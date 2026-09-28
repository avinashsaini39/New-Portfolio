import type { Topic } from './types'

export const testing: Topic = {
  id: 'testing',
  title: 'Testing',
  group: 'Quality & Ops',
  summary:
    'Jest and Vitest, React Testing Library, MSW, Supertest and Playwright Test. The biggest gap on the resume and the fastest one to close, since you already know Playwright.',
  questions: [
    {
      q: 'What is the testing pyramid?',
      level: 'basic',
      diagram: `
flowchart TB
  E["E2E: few, slow, highest confidence"] --- I["Integration: many, best value"] --- U["Unit: lots, fast"] --- S["Static: TypeScript + ESLint"]
`,
      a: "A guide to how many of each kind of test to write:\n- Many unit tests at the bottom: small, fast, test one function or component.\n- Fewer integration tests in the middle: several pieces together (an API route with a real database, a component with its hooks and mocked API).\n- A few end-to-end tests at the top: a real browser clicking through real flows. Slow and more brittle, but give the most confidence.\n\nMany teams now favour a 'testing trophy' with integration tests as the biggest layer, since they catch the most real bugs per test.",
    },
    {
      q: 'What does "test behaviour, not implementation" mean?',
      level: 'mid',
      a: "Test what a user or caller can observe (what's rendered, what the function returns, which request was sent), not internal details (state variable names, which private function was called). Implementation tests break every time you refactor even when nothing is broken, so people stop trusting them. React Testing Library is built around this idea.",
    },
    {
      q: 'Jest vs Vitest?',
      level: 'basic',
      a: "They have nearly the same API (`describe`, `it`, `expect`, `vi.fn()` vs `jest.fn()`). Vitest is built on Vite, so it's faster, supports ESM and TypeScript without extra setup, and reuses your Vite config. It's the natural choice in Vite projects. Jest is still very common in older codebases and Create React App or Next.js setups.",
    },
    {
      q: 'Write a basic unit test.',
      level: 'basic',
      a: "Arrange the inputs, act by calling the code, assert on the result. Cover the normal case and the edge cases (empty input, boundaries, invalid values).",
      code: `
import { describe, it, expect } from 'vitest'
import { formatPhone } from './formatPhone'

describe('formatPhone', () => {
  it('adds the country code to a 10-digit number', () => {
    expect(formatPhone('8107707411')).toBe('+91 81077 07411')
  })

  it('throws on too few digits', () => {
    expect(() => formatPhone('123')).toThrow('Invalid phone')
  })
})
`,
    },
    {
      q: 'How do you test a React component with React Testing Library?',
      level: 'mid',
      a: "Render it, find elements the way a user would (by role, label or text), interact with `userEvent`, and assert on what appears. Query priority: `getByRole` first, then `getByLabelText`, `getByText`, and `getByTestId` only as a last resort.",
      code: `
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('shows an error when the email is invalid', async () => {
  const user = userEvent.setup()
  render(<LoginForm onSubmit={vi.fn()} />)

  await user.type(screen.getByLabelText(/email/i), 'not-an-email')
  await user.click(screen.getByRole('button', { name: /log in/i }))

  expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
})
`,
    },
    {
      q: 'getBy vs queryBy vs findBy?',
      level: 'mid',
      a: "- `getBy...`: returns the element, throws if not found. Use when it should be there now.\n- `queryBy...`: returns `null` if not found. Use to assert something is absent: `expect(screen.queryByText('Error')).not.toBeInTheDocument()`.\n- `findBy...`: returns a promise that waits (up to about 1 second) for the element. Use for things that appear after async work.\n\nEach has an `...AllBy` version for multiple matches.",
    },
    {
      q: 'Why use userEvent instead of fireEvent?',
      level: 'mid',
      a: "`fireEvent` dispatches a single DOM event. `userEvent` simulates what a real user does: typing fires keydown, keypress, input and keyup for each character, clicking includes pointer and focus events, and disabled elements can't be clicked. Tests become more realistic and catch more bugs.",
    },
    {
      q: 'How do you mock API calls in frontend tests?',
      level: 'mid',
      diagram: `
flowchart LR
  C["Component"] --> H["Hook / TanStack Query"] --> F["fetch"] --> M{"MSW handler"}
  M --> R1["200 data"]
  M --> R2["500 error"]
`,
      a: "Use MSW (Mock Service Worker). It intercepts real `fetch`/XHR requests at the network level and returns mock responses, so your components, hooks and data libraries run their real code. The same handlers can be reused in the browser during development and in Storybook. It's better than mocking `fetch` or axios module by module.",
      code: `
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/campaigns', () => HttpResponse.json([{ id: '1', name: 'Diwali Sale' }])),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('shows an error state', async () => {
  server.use(http.get('/api/campaigns', () => new HttpResponse(null, { status: 500 })))
  render(<CampaignList />)
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
})
`,
    },
    {
      q: 'What are mocks, stubs and spies?',
      level: 'mid',
      a: "- Stub: replaces a function with a fixed response (`vi.fn().mockResolvedValue(user)`).\n- Spy: watches calls to a real function (how many times, with what arguments), optionally letting it run (`vi.spyOn(obj, 'method')`).\n- Mock: a fake with expectations about how it's called. In Jest and Vitest, `vi.fn()` / `jest.fn()` covers all three.\n\nMock at the boundaries (network, time, randomness, third-party SDKs), not your own internal modules.",
    },
    {
      q: 'How do you test code that uses timers or dates?',
      level: 'mid',
      a: "Use fake timers so the test controls time instead of waiting for real seconds.",
      code: `
it('debounces the search call', () => {
  vi.useFakeTimers()
  const onSearch = vi.fn()
  const debounced = debounce(onSearch, 300)

  debounced('a'); debounced('ab'); debounced('abc')
  expect(onSearch).not.toHaveBeenCalled()

  vi.advanceTimersByTime(300)
  expect(onSearch).toHaveBeenCalledOnce()
  expect(onSearch).toHaveBeenCalledWith('abc')
  vi.useRealTimers()
})
`,
    },
    {
      q: 'How do you test a custom hook?',
      level: 'mid',
      a: "Use `renderHook` from React Testing Library, and wrap state changes in `act`. If the hook needs providers (a QueryClient, a router), pass a `wrapper`.",
      code: `
import { renderHook, act } from '@testing-library/react'

it('increments', () => {
  const { result } = renderHook(() => useCounter(5))
  act(() => result.current.increment())
  expect(result.current.count).toBe(6)
})
`,
    },
    {
      q: 'How do you test Express routes?',
      level: 'mid',
      a: "Use Supertest: it sends real HTTP requests to your Express app without starting a server on a port. For integration tests, use a real test database (`mongodb-memory-server` for Mongo, a Docker Postgres or Testcontainers) and reset it between tests.",
      code: `
import request from 'supertest'
import { app } from '../app'

it('rejects campaigns scheduled in the past', async () => {
  const res = await request(app)
    .post('/api/campaigns')
    .set('Authorization', 'Bearer ' + testToken)
    .send({ name: 'Old', scheduledAt: '2020-01-01' })

  expect(res.status).toBe(400)
  expect(res.body.error.code).toBe('BAD_REQUEST')
})
`,
    },
    {
      q: 'Write a Playwright end-to-end test.',
      level: 'mid',
      a: "Playwright Test runs real browsers. Use role-based locators (like RTL), rely on auto-waiting instead of sleeps, and log in once with a saved storage state so each test doesn't repeat the login.",
      code: `
import { test, expect } from '@playwright/test'

test('create a campaign', async ({ page }) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: 'New campaign' }).click()
  await page.getByLabel('Name').fill('Diwali Sale')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByRole('row', { name: /Diwali Sale/ })).toBeVisible()
})
`,
    },
    {
      q: 'What makes a test flaky, and how do you fix it?',
      level: 'mid',
      a: "A flaky test passes and fails without code changes. Causes:\n- Fixed sleeps instead of waiting for a condition.\n- Tests depending on each other or on shared data left behind.\n- Real time, random values or real network calls.\n- Animations and race conditions.\n\nFixes: wait for specific UI states (`findBy`, Playwright's auto-waiting `expect`), isolate data per test, fake time, mock the network, and quarantine a flaky test until it's fixed rather than letting people ignore failures.",
    },
    {
      q: 'Are snapshot tests useful?',
      level: 'mid',
      a: "Sometimes, but they're often abused. Large component snapshots change with every small markup edit, people update them without reading, and they don't say what behaviour matters. Keep snapshots small and focused (a serialised config, an error message), and prefer explicit assertions for components.",
    },
    {
      q: 'What is code coverage, and is 100% the goal?',
      level: 'basic',
      a: "Coverage measures which lines, branches and functions ran during tests. It's good for finding untested areas, but high coverage doesn't mean good tests: you can run every line and assert nothing. Aim for meaningful coverage of important logic and risky paths rather than a number. Something like 70 to 80% on business logic is a common healthy target.",
    },
    {
      q: 'How would you add tests to an existing codebase that has none?',
      level: 'mid',
      a: "- Set up the tools and run tests in CI first, even with one test, so the habit starts.\n- Test new code and every bug fix (write a failing test that reproduces the bug, then fix it).\n- Cover the most-used shared pieces first (the component library, utilities) and the most critical flows with a few E2E tests (login, create campaign).\n- Don't pause feature work for a big 'testing sprint'; grow coverage steadily.\n\nThis is also your answer for how you'd introduce testing at EvolveNext.",
    },
    {
      q: 'What is TDD?',
      level: 'basic',
      a: "Test-Driven Development: write a failing test for the next small behaviour (red), write the simplest code to pass it (green), then clean up the code with the test as a safety net (refactor). It pushes you towards small, testable units and clear requirements. Many developers use it selectively, for example for tricky logic and bug fixes.",
    },
  ],
}
