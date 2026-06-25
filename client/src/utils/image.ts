import { dummyProducts } from "../assets/assets";

/**
 * Products seeded on the server ship without image URLs (admins upload them, or
 * set a Cloudinary URL). Until then we fall back to the bundled catalogue
 * artwork, matched by product name, so the storefront still looks complete.
 */
const byName = new Map(dummyProducts.map((p) => [p.name.toLowerCase().trim(), p.image]));

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1ede4"/><text x="100" y="105" font-family="sans-serif" font-size="16" fill="#9c9486" text-anchor="middle">No image</text></svg>`
  );

/** Resolve a usable image URL, falling back to bundled artwork then a placeholder. */
export function productImage(image?: string | null, name?: string): string {
  if (image) return image;
  if (name) {
    const local = byName.get(name.toLowerCase().trim());
    if (local) return local;
  }
  return PLACEHOLDER;
}
