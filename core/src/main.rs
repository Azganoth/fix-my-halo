use clap::{Parser, ValueHint};
use glob::glob;
use indicatif::{ParallelProgressIterator, ProgressBar, ProgressStyle};
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
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
    #[arg(short, long, default_value_t = 8)]
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

fn main() {
    let args = Cli::parse();

    /* Collect files */
    let mut files = Vec::new();
    let path = Path::new(&args.input);

    if path.is_dir() {
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
        files.push(path.to_path_buf());
    } else {
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

    println!("Found {} files to process.", files.len());

    /* Process */
    let pb = ProgressBar::new(files.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template(
                "{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta})",
            )
            .expect("Failed to create progress style")
            .progress_chars("#>-"),
    );

    let results: Vec<Result<PathBuf, String>> = files
        .par_iter()
        .progress_with(pb)
        .map(|file_path| process_file(file_path, &args))
        .collect();

    /* Report */
    let success_count = results.iter().filter(|r| r.is_ok()).count();
    let failure_count = results.len() - success_count;

    println!("\nSummary:");
    println!("  Success: {}", success_count);
    println!("  Failed:  {}", failure_count);

    if failure_count > 0 && args.verbose {
        println!("\nFailures:");
        for res in results {
            if let Err(e) = res {
                eprintln!("  - {}", e);
            }
        }
    }
}

fn is_image(path: &Path) -> bool {
    path.extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase())
        .map(|s| matches!(s.as_str(), "png" | "jpg" | "jpeg"))
        .unwrap_or(false)
}

fn process_file(input_path: &Path, args: &Cli) -> Result<PathBuf, String> {
    if args.verbose {
        println!("Processing: {:?}", input_path);
    }

    let img =
        image::open(input_path).map_err(|e| format!("Open error for {:?}: {}", input_path, e))?;

    let processed = engine::process_image(img, args.padding);

    // Determine output path
    let output_path = if args.in_place {
        input_path.to_path_buf()
    } else if let Some(ref out_dir) = args.output {
        fs::create_dir_all(out_dir)
            .map_err(|e| format!("Failed to create output dir {:?}: {}", out_dir, e))?;

        let filename = input_path.file_name().ok_or("Invalid filename")?;
        out_dir.join(filename)
    } else {
        let parent = input_path.parent().unwrap_or_else(|| Path::new("."));
        let fixed_dir = parent.join("fixed");

        fs::create_dir_all(&fixed_dir)
            .map_err(|e| format!("Failed to create default output dir {:?}: {}", fixed_dir, e))?;

        let filename = input_path.file_name().ok_or("Invalid filename")?;
        fixed_dir.join(filename)
    };

    processed
        .save(&output_path)
        .map_err(|e| format!("Save error for {:?}: {}", output_path, e))?;

    Ok(output_path)
}
