# Certificate assets

Read at request time by the certificate image routes (`src/lib/certificates/render.tsx`).
The image renderer (`next/og`) only reads TTF/OTF/WOFF fonts and PNG/JPEG images, so these
are kept here instead of the WebP files in `public/art`.

- One 1600×1000 plate per certificate type, framed so the object sits on the right and the
  type sits on the dark left side:
  - `plate-phase.jpg`: rising bars, for a passed phase (from `public/art/page-challenges`,
    scaled down with the backdrop extended).
  - `plate-funded.jpg`: rosette with a check, for a funded account (from `page-verify`).
  - `plate-payout.jpg`: trophy, for a payout (from `page-contest`).
  - `plate-highest.jpg`: podium, for a highest-payout award (from `page-leaderboard`).
  - `plate-award.jpg`: stars, for a custom award (from `page-reviews`, scaled down with the
    backdrop extended).
- `fonts/Inter-*.ttf`: static instances (400–700) of the site's Inter variable font, latin,
  latin-ext and cyrillic subsets. Inter is © The Inter Project Authors and licensed under the
  SIL Open Font License 1.1; see `fonts/OFL.txt`.
