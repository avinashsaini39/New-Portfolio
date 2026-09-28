import type { Topic } from './types'

export const cs: Topic = {
  id: 'cs',
  title: 'CS Basics',
  group: 'Foundations',
  summary: 'Big-O in practice, choosing data structures, recursion, and REST principles. The parts of computer science that come up in a web interview.',
  questions: [
    {
      q: 'What is Big-O notation?',
      level: 'basic',
      a: "Big-O describes how the time or memory an algorithm needs grows as the input gets bigger, ignoring constants. Common ones from fast to slow: O(1) constant, O(log n) (binary search), O(n) (one loop), O(n log n) (good sorting), O(n²) (nested loops over the same data), O(2ⁿ) (naive recursion on subsets).",
    },
    {
      q: 'How do you spot O(n²) in real code?',
      level: 'mid',
      a: "Look for work inside a loop that itself loops over the data: `.find`, `.includes`, `.filter` or `.indexOf` inside a `.map` or `for`. The fix is usually to build a `Map` or `Set` once (O(n)), then do O(1) lookups.",
      code: `
// O(n * m): find inside map
const withNames = orders.map((o) => ({
  ...o, user: users.find((u) => u.id === o.userId),
}))

// O(n + m): index once, then look up
const byId = new Map(users.map((u) => [u.id, u]))
const withNames2 = orders.map((o) => ({ ...o, user: byId.get(o.userId) }))
`,
    },
    {
      q: 'What are the time complexities of common array and object operations?',
      level: 'mid',
      a: "- Array: read by index O(1), `push`/`pop` O(1), `shift`/`unshift` O(n) (everything moves), `includes`/`indexOf`/`find` O(n), `sort` O(n log n).\n- Object and `Map`: get, set, delete and has are O(1) on average.\n- `Set`: add, has and delete are O(1) on average.",
    },
    {
      q: 'What is recursion, and what is a stack overflow?',
      level: 'basic',
      a: "Recursion is a function calling itself on a smaller piece of the problem until it reaches a base case. Each call adds a frame to the call stack. Without a correct base case, or with very deep input, the stack runs out of space: 'Maximum call stack size exceeded'. Deep recursion can be rewritten as a loop with your own stack.",
      code: `
function sumNested(arr) {
  let total = 0
  for (const item of arr) {
    total += Array.isArray(item) ? sumNested(item) : item
  }
  return total
}
sumNested([1, [2, [3, 4]]]) // 10
`,
    },
    {
      q: 'What are the REST principles?',
      level: 'basic',
      a: "- Resources identified by URLs using nouns: `/users/42/orders`.\n- HTTP methods as the verbs: GET, POST, PUT, PATCH, DELETE.\n- Stateless: each request carries everything the server needs (like a token); the server doesn't remember the previous request.\n- Meaningful status codes.\n- Consistent representations, usually JSON.",
    },
    {
      q: 'What is idempotency and why does it matter?',
      level: 'mid',
      a: "An operation is idempotent if doing it several times has the same effect as doing it once. GET, PUT and DELETE should be idempotent; POST usually isn't.\n\nIt matters because networks retry. If a 'charge payment' POST times out and the client retries, you could charge twice. The fix is an idempotency key: the client sends a unique key, and the server stores the result and returns it for repeats.",
    },
    {
      q: 'Stack vs queue?',
      level: 'basic',
      diagram: `
flowchart LR
  subgraph Stack["Stack: last in, first out"]
    direction TB
    S3["3 (top: popped first)"] --- S2["2"] --- S1["1"]
  end
  subgraph Queue["Queue: first in, first out"]
    direction LR
    Q1["1 (front: out first)"] --- Q2["2"] --- Q3["3 (back: newest)"]
  end
`,
      a: "- Stack: last in, first out (LIFO). Like a stack of plates. Used for undo, the call stack, DFS, bracket matching.\n- Queue: first in, first out (FIFO). Like a line at a counter. Used for BFS, job queues (BullMQ), task scheduling.",
    },
    {
      q: 'What is a hash map and how does it achieve O(1)?',
      level: 'mid',
      a: "A hash map runs the key through a hash function that turns it into an index in an internal array, so it can jump straight to the right slot. When two keys land in the same slot (a collision), it stores both and checks them. With a good hash function and resizing as it fills, lookups are O(1) on average.",
    },
    {
      q: 'What is the difference between a process and a thread?',
      level: 'mid',
      a: "A process is a running program with its own memory. Threads live inside a process and share its memory, which makes communication cheap but needs care to avoid race conditions. Node runs your JavaScript on one main thread, uses a thread pool (libuv) for some I/O, and can use worker threads or extra processes for CPU-heavy work.",
    },
    {
      q: 'What is binary search and when can you use it?',
      level: 'basic',
      a: "On a sorted array, check the middle element, then throw away the half that can't contain the target. Repeat. O(log n): about 20 steps for a million items. It only works on sorted data.",
      code: `
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}
`,
    },
  ],
}
