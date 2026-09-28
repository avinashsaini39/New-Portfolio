import type { Topic } from './types'

export const auth: Topic = {
  id: 'auth',
  title: 'Auth & Security',
  group: 'Backend',
  summary:
    'Sessions vs JWT, access and refresh token rotation, where to store tokens, password hashing, OAuth, RBAC, multi-tenancy, and the OWASP basics. The most-asked MERN topic after React state.',
  questions: [
    {
      q: 'What is the difference between authentication and authorisation?',
      level: 'basic',
      a: "- Authentication: who are you? (logging in, verifying identity). Failure → 401 Unauthorized.\n- Authorisation: what are you allowed to do? (roles, permissions, ownership). Failure → 403 Forbidden.",
    },
    {
      q: 'Session-based auth vs JWT: what are the trade-offs?',
      level: 'mid',
      diagram: `
flowchart LR
  subgraph Session["Session"]
    SB["Browser: sid cookie"] --> SA["API"] --> SR[("Session store")]
  end
  subgraph JWT["JWT"]
    JB["Browser: signed token"] --> JA["API verifies signature<br/>(no lookup)"]
  end
`,
      a: "- Sessions: the server stores session data (in Redis or a database) and the browser holds only a random session ID in a cookie. Easy to revoke (delete the session), small cookie. Needs a shared session store when you have several servers.\n- JWT: the token itself contains the user data, signed by the server, so any server can verify it without a lookup. Scales easily and works across services. But you can't easily revoke a JWT before it expires, and it's bigger.\n\nA common middle ground: short-lived JWT access tokens plus a revocable refresh token stored server-side.",
    },
    {
      q: 'What is inside a JWT, and is it encrypted?',
      level: 'basic',
      a: "A JWT has three base64url parts separated by dots: header (algorithm), payload (claims like `sub`, `role`, `exp`), and signature. It is signed, not encrypted: anyone can decode and read the payload. The signature only proves it wasn't changed. Never put secrets or sensitive personal data in it.",
      code: `
const token = jwt.sign({ sub: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' })
const payload = jwt.verify(token, ACCESS_SECRET) // throws if tampered or expired
`,
    },
    {
      q: 'How do access and refresh tokens work together?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: Request with access token
  A-->>B: 401 expired
  B->>A: POST /auth/refresh (HttpOnly cookie)
  A-->>B: New access token + rotated cookie
  B->>A: Retry request
  A-->>B: 200
`,
      a: "- The access token is short-lived (5 to 15 minutes) and sent with each API request. If it's stolen, it's useful only briefly.\n- The refresh token is long-lived (days or weeks), stored in an `HttpOnly` cookie, and only sent to one endpoint (`/auth/refresh`) to get a new access token.\n- When the access token expires, the client calls refresh and retries the failed request.\n- Store refresh tokens (or their hashes) server-side so you can revoke them on logout or password change.",
    },
    {
      q: 'What is refresh token rotation, and how does it detect theft?',
      level: 'advanced',
      diagram: `
flowchart TD
  L["Login"] --> R1["R1 issued"]
  R1 -- "refresh" --> R2["R1 used, R2 issued"]
  R2 -- "refresh" --> R3["R2 used, R3 issued"]
  X["Attacker replays R1"] --> D{"Already used?"}
  D -- "yes" --> K["Revoke whole family: log in again"]
`,
      a: "Every time a refresh token is used, issue a new one and invalidate the old one. If an old (already used) refresh token is ever presented again, someone has copied it: revoke the whole token family and force that user to log in again.",
      code: `
app.post('/auth/refresh', async (req, res) => {
  const token = req.cookies.refresh
  const stored = await RefreshToken.findOne({ hash: sha256(token) })
  if (!stored) return res.sendStatus(401)
  if (stored.usedAt) {                       // reuse detected
    await RefreshToken.deleteMany({ family: stored.family })
    return res.sendStatus(401)
  }
  stored.usedAt = new Date(); await stored.save()
  const next = randomToken()
  await RefreshToken.create({ hash: sha256(next), family: stored.family, userId: stored.userId })
  res.cookie('refresh', next, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth/refresh' })
  res.json({ accessToken: signAccess(stored.userId) })
})
`,
    },
    {
      q: 'Where should tokens be stored in the browser: localStorage or cookies?',
      level: 'mid',
      a: "- localStorage: any JavaScript on the page can read it, so a single XSS bug leaks the token. Not affected by CSRF.\n- HttpOnly cookie: JavaScript can't read it, so XSS can't steal it (though XSS can still make requests as the user). Sent automatically, so you need CSRF protection (`SameSite`, CSRF tokens).\n\nCommon recommendation: refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie; access token kept in memory (a JavaScript variable), refreshed silently on page load.",
    },
    {
      q: 'How should passwords be stored?',
      level: 'basic',
      a: "Never store plain passwords or use fast hashes like MD5 or SHA-256. Use a slow, salted password hash: bcrypt (cost around 12), scrypt or argon2id. Slowness makes brute-forcing leaked hashes expensive; the salt (random per user, stored with the hash) stops precomputed tables and makes identical passwords hash differently.",
      code: `
import bcrypt from 'bcrypt'

const hash = await bcrypt.hash(password, 12)
const ok = await bcrypt.compare(attempt, user.passwordHash)
`,
    },
    {
      q: 'How do you build a safe password reset flow?',
      level: 'mid',
      a: "- The user enters an email. Always respond 'if the account exists, we sent a link' so attackers can't discover which emails are registered.\n- Generate a random single-use token, store only its hash with an expiry (15 to 60 minutes), email the link.\n- On submit, hash the token from the link, find a matching unexpired record, set the new password, delete the token.\n- Invalidate existing sessions and refresh tokens, and notify the user by email.\n- Rate-limit the endpoint.",
    },
    {
      q: 'How does OAuth 2.0 login with Google work?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant U as Browser
  participant A as Your server
  participant G as Google
  U->>A: Continue with Google
  A-->>U: Redirect (client_id, state, PKCE challenge)
  U->>G: Log in + consent
  G-->>U: Redirect back with code
  U->>A: Callback with code + state
  A->>G: Exchange code + verifier
  G-->>A: ID token
  A-->>U: Your own session cookie
`,
      a: "Authorisation Code flow with PKCE:\n- Your app redirects the user to Google with your client ID, requested scopes, a `state` value (against CSRF) and a PKCE code challenge.\n- The user logs in and agrees. Google redirects back to your callback with a short-lived `code`.\n- Your server exchanges the code (plus the PKCE verifier and client secret) for tokens, including an ID token that identifies the user.\n- You find or create the user by their Google ID and email, then start your own session.\n\nOAuth is for delegated access; OpenID Connect (the ID token) is the identity layer on top used for login.",
    },
    {
      q: 'What is CSRF and how do you prevent it?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant U as Logged-in user
  participant E as evil site
  participant A as Your API
  U->>E: Visit page
  E-->>U: Hidden form posts to your API
  U->>A: POST with your cookies attached
  Note over A: SameSite cookies stop this cookie being sent
`,
      a: "Cross-Site Request Forgery: a malicious site makes the user's browser send a request to your site, and the browser automatically attaches your cookies, so the request looks legitimate (for example, a hidden form that posts 'change email').\n\nDefences:\n- `SameSite=Lax` or `Strict` cookies (the main modern defence).\n- CSRF tokens: a random value in the page that must be sent back in a header or form field.\n- Check the `Origin` header on state-changing requests.\n- Never change state on GET requests.\n\nAPIs that use `Authorization: Bearer` headers instead of cookies aren't vulnerable to classic CSRF.",
    },
    {
      q: 'What is XSS and how do you prevent it?',
      level: 'mid',
      a: "Cross-Site Scripting: an attacker gets their JavaScript to run on your page, usually through user content shown without escaping (a contact name like `<img src=x onerror=...>`). The script can then act as the user.\n\nPrevention:\n- React escapes text by default. Avoid `dangerouslySetInnerHTML`; if you must render HTML, sanitise it with DOMPurify.\n- Don't put user input into `href` without checking the scheme (`javascript:` URLs).\n- Set a Content-Security-Policy header.\n- Keep tokens in HttpOnly cookies to limit the damage.",
    },
    {
      q: 'What is injection, and how do you prevent it in SQL and MongoDB?',
      level: 'mid',
      a: "Injection is user input being interpreted as part of a query or command.\n- SQL: never build queries by string concatenation. Use parameterised queries or an ORM.\n- MongoDB: operator injection. If you pass `req.body.password` straight into `find`, an attacker can send `{ \"$ne\": null }` and match any user. Validate types with Zod (a string must be a string) or use `express-mongo-sanitize`.",
      code: `
// SQL: parameterised
await pool.query('SELECT * FROM users WHERE email = $1', [email])

// Mongo: validated type, so an object can't sneak in
const { email, password } = LoginSchema.parse(req.body) // both z.string()
const user = await User.findOne({ email })
`,
    },
    {
      q: 'Which items from the OWASP Top 10 should a web developer know?',
      level: 'mid',
      a: "- Broken access control: users reaching data or actions they shouldn't (the number one issue). Check ownership on every request.\n- Cryptographic failures: plain-text passwords, no HTTPS, weak secrets.\n- Injection: SQL, NoSQL, command injection.\n- Insecure design: missing rate limits, trusting the client.\n- Security misconfiguration: debug mode on, default passwords, open S3 buckets, verbose errors.\n- Vulnerable dependencies: run `npm audit` and keep packages updated.\n- Authentication failures: no brute-force protection, weak session handling.\n- SSRF: your server fetching URLs supplied by users (relevant for an SEO crawler: block internal IPs).",
    },
    {
      q: 'How did you implement RBAC, and how would you describe it?',
      level: 'mid',
      diagram: `
flowchart LR
  U1["User"] --> R["Role: manager"] --> P1["client:read"]
  R --> P2["client:write"]
  R --> P3["task:assign"]
  P2 --> RT["Route checks permission"] --> OW["Query checks ownership (orgId)"]
`,
      a: "Role-Based Access Control: users get roles (Admin, Manager, Client), roles map to permissions (`task:create`, `client:read`), and each route checks the permission rather than the role name. That way you can change what a role can do without editing every route.\n\nTwo levels of checks:\n- Permission: can this role do this kind of action at all?\n- Ownership or scope: is this specific record theirs (their own client, their own organisation)? Missing ownership checks is how most data leaks happen.",
      code: `
const permissions = {
  admin: ['client:read', 'client:write', 'task:assign', 'user:manage'],
  manager: ['client:read', 'client:write', 'task:assign'],
  client: ['task:read'],
} as const

const can = (perm) => (req, res, next) =>
  permissions[req.user.role]?.includes(perm) ? next() : res.sendStatus(403)

router.patch('/clients/:id', requireAuth, can('client:write'), async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, orgId: req.user.orgId }) // scope check
  if (!client) return res.sendStatus(404)
  // ...
})
`,
    },
    {
      q: 'What is multi-tenancy, and how do you isolate tenant data?',
      level: 'advanced',
      diagram: `
flowchart TD
  Q{"Isolation level"} --> A["Shared tables + orgId column<br/>cheapest, filter every query"]
  Q --> B["Schema per tenant<br/>stronger, harder migrations"]
  Q --> C["Database per tenant<br/>strongest, most expensive"]
`,
      a: "Multi-tenancy means one application serves many customer organisations (tenants), like EasySocial serving 100+ businesses. Isolation strategies:\n- Shared tables with a `tenantId` (orgId) column on every row. Cheapest and most common. Risk: forgetting the filter once leaks data. Enforce it centrally (a repository layer or Mongoose plugin that always adds `orgId`), and in Postgres you can use Row-Level Security.\n- A schema per tenant: better isolation, more complex migrations.\n- A database per tenant: strongest isolation, for large or regulated customers, but costly to run.",
    },
    {
      q: 'How do you log a user out everywhere or revoke a JWT?',
      level: 'advanced',
      a: "Since JWTs are valid until they expire, options are:\n- Keep access tokens very short-lived and revoke refresh tokens in the database (the usual answer).\n- Store a `tokenVersion` on the user, include it in the JWT, and reject tokens with an old version (one quick lookup, can be cached in Redis).\n- Keep a denylist of revoked token IDs (`jti`) in Redis until they expire.",
    },
    {
      q: 'How do you manage secrets?',
      level: 'basic',
      a: "Never commit secrets to Git (add `.env` to `.gitignore`, use a secret scanner). Load them from environment variables, and in production from a secrets manager (AWS Secrets Manager, SSM Parameter Store, GitHub Actions secrets for CI). Give each environment its own secrets, rotate them regularly, and give each service only the permissions it needs.",
    },
    {
      q: 'How do you protect a login endpoint against brute force?',
      level: 'basic',
      a: "Rate-limit by IP and by account, add increasing delays or a temporary lockout after repeated failures, show a CAPTCHA after several failures, return the same generic message for 'wrong email' and 'wrong password', and offer two-factor authentication.",
    },
  ],
}
