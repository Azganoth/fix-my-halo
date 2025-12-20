use clap::Parser;
use std::path::PathBuf;

mod engine;

#[derive(Parser)]
#[command(name = "FixMyHalo")]
#[command(version = "0.1")]
#[command(about = "Removes white halos from textures")]
struct Cli {
    input: PathBuf,

    #[arg(short, long)]
    output: Option<PathBuf>,

    #[arg(short, long, default_value_t = 8)]
    padding: u32,
}

fn main() {
    let args = Cli::parse();

    println!("Opening {:?}", args.input);
    let img = image::open(&args.input).expect("Failed to open image");

    println!("Dilating by {} pixels...", args.padding);
    let result = engine::process_image(img, args.padding);

    let output_path = args.output.unwrap_or_else(|| {
        let mut p = args.input.clone();
        p.set_file_name("fixed.png");
        p
    });

    result.save(&output_path).expect("Failed to save image");
    println!("Saved to {:?}", output_path);
}