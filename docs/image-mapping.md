# Product Image Mapping

Use this process to replace demo/placeholder images with relevant product images.

Approach
- Prepare a JSON mapping from SKU → image URLs.
- Run the provided Node script to replace `ProductMedia` for the mapped SKUs.

Mapping Format
- Object form (recommended):
  - `{ "SKU-123": ["https://.../1.jpg", "https://.../2.jpg"], "SKU-456": ["https://.../a.jpg"] }`
- Or array form:
  - `[{ "sku": "SKU-123", "urls": ["https://.../1.jpg"], "kind": "image" }]`

Demo File
- See `data/product-images.sample.json` and copy it to `data/product-images.json`.

Run Script
- Local: ensure `DATABASE_URL` points to your Postgres.
- Command:
  - `pnpm -C packages/api run db:update:images` (expects `data/product-images.json`)
  - Or custom file: `node packages/api/scripts/update-product-images.mjs -f path/to/your.json`
- Dry run:
  - Add `--dry` to preview changes without writing.

Behavior
- For each SKU in the mapping:
  - Finds the product by `sku`.
  - Deletes existing `ProductMedia` rows for that product.
  - Inserts new media rows in the provided order (as `sortOrder`).
- Skips missing SKUs; prints a summary.

Image Hosting Notes
- Use stable, publicly accessible URLs (your CDN, S3, or a stock provider).
- Ensure you have rights to use the images.
- For Unsplash/stock providers, prefer permanent links and include proper parameters for size/quality.

Troubleshooting
- If no changes appear on the web:
  - Verify the SKUs in your mapping match DB `Product.sku` exactly.
  - Clear any catalog caches if applicable (or wait for TTL).
  - Confirm your `DATABASE_URL` points to the environment you intend to modify.

