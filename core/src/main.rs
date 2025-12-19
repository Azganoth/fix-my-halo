use clap::Parser;

mod engine;

#[derive(Parser)]
#[command(name = "FixMyHalo")]
#[command(version = "0.1")]
#[command(about = "Removes white halos from textures", long_about = None)]
struct Cli {
    #[arg(short, long, default_value_t = 8)]
    padding: u32,
}

fn main() {
    let args = Cli::parse();

    println!("--- CLI Started ---");
    println!("Processing with padding: {}", args.padding);

    let result = engine::process_dummy_texture(args.padding);

    println!("--- CLI Finished ---");
    println!("Status: {}", result.message);
    println!("Original Size: {}", result.original_size);
    println!("New Size: {} units", result.new_size);
    println!("Pixels Processed: {}", result.processed_pixels);
    println!("Time Taken: {}ms", result.time_taken_ms);
}
