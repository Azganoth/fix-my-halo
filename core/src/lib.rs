use wasm_bindgen::prelude::*;

mod engine;

#[wasm_bindgen]
pub struct FixResult {
    data: Vec<u8>,
    pub changed: bool,
}

#[wasm_bindgen]
impl FixResult {
    #[wasm_bindgen(getter)]
    pub fn data(&self) -> Vec<u8> {
        self.data.clone()
    }
}

#[wasm_bindgen]
pub fn fix_texture(image_data: &[u8], padding: u32) -> Result<FixResult, JsValue> {
    let img = image::load_from_memory(image_data)
        .map_err(|e| JsValue::from_str(&format!("Load Error: {}", e)))?;

    let (fixed, changed) = engine::process_image(img, padding);

    let mut buffer = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new_with_quality(
        &mut buffer,
        image::codecs::png::CompressionType::Best,
        image::codecs::png::FilterType::Adaptive,
    );

    fixed
        .write_with_encoder(encoder)
        .map_err(|e| JsValue::from_str(&format!("Save Error: {}", e)))?;

    Ok(FixResult {
        data: buffer,
        changed,
    })
}
