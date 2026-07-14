import os
from PIL import Image

def process_logo():
    source_path = '/Users/sora/Desktop/2026-07-14 14.32.29.jpg'
    public_dir = '/Users/sora/code by Me/My Event For Mr.sophea/public'
    
    if not os.path.exists(source_path):
        print(f"Source image not found at {source_path}")
        return
        
    os.makedirs(public_dir, exist_ok=True)
    
    # Load original image
    img = Image.open(source_path)
    print(f"Loaded source image {source_path} ({img.width}x{img.height})")
    
    # Crop to square (center-based)
    min_dim = min(img.width, img.height)
    left = (img.width - min_dim) / 2
    top = (img.height - min_dim) / 2
    right = (img.width + min_dim) / 2
    bottom = (img.height + min_dim) / 2
    
    square_img = img.crop((left, top, right, bottom))
    print(f"Cropped to square ({square_img.width}x{square_img.height})")
    
    # Save original cropped logo
    logo_path = os.path.join(public_dir, 'logo.jpg')
    square_img.save(logo_path, 'JPEG', quality=95)
    print(f"Saved logo to {logo_path}")
    
    # Save favicon (32x32)
    favicon_path = os.path.join(public_dir, 'favicon.ico')
    favicon_img = square_img.resize((32, 32), Image.Resampling.LANCZOS)
    favicon_img.save(favicon_path, 'ICO')
    print(f"Saved favicon to {favicon_path}")
    
    # Save iOS Apple Touch Icon (180x180)
    touch_path = os.path.join(public_dir, 'apple-touch-icon.png')
    touch_img = square_img.resize((180, 180), Image.Resampling.LANCZOS)
    touch_img.save(touch_path, 'PNG')
    print(f"Saved apple touch icon to {touch_path}")
    
    print("Asset processing complete!")

if __name__ == '__main__':
    process_logo()
