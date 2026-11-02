# Certificate assets

Read at request time by the certificate image routes (`src/lib/certificates/render.tsx`).
The image renderer (`next/og`) only reads TTF/OTF/WOFF fonts and PNG/JPEG images, so these
are kept here instead of the WebP files in `public/art`.

- `plate-funded.jpg`, `plate-payout.jpg`, `plate-highest.jpg`: 1600×1000 crops of the
  path-traced page plates (`page-verify`, `page-contest`, `page-leaderboard`) from
  `tools/asset-studio`, framed so each object sits on the right and the type sits on the
  dark left side.
- `fonts/Inter-*.ttf`: static instances (400–700) of the site's Inter variable font, latin,
  latin-ext and cyrillic subsets. Inter is © The Inter Project Authors and licensed under the
  SIL Open Font License 1.1; see `fonts/OFL.txt`.
