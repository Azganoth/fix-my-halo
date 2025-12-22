<div align="center">

![Fix My Halo](docs/header.png)

Eliminate the ugly "White Halo" artifacts from your Unity textures.

[![Website](https://img.shields.io/badge/Use-Website-0077b9?style=for-the-badge&labelColor=1F1F1F&logo=vercel&logoColor=white)](https://fixmyhalo.vercel.app/)
[![Request Icon](https://img.shields.io/badge/Download-CLI-0077b9?style=for-the-badge&labelColor=1F1F1F&logo=github&logoColor=white)](https://github.com/Azganoth/fix-my-halo/releases)

</div>

## 🧐 The Problem

When you export textures from Adobe Illustrator or Photoshop for Unity,
transparent pixels are often saved as "Transparent White" (R=255, G=255, B=255,
A=0).

When the game renders these textures using **Bilinear Filtering**, it blends the
visible edge colors with that hidden white background. The result? **A ghostly
white outline** around your beautiful art.

## 🛠 The Solution

**FixMyHalo** is a high-performance tool written in **Rust** that performs
**Texture Dilation** (Alpha Bleeding).

It scans your image for transparent pixels and "bleeds" the nearest visible
color into them.

1. **Neutralizes Background:** Forces all transparent pixels to "Transparent
   Black" (0,0,0,0).
2. **Dilates Edges:** Smears the edge colors outwards into the invisible space.

The result is a texture that looks identical in your editor but renders
perfectly smooth in-game without the halo.

## 🚀 Usage

### 🌐 Web Version

No installation required. Runs entirely in your browser using **WebAssembly
(Wasm)** for native performance.

1. Go to [**Fix My Halo**](https://fixmyhalo.vercel.app/).
2. Drag & drop your PNGs.
3. Get the fixed versions instantly.

### 💻 CLI Tool

Ideal for modders batch-processing hundreds of textures at once. Supports parallel processing, recursion, and multiple file formats.

**Installation:**

1. Download `fixmyhalo.exe` (Windows x64) from the
   [**Releases Page**](https://github.com/Azganoth/fix-my-halo/releases).
2. Place it in your folder (or add to PATH).
3. Open a terminal where it is located and execute it with the desired parameters.

**Usage:**

```powershell
# Basic usage (Saves to "fixed/" folder next to input)
./fixmyhalo "Textures/Player.png"

# Batch process an entire folder recursively
./fixmyhalo "C:/MyMod/Textures" --recursive

# Overwrite original files (In-place)
./fixmyhalo "C:/MyMod/Textures" --recursive --in-place

# Use Glob patterns (e.g. process only PNGs)
./fixmyhalo "assets/**/*.png" --padding 16

# Specify a custom output directory
./fixmyhalo "input/" --output "C:/Output/FixedTextures"
```

## 📜 License

MIT License. Free to use for personal and commercial projects.
