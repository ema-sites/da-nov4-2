# cards-game-tiles

Custom **cards** block: ALC "Featured games and promotions" game tiles.

## Authoring (Document Authoring)

Model: `standalone`

One row per tile, two cells:

1. Tile artwork image (alt = title). Optionally a second paragraph with flag text (e.g. `NEW`),
   rendered as an orange ribbon on the artwork's top-right corner.
2. Title (h3), one or more description paragraphs (clamped to two lines; inline links render
   as uppercase chevron links), then a paragraph containing only the CTA link (rendered as the
   pill button with the arrow icon).

## Behaviour

- `>= 768px`: two-column grid.
- `< 768px`: one tile per slide, swipeable (scroll-snap) with previous/next buttons and dots.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
