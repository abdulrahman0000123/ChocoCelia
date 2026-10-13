---
name: Choco Celia administration
description: One bilingual workspace for orders, product costs and finance
colors:
  cocoa: "#2b1712"
  ivory: "#fff8ee"
  caramel: "#c89b67"
  milk-chocolate: "#754331"
  blush: "#e8c9bd"
typography:
  headline:
    fontFamily: "rpt, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "rpt, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.85
rounded:
  control: "10px"
  panel: "12px"
spacing:
  compact: "8px"
  control: "12px"
  section: "20px"
components:
  button-secondary:
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "44px"
---
# Choco Celia design system

## Overview
The storefront keeps the heartfelt, tactile, thoughtful identity documented in PRODUCT.md. Administration is a product surface: compact, familiar and consistent, for reviewing customer orders and their finances during daily work. Preserve the cocoa, ivory, caramel and blush palette. Shared administrative context supplies language, direction and session handling; the global site provider supplies theme.

## Colors
Canonical site colors and theme roles live in app/globals.css. Use --background for the page, --surface for controls and navigation, --surface-muted for secondary rows, --foreground for primary copy, --muted for supporting copy, --border for separation and --focus for focus/selected tabs. Do not create a page-specific theme provider or independent palette. Finance aliases these roles in Finance.module.css. Positive and negative data use the admin semantic tokens in admin.css; text must also communicate state.

## Typography
Use the existing locally bundled rpt family for Arabic and English. It has real weights 400 and 700. Headlines are 26–28px, section titles 19px, controls and table values 14px, supporting text 12px. Monetary values use tabular numerals. Keep phones, order IDs and mixed-language content in bdi or explicit LTR fields.

## Elevation
Use tonal surfaces and thin full borders. Page content sits directly in the shared administration shell. Do not surround financial content with a second large framed page. Details and settings use a 12px panel border. No decorative motion is required for data loading.

## Components
AdminPageHeader, AdminNotice and AdminLoading define the header and request-state vocabulary. Finance.module.css supplies the shared toolbar, buttons, ledger, tabs and form grids. Buttons and form controls have a minimum 44px height and visible keyboard focus. The sidebar uses a filled selected item with a full thin border, and mirrors with direction. The toolbar and grids wrap on phones. Table scrolling stays inside the table region. OrderDetail is the same customer/delivery/finance review on Orders and Finance. Financial settings show customer delivery fees separately from business costs and allocations, with explicit save actions.

## Do's and Don'ts
- Do preserve the existing cocoa-pod identity and warm brand palette.
- Do translate the related administrative workflow together and preserve language between routes.
- Do distinguish loading, error, expired session, empty data and incomplete costs.
- Do preserve financial snapshots and audit/version safeguards.
- Do explain that profit, allocations and confirmed collection are different values.
- Don't add generic luxury claims or invented sourcing or founder histories.
- Don't use generic feature-card layouts that obscure the personal narrative.
- Don't add independent theme controls to individual administrative pages.
- Don't display zero records when the data request failed.
- Don't use colored side stripes, nested page containers or decorative chart effects.
