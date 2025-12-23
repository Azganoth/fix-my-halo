use wasm_bindgen::prelude::*;

mod engine;

#[wasm_bindgen]
pub fn fix_texture(image_data: &[u8], padding: u32) -> Result<Vec<u8>, JsValue> {
    let img = image::load_from_memory(image_data)
        .map_err(|e| JsValue::from_str(&format!("Load Error: {}", e)))?;

    let fixed = engine::process_image(img, padding);

    let mut buffer = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new_with_quality(
        &mut buffer,
        image::codecs::png::CompressionType::Best,
        image::codecs::png::FilterType::Adaptive,
    );

    fixed
        .write_with_encoder(encoder)
        .map_err(|e| JsValue::from_str(&format!("Save Error: {}", e)))?;

    Ok(buffer)
}
