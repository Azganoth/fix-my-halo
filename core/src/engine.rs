use image::{DynamicImage, Rgba, RgbaImage};

pub fn process_image(img: DynamicImage, padding: u32) -> DynamicImage {
    let width = img.width();
    let height = img.height();
    let original = img.to_rgba8();
    let mut buffer = original.clone();

    // We run the dilation 'padding' times
    for _ in 0..padding {
        buffer = dilate_step(&buffer, width, height);
    }

    // Restore original alpha channel to keep the shape,
    // but now the invisible pixels contain the bled color.
    for (x, y, pixel) in buffer.enumerate_pixels_mut() {
        let original_pixel = original.get_pixel(x, y);
        pixel[3] = original_pixel[3];
    }

    DynamicImage::ImageRgba8(buffer)
}

/// Expands colored regions into transparent areas to prevent filtering artifacts.
/// Returns a new image to ensure all pixel updates in this step are based on the previous state.
fn dilate_step(img: &RgbaImage, width: u32, height: u32) -> RgbaImage {
    let mut next_img = img.clone();

    for x in 0..width {
        for y in 0..height {
            let pixel = img.get_pixel(x, y);
            if pixel[3] > 0 {
                continue;
            }
            if let Some(color) = find_neighbor_color(img, x, y, width, height) {
                next_img.put_pixel(x, y, color);
            }
        }
    }

    next_img
}

const OFFSETS: [(i32, i32); 8] = [
    (-1, 0),
    (1, 0),
    (0, -1),
    (0, 1),
    (-1, -1),
    (1, -1),
    (-1, 1),
    (1, 1),
];

/// Searches for a non-transparent neighbor to source color from.
fn find_neighbor_color(img: &RgbaImage, x: u32, y: u32, w: u32, h: u32) -> Option<Rgba<u8>> {
    for (dx, dy) in OFFSETS {
        let nx = x as i32 + dx;
        let ny = y as i32 + dy;

        if nx >= 0 && nx < w as i32 && ny >= 0 && ny < h as i32 {
            let neighbor = img.get_pixel(nx as u32, ny as u32);
            if neighbor[3] > 0 {
                return Some(*neighbor);
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::Rgba;

    #[test]
    fn test_find_neighbor_color() {
        // Create a 3x3 image
        // [ T, T, T ]
        // [ T, T, C ]
        // [ T, T, T ]
        // Center (1,1) is T. Right (2,1) is C.
        let mut img = RgbaImage::new(3, 3);
        let red = Rgba([255, 0, 0, 255]);

        img.put_pixel(2, 1, red);

        // Check center pixel (1,1) -> should find red from (2,1)
        let found = find_neighbor_color(&img, 1, 1, 3, 3);
        assert_eq!(found, Some(red));

        // Check top-left pixel (0,0) -> too far, should be None
        let found = find_neighbor_color(&img, 0, 0, 3, 3);
        assert_eq!(found, None);
    }

    #[test]
    fn test_dilation_step() {
        // [ T, C, T ]
        // [ T, T, T ]
        // [ T, T, T ]
        let mut img = RgbaImage::new(3, 3);
        let red = Rgba([255, 0, 0, 255]);
        img.put_pixel(1, 0, red);

        let next = dilate_step(&img, 3, 3);

        // (1,0) remains red
        assert_eq!(next.get_pixel(1, 0), &red);

        // (0,0) is left of C, should become red
        assert_eq!(next.get_pixel(0, 0), &red);

        // (2,0) is right of C, should become red
        assert_eq!(next.get_pixel(2, 0), &red);

        // (1,1) is below C, should become red
        assert_eq!(next.get_pixel(1, 1), &red);
    }

    #[test]
    fn test_process_image_padding() {
        // 5x5 image, center pixel only.
        // Padding 1 -> 3x3 block
        // Padding 2 -> 5x5 block
        let mut img = RgbaImage::new(5, 5);
        let red = Rgba([255, 0, 0, 255]);
        let transparent_red = Rgba([255, 0, 0, 0]);
        img.put_pixel(2, 2, red);

        let dynamic = DynamicImage::ImageRgba8(img);

        // 1 Step
        let res1 = process_image(dynamic.clone(), 1);
        let buf1 = res1.to_rgba8();
        // The pixel at (2,1) should have red color but 0 alpha
        assert_eq!(buf1.get_pixel(2, 1), &transparent_red, "1 step should reach (2,1) with hidden color");
        assert_eq!(
            buf1.get_pixel(2, 0).0,
            [0, 0, 0, 0],
            "1 step should NOT reach (2,0)"
        );

        // 2 Steps
        let res2 = process_image(dynamic, 2);
        let buf2 = res2.to_rgba8();
        // The pixel at (2,0) should have red color but 0 alpha
        assert_eq!(buf2.get_pixel(2, 0), &transparent_red, "2 steps should reach (2,0) with hidden color");
    }
}
