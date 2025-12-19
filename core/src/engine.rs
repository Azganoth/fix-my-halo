use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ProcessingResult {
    pub original_size: u32,
    pub new_size: u32,
    pub processed_pixels: u32,
    pub time_taken_ms: u32,
    pub message: String,
}

pub fn process_dummy_texture(input_val: u32) -> ProcessingResult {
    let processed_val = input_val * 42;
    let pixels = processed_val * 1024;
    let time = input_val * 2;

    ProcessingResult {
        original_size: input_val,
        new_size: processed_val,
        processed_pixels: pixels,
        time_taken_ms: time,
        message: format!("Successfully dilated texture by factor {}", input_val),
    }
}
