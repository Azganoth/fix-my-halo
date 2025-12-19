use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

pub mod engine;

#[wasm_bindgen]
pub fn run_wasm_dilation(padding: u32) -> JsValue {
    let result = engine::process_dummy_texture(padding);

    to_value(&result).unwrap()
}
