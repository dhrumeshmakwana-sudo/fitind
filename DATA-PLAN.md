# Data Plan

Core data: no external data sources — the artifact is populated by user input and its own actions.

## Redesign 4 (2026-11-17)

Palette revert to the first design's basics (cream #EBE9E1 / red-orange #E43D12 / near-black #16140F, accents #D6536D / #FFA286 / #EFB11D) plus removal of all landing paragraph text. No new external sources, no images added — the zero-images rule still stands app-wide.

## Build-time imagery (Redesign 2, 2026-11-17 — REMOVED in Redesign 3)

Redesign 3 (2026-11-17, same day) removed all photography at the user's explicit request ("First design, no pics"): the four files below were deleted from `client/src/assets/` and are no longer imported or rendered anywhere. The landing and auth are now pure type + flat plum palette steps (#2D142C / #510A32 / #801336 / #C72C41 / #EE4540, from the user's own palette screenshot). Provenance of the removed images is kept here for the record.

Landing/auth photography found with the image-search skill, preflighted, and copied into `client/src/assets/` (owned bytes, imported by the client — never hotlinked):

- `hero-train.jpg` — athlete training with a dumbbell in a bright gym. Source page: https://radazulsportcenter.es/wp-content/uploads/2025/05/fullbody-young-african-american-athlete-lifting-dumbbell-during-tricep-curl-workout-in-gym-strong--1200x600.jpg (article: radazulsportcenter.es full-body workout post).
- `hero-eat.jpg` — full Indian thali (rice, dal, curries, paratha, papad, raita) on a white background. Image: https://image3.mouthshut.com/images/Restaurant/Photo/-29031_118292.jpg (MouthShut restaurant photo).
- `hero-track.jpg` — smartwatch showing a live workout (time, calories, heart rate). Image: https://www.datocms-assets.com/57452/1679644070-artboard-copy-22.jpg (STRV blog, sports-industry product design).
- `band-food.jpg` — Indian dishes flat lay (dal, palak paneer, rice, chana, roti). Image: https://healthmantra.com/wp-content/uploads/2024/11/balanced-meal.jpg (HealthMantra, balancing Indian meals article).
