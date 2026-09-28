import type { Topic } from './types'

export const sql: Topic = {
  id: 'sql',
  title: 'PostgreSQL & SQL',
  group: 'Databases',
  summary:
    'Joins, keys and constraints, normalisation, transactions and ACID, EXPLAIN ANALYZE, indexes, and JSONB, which you have used for audit results. Plus when to pick Postgres over Mongo.',
  questions: [
    {
      q: 'Explain the different types of JOIN.',
      level: 'basic',
      diagram: `
flowchart LR
  I["INNER: only matches"] --- L["LEFT: all left rows + matches or NULL"] --- F["FULL: all rows from both"]
`,
      a: "- INNER JOIN: only rows that match in both tables.\n- LEFT JOIN: all rows from the left table, with matching right rows or NULLs.\n- RIGHT JOIN: the mirror of LEFT (rarely used; just swap the tables).\n- FULL OUTER JOIN: all rows from both, NULLs where there's no match.\n- CROSS JOIN: every combination of rows.",
      code: `
-- Every campaign with its number of messages, including campaigns with none
SELECT c.id, c.name, COUNT(m.id) AS messages
FROM campaigns c
LEFT JOIN messages m ON m.campaign_id = c.id
GROUP BY c.id, c.name;
`,
    },
    {
      q: 'Primary key vs foreign key vs unique constraint?',
      level: 'basic',
      a: "- Primary key: uniquely identifies each row. Unique and not null. One per table.\n- Foreign key: a column referencing another table's primary key. The database refuses rows pointing to something that doesn't exist, and `ON DELETE CASCADE` or `RESTRICT` controls what happens when the parent is deleted.\n- Unique constraint: no duplicates in a column or combination (e.g. `UNIQUE (org_id, email)`).",
    },
    {
      q: 'What is normalisation, and when would you denormalise?',
      level: 'mid',
      a: "Normalisation organises data so each fact is stored once, avoiding duplication and update anomalies (change a customer's name in one place, not in every order). In practice, third normal form: every column depends on the key, the whole key, and nothing but the key.\n\nDenormalise deliberately for read speed: store a `message_count` on a campaign or a copy of `customer_name` on invoices, accepting that you must keep the copies in sync (triggers, application code, or periodic recalculation).",
    },
    {
      q: 'What does ACID mean?',
      level: 'basic',
      a: "- Atomicity: all statements in a transaction succeed, or none do.\n- Consistency: a transaction moves the database from one valid state to another (constraints hold).\n- Isolation: concurrent transactions don't see each other's half-done work.\n- Durability: once committed, the data survives a crash.",
      code: `
BEGIN;
UPDATE wallets SET credits = credits - 100 WHERE org_id = 42;
INSERT INTO campaigns (org_id, name, cost) VALUES (42, 'Diwali', 100);
COMMIT; -- or ROLLBACK if anything failed
`,
    },
    {
      q: 'What are isolation levels?',
      level: 'advanced',
      diagram: `
sequenceDiagram
  participant T1 as Request 1
  participant DB as Database
  participant T2 as Request 2
  T1->>DB: Read credits = 100
  T2->>DB: Read credits = 100
  T1->>DB: Set credits = 50
  T2->>DB: Set credits = 50 (lost update!)
  Note over DB: Fix: UPDATE ... WHERE credits >= 50,<br/>or SELECT ... FOR UPDATE
`,
      a: "They control what a transaction can see of other concurrent transactions:\n- Read Committed (Postgres default): each statement sees data committed before it started. A value can change between two reads in the same transaction.\n- Repeatable Read: the whole transaction sees one snapshot.\n- Serializable: behaves as if transactions ran one at a time; Postgres may abort one with a serialization error that you must retry.\n\nFor 'check then update' logic (like a stock or credit balance), use `SELECT ... FOR UPDATE` to lock the row, or a single atomic `UPDATE ... WHERE credits >= 100`.",
    },
    {
      q: 'How do you read EXPLAIN ANALYZE output?',
      level: 'mid',
      a: "`EXPLAIN ANALYZE` runs the query and shows the plan with real timings. Look for:\n- `Seq Scan` on a large table where you expected an index scan.\n- A big gap between estimated `rows` and actual rows (stale statistics; run `ANALYZE`).\n- Expensive `Sort` or `Hash` steps spilling to disk.\n- Nested loops over many rows.\n\nThen add or adjust an index and compare.",
      code: `
EXPLAIN ANALYZE
SELECT * FROM audits WHERE site_id = 7 ORDER BY created_at DESC LIMIT 20;

CREATE INDEX CONCURRENTLY idx_audits_site_created ON audits (site_id, created_at DESC);
`,
    },
    {
      q: 'What kinds of indexes does Postgres have?',
      level: 'mid',
      a: "- B-tree (default): equality and range queries, sorting.\n- GIN: for values containing many items: JSONB, arrays, full-text search.\n- GiST / SP-GiST: geometric data, ranges, some text search.\n- BRIN: tiny indexes for huge tables naturally ordered by a column (like time-series logs).\n\nPlus partial indexes (`WHERE status = 'pending'`) and expression indexes (`ON lower(email)`).",
    },
    {
      q: 'What is JSONB, and how do you index it?',
      level: 'mid',
      a: "JSONB stores JSON in a parsed binary format, so you can query inside it efficiently. It suits flexible or nested data, like the results of 20+ SEO checks per audit, while the rest of the table stays relational.\n\nIndexing: a GIN index on the whole column supports containment queries (`@>`); an expression B-tree index on one extracted key is smaller and faster when you always query that key.",
      code: `
-- Audits where the 'meta_description' check failed
SELECT id FROM audits WHERE results @> '{"meta_description": {"passed": false}}';
CREATE INDEX idx_audits_results ON audits USING GIN (results);

-- Or index a single key you filter on often
CREATE INDEX idx_audits_score ON audits (((results->>'score')::int));
`,
    },
    {
      q: 'WHERE vs HAVING?',
      level: 'basic',
      a: "`WHERE` filters rows before grouping; `HAVING` filters groups after `GROUP BY`, so it can use aggregates.",
      code: `
SELECT org_id, COUNT(*) AS campaigns
FROM campaigns
WHERE created_at > now() - interval '30 days'
GROUP BY org_id
HAVING COUNT(*) > 10;
`,
    },
    {
      q: 'What are window functions?',
      level: 'advanced',
      a: "They calculate across related rows without collapsing them like `GROUP BY` does: rankings, running totals, 'previous value' comparisons. Useful for growth analysis like your Instagram tool (follower change since the last snapshot).",
      code: `
SELECT profile_id, captured_at, followers,
       followers - LAG(followers) OVER (PARTITION BY profile_id ORDER BY captured_at) AS change
FROM snapshots;
`,
    },
    {
      q: 'What is a CTE?',
      level: 'mid',
      a: "A Common Table Expression (`WITH name AS (...)`) is a named subquery you can use in the main query. It makes complex queries readable by building them in steps. `WITH RECURSIVE` handles hierarchies like org charts or comment threads.",
      code: `
WITH recent AS (
  SELECT site_id, MAX(created_at) AS last_audit FROM audits GROUP BY site_id
)
SELECT s.domain, r.last_audit FROM sites s JOIN recent r ON r.site_id = s.id;
`,
    },
    {
      q: 'What is connection pooling, and why do you need it?',
      level: 'mid',
      a: "Opening a Postgres connection is slow and each one uses server memory, and Postgres handles only a limited number. A pool keeps a set of open connections that requests borrow and return. In Node use `pg.Pool` (or your ORM's pool); with many app instances or serverless functions, add PgBouncer in front of the database.",
    },
    {
      q: 'How do you run database migrations safely?',
      level: 'mid',
      a: "Keep schema changes as versioned migration files in Git (Knex, Prisma, or AdonisJS Lucid migrations) and run them in CI/CD before or during deploy. For zero downtime: add columns as nullable first, backfill, then add constraints; create indexes with `CONCURRENTLY`; never rename or drop a column that running code still uses (expand, migrate, then contract).",
    },
    {
      q: 'PostgreSQL vs MongoDB: how do you choose?',
      level: 'mid',
      a: "- PostgreSQL: data with clear relationships and integrity rules (users, orgs, invoices, permissions), complex queries and reporting, transactions everywhere. JSONB covers the flexible parts.\n- MongoDB: document-shaped data read as a whole, flexible or fast-changing schemas, very high write volume on simple access patterns (events, logs, messages), easy horizontal scaling.\n\nYou've used both: explain the Video Ad Generator's tracked stages (brief, script, scenes, render) fitting Postgres well, and the CRM's contacts and messages fitting Mongo.",
    },
    {
      q: 'What is an ORM, and what are its trade-offs?',
      level: 'basic',
      a: "An Object-Relational Mapper (Prisma, TypeORM, Lucid in AdonisJS, Sequelize) maps tables to objects, generates queries, handles migrations and often types. It speeds up everyday work. Trade-offs: it can hide inefficient queries (N+1), complex queries get awkward, and you still need to understand the SQL it produces. Most ORMs let you drop to raw SQL when needed.",
    },
  ],
}
