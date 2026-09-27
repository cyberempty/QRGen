# QRGen

A free, no-signup QR code generator that runs entirely in the browser. Nothing you type is ever sent to a server — all encoding happens client-side with JavaScript.

## Files

```
qr-generator/
├── index.html    # Markup and page structure
├── style.css     # All styling
├── script.js     # App logic (QR generation, downloads, validation)
└── privacy.html  # Privacy policy & terms of service page
```

## Running it

No build step or server required. Just open `index.html` in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## Features

- **Content types**: Link, Email, Phone, Wi-Fi, and Contact (vCard)
- **Live preview**: the QR code updates as you type
- **Downloads**: export as PNG or SVG, both with a quiet-zone margin for reliable scanning
- **Copy to clipboard**: copy the generated code as an image, no download needed
- **Input validation**: URLs get `https://` auto-prefixed if missing; phone numbers are checked against a basic format
- **Character counter**: warns when content is dense enough to need a larger printed size
- **Print-size hint**: estimates the minimum size the code should be printed at based on its complexity
- **Wi-Fi password toggle**: show/hide the password you're encoding

## Dependencies

Loaded via CDN, no installation needed:
- [qrcodejs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) — QR code generation
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (Google Fonts) — display typeface

## Privacy

See [`privacy.html`](./privacy.html) — in short: no data collection, no cookies, no tracking. Everything happens on the visitor's device.