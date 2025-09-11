# Unsplash Integration for Product Images

Goal
- Automatically fetch relevant, royalty-free placeholder images for each product using the Unsplash API, then update your database media.

Steps
1) Create an Unsplash developer account and application:
   - https://unsplash.com/developers
   - Copy your Access Key.

2) Set environment variable where you run scripts:
   - PowerShell: `$env:UNSPLASH_ACCESS_KEY = 'YOUR_KEY'`
   - bash/zsh: `export UNSPLASH_ACCESS_KEY=YOUR_KEY`

3) Generate a SKU→URLs mapping JSON:
   - `pnpm -C packages/api run images:unsplash:map`
   - This writes `data/product-images.json` with one image per product based on product name, brand, and category.

4) Apply the mapping to your DB (overwrites existing ProductMedia):
   - Ensure `DATABASE_URL` points to the target database.
   - `pnpm -C packages/api run db:update:images`

Notes
- The mapping is editable. Feel free to manually curate URLs before applying.
- For production use, host images in your own storage/CDN and update the mapping URLs accordingly.
- Respect Unsplash API rate limits and guidelines; consider attributing the photographer where appropriate.

