# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static assets repository for frontend customizations of the Tattootatu Odoo e-commerce site. Files are served via GitHub Pages and injected into Odoo's website via `<script>` and `<link>` tags in the custom code section.

**Deployed URL**: `https://calidae.github.io/tattoodoo-custom-files/`

There is no build step — commit and push deploys directly.

## Deployment

Files are included in Odoo website settings under *Website > Configuration > Custom Code*:

```html
<script src="https://calidae.github.io/tattoodoo-custom-files/minmax_qty.js"></script>
<script src="https://calidae.github.io/tattoodoo-custom-files/cart_qty.js"></script>
<!-- etc. -->
```

To deploy a change: commit and push to `main`. GitHub Pages serves the updated file within minutes.

## JavaScript Modules

Each `.js` file is an IIFE. They hook into Odoo's dynamically-rendered DOM via MutationObserver patterns since Odoo re-renders elements after navigation.

**minmax_qty.js** — Enforces per-product minimum/maximum order quantities. The product ID → min qty mapping is hardcoded near the top. Validates on input change and intercepts the "Add to Cart" button. Contains inline multilingual error messages (ES, CA, NL, FR, DE, IT, PT).

**cart_qty.js** — Three independent features:
1. Cart lock: disables +/- buttons and makes quantity inputs read-only on the cart page
2. T&C checkbox: gates the payment button on a terms agreement checkbox
3. Category hide: hides "Add to Cart" on specific category URLs (regex-matched)

**optional_products.js** — Locks quantity inputs inside Odoo's optional products configurator modal. Uses MutationObserver because Odoo reinjects the modal on each open.

**cards-link.js** — Makes S_CTA badge cards and team member cards fully clickable. Skips when Odoo's website editor is open (`.o_builder_open`).

**forms.js** — Auto-assigns IDs to forms (`lead-form-{path}-{index}`) and syncs `<select name="lang">` to the page's `<html lang="...">` attribute. Uses polling with a 10s timeout because Odoo asynchronously resets the select after page load.

## HTML Reports

`report_invoice_document.html` and `report_saleorder_document.html` are Odoo QWeb templates replacing the default invoice/sale order PDF layouts. They extend `web.external_layout` and follow Odoo's QWeb syntax (`t-if`, `t-foreach`, `t-field`).

## Translations (lang/)

PO files for the Sale module in 7 languages (es, en_GB, fr, de, it, nl, pt). These are Odoo server-side translations, not used by the JS files directly. Edit with a PO editor or as plain text — the format is standard GNU gettext.

## Key Integration Points

- Odoo editor mode detection: `.o_builder_open` on `<body>`
- Cart page detection: URL path matching or presence of `.o_cart_summary`
- Modal re-render: `MutationObserver` on `document.body` watching for `childList` changes
- Bootstrap classes used by Odoo: `.modal-body`, `.btn`, `.input-group`
- Theme colors: cream `#f0eee9`, red `#ed2a20`
