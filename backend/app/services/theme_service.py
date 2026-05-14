"""Theme extraction from logo images using Pillow."""

from typing import List
import io


def extract_colors_from_image(image_bytes: bytes, n_colors: int = 5) -> List[str]:
    """Extract dominant colors from an image. Returns list of hex strings."""
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((100, 100))
        # Get pixel data
        pixels = list(img.getdata())
        # Simple frequency-based extraction (no sklearn needed)
        from collections import Counter
        # Quantize colors by rounding to nearest 32
        quantized = [
            (r // 32 * 32, g // 32 * 32, b // 32 * 32)
            for r, g, b in pixels
            if not (r > 240 and g > 240 and b > 240)  # skip near-white
            and not (r < 15 and g < 15 and b < 15)    # skip near-black
        ]
        counter = Counter(quantized)
        top = counter.most_common(n_colors)
        return ["#{:02x}{:02x}{:02x}".format(r, g, b) for (r, g, b), _ in top]
    except Exception as e:
        return ["#4137A8", "#27CED7", "#CC3641", "#f4f4f8", "#0f0e1c"]
