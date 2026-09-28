import type { Topic } from './types'

export const jsCoding: Topic = {
  id: 'js-coding',
  title: 'JS Coding Round',
  group: 'Interview rounds',
  summary:
    'Polyfills and utilities you should be able to write from scratch (the js-internals repo checklist), plus predict-the-output puzzles on closures, this and the event loop.',
  questions: [
    {
      q: 'Implement Array.prototype.map.',
      level: 'basic',
      a: "Loop over the array, call the callback with (item, index, array) and the given `this`, and collect the results in a new array. Skip holes in sparse arrays like the real one does.",
      code: `
Array.prototype.myMap = function (callback, thisArg) {
  const result = new Array(this.length)
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this)
  }
  return result
}
[1, 2, 3].myMap((n) => n * 2) // [2, 4, 6]
`,
    },
    {
      q: 'Implement Array.prototype.filter.',
      level: 'basic',
      a: "Same shape as map, but only push items where the callback returns a truthy value.",
      code: `
Array.prototype.myFilter = function (callback, thisArg) {
  const result = []
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i])
  }
  return result
}
`,
    },
    {
      q: 'Implement Array.prototype.reduce.',
      level: 'mid',
      a: "The tricky part: with no initial value, the first element is the starting accumulator and the loop starts at index 1. Reducing an empty array with no initial value throws a TypeError.",
      code: `
Array.prototype.myReduce = function (callback, ...init) {
  let i = 0
  let acc
  if (init.length) {
    acc = init[0]
  } else {
    if (this.length === 0) throw new TypeError('Reduce of empty array with no initial value')
    acc = this[0]
    i = 1
  }
  for (; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this)
  }
  return acc
}
`,
    },
    {
      q: 'Implement Promise.all.',
      level: 'mid',
      a: "Return a new promise. Keep results in the original order (not the order they finish), count how many resolved, reject immediately on the first failure, and resolve straight away for an empty array. Wrap each item in `Promise.resolve` so plain values work too.",
      code: `
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = []
    let done = 0
    if (items.length === 0) return resolve(results)
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value
        done++
        if (done === items.length) resolve(results)
      }, reject)
    })
  })
}
`,
    },
    {
      q: 'Implement Promise.allSettled.',
      level: 'mid',
      a: "Like `Promise.all`, but never rejects: record `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }` for each item.",
      code: `
function allSettled(items) {
  return Promise.all(items.map((item) =>
    Promise.resolve(item).then(
      (value) => ({ status: 'fulfilled', value }),
      (reason) => ({ status: 'rejected', reason }),
    ),
  ))
}
`,
    },
    {
      q: 'Implement Function.prototype.bind.',
      level: 'mid',
      a: "Return a new function that calls the original with a fixed `this` and any pre-filled arguments followed by the new ones.",
      code: `
Function.prototype.myBind = function (thisArg, ...preset) {
  const fn = this
  return function (...args) {
    return fn.apply(thisArg, [...preset, ...args])
  }
}
`,
    },
    {
      q: 'Implement Function.prototype.call without using call, apply or bind.',
      level: 'advanced',
      a: "Temporarily attach the function to the target object as a property (use a Symbol so you don't overwrite anything), call it as a method so `this` is the object, then delete it.",
      code: `
Function.prototype.myCall = function (thisArg, ...args) {
  const ctx = thisArg ?? globalThis
  const key = Symbol('fn')
  ctx[key] = this
  const result = ctx[key](...args)
  delete ctx[key]
  return result
}
`,
    },
    {
      q: 'Implement a deep clone.',
      level: 'mid',
      a: "Recursively copy arrays and plain objects; return primitives as they are. Use a `WeakMap` to handle circular references (otherwise infinite recursion). Handle `Date` specially. In real code, use `structuredClone`.",
      code: `
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value)
  if (seen.has(value)) return seen.get(value)
  const copy = Array.isArray(value) ? [] : {}
  seen.set(value, copy)
  for (const key of Object.keys(value)) copy[key] = deepClone(value[key], seen)
  return copy
}
`,
    },
    {
      q: 'Flatten a nested array (with an optional depth).',
      level: 'basic',
      a: "Recursively spread items that are arrays until the depth runs out. The built-in is `arr.flat(depth)`.",
      code: `
function flatten(arr, depth = Infinity) {
  return arr.reduce((out, item) =>
    Array.isArray(item) && depth > 0
      ? out.concat(flatten(item, depth - 1))
      : out.concat([item]), [])
}
flatten([1, [2, [3, [4]]]])    // [1, 2, 3, 4]
flatten([1, [2, [3, [4]]]], 1) // [1, 2, [3, [4]]]
`,
    },
    {
      q: 'Flatten a nested object into dot-notation keys.',
      level: 'mid',
      a: "Walk the object recursively, building the key path. Useful for forms and for querying nested fields in MongoDB.",
      code: `
function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? prefix + '.' + key : key
    if (value && typeof value === 'object' && !Array.isArray(value)) flattenObject(value, path, out)
    else out[path] = value
  }
  return out
}
flattenObject({ user: { name: 'Avi', address: { city: 'Kota' } } })
// { 'user.name': 'Avi', 'user.address.city': 'Kota' }
`,
    },
    {
      q: 'Implement once().',
      level: 'basic',
      a: "Return a function that runs the original only the first time and returns the same result afterwards. A closure keeps the flag and result.",
      code: `
function once(fn) {
  let called = false, result
  return function (...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}
const init = once(() => console.log('connected'))
init(); init() // logs once
`,
    },
    {
      q: 'Implement a function that retries a promise-returning call.',
      level: 'mid',
      a: "Try the call; on failure wait (with exponential backoff) and try again, up to a maximum number of attempts, then throw the last error.",
      code: `
async function retry(fn, { attempts = 3, delay = 500 } = {}) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delay * 2 ** i))
    }
  }
  throw lastError
}
`,
    },
    {
      q: 'Run async tasks with a concurrency limit.',
      level: 'advanced',
      a: "Start up to `limit` workers; each takes the next task from a shared index until none are left. Results keep their original order. This is the core of how BullMQ's `concurrency` or a scraping pool behaves.",
      code: `
async function runWithLimit(tasks, limit) {
  const results = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

await runWithLimit(urls.map((u) => () => audit(u)), 4)
`,
    },
    {
      q: 'Implement a sleep and a timeout wrapper.',
      level: 'basic',
      a: "`sleep` is a promise that resolves after a delay. A timeout wrapper races the real promise against one that rejects after the limit.",
      code: `
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function withTimeout(promise, ms) {
  let id
  const timeout = new Promise((_, reject) => {
    id = setTimeout(() => reject(new Error('Timed out after ' + ms + 'ms')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(id))
}
`,
    },
    {
      q: 'Implement an LRU cache.',
      level: 'advanced',
      a: "A Least Recently Used cache evicts the entry that hasn't been used for the longest time when it's full. A JavaScript `Map` keeps insertion order, so on every `get` delete and re-insert the key (making it newest); to evict, remove the first key. Both operations are O(1).",
      code: `
class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map() }
  get(key) {
    if (!this.map.has(key)) return -1
    const value = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }
  put(key, value) {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value)
  }
}
`,
    },
    {
      q: 'Output: closures in a loop with var and let.',
      level: 'basic',
      a: "With `var`, all callbacks share one `i`, which is 3 when they run. With `let`, each iteration has its own `i`.",
      code: `
for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i))
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j))

// var 3, var 3, var 3, let 0, let 1, let 2
`,
    },
    {
      q: 'Output: this in regular vs arrow methods.',
      level: 'mid',
      a: "`regular` is called as `obj.regular()`, so `this` is `obj`. The arrow function takes `this` from where the object literal is written (module or global scope), not from `obj`, so `this.name` is undefined.",
      code: `
const obj = {
  name: 'Avi',
  regular() { return this.name },
  arrow: () => this?.name,
}
console.log(obj.regular()) // 'Avi'
console.log(obj.arrow())   // undefined
`,
    },
    {
      q: 'Output: promises, timeouts and synchronous code.',
      level: 'mid',
      a: "Synchronous code first (1, 5), then all microtasks (3, then 4, which was queued by 3), then the timeout (2).",
      code: `
console.log(1)
setTimeout(() => console.log(2))
Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4))
console.log(5)

// 1, 5, 3, 4, 2
`,
    },
    {
      q: 'Output: a promise executor runs synchronously.',
      level: 'mid',
      a: "The function passed to `new Promise` runs immediately, so 'b' logs before 'c'. Only the `.then` callback is delayed as a microtask.",
      code: `
console.log('a')
new Promise((resolve) => {
  console.log('b')
  resolve()
}).then(() => console.log('d'))
console.log('c')

// a, b, c, d
`,
    },
    {
      q: 'Output: hoisting with function and var of the same name.',
      level: 'advanced',
      a: "Function declarations are hoisted with their body, so `typeof foo` is 'function' at the top. Then the assignment runs and `foo` becomes a number.",
      code: `
console.log(typeof foo) // 'function'
var foo = 1
function foo() {}
console.log(typeof foo) // 'number'
`,
    },
    {
      q: 'Output: object keys and references.',
      level: 'mid',
      a: "Object keys are strings. Both `b` and `c` are objects, which become the same string `'[object Object]'` as keys, so the second assignment overwrites the first. Use a `Map` for object keys.",
      code: `
const a = {}
const b = { key: 'b' }
const c = { key: 'c' }
a[b] = 123
a[c] = 456
console.log(a[b]) // 456
`,
    },
    {
      q: 'Output: typeof and equality edge cases.',
      level: 'basic',
      a: "Classic surprises worth memorising.",
      code: `
typeof null          // 'object'
typeof []            // 'object'
typeof NaN           // 'number'
NaN === NaN          // false  (use Number.isNaN)
0.1 + 0.2 === 0.3    // false  (floating point: 0.30000000000000004)
[] + []              // ''
[] == false          // true
null == 0            // false
null >= 0            // true
`,
    },
  ],
}
