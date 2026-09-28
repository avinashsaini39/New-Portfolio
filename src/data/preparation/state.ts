import type { Topic } from './types'

export const state: Topic = {
  id: 'state',
  title: 'State & Data Fetching',
  group: 'Frontend',
  summary:
    'Redux Toolkit, Zustand, Context and TanStack Query, and being able to defend your choice. Plus routing with React Router.',
  questions: [
    {
      q: 'What is the difference between client state and server state?',
      level: 'mid',
      diagram: `
flowchart TD
  Q{"What kind of state?"} --> SV["From the server"] --> TQ["TanStack Query / RTK Query"]
  Q --> UI["One component's UI"] --> US["useState / useReducer"]
  Q --> SH["Shared UI state"] --> ZS["Context (rare changes)<br/>Zustand / Redux (frequent)"]
  Q --> URL["Filters, page, tab"] --> SP["URL search params"]
`,
      a: "- Client state belongs to the UI: is the modal open, the selected tab, form input, theme. You own it completely.\n- Server state is a copy of data that lives on the server: users, campaigns, messages. It can go stale, other people can change it, and it needs fetching, caching, refetching and error handling.\n\nMixing them (keeping API data in Redux by hand) leads to lots of boilerplate. Modern apps use a server-state library (TanStack Query, RTK Query) for server data and something small for client state.",
    },
    {
      q: 'Context vs Zustand vs Redux: how do you choose?',
      level: 'mid',
      a: "- Context: built in, fine for values that rarely change (theme, logged-in user, locale). Every consumer re-renders when the value changes, so it's poor for frequently changing state.\n- Zustand: tiny store with hooks; components subscribe to only the slice they need, so re-renders are precise. Very little boilerplate. Great for most apps' client state.\n- Redux Toolkit: more structure (slices, actions, middleware), excellent DevTools with time travel, and RTK Query for server state. Good for large teams and complex state that benefits from strict patterns.\n\nA good answer names the trade-off and ties it to the project's size and team.",
    },
    {
      q: 'What problems does Redux Toolkit solve compared to classic Redux?',
      level: 'basic',
      diagram: `
flowchart LR
  UI["Component"] -- "dispatch(action)" --> MW["Middleware"] --> R["Reducers (pure)"] --> ST["Store"]
  ST -- "useSelector" --> UI
`,
      a: "Classic Redux needed separate action types, action creators, switch-statement reducers, careful immutable updates, and manual store setup. Redux Toolkit gives you:\n- `createSlice`: reducers and actions together in one place.\n- Immer built in: you write 'mutating' code and it produces immutable updates.\n- `configureStore`: sensible defaults, DevTools and thunk middleware included.\n- `createAsyncThunk` and RTK Query for async and API data.",
      code: `
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as CartItem[] },
  reducers: {
    added(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload) // Immer makes this immutable
    },
    removed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
  },
})

export const { added, removed } = cartSlice.actions
`,
    },
    {
      q: 'Why must Redux state be updated immutably?',
      level: 'mid',
      a: "Redux and React decide whether something changed by comparing references (`prev === next`). If you mutate an object in place, the reference stays the same, so selectors and components think nothing changed and don't update. Immutability also makes time-travel debugging possible. Immer (inside RTK) lets you write mutation-style code that safely produces new objects.",
    },
    {
      q: 'What are selectors, and why memoise them?',
      level: 'mid',
      a: "Selectors are functions that read (and derive) data from the store: `state => state.cart.items`. `useSelector` re-renders a component when the selected value changes by reference. A selector that returns a new array every time (like `.filter`) causes a re-render on every store update. `createSelector` (Reselect) caches the result until its inputs change.",
      code: `
const selectItems = (s: RootState) => s.cart.items
const selectTotal = createSelector([selectItems], (items) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0),
)
`,
    },
    {
      q: 'What is a thunk?',
      level: 'mid',
      a: "A thunk is a function you dispatch instead of a plain action object. The thunk middleware calls it with `dispatch` and `getState`, so it can do async work (like an API call) and dispatch real actions when done. `createAsyncThunk` generates the pending, fulfilled and rejected actions for you.",
    },
    {
      q: 'What is RTK Query?',
      level: 'mid',
      a: "Redux Toolkit's data-fetching and caching layer. You define API endpoints once and get generated hooks like `useGetCampaignsQuery`, with caching, loading and error state, deduplication of requests, and cache invalidation through tags. It's the Redux answer to TanStack Query.",
      code: `
const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Campaign'],
  endpoints: (build) => ({
    getCampaigns: build.query<Campaign[], void>({
      query: () => 'campaigns',
      providesTags: ['Campaign'],
    }),
    addCampaign: build.mutation<Campaign, NewCampaign>({
      query: (body) => ({ url: 'campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaign'], // refetch the list after adding
    }),
  }),
})
`,
    },
    {
      q: 'How does a Zustand store work?',
      level: 'basic',
      a: "You create a store with `create`, which returns a hook. Components call the hook with a selector and only re-render when that selected slice changes. No providers needed.",
      code: `
const useInbox = create<InboxState>((set) => ({
  selectedChatId: null,
  unread: 0,
  selectChat: (id) => set({ selectedChatId: id }),
  markRead: () => set((s) => ({ unread: Math.max(0, s.unread - 1) })),
}))

const unread = useInbox((s) => s.unread) // re-renders only when unread changes
`,
    },
    {
      q: 'What does TanStack Query (React Query) do for you?',
      level: 'basic',
      a: "It manages server state: fetching, caching by key, deduplicating identical requests, background refetching (on window focus, reconnect or an interval), retries, pagination and infinite scroll, and loading and error states. You stop writing `useEffect` + `useState` + loading flags for every request.",
      code: `
const { data, isPending, error } = useQuery({
  queryKey: ['campaign', campaignId],
  queryFn: () => api.getCampaign(campaignId),
  staleTime: 60_000,
})
`,
    },
    {
      q: 'What is the difference between staleTime and gcTime in TanStack Query?',
      level: 'mid',
      diagram: `
flowchart TD
  M["useQuery mounts"] --> C{"In cache?"}
  C -- "no" --> F["Fetch"]
  C -- "yes" --> S{"Older than staleTime?"}
  S -- "no" --> U["Serve cache, no request"]
  S -- "yes" --> B["Serve cache + refetch in background"]
  X["No component uses it"] --> G["Kept for gcTime, then removed"]
`,
      a: "- `staleTime`: how long fetched data counts as fresh. While fresh, it's served from cache with no refetch. Default is 0, so data is instantly 'stale' and refetched on the next mount or window focus.\n- `gcTime` (formerly `cacheTime`): how long unused data stays in memory after no component uses it. Default 5 minutes.",
    },
    {
      q: 'How do you invalidate queries after a mutation?',
      level: 'mid',
      a: "After a successful mutation, call `queryClient.invalidateQueries` with the key of the affected data. Those queries are marked stale and refetched if they're on screen.",
      code: `
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: api.createContact,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
})
`,
    },
    {
      q: 'What are optimistic updates?',
      level: 'advanced',
      diagram: `
sequenceDiagram
  participant U as User
  participant C as Cache
  participant S as Server
  U->>C: Click star
  C->>C: Snapshot, update instantly
  C->>S: PATCH request
  alt success
    S-->>C: 200 → invalidate to confirm
  else failure
    S-->>C: 500 → restore snapshot
  end
`,
      a: "Updating the UI immediately as if the request already succeeded, then rolling back if it fails. It makes actions like 'mark as read' or 'like' feel instant. With TanStack Query: cancel in-flight queries, snapshot the old data, set the new data in the cache, and restore the snapshot in `onError`.",
      code: `
useMutation({
  mutationFn: api.toggleStar,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['chats'] })
    const previous = queryClient.getQueryData<Chat[]>(['chats'])
    queryClient.setQueryData<Chat[]>(['chats'], (old) =>
      old?.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c)),
    )
    return { previous }
  },
  onError: (_err, _id, ctx) => queryClient.setQueryData(['chats'], ctx?.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
})
`,
    },
    {
      q: 'How do you implement infinite scroll with TanStack Query?',
      level: 'mid',
      a: "Use `useInfiniteQuery` with a `getNextPageParam` that reads the next cursor from the last page. Call `fetchNextPage` when a sentinel element at the bottom becomes visible (IntersectionObserver).",
      code: `
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['messages', chatId],
  queryFn: ({ pageParam }) => api.getMessages(chatId, pageParam),
  initialPageParam: null as string | null,
  getNextPageParam: (last) => last.nextCursor ?? undefined,
})
`,
    },
    {
      q: 'How do nested routes and layouts work in React Router?',
      level: 'mid',
      a: "Routes can contain child routes. The parent renders shared UI (a sidebar, header) and an `<Outlet />` where the matching child appears. Navigating between children keeps the parent mounted, so its state and layout persist.",
      code: `
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />
    <Route path="campaigns" element={<Campaigns />} />
    <Route path="campaigns/:id" element={<CampaignDetail />} />
  </Route>
</Routes>

function DashboardLayout() {
  return (<><Sidebar /><main><Outlet /></main></>)
}
`,
    },
    {
      q: 'How do you protect routes that need login?',
      level: 'mid',
      a: "Wrap protected routes in a layout component that checks auth state. If the user isn't logged in, redirect to `/login` (remembering where they were going). Remember this is only for user experience: the API must still check auth on every request.",
      code: `
function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
`,
    },
    {
      q: 'Where should URL state live?',
      level: 'mid',
      a: "Filters, search terms, sort order, the current tab and pagination often belong in the URL (`?status=active&page=2`) rather than component state. Then refresh keeps them, the back button works, and users can share links. Use `useSearchParams` to read and update them.",
    },
  ],
}
