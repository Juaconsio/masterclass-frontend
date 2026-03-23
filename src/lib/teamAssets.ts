import type { ImageMetadata } from 'astro';

const teamAssetImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/team/*.{svg,png,jpg,jpeg,webp}',
  { eager: true }
);

/**
 * Resolves content collection `image` paths to a URL string for `<img src>` (and React islands).
 */
export function resolveTeamImageForImg(imagePath: string | undefined): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/') && !imagePath.includes('src/')) return imagePath;
  const filename = imagePath.split('/').pop() ?? '';
  const key = Object.keys(teamAssetImages).find((k) => k.endsWith(filename));
  if (key && teamAssetImages[key]?.default) return teamAssetImages[key].default.src;
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}
