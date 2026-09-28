import type { Topic } from './types'

export const mongodb: Topic = {
  id: 'mongodb',
  title: 'MongoDB',
  group: 'Databases',
  summary:
    'Schema design (embed vs reference), Mongoose, the aggregation pipeline, transactions, and indexes: compound indexes, explain() and covered queries, so you can explain exactly why your indexing work sped things up.',
  questions: [
    {
      q: 'When do you embed documents, and when do you reference them?',
      level: 'mid',
      diagram: `
flowchart TD
  Q["Related data"] --> A{"Read together with the parent?"}
  A -- "no" --> REF["Reference"]
  A -- "yes" --> B{"Bounded size?"}
  B -- "no" --> REF
  B -- "yes" --> C{"Shared or updated alone often?"}
  C -- "yes" --> REF
  C -- "no" --> EMB["Embed"]
`,
      a: "Embed when the child data belongs to the parent, is read together with it, and is bounded in size: a user's addresses, an order's line items. One read gets everything.\n\nReference (store IDs) when the data is shared by many parents, grows without limit, or is often read on its own: a chat's messages (could be millions), products referenced by many orders.\n\nRule of thumb: design around your queries. Documents have a 16MB limit, and unbounded arrays inside a document are a classic mistake.",
      code: `
// Embed: bounded, always read with the order
{ _id, customerId, items: [{ productId, name, price, qty }], total }

// Reference: unbounded, queried separately
// chats: { _id, orgId, contactId, lastMessageAt }
// messages: { _id, chatId, body, direction, createdAt }
`,
    },
    {
      q: 'What is an index, and why does it make queries faster?',
      level: 'basic',
      diagram: `
flowchart LR
  subgraph NoIndex["COLLSCAN"]
    A1["Read every document"] --> A2["Return matches"]
  end
  subgraph Index["IXSCAN"]
    B1["Walk sorted B-tree"] --> B2["Fetch only matches"]
  end
`,
      a: "An index is a separate, sorted data structure (a B-tree) that stores the values of some fields with pointers to the documents. Without one, MongoDB scans every document in the collection (COLLSCAN). With one, it jumps to matching entries directly (IXSCAN), like using a book's index instead of reading every page. The cost: indexes use memory and disk, and every insert and update must also update them.",
    },
    {
      q: 'How does a compound index work, and what is the ESR rule?',
      level: 'advanced',
      a: "A compound index sorts by the first field, then by the second within each first value, and so on. It can serve queries on any prefix of its fields (`{a, b, c}` helps queries on `a`, and on `a + b`, but not on `b` alone).\n\nESR rule for field order: Equality fields first, then Sort fields, then Range fields. This lets MongoDB narrow down with equality, read in already-sorted order, and avoid an in-memory sort.",
      code: `
// Query: this org's contacts with a tag, created after a date, newest first
Contact.find({ orgId, tags: 'vip', createdAt: { $gte: since } }).sort({ createdAt: -1 })

// Index following ESR: equality (orgId, tags), sort + range (createdAt)
contactSchema.index({ orgId: 1, tags: 1, createdAt: -1 })
`,
    },
    {
      q: 'How do you use explain() to check a query?',
      level: 'mid',
      a: "Run the query with `.explain('executionStats')` and look at:\n- `winningPlan` stage: `IXSCAN` (good) or `COLLSCAN` (full scan).\n- `totalDocsExamined` vs `nReturned`: ideally close. Examining 50,000 documents to return 20 means a missing or wrong index.\n- `SORT` stage in memory: means the index doesn't match the sort.\n- `executionTimeMillis`.\n\nRecord before and after timings: that's the concrete story behind 'improved API response times with indexes'.",
      code: `
const stats = await Task.find({ assigneeId, status: 'open' })
  .sort({ dueDate: 1 })
  .explain('executionStats')

console.log(stats.executionStats.totalDocsExamined, stats.executionStats.nReturned)
`,
    },
    {
      q: 'What is a covered query?',
      level: 'advanced',
      a: "A query where every field you filter on and return is in the index, so MongoDB answers from the index alone and never reads the documents. Use a projection that includes only indexed fields and excludes `_id` (unless `_id` is in the index). In `explain`, `totalDocsExamined` is 0.",
    },
    {
      q: 'What are the downsides of too many indexes?',
      level: 'mid',
      a: "Every write must update every index, so inserts and updates get slower. Indexes take RAM, and when the working set no longer fits in memory, performance drops sharply. Remove unused indexes (check `$indexStats`) and prefer one well-designed compound index over several single-field ones.",
    },
    {
      q: 'What other index types does MongoDB have?',
      level: 'mid',
      a: "- Unique: enforces no duplicates (e.g. one phone number per org: `{ orgId: 1, phone: 1 }, { unique: true }`).\n- Partial: indexes only documents matching a filter, smaller and faster.\n- TTL: automatically deletes documents after a time (sessions, OTP codes, logs).\n- Text: basic full-text search.\n- Multikey: created automatically when you index an array field.\n- Geospatial (`2dsphere`) for location queries.",
      code: `
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 })
contactSchema.index({ orgId: 1, phone: 1 }, { unique: true })
`,
    },
    {
      q: 'What is the aggregation pipeline?',
      level: 'mid',
      diagram: `
flowchart LR
  M["$match (uses index)"] --> G["$group"] --> P["$project"] --> S["$sort"] --> L["$limit"]
`,
      a: "A sequence of stages that transform documents step by step, like a data-processing assembly line: `$match` (filter), `$group` (sum, count, average), `$project` (shape fields), `$sort`, `$limit`, `$lookup` (join another collection), `$unwind` (one document per array item), `$facet` (several pipelines at once).\n\nPut `$match` and `$sort` first so they can use indexes and shrink the data early.",
      code: `
// Campaign analytics: messages per status for one campaign
Message.aggregate([
  { $match: { campaignId: new ObjectId(id) } },
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
])
// [{ _id: 'delivered', count: 820 }, { _id: 'read', count: 610 }, ...]
`,
    },
    {
      q: 'How does $lookup work, and when is it a smell?',
      level: 'mid',
      a: "`$lookup` joins documents from another collection, like a SQL left join. It's fine occasionally, but if nearly every read needs several lookups, your data is probably modelled like a relational database. Consider embedding or duplicating the few fields you need (a denormalised `contactName` on a chat), or ask whether PostgreSQL fits better.",
    },
    {
      q: 'Does MongoDB support transactions?',
      level: 'mid',
      a: "Yes. Single-document writes have always been atomic. Multi-document ACID transactions are supported on replica sets and sharded clusters (MongoDB 4.0/4.2+). Use them when several documents must change together or not at all, like moving credits between two accounts. They cost more than single writes, so good schema design (keeping related data in one document) reduces how often you need them.",
      code: `
const session = await mongoose.startSession()
await session.withTransaction(async () => {
  await Wallet.updateOne({ orgId }, { $inc: { credits: -cost } }, { session })
  await Campaign.create([{ orgId, name, cost }], { session })
})
session.endSession()
`,
    },
    {
      q: 'What do Mongoose schemas, validation and middleware give you?',
      level: 'basic',
      a: "- Schemas: a defined shape, types and defaults on top of schemaless MongoDB.\n- Validation: `required`, `enum`, `min`, custom validators, run before saving.\n- Middleware (hooks): `pre('save')` to hash passwords, `post('save')` to trigger events.\n- Helpers: `populate` to replace references with documents, virtuals, instance and static methods.\n\nNote: `updateOne` and `findOneAndUpdate` skip validators and save hooks unless you pass `runValidators: true`.",
    },
    {
      q: 'What is lean() and why does it matter for performance?',
      level: 'mid',
      a: "By default, Mongoose turns every result into a full document object with getters, setters and change tracking. `.lean()` returns plain JavaScript objects instead, which is much faster and lighter. Use it for read-only queries, like API list endpoints.",
      code: `
const contacts = await Contact.find({ orgId }).select('name phone tags').lean()
`,
    },
    {
      q: 'What is the N+1 query problem in MongoDB?',
      level: 'mid',
      a: "Fetching a list, then running one more query per item (for example, looping over 50 tasks and fetching each assignee). That's 51 round trips. Fix it by collecting the IDs and fetching them in one `$in` query, using `populate` (which does this batching), or `$lookup`.",
      code: `
const tasks = await Task.find({ projectId }).lean()
const users = await User.find({ _id: { $in: tasks.map((t) => t.assigneeId) } }).lean()
const byId = new Map(users.map((u) => [String(u._id), u]))
`,
    },
    {
      q: 'What are replica sets and sharding?',
      level: 'advanced',
      diagram: `
flowchart TB
  subgraph RS["Replica set"]
    P["Primary (writes)"] --> S1["Secondary"]
    P --> S2["Secondary"]
  end
  subgraph SH["Sharding"]
    M["mongos router"] --> A["Shard A"]
    M --> B["Shard B"]
    M --> C["Shard C"]
  end
`,
      a: "- Replica set: several copies of the same data. One primary takes writes; secondaries copy it and can take over automatically if the primary fails (high availability). Secondaries can also serve some reads.\n- Sharding: splitting a collection across several servers by a shard key, to scale beyond one machine. Choosing the shard key well (high cardinality, even distribution, matches common queries, e.g. `orgId`) is the critical decision.",
    },
    {
      q: 'What are write concern and read preference?',
      level: 'advanced',
      a: "- Write concern: how many replica members must confirm a write before it counts as done. `w: 'majority'` survives a primary failure; `w: 1` is faster but can lose recent writes.\n- Read preference: where reads go. `primary` (always fresh) or `secondary` (spreads load but data may be slightly behind).",
    },
    {
      q: 'What are change streams?',
      level: 'advanced',
      a: "A way to subscribe to inserts, updates and deletes on a collection in real time (requires a replica set). Useful for pushing database changes to sockets, syncing to a search index, or triggering side effects, without polling.",
    },
  ],
}
