import type { Topic } from './types'

export const react: Topic = {
  id: 'react',
  title: 'React',
  group: 'Frontend',
  summary:
    'The model underneath the API: what triggers a render, reconciliation and keys, state as a snapshot, when not to use useEffect, memoisation, and performance.',
  questions: [
    {
      q: 'What triggers a re-render in React?',
      level: 'basic',
      a: "A component re-renders when:\n- its own state changes (`setState` with a different value),\n- its parent re-renders (by default, children re-render too, even if their props didn't change),\n- a context it reads with `useContext` changes.\n\nChanging a prop doesn't 'cause' a render by itself: the parent rendering is what passes the new prop down.",
    },
    {
      q: 'What is the difference between the render phase and the commit phase?',
      level: 'mid',
      diagram: `
flowchart LR
  T["Trigger<br/>(setState, parent render,<br/>context change)"] --> R["Render phase<br/>call components, diff trees<br/>(pure)"]
  R --> C["Commit phase<br/>update DOM,<br/>layout effects"]
  C --> P["Browser paints"] --> E["useEffect runs"]
`,
      a: "- Render phase: React calls your components to work out what the UI should look like. This must be pure: no side effects. React may run it more than once or throw it away.\n- Commit phase: React applies the differences to the real DOM, then runs layout effects and, after paint, regular effects.\n\nA render doesn't always mean a DOM update: if the output is the same, nothing in the DOM changes.",
    },
    {
      q: 'What is reconciliation?',
      level: 'mid',
      diagram: `
flowchart TD
  Q{"Same element type<br/>at the same position?"} -- "yes" --> K["Keep DOM node + state,<br/>update changed props"]
  Q -- "no" --> D["Destroy old subtree (state lost),<br/>mount the new one"]
  L["Lists: children matched by key"] -.- Q
`,
      a: "Reconciliation is how React compares the new element tree with the previous one to find the minimum changes to the DOM. Its rules:\n- Different element type at the same position (a `div` becoming a `span`, or `ComponentA` becoming `ComponentB`): tear down the old subtree, including its state, and build a new one.\n- Same type: keep the DOM node and component state, update only the changed props.\n- Lists: match children by `key`.",
    },
    {
      q: 'Why do lists need keys, and why is the index a bad key?',
      level: 'basic',
      diagram: `
flowchart LR
  subgraph Before["Before: delete 'Asha'"]
    A0["key 0 → Asha (input: 'hi')"]
    A1["key 1 → Ravi"]
  end
  subgraph After["After, with index keys"]
    B0["key 0 → Ravi (still shows 'hi'!)"]
  end
  A0 -. "key 0 reused" .-> B0
`,
      a: "Keys tell React which item is which between renders, so it can keep the right state and DOM node for each item when the list changes.\n\nUsing the array index breaks when items are inserted, removed or reordered: the key stays with the position, not the item. Input values, focus and component state end up attached to the wrong row. Use a stable unique ID from your data.",
      code: `
// Bug: after deleting the first todo, the second one shows the first one's input text
{todos.map((t, i) => <TodoRow key={i} todo={t} />)}

// Correct
{todos.map((t) => <TodoRow key={t.id} todo={t} />)}
`,
    },
    {
      q: 'How can you use key to reset a component?',
      level: 'mid',
      a: "Changing a component's `key` makes React treat it as a brand-new component: the old one is removed with its state, and a fresh one is mounted. It's the clean way to reset a form when switching between records, instead of syncing state in an effect.",
      code: `
<EditProfileForm key={selectedUser.id} user={selectedUser} />
`,
    },
    {
      q: "What does 'state is a snapshot' mean?",
      level: 'mid',
      a: "During a render, state values are fixed for that render. Calling `setCount` doesn't change `count` in the current code; it asks React for a new render where `count` has the new value. Event handlers and effects created in a render see that render's values.",
      code: `
function Counter() {
  const [count, setCount] = useState(0)
  function handleClick() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    console.log(count) // still 0 in this render
  }
  // After the click, count is 1, not 3
}
`,
    },
    {
      q: 'What is a functional update, and when do you need it?',
      level: 'basic',
      a: "Passing a function to the setter: `setCount(c => c + 1)`. React calls it with the latest state, so several updates in a row stack up correctly. Use it whenever the new state depends on the previous state, especially in async callbacks and intervals, where the variable you closed over may be stale.",
      code: `
setCount((c) => c + 1)
setCount((c) => c + 1) // count goes up by 2

useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000)
  return () => clearInterval(id)
}, []) // no stale 'seconds' problem
`,
    },
    {
      q: 'What is automatic batching?',
      level: 'mid',
      a: "React groups several state updates that happen in the same event into one re-render. Since React 18 this happens everywhere: in event handlers, promises, timeouts and native listeners. It's why you see the final result once instead of intermediate renders. `flushSync` forces an immediate update when you really need it (rare).",
    },
    {
      q: 'What is derived state, and why is storing it usually a bug?',
      level: 'mid',
      a: "Derived state is anything you can calculate from existing props or state, like `fullName` from `firstName` and `lastName`, or a filtered list. Storing it in its own `useState` and syncing it with an effect means two sources of truth that can get out of step, plus an extra render. Just calculate it during render (with `useMemo` only if it's expensive).",
      code: `
// Avoid
const [filtered, setFiltered] = useState([])
useEffect(() => setFiltered(items.filter((i) => i.active)), [items])

// Do this
const filtered = items.filter((i) => i.active)
`,
    },
    {
      q: 'What does lifting state up mean? And colocation?',
      level: 'basic',
      a: "- Lifting state up: when two siblings need the same data, move the state to their closest common parent and pass it down as props.\n- Colocation: the opposite habit. Keep state as close as possible to where it's used. State that lives too high makes big parts of the tree re-render for no reason.",
    },
    {
      q: 'What are the rules of hooks, and why do they exist?',
      level: 'mid',
      diagram: `
flowchart LR
  subgraph Calls["Hook calls in order"]
    H1["useState('')"] --> H2["useState(false)"] --> H3["useEffect(...)"]
  end
  subgraph Slots["React's stored slots"]
    S1["slot 1"]
    S2["slot 2"]
    S3["slot 3"]
  end
  H1 -.-> S1
  H2 -.-> S2
  H3 -.-> S3
`,
      a: "- Only call hooks at the top level of a component or custom hook: not inside conditions, loops or nested functions.\n- Only call them from React functions.\n\nReason: React doesn't know hooks by name. It stores them in a list per component and matches them by call order. If a condition skips one hook on some renders, every hook after it gets the wrong state.",
    },
    {
      q: 'What is useEffect actually for?',
      level: 'mid',
      a: "Synchronising your component with something outside React: subscriptions, timers, WebSocket connections, browser APIs, non-React widgets, and fetching data (though a library like TanStack Query is often better).\n\nIt's not for reacting to state changes inside React. If you're setting state in response to other state or props, you usually want to calculate it during render or do it in the event handler instead.",
    },
    {
      q: "When should you NOT use useEffect?",
      level: 'mid',
      a: "- Transforming data for rendering: calculate it during render.\n- Handling a user event (sending a POST when a button is clicked): do it in the event handler, where you know what happened.\n- Resetting state when a prop changes: use a `key`.\n- Notifying the parent of a change: call the parent's callback in the same event handler.\n- Chains of effects that set state that triggers another effect: combine the logic in one place.\n\nEach unnecessary effect causes an extra render and makes the data flow harder to follow.",
    },
    {
      q: 'Explain the useEffect dependency array and cleanup function.',
      level: 'basic',
      diagram: `
sequenceDiagram
  participant C as Component
  participant E as Effect
  C->>E: Mount: run effect (connect room A)
  Note over C: roomId changes to B
  C->>E: Cleanup (disconnect A)
  C->>E: Run again (connect B)
  Note over C: Unmount
  C->>E: Cleanup (disconnect B)
`,
      a: "- No array: runs after every render.\n- `[]`: runs once after mount (twice in development under StrictMode, on purpose).\n- `[a, b]`: runs after mount and whenever `a` or `b` changes.\n\nThe cleanup function you return runs before the effect runs again and when the component unmounts. Use it to unsubscribe, clear timers, close sockets and abort requests.",
      code: `
useEffect(() => {
  const socket = connect(roomId)
  return () => socket.disconnect() // runs when roomId changes or on unmount
}, [roomId])
`,
    },
    {
      q: 'How do you avoid race conditions when fetching data in an effect?',
      level: 'mid',
      a: "If the user changes the input quickly, an older, slower request can finish after a newer one and show the wrong data. Fix it by ignoring stale responses in the cleanup (a flag or `AbortController`), or use TanStack Query, which handles this for you.",
      code: `
useEffect(() => {
  let ignore = false
  fetchProfile(userId).then((data) => {
    if (!ignore) setProfile(data)
  })
  return () => { ignore = true }
}, [userId])
`,
    },
    {
      q: 'Why does useEffect run twice in development?',
      level: 'basic',
      a: "In StrictMode during development, React mounts, unmounts and re-mounts each component once to check that your effect cleanup is correct. If running it twice causes a bug (a double subscription, a duplicate request that matters), your cleanup is missing. It doesn't happen in production.",
    },
    {
      q: 'useEffect vs useLayoutEffect?',
      level: 'mid',
      a: "- `useEffect` runs after the browser paints. Use it for almost everything.\n- `useLayoutEffect` runs after the DOM updates but before paint, blocking it. Use it only when you must measure the DOM and adjust before the user sees anything, like positioning a tooltip, to avoid a visible flicker.",
    },
    {
      q: 'What is useRef used for?',
      level: 'basic',
      a: "`useRef` gives you a box (`ref.current`) that survives re-renders and doesn't trigger a render when it changes. Two uses:\n- Accessing DOM elements: focus an input, measure size, scroll into view.\n- Storing mutable values that aren't shown on screen: timer IDs, the previous value, a 'did mount' flag, the latest callback.\n\nDon't read or write `ref.current` during render; do it in effects and handlers.",
      code: `
function Search() {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  )
}
`,
    },
    {
      q: 'When would you use useReducer instead of useState?',
      level: 'mid',
      a: "When state has several related values that change together, or when the next state depends on complex logic. A reducer puts all update logic in one pure function that's easy to test, and components just `dispatch` what happened.",
      code: `
type Action = { type: 'added'; text: string } | { type: 'toggled'; id: string }

function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'added':
      return [...state, { id: crypto.randomUUID(), text: action.text, done: false }]
    case 'toggled':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
  }
}

const [todos, dispatch] = useReducer(todosReducer, [])
`,
    },
    {
      q: 'How does useContext affect re-renders?',
      level: 'mid',
      a: "Every component that reads a context re-renders when the context value changes, even if it only uses one field that didn't change. And if the provider's `value` is a new object on every render, all consumers re-render every time.\n\nFixes: memoise the value with `useMemo`, split one big context into smaller ones (state and dispatch separately), or use a store like Zustand that lets components subscribe to slices.",
      code: `
const value = useMemo(() => ({ user, login, logout }), [user])
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
`,
    },
    {
      q: 'What do useMemo and useCallback do, and why are they not free?',
      level: 'mid',
      a: "- `useMemo(fn, deps)` caches a calculated value between renders.\n- `useCallback(fn, deps)` caches a function (it's `useMemo` returning a function).\n\nThey have a cost: extra memory, comparing dependencies every render, and harder-to-read code. They only help when:\n- the calculation is genuinely expensive, or\n- the value is passed to a `React.memo` child or used as another hook's dependency, where a stable reference matters.\n\n(The React Compiler, which this portfolio uses, adds this memoisation automatically.)",
    },
    {
      q: 'What does React.memo do?',
      level: 'mid',
      a: "It wraps a component so it skips re-rendering when its props are shallowly equal to last time. It only helps if the props really are stable: passing a new object, array or inline function every render defeats it. Use it on components that render often with the same props and are expensive to render.",
      code: `
const Row = React.memo(function Row({ item, onSelect }: RowProps) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>
})

// Parent must keep onSelect stable or Row re-renders anyway
const onSelect = useCallback((id: string) => setSelected(id), [])
`,
    },
    {
      q: 'What makes a good custom hook?',
      level: 'mid',
      a: "A custom hook is a function starting with `use` that calls other hooks, so you can reuse stateful logic (not state itself: each component calling it gets its own state). Good ones:\n- have one clear job (`useDebounce`, `useOnlineStatus`, `useMediaQuery`),\n- return a small, stable API,\n- clean up everything they start.",
      code: `
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

const debouncedQuery = useDebounce(query)
`,
    },
    {
      q: 'Controlled vs uncontrolled inputs?',
      level: 'basic',
      a: "- Controlled: React state holds the value (`value` + `onChange`). You can validate, format and react on every keystroke. The downside is a re-render on each keystroke.\n- Uncontrolled: the DOM holds the value; you read it with a ref or `FormData` when needed (`defaultValue`). Less code, fewer renders.\n\nReact Hook Form uses uncontrolled inputs under the hood, which is why it's fast on large forms.",
    },
    {
      q: 'How do you handle form validation in React?',
      level: 'mid',
      a: "A common modern setup is React Hook Form with a Zod schema. The schema defines the rules once, gives you the TypeScript type, and can be reused on the server to validate the same payload.",
      code: `
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'At least 8 characters'),
})
type FormValues = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } =
  useForm<FormValues>({ resolver: zodResolver(schema) })

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <p>{errors.email.message}</p>}
</form>
`,
    },
    {
      q: 'What are error boundaries?',
      level: 'mid',
      a: "Components that catch errors thrown while rendering their children and show a fallback UI instead of a blank screen. They must be class components (or use a library like `react-error-boundary`). They don't catch errors in event handlers, async code, or the boundary itself; handle those with `try/catch`.",
      code: `
<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <CampaignAnalytics />
</ErrorBoundary>
`,
    },
    {
      q: 'What are Suspense and lazy loading?',
      level: 'mid',
      a: "`React.lazy(() => import('./Page'))` loads a component's code only when it's first rendered. `<Suspense fallback={...}>` shows the fallback while it loads. Together they give route-level code splitting. Suspense also works with data libraries that support it, such as TanStack Query's suspense mode and Next.js Server Components.",
    },
    {
      q: 'How do you find and fix performance problems in React?',
      level: 'mid',
      diagram: `
flowchart TD
  P["Profile with React DevTools"] --> W{"Why did it render?"}
  W -- "state too high" --> A["Move state down (colocate)"]
  W -- "new props every render" --> B["useMemo / useCallback + React.memo"]
  W -- "huge list" --> C["Virtualise the list"]
  W -- "context changes" --> D["Split context / use a store"]
  W -- "slow typing" --> E["useDeferredValue / startTransition"]
`,
      a: "- Measure first with the React DevTools Profiler: record an interaction and see which components rendered, how long each took, and why.\n- Common fixes: move state down (colocation), split contexts, stabilise props with `useCallback`/`useMemo` for memoised children, wrap expensive children in `React.memo`.\n- For long lists (hundreds or thousands of rows), use virtualisation (`@tanstack/react-virtual` or `react-window`) so only visible rows are rendered.\n- Check the bundle with a bundle analyser and code-split heavy routes and libraries.",
    },
    {
      q: 'What is virtualisation?',
      level: 'mid',
      a: "Rendering only the rows currently visible (plus a small buffer) in a long list, and swapping them as you scroll. A list of 10,000 contacts then only has about 20 DOM nodes. Essential for things like a CRM contact list or chat history.",
    },
    {
      q: 'What is prop drilling, and how do you avoid it?',
      level: 'basic',
      a: "Passing props through several layers of components that don't use them, just to reach a deep child. Solutions:\n- Component composition: pass `children` or elements as props, so the middle layers don't need to know.\n- Context for truly global values (theme, current user).\n- A state library (Zustand, Redux) for shared app state.",
    },
    {
      q: 'What are portals?',
      level: 'mid',
      a: "`createPortal(children, domNode)` renders children into a different DOM node, usually `document.body`, while keeping them in the same React tree (context and events still work). Used for modals, tooltips and dropdowns that must escape `overflow: hidden` or stacking contexts.",
    },
    {
      q: 'What is forwardRef, and what changed in React 19?',
      level: 'mid',
      a: "`forwardRef` let a component pass a `ref` from its parent to an inner DOM element, which component libraries need (for example so a parent can focus your custom `Input`). In React 19, `ref` is a normal prop for function components, so `forwardRef` is no longer needed for new code.",
    },
    {
      q: 'What are Server Components (briefly)?',
      level: 'advanced',
      a: "Components that run only on the server (at build time or per request). They can read databases and files directly, and their code never ships to the browser, which reduces bundle size. They can't use state, effects or browser APIs. Interactive parts are Client Components marked with `\"use client\"`. Used mainly through Next.js App Router.",
    },
    {
      q: 'What are useTransition and useDeferredValue?',
      level: 'advanced',
      a: "Both mark some updates as lower priority so typing and clicking stay responsive.\n- `useTransition`: wrap a state update in `startTransition`; React can interrupt that render if something more urgent happens, and `isPending` tells you it's in progress.\n- `useDeferredValue`: gives you a version of a value that 'lags behind' during heavy renders, useful for filtering a big list as the user types.",
      code: `
const [query, setQuery] = useState('')
const deferredQuery = useDeferredValue(query)
const results = useMemo(() => filterContacts(all, deferredQuery), [all, deferredQuery])
`,
    },
    {
      q: 'How did you build a reusable component library, and how do you keep components flexible?',
      level: 'mid',
      a: "This is a question about your EasySocial.io work. Points worth making:\n- Consistent props API across components (`size`, `variant`, `disabled`), typed with TypeScript.\n- Composition over configuration: accept `children` and slots instead of dozens of boolean props.\n- Forward refs and spread remaining props onto the root element so consumers can add `aria-*` or `data-*` attributes.\n- Theme tokens from MUI's theme instead of hard-coded colours.\n- Accessibility built in (labels, focus states, keyboard support).\n- Documentation and examples so other developers use them rather than rebuild them.",
    },
  ],
}
