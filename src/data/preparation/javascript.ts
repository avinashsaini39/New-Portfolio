import type { Topic } from './types'

export const javascript: Topic = {
  id: 'javascript',
  title: 'JavaScript',
  group: 'Foundations',
  summary:
    'The layer underneath React and Node: values and memory, scope and closures, `this`, prototypes, the event loop and async code. Interviews test how it works, not whether you can use it.',
  questions: [
    {
      q: 'What is the difference between primitive and reference types?',
      level: 'basic',
      diagram: `
flowchart LR
  subgraph Primitives["Primitives: copied"]
    A["a = 5"]
    B["b = 10 (own copy)"]
  end
  subgraph References["Objects: shared"]
    U["user"] --> O["{ name: 'Sam' }"]
    C["copy"] --> O
  end
`,
      a: "Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) are stored as the value itself. When you copy one, you get an independent copy.\n\nObjects, arrays and functions are reference types. The variable holds a pointer to the object in memory. Copying the variable copies the pointer, so both variables point to the same object and a change through one is visible through the other.",
      code: `
let a = 5
let b = a
b = 10
console.log(a) // 5  (independent copy)

const user = { name: 'Avi' }
const copy = user
copy.name = 'Sam'
console.log(user.name) // 'Sam'  (same object)
`,
    },
    {
      q: 'What is the difference between a shallow copy and a deep copy?',
      level: 'basic',
      diagram: `
flowchart LR
  OR["original"] --> O1["{ name, address }"]
  SH["shallow copy"] --> O2["{ name, address }"]
  O1 --> AD["address object (shared!)"]
  O2 --> AD
  DP["structuredClone"] --> O3["{ name, address }"] --> AD2["its own address copy"]
`,
      a: "A shallow copy creates a new top-level object, but nested objects are still shared. Spread (`{...obj}`), `Object.assign` and `Array.prototype.slice` are shallow.\n\nA deep copy duplicates every level, so nothing is shared. Use `structuredClone(obj)` in modern browsers and Node 17+. `JSON.parse(JSON.stringify(obj))` also works but drops functions, `undefined`, and turns dates into strings.",
      code: `
const original = { name: 'Avi', address: { city: 'Kota' } }

const shallow = { ...original }
shallow.address.city = 'Jaipur'
console.log(original.address.city) // 'Jaipur'  (nested object shared)

const deep = structuredClone(original)
deep.address.city = 'Delhi'
console.log(original.address.city) // still 'Jaipur'
`,
    },
    {
      q: 'What is the difference between var, let and const?',
      level: 'basic',
      a: "- `var` is function-scoped, can be re-declared, and is hoisted and initialised as `undefined`.\n- `let` is block-scoped (inside `{}`), cannot be re-declared in the same scope, and can be reassigned.\n- `const` is block-scoped and cannot be reassigned. The object it points to can still be changed.\n\nIn practice: use `const` by default, `let` when you need to reassign, and avoid `var`.",
      code: `
if (true) {
  var x = 1
  let y = 2
}
console.log(x) // 1
console.log(y) // ReferenceError: y is not defined

const list = [1, 2]
list.push(3)   // fine: mutating, not reassigning
list = []      // TypeError: Assignment to constant variable
`,
    },
    {
      q: 'What is hoisting?',
      level: 'basic',
      a: "Before code runs, JavaScript sets up memory for declarations in each scope. This makes declarations behave as if they were moved to the top.\n\n- Function declarations are hoisted completely, so you can call them before the line where they're written.\n- `var` is hoisted and set to `undefined`.\n- `let`, `const` and `class` are hoisted but not initialised. Touching them before the declaration throws a ReferenceError.",
      code: `
sayHi()             // works: 'hi'
function sayHi() { console.log('hi') }

console.log(a)      // undefined
var a = 1

console.log(b)      // ReferenceError
let b = 2
`,
    },
    {
      q: 'What is the Temporal Dead Zone (TDZ)?',
      level: 'mid',
      a: "The TDZ is the time between the start of a scope and the line where a `let`/`const`/`class` variable is declared. The variable exists (it's hoisted), but reading or writing it during that time throws a ReferenceError.\n\nIt exists to catch bugs where you use a variable before giving it a value.",
      code: `
let x = 'outer'
function test() {
  console.log(x) // ReferenceError, not 'outer'
  let x = 'inner' // the inner x shadows the outer one for the whole block
}
`,
    },
    {
      q: 'What is a closure? Give a practical use.',
      level: 'basic',
      diagram: `
flowchart LR
  F["createCounter() runs"] --> S["Its scope: count = 0"]
  F --> R["returns increment() and get()"]
  R -. "still reference" .-> S
  X["createCounter has finished,<br/>but count stays alive"] -.- S
`,
      a: "A closure is a function that remembers the variables from the place where it was created, even after that outer function has finished running.\n\nPractical uses:\n- Private state (counters, caches) that can't be touched from outside.\n- Function factories, like `makeMultiplier(2)`.\n- `once`, `memoize`, `debounce` and `throttle` all rely on closures.\n- React hooks: every render's event handlers close over that render's state.",
      code: `
function createCounter() {
  let count = 0 // private: nothing outside can change it directly
  return {
    increment: () => ++count,
    get: () => count,
  }
}

const counter = createCounter()
counter.increment()
counter.increment()
console.log(counter.get()) // 2
`,
    },
    {
      q: "Why does a loop with var and setTimeout print the same number every time?",
      level: 'mid',
      a: "`var` is function-scoped, so there is only one `i` shared by every iteration. By the time the timeouts run, the loop has finished and `i` is 3.\n\n`let` creates a new binding for each iteration, so each callback closes over its own `i`.",
      code: `
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)) // 3, 3, 3
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j)) // 0, 1, 2
}
`,
    },
    {
      q: 'What is an IIFE and why was it used?',
      level: 'basic',
      a: "An Immediately Invoked Function Expression is a function that runs as soon as it's defined. Before ES modules and `let`, it was the main way to create a private scope so variables didn't leak into the global scope. You still see it in older code and in the module pattern.",
      code: `
const counterModule = (function () {
  let count = 0
  return { inc: () => ++count }
})()

counterModule.inc() // 1
`,
    },
    {
      q: 'How does `this` work in JavaScript?',
      level: 'mid',
      diagram: `
flowchart TD
  Q{"How was the function called?"} --> N["with new"] --> N1["this = the new object"]
  Q --> E["fn.call / apply / bind(obj)"] --> E1["this = obj"]
  Q --> I["obj.fn()"] --> I1["this = obj"]
  Q --> P["plain fn()"] --> P1["this = undefined (strict mode)"]
  AR["Arrow functions skip all of this:<br/>they use the surrounding this"]
`,
      a: "`this` is decided by how a function is called, not where it's written. The rules, in priority order:\n\n- `new` binding: `new Foo()` sets `this` to the new object.\n- Explicit binding: `fn.call(obj)`, `fn.apply(obj)` or `fn.bind(obj)` set `this` to `obj`.\n- Implicit binding: `obj.fn()` sets `this` to `obj`.\n- Default binding: a plain call `fn()` sets `this` to `undefined` in strict mode (or the global object in sloppy mode).\n\nArrow functions don't have their own `this`. They use the `this` of the surrounding code.",
      code: `
const user = {
  name: 'Avi',
  greet() { return 'Hi ' + this.name },
}

user.greet()             // 'Hi Avi'  (implicit)
const fn = user.greet
fn()                     // TypeError or 'Hi undefined'  (lost this)
fn.call({ name: 'Sam' }) // 'Hi Sam'  (explicit)
`,
    },
    {
      q: 'Why do we lose `this` in callbacks, and how do we fix it?',
      level: 'mid',
      a: "When you pass `obj.method` as a callback, you pass only the function. Whoever calls it later calls it as a plain function, so the implicit `obj.` binding is gone.\n\nFixes:\n- Use an arrow function wrapper: `() => obj.method()`.\n- Bind it: `obj.method.bind(obj)`.\n- In classes, define the method as an arrow class field.",
      code: `
class Timer {
  seconds = 0
  start() {
    // setInterval(this.tick, 1000)     // 'this' would be undefined inside tick
    setInterval(() => this.tick(), 1000) // arrow keeps 'this'
  }
  tick() { this.seconds++ }
}
`,
    },
    {
      q: 'What is the difference between call, apply and bind?',
      level: 'basic',
      a: "All three set `this` for a function.\n\n- `call(thisArg, a, b)` calls the function now, arguments listed one by one.\n- `apply(thisArg, [a, b])` calls it now, arguments as an array.\n- `bind(thisArg, a)` doesn't call it. It returns a new function with `this` (and optionally some arguments) fixed.",
      code: `
function intro(greeting, punct) {
  return greeting + ', I am ' + this.name + punct
}
const me = { name: 'Avi' }

intro.call(me, 'Hi', '!')      // 'Hi, I am Avi!'
intro.apply(me, ['Hello', '.']) // 'Hello, I am Avi.'
const later = intro.bind(me, 'Hey')
later('?')                     // 'Hey, I am Avi?'
`,
    },
    {
      q: 'How are arrow functions different from regular functions?',
      level: 'basic',
      a: "- No own `this`: they use `this` from the surrounding scope.\n- No `arguments` object (use rest parameters instead).\n- Can't be used with `new` and have no `prototype`.\n- Shorter syntax, with implicit return for single expressions.\n\nUse them for callbacks. Avoid them for object methods that need `this` to be the object.",
    },
    {
      q: 'What is the prototype chain?',
      level: 'mid',
      diagram: `
flowchart LR
  D["dog<br/>barks"] -- "prototype" --> A["animal<br/>eats"]
  A -- "prototype" --> OP["Object.prototype<br/>toString, hasOwnProperty"]
  OP -- "prototype" --> N["null"]
`,
      a: "Every object has a hidden link (`[[Prototype]]`) to another object. When you read a property that doesn't exist on the object, JavaScript looks at its prototype, then that object's prototype, and so on until it reaches `null`.\n\nThis is how arrays get `.map` (from `Array.prototype`) and how inheritance works in JavaScript.",
      code: `
const animal = { eats: true }
const dog = Object.create(animal) // dog's prototype is animal
dog.barks = true

dog.barks // true  (own property)
dog.eats  // true  (found on the prototype)
Object.getPrototypeOf(dog) === animal // true
`,
    },
    {
      q: 'Are ES6 classes different from constructor functions?',
      level: 'mid',
      a: "Classes are mostly nicer syntax over constructor functions and prototypes. Methods still live on the prototype.\n\nSmall real differences: classes must be called with `new`, class bodies are always in strict mode, class declarations are in the TDZ until defined, and methods are non-enumerable. Classes also support `#private` fields and `static` blocks.",
      code: `
// Constructor function
function Person(name) { this.name = name }
Person.prototype.greet = function () { return 'Hi ' + this.name }

// Same thing as a class
class PersonC {
  constructor(name) { this.name = name }
  greet() { return 'Hi ' + this.name }
}
`,
    },
    {
      q: 'How does instanceof work?',
      level: 'mid',
      a: "`a instanceof B` walks up `a`'s prototype chain and checks whether `B.prototype` appears anywhere in it. It doesn't check how the object was created, only the chain. That's why it can fail across iframes or realms, and why `Array.isArray` is safer for arrays.",
    },
    {
      q: 'Explain the event loop.',
      level: 'mid',
      diagram: `
flowchart TD
  S["Run code on the call stack<br/>until empty"] --> M{"Microtasks waiting?"}
  M -- "yes" --> RM["Run one microtask<br/>(promise callbacks, await)"] --> M
  M -- "no" --> R["Browser may render"]
  R --> T{"Task waiting?"}
  T -- "yes" --> RT["Run ONE task<br/>(setTimeout, I/O, click)"] --> S
`,
      a: "JavaScript runs on one thread with one call stack. The event loop decides what runs next:\n\n- Run everything on the call stack until it's empty.\n- Then run all microtasks (promise callbacks, `queueMicrotask`, `MutationObserver`) until that queue is empty.\n- Then the browser may render.\n- Then take one macrotask (a `setTimeout` callback, an I/O callback, a UI event) and repeat.\n\nSo promise callbacks always run before the next `setTimeout`, even a `setTimeout(fn, 0)`.",
      code: `
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')

// Output: 1, 4, 3, 2
`,
    },
    {
      q: 'What is the difference between the microtask and macrotask queues?',
      level: 'mid',
      a: "Macrotasks (tasks): `setTimeout`, `setInterval`, I/O, UI events, `MessageChannel`. The loop runs one per turn.\n\nMicrotasks: promise `.then/.catch/.finally`, `await` continuations, `queueMicrotask`. After each task, all microtasks run, including new ones added during that time.\n\nThis means a microtask that keeps adding microtasks can starve the page: rendering and timers never get a turn.",
      code: `
// This freezes the page: the microtask queue never empties
function loop() { Promise.resolve().then(loop) }
// loop()
`,
    },
    {
      q: 'Predict the output: async/await ordering.',
      level: 'advanced',
      a: "Code before the first `await` runs synchronously. Everything after an `await` is scheduled as a microtask, even if the awaited value is already resolved.",
      code: `
async function a() {
  console.log('a1')
  await null
  console.log('a2')
}

console.log('start')
setTimeout(() => console.log('timeout'))
a()
Promise.resolve().then(() => console.log('promise'))
console.log('end')

// start, a1, end, a2, promise, timeout
`,
    },
    {
      q: 'Explain callbacks vs promises vs async/await.',
      level: 'basic',
      diagram: `
stateDiagram-v2
  [*] --> Pending
  Pending --> Fulfilled: resolve(value)
  Pending --> Rejected: reject(error) / throw
  Fulfilled --> [*]: .then / code after await
  Rejected --> [*]: .catch / catch block
`,
      a: "- Callbacks: you pass a function to be called later. Nesting several leads to 'callback hell', and error handling is manual.\n- Promises: an object representing a future value. You chain `.then()` and handle errors once with `.catch()`.\n- async/await: syntax on top of promises. Async code reads top to bottom, and you use normal `try/catch`.\n\nAll three are the same idea underneath; async/await is the most readable.",
      code: `
// Promise chain
fetchUser(id)
  .then((user) => fetchOrders(user.id))
  .then((orders) => render(orders))
  .catch(showError)

// Same with async/await
async function load(id) {
  try {
    const user = await fetchUser(id)
    const orders = await fetchOrders(user.id)
    render(orders)
  } catch (err) {
    showError(err)
  }
}
`,
    },
    {
      q: 'Promise.all vs allSettled vs race vs any?',
      level: 'mid',
      a: "All take an array of promises:\n\n- `Promise.all`: resolves with all results when every promise succeeds. Rejects as soon as one fails.\n- `Promise.allSettled`: waits for all of them, never rejects. Gives `{status, value}` or `{status, reason}` for each.\n- `Promise.race`: settles with the first promise to settle, success or failure. Good for timeouts.\n- `Promise.any`: resolves with the first success. Rejects only if all fail (with an `AggregateError`).",
      code: `
// Timeout with race
const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timed out')), ms))

const data = await Promise.race([fetch('/api/report'), timeout(5000)])
`,
    },
    {
      q: 'What is the sequential vs parallel await trap?',
      level: 'mid',
      diagram: `
gantt
  title Two 1-second requests
  dateFormat X
  axisFormat %Ss
  section Sequential awaits
  getUser  :0, 1
  getPosts :1, 2
  section Promise.all
  getUser  :0, 1
  getPosts :0, 1
`,
      a: "Writing `await` on separate lines makes independent requests run one after another, so total time is the sum. If they don't depend on each other, start them together and await `Promise.all` so total time is the slowest one.",
      code: `
// Slow: about 2 seconds if each takes 1 second
const user = await getUser()
const posts = await getPosts()

// Fast: about 1 second
const [user2, posts2] = await Promise.all([getUser(), getPosts()])
`,
    },
    {
      q: 'How do you handle errors in async code?',
      level: 'basic',
      a: "- With async/await, wrap awaited calls in `try/catch`.\n- With promise chains, add `.catch()` at the end.\n- A promise that rejects with no handler causes an `unhandledrejection` event in browsers and an `unhandledRejection` crash warning (or exit) in Node.\n- Errors thrown inside a `setTimeout` callback are not caught by an outer `try/catch`, because that code runs later on a fresh stack.",
    },
    {
      q: 'What is AbortController used for?',
      level: 'mid',
      a: "It lets you cancel async work, most commonly a `fetch`. You pass `controller.signal` to the request and call `controller.abort()` to cancel it. The fetch then rejects with an `AbortError`.\n\nIn React it's the clean way to cancel a request in a `useEffect` cleanup, so a slow old response doesn't overwrite a newer one.",
      code: `
useEffect(() => {
  const controller = new AbortController()
  fetch('/api/search?q=' + query, { signal: controller.signal })
    .then((r) => r.json())
    .then(setResults)
    .catch((err) => { if (err.name !== 'AbortError') throw err })
  return () => controller.abort()
}, [query])
`,
    },
    {
      q: 'What are iterators and generators?',
      level: 'mid',
      a: "An iterator is any object with a `next()` method returning `{ value, done }`. An object is iterable if it has a `[Symbol.iterator]()` method returning an iterator. That's what `for...of` and spread use.\n\nA generator (`function*`) is an easy way to write iterators. `yield` pauses the function and hands out a value. Calling `next()` resumes it. Generators are lazy, so they can represent infinite sequences.",
      code: `
function* ids() {
  let id = 1
  while (true) yield id++
}

const gen = ids()
gen.next().value // 1
gen.next().value // 2

const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i },
}
console.log([...range]) // [1, 2, 3]
`,
    },
    {
      q: 'ES Modules vs CommonJS?',
      level: 'mid',
      a: "- CommonJS (`require`, `module.exports`): Node's original system. Loaded synchronously at runtime, so you can `require` conditionally.\n- ES Modules (`import`, `export`): the standard. Imports are static and analysed before running, which enables tree shaking. They load asynchronously, support top-level `await`, and imports are live bindings rather than copies.\n\nIn Node, a file is ESM if it ends in `.mjs` or `package.json` has `\"type\": \"module\"`.",
    },
    {
      q: 'What is tree shaking?',
      level: 'mid',
      a: "Tree shaking is when the bundler removes exports that are never imported. It only works reliably with ES modules because their imports are static. Side effects at the top level of a module (and a missing `sideEffects: false` in `package.json`) can stop code from being removed.",
    },
    {
      q: 'What happens with circular dependencies between modules?',
      level: 'advanced',
      a: "If A imports B and B imports A, one of them will see the other only partly initialised while it loads. In ESM you get a TDZ ReferenceError if you use an import too early; in CommonJS you get an incomplete (often empty) `exports` object.\n\nFix it by moving shared code to a third module, or only using the import inside functions that run later.",
    },
    {
      q: 'What is the difference between == and ===?',
      level: 'basic',
      a: "`===` compares value and type with no conversion. `==` converts types first, which leads to surprises like `'' == 0` being true. Use `===` everywhere. The one common exception is `x == null`, which checks for both `null` and `undefined`.",
      code: `
0 == ''          // true
0 === ''         // false
null == undefined  // true
null === undefined // false
`,
    },
    {
      q: 'What are optional chaining and nullish coalescing?',
      level: 'basic',
      a: "- Optional chaining `a?.b` returns `undefined` instead of throwing if `a` is `null` or `undefined`. Also works as `a?.[key]` and `fn?.()`.\n- Nullish coalescing `a ?? b` gives `b` only when `a` is `null` or `undefined`. Unlike `||`, it keeps valid falsy values like `0` and `''`.",
      code: `
const city = user?.address?.city ?? 'Unknown'

const count = 0
count || 10  // 10  (wrong if 0 is a real value)
count ?? 10  // 0
`,
    },
    {
      q: 'Explain destructuring, spread and rest.',
      level: 'basic',
      a: "- Destructuring unpacks values from arrays or objects into variables, with optional defaults and renaming.\n- Spread (`...`) expands an array or object into individual items: copying, merging, passing arguments.\n- Rest (`...`) collects the remaining items into an array or object. Same syntax, opposite direction.",
      code: `
const { name, role = 'dev', ...others } = user
const [first, ...rest] = [1, 2, 3]

const merged = { ...defaults, ...options }
Math.max(...[3, 7, 2]) // 7

function sum(...nums) { return nums.reduce((a, b) => a + b, 0) }
`,
    },
    {
      q: 'What is garbage collection in JavaScript?',
      level: 'mid',
      a: "The engine frees memory for objects that can no longer be reached from the 'roots' (global object, the current call stack). This is mark-and-sweep: mark everything reachable, delete the rest.\n\nCommon memory leaks: forgotten timers or event listeners, growing caches in closures or global maps, detached DOM nodes still referenced in JavaScript. `WeakMap`/`WeakSet` hold keys weakly, so they don't keep objects alive.",
    },
    {
      q: 'What is event delegation?',
      level: 'basic',
      diagram: `
flowchart TD
  L1["li (clicked)"] -- "event bubbles up" --> UL["ul#list<br/>ONE listener here"]
  L2["li"] -.- UL
  L3["li added later"] -.- UL
  UL --> H["e.target.closest('li') tells us which item"]
`,
      a: "Instead of adding a listener to every child, add one listener to a parent and use `event.target` to find which child was clicked. It works because events bubble up the DOM.\n\nBenefits: fewer listeners, and it works for children added later.",
      code: `
document.querySelector('#list').addEventListener('click', (e) => {
  const item = e.target.closest('li')
  if (item) console.log('Clicked', item.dataset.id)
})
`,
    },
    {
      q: 'What is the difference between event bubbling and capturing?',
      level: 'basic',
      diagram: `
flowchart LR
  W["window"] -- "1. capture" --> D["document"] -- "capture" --> P["parent"] -- "capture" --> T["target"]
  T -. "3. bubble" .-> P2["parent"] -. "bubble" .-> D2["document"] -. "bubble" .-> W2["window"]
`,
      a: "An event travels in three phases: capturing (from `window` down to the target), target, then bubbling (back up to `window`). Listeners run in the bubbling phase by default. Pass `{ capture: true }` to run during capturing. `event.stopPropagation()` stops it travelling further.",
    },
    {
      q: 'What are debounce and throttle, and when would you use each?',
      level: 'mid',
      diagram: `
gantt
  title Calls while typing / scrolling (ms)
  dateFormat x
  axisFormat %L
  section Raw events
  e1 :0, 20
  e2 :100, 120
  e3 :200, 220
  e4 :300, 320
  section Debounce 300ms
  runs once after the last event :620, 640
  section Throttle 200ms
  run :0, 20
  run :200, 220
`,
      a: "- Debounce: wait until the calls stop for X ms, then run once. Use for search-as-you-type or auto-save.\n- Throttle: run at most once every X ms, no matter how often it's called. Use for scroll, resize or mousemove handlers.",
      code: `
function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function throttle(fn, interval) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}
`,
    },
    {
      q: 'What is currying?',
      level: 'mid',
      a: "Currying turns a function that takes several arguments into a chain of functions that each take one: `f(a, b, c)` becomes `f(a)(b)(c)`. It's useful for creating pre-configured functions, like a logger fixed to one level.",
      code: `
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args)
    return (...next) => curried.apply(this, [...args, ...next])
  }
}

const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)
curriedAdd(1)(2)(3) // 6
curriedAdd(1, 2)(3) // 6
`,
    },
    {
      q: 'What is memoization?',
      level: 'mid',
      a: "Caching a function's result for given inputs so repeated calls with the same inputs return instantly. It only makes sense for pure functions (same input always gives the same output). It trades memory for speed.",
      code: `
function memoize(fn) {
  const cache = new Map()
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg)
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
`,
    },
    {
      q: 'Map vs Object, and Set vs Array?',
      level: 'basic',
      a: "- `Map` keys can be any type (objects too), it keeps insertion order, has `.size`, and is faster for frequent adds and deletes. Use `Object` for fixed-shape records and JSON.\n- `Set` stores unique values with O(1) `has`. `array.includes` is O(n). Use `new Set(arr)` to remove duplicates.",
      code: `
const unique = [...new Set([1, 2, 2, 3])] // [1, 2, 3]

const visits = new Map()
visits.set(userObj, 3) // an object as a key
`,
    },
    {
      q: 'What does "use strict" do?',
      level: 'basic',
      a: "Strict mode turns silent mistakes into errors: assigning to an undeclared variable throws, `this` in a plain function call is `undefined` instead of the global object, duplicate parameter names are errors, and some unsafe features are disabled. ES modules and class bodies are always strict.",
    },
    {
      q: 'What is the difference between null and undefined?',
      level: 'basic',
      a: "`undefined` means a value was never assigned: missing variables, missing object properties, missing function arguments, functions with no return. `null` is an intentional 'no value' set by the programmer. `typeof null` is `'object'`, a long-standing bug in the language.",
    },
    {
      q: 'What are pure functions and side effects?',
      level: 'basic',
      a: "A pure function always returns the same output for the same input and doesn't change anything outside itself. A side effect is anything else: changing a global, mutating an argument, network calls, writing to the DOM or console.\n\nPure functions are easy to test and cache. React expects component render logic to be pure.",
    },
    {
      q: 'What is the difference between map, forEach, filter and reduce?',
      level: 'basic',
      a: "- `forEach`: runs a function for each item, returns nothing.\n- `map`: returns a new array with each item transformed.\n- `filter`: returns a new array with only items that pass a test.\n- `reduce`: combines all items into one value (a sum, an object, a grouped map).\n\nNone of them change the original array (unless your callback mutates items).",
      code: `
const orders = [{ amount: 100, paid: true }, { amount: 50, paid: false }]

const paidTotal = orders
  .filter((o) => o.paid)
  .map((o) => o.amount)
  .reduce((sum, n) => sum + n, 0) // 100
`,
    },
  ],
}
