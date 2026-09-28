import type { Topic } from './types'

export const css: Topic = {
  id: 'css',
  title: 'CSS',
  group: 'Foundations',
  summary: 'The cascade and specificity, the box model, Flexbox and Grid, stacking contexts, responsive units and modern CSS features.',
  questions: [
    {
      q: 'How does the cascade decide which rule wins?',
      level: 'mid',
      diagram: `
flowchart TD
  A["Competing rules"] --> O{"Different origin / !important?"}
  O -- "yes" --> W1["Higher importance wins"]
  O -- "no" --> L{"Different @layer?"}
  L -- "yes" --> W2["Later layer wins"]
  L -- "no" --> S{"Different specificity?"}
  S -- "yes" --> W3["More specific wins"]
  S -- "no" --> W4["Later in source wins"]
`,
      a: "In order of importance:\n\n- Origin and `!important` (user-agent < author < `!important` author).\n- Cascade layers (`@layer`), if you use them.\n- Specificity: inline style > ID > class/attribute/pseudo-class > element.\n- Source order: the later rule wins when everything else is equal.",
    },
    {
      q: 'How is specificity calculated?',
      level: 'basic',
      a: "Count three columns (IDs, classes/attributes/pseudo-classes, elements) and compare left to right. `#nav .item a` is (1, 1, 1) and beats `.nav .item a` (0, 2, 1). `:where()` adds zero specificity; `:is()` and `:not()` take the specificity of their most specific argument.",
    },
    {
      q: 'Explain the box model and box-sizing.',
      level: 'basic',
      diagram: `
flowchart LR
  subgraph M["margin"]
    subgraph B["border"]
      subgraph P["padding"]
        C["content"]
      end
    end
  end
`,
      a: "Every element is a box: content, then padding, then border, then margin. With the default `box-sizing: content-box`, `width` sets only the content, so padding and border make the box bigger. With `border-box`, `width` includes padding and border, which is much easier to reason about. Most resets set `*, *::before, *::after { box-sizing: border-box }`.",
    },
    {
      q: 'What is margin collapsing?',
      level: 'mid',
      a: "Vertical margins between block elements combine into one margin (the larger of the two) instead of adding up. It also happens between a parent and its first or last child if there's no padding, border or content between them. It doesn't happen in flex or grid containers.",
    },
    {
      q: 'Flexbox vs Grid: when do you use each?',
      level: 'basic',
      a: "- Flexbox is one-dimensional: laying items in a row or a column, like navbars, button groups or centring.\n- Grid is two-dimensional: rows and columns together, like page layouts, card grids and forms.\n\nThey combine well: a grid for the page, flex inside each card.",
      code: `
.center { display: flex; align-items: center; justify-content: center; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
`,
    },
    {
      q: 'What do flex-grow, flex-shrink and flex-basis do?',
      level: 'mid',
      a: "- `flex-basis`: the starting size before extra space is shared.\n- `flex-grow`: how much of the leftover space the item takes, relative to its siblings.\n- `flex-shrink`: how much it shrinks when there's not enough space.\n\n`flex: 1` means grow 1, shrink 1, basis 0. A common bug: flex items won't shrink below their content, so text overflows. Fix it with `min-width: 0`.",
    },
    {
      q: 'Explain position: static, relative, absolute, fixed and sticky.',
      level: 'basic',
      a: "- `static`: normal flow (the default).\n- `relative`: normal flow, but can be nudged with top/left, and becomes the reference for absolute children.\n- `absolute`: removed from flow, positioned against the nearest positioned ancestor.\n- `fixed`: positioned against the viewport (or an ancestor with a `transform`).\n- `sticky`: normal flow until a scroll threshold, then sticks. It fails if an ancestor has `overflow: hidden`.",
    },
    {
      q: 'What is a stacking context, and why does z-index sometimes not work?',
      level: 'advanced',
      diagram: `
flowchart TD
  ROOT["Root stacking context"] --> H["header z-index 10"]
  ROOT --> MAIN["main: transform creates a context (z 1)"]
  MAIN --> MOD["modal z-index 9999"]
  N["The modal can't rise above the header:<br/>its whole group sits at z 1. Fix: a portal"] -.- MOD
`,
      a: "A stacking context is a group whose children are layered together and then placed as one unit. `z-index` only compares elements inside the same stacking context. So a child with `z-index: 9999` can't escape a parent whose context sits below another element.\n\nThings that create a stacking context: `position` with a `z-index`, `opacity` less than 1, `transform`, `filter`, `isolation: isolate`, `position: fixed`, and more.",
    },
    {
      q: 'rem vs em vs px vs % vs vw?',
      level: 'basic',
      a: "- `px`: fixed size.\n- `em`: relative to the element's own font size (compounds when nested).\n- `rem`: relative to the root font size. Best for consistent, zoom-friendly spacing and type.\n- `%`: relative to the parent (for width, the parent's width).\n- `vw`/`vh`: 1% of the viewport. On mobile, prefer `svh`/`dvh` for heights because of browser toolbars.",
    },
    {
      q: 'What does clamp() do?',
      level: 'mid',
      a: "`clamp(min, preferred, max)` picks the preferred value but keeps it between min and max. It's ideal for fluid typography that scales with the screen without breakpoints.",
      code: `
h1 { font-size: clamp(2rem, 5vw, 4rem); }
`,
    },
    {
      q: 'What is mobile-first design?',
      level: 'basic',
      a: "Write base styles for small screens, then add `min-width` media queries to enhance for larger screens. Small screens get less CSS to override, and it forces you to prioritise content.",
    },
    {
      q: 'What are container queries?',
      level: 'mid',
      a: "They let a component change its layout based on the size of its container, not the whole viewport. The same card can be stacked in a narrow sidebar and side-by-side in a wide main area.",
      code: `
.card-wrap { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: flex; }
}
`,
    },
    {
      q: 'What are CSS custom properties, and how are they different from Sass variables?',
      level: 'basic',
      a: "Custom properties (`--brand: #ff6a3d`, used as `var(--brand)`) live in the browser at runtime. They cascade, can be changed per element or in media queries, and can be updated from JavaScript, which makes theming and dark mode easy. Sass variables are replaced at build time and are gone in the final CSS.",
    },
    {
      q: 'What does :has() do?',
      level: 'mid',
      a: "`:has()` is a 'parent selector': it matches an element based on what's inside it. For example, style a form group when its input is invalid, or a card that contains an image.",
      code: `
.field:has(input:invalid) { border-color: red; }
.card:has(img) { padding-top: 0; }
`,
    },
    {
      q: 'Which CSS properties are cheap to animate?',
      level: 'mid',
      a: "`transform` and `opacity` can be animated by the compositor without redoing layout or paint, so they stay smooth. Animating `width`, `height`, `top`, `left` or `margin` triggers layout on every frame and can stutter. Use `transform: translate()` instead of `left`.",
    },
    {
      q: 'How do you truncate text with an ellipsis?',
      level: 'basic',
      a: "For one line, the element needs a width and all three properties below. For several lines, use `line-clamp`.",
      code: `
.one-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.three-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`,
    },
  ],
}
