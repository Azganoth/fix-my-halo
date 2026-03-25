use clap::{Parser, ValueHint};
use console::style;
use glob::glob;
use indicatif::{HumanDuration, ParallelProgressIterator, ProgressBar, ProgressStyle};
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;
use walkdir::WalkDir;

mod engine;

#[derive(Parser)]
#[command(name = "FixMyHalo")]
#[command(version, about, long_about = None)]
struct Cli {
    /// Input path. Can be a file, directory, or glob pattern (e.g. "assets/*.png").
    #[arg(value_hint = ValueHint::AnyPath)]
    input: String,

    /// Output directory.
    #[arg(short, long, value_hint = ValueHint::DirPath)]
    output: Option<PathBuf>,

    /// Dilation padding in pixels.
    #[arg(short, long, default_value_t = 4)]
    padding: u32,

    /// Process directories recursively.
    #[arg(short, long)]
    recursive: bool,

    /// Overwrite original files.
    #[arg(long, conflicts_with = "output")]
    in_place: bool,

    /// Enable verbose logging.
    #[arg(short, long)]
    verbose: bool,
}

struct Job {
    input_path: PathBuf,
    output_path: PathBuf,
}

fn main() {
    let args = Cli::parse();

    /* Collect files */
    let path = Path::new(&args.input);
    let mut files = Vec::new();
    let base_path: PathBuf;

    if path.is_dir() {
        base_path = path.to_path_buf();
        let max_depth = if args.recursive { usize::MAX } else { 1 };
        for entry in WalkDir::new(path)
            .max_depth(max_depth)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && is_image(entry.path()) {
                files.push(entry.path().to_path_buf());
            }
        }
    } else if path.is_file() {
        base_path = path.parent().unwrap_or(Path::new(".")).to_path_buf();
        files.push(path.to_path_buf());
    } else {
        base_path = Path::new(".").to_path_buf();
        if let Ok(paths) = glob(&args.input) {
            for entry in paths.filter_map(|e| e.ok()) {
                if entry.is_file() && is_image(&entry) {
                    files.push(entry);
                }
            }
        }
    }

    if files.is_empty() {
        eprintln!("No supported image files found matching '{}'", args.input);
        return;
    }

    /* Determine jobs (inputs and outputs) */
    let jobs: Vec<Job> = files
        .into_iter()
        .map(|input| {
            let output = if args.in_place {
                input.clone()
            } else {
                let dest_root = if let Some(ref out) = args.output {
                    out.clone()
                } else {
                    base_path.join("fixed")
                };

                // Preserve structure if possible
                let relative = input
                    .strip_prefix(&base_path)
                    .unwrap_or_else(|_| Path::new(input.file_name().unwrap()));

                dest_root.join(relative)
            };

            Job {
                input_path: input,
                output_path: output,
            }
        })
        .collect();

    /* Process */
    println!("Found {} files to process.", jobs.len());

    let pb = ProgressBar::new(jobs.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template(
                "{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta})",
            )
            .expect("Failed to create progress style")
            .progress_chars("#>-"),
    );

    let start_time = Instant::now();

    let results: Vec<Result<(PathBuf, bool), String>> = jobs
        .par_iter()
        .progress_with(pb)
        .map(|job| process_job(job, &args))
        .collect();

    let duration = start_time.elapsed();

    /* Report */
    let mut modified_count = 0;
    let mut skipped_count = 0;
    let mut failure_count = 0;

    for res in &results {
        match res {
            Ok((_, changed)) => {
                if *changed {
                    modified_count += 1;
                } else {
                    skipped_count += 1;
                }
            }
            Err(_) => {
                failure_count += 1;
            }
        }
    }

    println!("\n{}", style("Summary:").bold());
    println!("  Total:     {}", jobs.len());
    println!("  Modified:  {}", style(modified_count).green());
    println!("  Skipped:   {}", style(skipped_count).dim());
    if failure_count > 0 {
        println!("  Failed:    {}", style(failure_count).red());
    }

    if failure_count > 0 {
        if args.verbose {
            println!("\n{}", style("Failures:").bold());
            for res in results {
                if let Err(e) = res {
                    eprintln!("  - {}", style(e).red());
                }
            }
        } else {
            println!("\n(Use {} to see failure details)", style("--verbose").bold());
        }
    }

    println!(
        "\n{} Finished in {}",
        style("Done!").green().bold(),
        HumanDuration(duration)
    );
}

fn is_image(path: &Path) -> bool {
    path.extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase())
        .map(|s| {
            matches!(
                s.as_str(),
                "png" | "jpg" | "jpeg" | "tga" | "bmp" | "tif" | "tiff" | "dds",
            )
        })
        .unwrap_or(false)
}

fn process_job(job: &Job, args: &Cli) -> Result<(PathBuf, bool), String> {
    if args.verbose {
        println!("Processing: {:?}", job.input_path);
    }

    let img = image::open(&job.input_path)
        .map_err(|e| format!("Open error for {:?}: {}", job.input_path, e))?;

    let (processed, changed) = engine::process_image(img, args.padding);

    if !changed && args.in_place {
        if args.verbose {
            println!("No changes for {:?}, skipping write.", job.input_path);
        }
        return Ok((job.input_path.clone(), false));
    }

    if let Some(parent) = job.output_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory {:?}: {}", parent, e))?;
    }

    let file = fs::File::create(&job.output_path)
        .map_err(|e| format!("Failed to create file {:?}: {}", job.output_path, e))?;
    let writer = std::io::BufWriter::new(file);

    let encoder = image::codecs::png::PngEncoder::new_with_quality(
        writer,
        image::codecs::png::CompressionType::Best,
        image::codecs::png::FilterType::Adaptive,
    );

    processed
        .write_with_encoder(encoder)
        .map_err(|e| format!("Save error for {:?}: {}", job.output_path, e))?;

    Ok((job.output_path.clone(), changed))
}
