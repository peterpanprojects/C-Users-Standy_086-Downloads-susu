/**
 * Utility functions for image compression, validation, and avatar presets
 */

export const PRESET_AVATARS: { id: string; label: string; url: string }[] = [
  {
    id: 'avatar-1',
    label: 'Professional Female 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-2',
    label: 'Professional Male 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-3',
    label: 'Professional Female 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-4',
    label: 'Professional Male 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-5',
    label: 'Stylized Gold Badge',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SusuGold&backgroundColor=b6e3f4,c0aede,d1d4f9'
  },
  {
    id: 'avatar-6',
    label: 'African Heritage Pattern',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Akosua&top=curly&hairColor=auburn&facialHair=none'
  }
];

/**
 * Validates that the uploaded file is an image and under max size (8MB).
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file (PNG, JPG, WEBP, GIF).' };
  }
  const maxBytes = 8 * 1024 * 1024; // 8MB upload threshold
  if (file.size > maxBytes) {
    return { valid: false, error: 'File size exceeds 8MB. Please select a smaller photo.' };
  }
  return { valid: true };
}

/**
 * Reads a File object and compresses it using HTML5 Canvas to a lightweight
 * base64 Data URL (JPEG format, scaled down to maxDimension x maxDimension).
 * Typically produces high-fidelity avatars of ~25-45 KB that fit cleanly into
 * browser storage.
 */
export function compressImageFile(file: File, maxDimension = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read image as data URL'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          // Smooth resampling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Return compressed JPEG data URL
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          // If canvas fails (e.g. strict security), fallback to raw data
          resolve(result);
        }
      };
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.readAsDataURL(file);
  });
}
