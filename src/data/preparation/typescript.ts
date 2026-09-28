import type { Topic } from './types'

export const typescript: Topic = {
  id: 'typescript',
  title: 'TypeScript',
  group: 'Foundations',
  summary:
    'The type system itself rather than the syntax: structural typing, narrowing, discriminated unions, generics, utility types, and `unknown` at the boundaries.',
  questions: [
    {
      q: 'What is structural typing?',
      level: 'basic',
      a: "TypeScript checks whether types are compatible by their shape (the properties they have), not by their name. If an object has at least the properties a type needs, it fits, even if it was never declared as that type. This is sometimes called 'duck typing' at compile time.",
      code: `
type Point = { x: number; y: number }
function print(p: Point) { console.log(p.x, p.y) }

const pos = { x: 1, y: 2, z: 3 }
print(pos) // OK: pos has x and y, the extra z is fine
`,
    },
    {
      q: 'type vs interface: when do you use each?',
      level: 'basic',
      a: "Both describe object shapes and mostly work the same.\n\n- `interface` can be reopened and merged (declaration merging) and extended with `extends`. Good for public object shapes and library APIs.\n- `type` can describe anything: unions, tuples, primitives, mapped and conditional types. You need `type` for `'loading' | 'error'`.\n\nA common rule: `type` by default, `interface` when you want extension or merging. Pick one style per codebase.",
    },
    {
      q: 'What are union and intersection types?',
      level: 'basic',
      a: "- Union `A | B`: the value is one of these types. You can only use what's common until you narrow it.\n- Intersection `A & B`: the value has everything from both types at once. Often used to combine object types.",
      code: `
type Id = string | number

type WithTimestamps = { createdAt: Date; updatedAt: Date }
type User = { name: string } & WithTimestamps
`,
    },
    {
      q: 'What is narrowing? Name the ways to do it.',
      level: 'mid',
      a: "Narrowing is TypeScript working out a more specific type inside a branch, based on a check you wrote. Ways to narrow:\n\n- `typeof x === 'string'`\n- `x instanceof Date`\n- `'email' in x`\n- Truthiness: `if (x)` removes `null` and `undefined`\n- Equality: `x === 'admin'`\n- Discriminant property: `if (res.status === 'error')`\n- Custom type guards: functions returning `x is Foo`",
      code: `
function format(value: string | number | Date) {
  if (typeof value === 'string') return value.trim()
  if (value instanceof Date) return value.toISOString()
  return value.toFixed(2) // TS knows it's a number here
}
`,
    },
    {
      q: 'What is a custom type guard?',
      level: 'mid',
      a: "A function whose return type is `value is SomeType`. When it returns true, TypeScript narrows the value to that type in the calling code. Useful for checking data you received from an API.",
      code: `
type Admin = { role: 'admin'; permissions: string[] }
type Member = { role: 'member' }

function isAdmin(user: Admin | Member): user is Admin {
  return user.role === 'admin'
}

if (isAdmin(currentUser)) {
  currentUser.permissions // OK
}
`,
    },
    {
      q: 'What are discriminated unions and why are they useful?',
      level: 'mid',
      diagram: `
flowchart LR
  S["s: State"] --> Q{"s.status"}
  Q -- "'loading'" --> L["{ status }"]
  Q -- "'error'" --> E["{ status, error }"]
  Q -- "'success'" --> OK["{ status, data }"]
`,
      a: "A union of object types that all share one literal property (the 'discriminant', like `status` or `type`). Checking that property narrows to exactly one member.\n\nThey're the best way to model UI and API state because impossible combinations (like `loading` with `data` and `error` at once) can't be represented.",
      code: `
type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: User[] }

function render(s: State) {
  switch (s.status) {
    case 'loading': return 'Loading...'
    case 'error':   return s.error
    case 'success': return s.data.length + ' users'
  }
}
`,
    },
    {
      q: 'How do you make a switch exhaustive with never?',
      level: 'advanced',
      a: "Add a `default` branch that assigns the value to a variable of type `never`. If someone later adds a new member to the union and forgets to handle it, that assignment becomes a compile error.",
      code: `
function assertNever(x: never): never {
  throw new Error('Unhandled case: ' + JSON.stringify(x))
}

switch (s.status) {
  case 'loading': ...
  case 'error': ...
  case 'success': ...
  default: return assertNever(s) // error if a case is missing
}
`,
    },
    {
      q: 'What are generics?',
      level: 'basic',
      a: "Generics let you write a function, type or component that works with many types while keeping the link between input and output types. Instead of `any`, you use a type parameter like `T` that's filled in when it's used.",
      code: `
function first<T>(items: T[]): T | undefined {
  return items[0]
}

const n = first([1, 2, 3])     // number | undefined
const s = first(['a', 'b'])    // string | undefined
`,
    },
    {
      q: 'What are generic constraints and defaults?',
      level: 'mid',
      a: "- A constraint (`T extends Something`) limits what `T` can be, so you can safely use properties of `Something`.\n- A default (`T = string`) is used when the caller doesn't specify `T` and it can't be inferred.",
      code: `
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
getProp({ name: 'Avi', age: 26 }, 'name') // string
// getProp({ name: 'Avi' }, 'email')      // error: not a key

type ApiResponse<T = unknown> = { data: T; error?: string }
`,
    },
    {
      q: 'How do you write a generic React component?',
      level: 'mid',
      a: "Put the type parameter on the function component. Props that use `T` then stay linked, so `renderItem` knows the exact item type.",
      code: `
type ListProps<T> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  getKey: (item: T) => string
}

function List<T>({ items, renderItem, getKey }: ListProps<T>) {
  return <ul>{items.map((i) => <li key={getKey(i)}>{renderItem(i)}</li>)}</ul>
}

<List items={users} getKey={(u) => u.id} renderItem={(u) => u.name} />
`,
    },
    {
      q: 'Explain Partial, Required, Pick, Omit, Record.',
      level: 'basic',
      a: "- `Partial<T>`: every property optional. Good for update payloads.\n- `Required<T>`: every property required.\n- `Pick<T, 'a' | 'b'>`: only those properties.\n- `Omit<T, 'password'>`: everything except those.\n- `Record<K, V>`: an object whose keys are `K` and values are `V`.",
      code: `
type User = { id: string; name: string; email: string; password: string }

type UpdateUser = Partial<Omit<User, 'id'>>
type PublicUser = Omit<User, 'password'>
type RoleMap = Record<'admin' | 'member', string[]>
`,
    },
    {
      q: 'How are utility types like Partial built?',
      level: 'advanced',
      a: "They're mapped types: they loop over the keys of a type with `[K in keyof T]` and change each property. Knowing this lets you read library types and write your own.",
      code: `
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
`,
    },
    {
      q: 'What do ReturnType, Parameters and Awaited do?',
      level: 'mid',
      a: "- `ReturnType<typeof fn>`: the type a function returns.\n- `Parameters<typeof fn>`: a tuple of its parameter types.\n- `Awaited<T>`: unwraps a promise, even nested ones.\n\nThey let you derive types from existing code instead of writing them twice.",
      code: `
async function getUser(id: string) { return { id, name: 'Avi' } }

type User = Awaited<ReturnType<typeof getUser>> // { id: string; name: string }
type Args = Parameters<typeof getUser>          // [id: string]
`,
    },
    {
      q: 'unknown vs any vs never?',
      level: 'mid',
      a: "- `any` turns type checking off. Anything goes, and mistakes spread silently.\n- `unknown` means 'could be anything, prove it first'. You must narrow it before using it. This is the right type for API responses, `JSON.parse` results and caught errors.\n- `never` means a value that can't exist: a function that always throws, or the leftover type after every case is handled.",
      code: `
const data: unknown = JSON.parse(text)
// data.name        // error: must narrow first
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log(data.name)
}
`,
    },
    {
      q: 'What does strict mode in tsconfig turn on?',
      level: 'mid',
      a: "`\"strict\": true` enables a group of checks. The important ones:\n\n- `strictNullChecks`: `null`/`undefined` aren't allowed unless the type says so. The biggest source of caught bugs.\n- `noImplicitAny`: errors when TS can't infer a type and would fall back to `any`.\n- `strictFunctionTypes`: safer checking of callback parameter types.\n- `strictPropertyInitialization`: class properties must be set in the constructor.\n- `useUnknownInCatchVariables`: `catch (e)` gives `e` the type `unknown`.",
    },
    {
      q: 'How do you type an Express request handler?',
      level: 'mid',
      a: "Express's `Request` type takes generics for route params, response body, request body and query. Combine that with runtime validation (like Zod), because types alone don't check what the client actually sent.",
      code: `
import { Request, Response } from 'express'

type Params = { id: string }
type Body = { name: string }

app.put('/users/:id', (req: Request<Params, unknown, Body>, res: Response) => {
  const { id } = req.params   // string
  const { name } = req.body   // string (at compile time only!)
  res.json({ id, name })
})
`,
    },
    {
      q: 'What is a .d.ts file?',
      level: 'mid',
      a: "A declaration file contains only types, no runtime code. It describes the shape of JavaScript code so TypeScript can check your use of it. Libraries ship them (or they come from `@types/*` packages). You write your own to add types for an untyped package or to extend globals, like adding `user` to Express's `Request`.",
      code: `
// types/express.d.ts
declare global {
  namespace Express {
    interface Request { user?: { id: string; role: 'admin' | 'member' } }
  }
}
export {}
`,
    },
    {
      q: 'What are conditional types and infer?',
      level: 'advanced',
      a: "A conditional type picks a type based on a check: `T extends U ? X : Y`. Inside the check, `infer` lets you capture part of a type into a new name. This is how `ReturnType` is built.",
      code: `
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type ElementOf<T> = T extends (infer E)[] ? E : T

type A = ElementOf<string[]> // string
`,
    },
    {
      q: 'What is the difference between `as` type assertions and `satisfies`?',
      level: 'advanced',
      a: "- `value as Type` tells TypeScript 'trust me'. It can hide real mistakes.\n- `value satisfies Type` checks that the value matches the type but keeps the value's more specific inferred type. It's safer and more precise.",
      code: `
const routes = {
  home: '/',
  profile: '/profile',
} satisfies Record<string, string>

routes.home // type is still known as a specific key; typos are errors
`,
    },
    {
      q: 'What are enums, and why do many teams prefer union types?',
      level: 'mid',
      a: "Enums create a named set of constants and also generate runtime JavaScript. Numeric enums accept any number, which weakens safety. Many teams use string literal unions (`'admin' | 'member'`) or `as const` objects instead: zero runtime cost, and they work naturally with JSON.",
      code: `
const Role = { Admin: 'admin', Member: 'member' } as const
type Role = (typeof Role)[keyof typeof Role] // 'admin' | 'member'
`,
    },
    {
      q: 'What does `as const` do?',
      level: 'basic',
      a: "It makes TypeScript infer the narrowest possible type: string literals instead of `string`, readonly tuples instead of arrays, and readonly properties. Great for config objects and lists of allowed values.",
      code: `
const sizes = ['sm', 'md', 'lg'] as const
type Size = (typeof sizes)[number] // 'sm' | 'md' | 'lg'
`,
    },
    {
      q: 'Does TypeScript check types at runtime?',
      level: 'basic',
      diagram: `
flowchart LR
  R["req.body (unknown)"] --> V{"Zod .parse()"}
  V -- "valid" --> T["Typed, trusted data"] --> APP["Business logic"]
  V -- "invalid" --> E["422 with field errors"]
`,
      a: "No. Types are erased when compiling to JavaScript. Data from users, APIs or `JSON.parse` is only 'typed' because you said so. Validate it at the boundary with a runtime library like Zod, then infer the TypeScript type from the schema so the two can't drift apart.",
      code: `
import { z } from 'zod'

const UserSchema = z.object({ name: z.string(), age: z.number().int() })
type User = z.infer<typeof UserSchema>

const user = UserSchema.parse(req.body) // throws if invalid
`,
    },
  ],
}
