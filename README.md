# Clare Stokolosa Italy studio catalog

## Edit artworks

Open artworks.json on GitHub, click the pencil, and change the details. Click Commit changes to save. GitHub Pages republishes automatically after saving to main. No ChatGPT subscription is needed.

Each artwork is one block between braces. Keep quotes around text. Price is a number without a dollar sign. Use visible: "yes" to show an artwork or "no" to hide it. CS2 and CS457 remain hidden pending confirmation. CS032 replaces the former blank CS32 placeholder. Original USD prices come from the inventory, without its 5% fee increase. Checkout remains on Clare's existing website and may show a different price.

To add a piece, copy one entire artwork block, give it a unique SKU, and edit its fields. Separate blocks with commas; do not add a comma after the final block. For a missing price use null. For empty text use "". Enter dimensions in inches. Image links should point directly to an image file.

To remove a piece, change visible to "no". This is easier to undo than deleting its block. GitHub keeps saved edit history.

The website and its Print price list button use the same artworks.json file. Print after the updated site has loaded. Save as PDF in the print dialog if desired.

## Initial hosting setup

Upload these five files to the repository root. Once public publication is approved, use Settings → Pages → Deploy from a branch → main → / (root) → Save. A free GitHub Pages deployment requires a public repository. Never upload the full inventory, private notes, local editor, or earlier workbook into this public repository.

The initial setup is a one-time upload. Routine changes are edits directly on GitHub. Publication can take a few minutes. Image files remain hosted on Clare's website.

## Replace the printed QR code

Upload a new PNG to the repository root with exactly the name `clareItalyCatalogueQRCode.png`, replacing the existing file, and commit to main. After GitHub Pages finishes deploying, click Print price list again. Every click requests the QR file afresh and waits for it to load before opening the print dialog. The QR appears at the top right, with its white border preserved. No code changes are needed when replacing the image.

If the site URL changes, generate a QR for the new URL and replace this file. Uploading an image does not change the URL encoded inside it. The print button is at the bottom of the catalog.
