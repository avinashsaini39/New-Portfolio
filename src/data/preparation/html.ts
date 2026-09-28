import type { Topic } from './types'

export const html: Topic = {
  id: 'html',
  title: 'HTML & Accessibility',
  group: 'Foundations',
  summary: 'Semantic markup, forms and labels, keyboard navigation, focus management and ARIA. Increasingly asked directly in React interviews.',
  questions: [
    {
      q: 'What is semantic HTML and why does it matter?',
      level: 'basic',
      a: "Using elements that describe their meaning: `header`, `nav`, `main`, `article`, `section`, `button`, `label`, instead of `div` for everything.\n\nIt matters because screen readers, search engines and browsers use these meanings. A real `button` is focusable, works with Enter and Space, and is announced as a button, all for free. A clickable `div` gets none of that.",
    },
    {
      q: 'Why is a clickable div worse than a button?',
      level: 'basic',
      a: "A `div` with `onClick` can't be reached with Tab, doesn't respond to Enter or Space, isn't announced as a button, and doesn't get disabled styles or form behaviour. You'd need `role`, `tabIndex` and key handlers to fake it. Just use `button` (with `type=\"button\"` when it's inside a form and shouldn't submit).",
    },
    {
      q: 'How do you correctly label form inputs?',
      level: 'basic',
      a: "Every input needs an accessible name. Best: a `label` with `for` matching the input's `id`, or the input wrapped inside the `label`. Placeholders are not labels: they disappear when typing and often have poor contrast. For errors, link the message with `aria-describedby` and set `aria-invalid`.",
      code: `
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error">Please enter a valid email.</p>
`,
    },
    {
      q: 'What is ARIA, and when should you not use it?',
      level: 'mid',
      a: "ARIA attributes (`role`, `aria-label`, `aria-expanded`, and others) add accessibility information that HTML can't express on its own, like the state of a custom dropdown.\n\nThe first rule of ARIA: if a native element does the job, use it instead. ARIA only changes what's announced; it doesn't add keyboard behaviour. Wrong ARIA is worse than none.",
    },
    {
      q: 'How do you make a custom component keyboard accessible?',
      level: 'mid',
      a: "- Everything clickable must be focusable (native elements, or `tabIndex={0}`).\n- Support the expected keys: Enter/Space to activate, Escape to close, arrow keys inside menus, tabs and listboxes.\n- Show a visible focus style (`:focus-visible`), never just `outline: none`.\n- Keep the tab order following the visual order.",
    },
    {
      q: 'What is focus management in a modal?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant U as User
  participant B as Open button
  participant M as Modal
  U->>B: Click / Enter
  B->>M: Open, move focus to first field
  Note over M: Tab cycles inside (focus trap)
  U->>M: Escape
  M->>B: Close, return focus to the button
`,
      a: "When a modal opens, move focus into it (usually the first field or the close button). Keep Tab cycling inside the modal (a focus trap). Close on Escape. When it closes, return focus to the button that opened it. The native `<dialog>` element with `showModal()` handles much of this for you.",
    },
    {
      q: 'What is alt text and how do you write it?',
      level: 'basic',
      a: "`alt` describes an image for people who can't see it and shows if the image fails to load. Describe the purpose, not the pixels: for a logo link, use the destination ('Home'). For purely decorative images, use `alt=\"\"` so screen readers skip them.",
    },
    {
      q: 'What are colour contrast requirements?',
      level: 'basic',
      a: "WCAG AA asks for a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (about 24px, or 19px bold) and for UI parts like input borders. Also never use colour alone to show meaning: pair a red error border with text or an icon.",
    },
    {
      q: 'What does aria-live do?',
      level: 'mid',
      a: "It marks a region whose changes should be announced by screen readers without moving focus: toast messages, 'saved' confirmations, search result counts. `aria-live=\"polite\"` waits for a pause; `\"assertive\"` interrupts, so keep it for urgent messages.",
    },
    {
      q: 'What is the difference between display:none, visibility:hidden and a visually-hidden class?',
      level: 'mid',
      a: "- `display: none` and `visibility: hidden` hide content from everyone, including screen readers.\n- A 'visually hidden' (sr-only) class hides content on screen but keeps it for screen readers. Use it for extra context, like 'Delete invoice #42' on an icon-only button.",
    },
    {
      q: 'What are the most useful input types and attributes?',
      level: 'basic',
      a: "Types like `email`, `tel`, `number`, `date` and `url` give the right mobile keyboard and built-in validation. Attributes like `required`, `minlength`, `pattern`, `autocomplete` (`email`, `current-password`, `one-time-code`) and `inputmode` improve usability and let password managers work.",
    },
    {
      q: 'What is the purpose of the viewport meta tag?',
      level: 'basic',
      a: "`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` tells mobile browsers to use the device's real width instead of pretending to be a ~980px desktop. Without it, media queries don't behave and pages look zoomed out.",
    },
  ],
}
