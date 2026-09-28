import type { Topic } from './types'

export const realtime: Topic = {
  id: 'realtime',
  title: 'Real-time & WebSockets',
  group: 'Backend',
  summary:
    'WebSockets and Socket.io: rooms, auth on the handshake, reconnection, and scaling across servers with the Redis adapter. Interviewers will assume a WhatsApp CRM has live updates.',
  questions: [
    {
      q: 'Polling vs long polling vs SSE vs WebSockets?',
      level: 'basic',
      diagram: `
flowchart LR
  P["Polling: ask every N s"] --> L["Long polling: server holds request"] --> S["SSE: server pushes over one response"] --> W["WebSocket: two-way connection"]
`,
      a: "- Polling: the client asks every few seconds. Simple, but wasteful and delayed.\n- Long polling: the server holds the request open until there's news, then the client asks again. Works everywhere, but heavier.\n- Server-Sent Events (SSE): one long HTTP response where the server pushes events. One-way (server to client), auto-reconnects, simple. Good for notifications and live dashboards.\n- WebSockets: a persistent two-way connection. Best for chat, typing indicators and collaboration.",
    },
    {
      q: 'How does a WebSocket connection start?',
      level: 'mid',
      diagram: `
sequenceDiagram
  participant B as Browser
  participant S as Server
  B->>S: GET with Upgrade: websocket
  S-->>B: 101 Switching Protocols
  S-->>B: message
  B->>S: message
`,
      a: "It starts as a normal HTTP request with `Upgrade: websocket` headers. If the server agrees, it replies `101 Switching Protocols`, and the same TCP connection becomes a WebSocket that both sides can send messages on at any time, until one side closes it.",
    },
    {
      q: 'What does Socket.io add on top of plain WebSockets?',
      level: 'basic',
      a: "Automatic reconnection, fallback to HTTP long polling when WebSockets are blocked, rooms and namespaces, acknowledgements (callbacks confirming a message arrived), event names instead of raw messages, and adapters for scaling across servers. The trade-off: it has its own protocol, so a plain WebSocket client can't connect to a Socket.io server.",
    },
    {
      q: 'What are rooms and namespaces in Socket.io?',
      level: 'mid',
      a: "- Namespaces (`/chat`, `/admin`) split one server into separate channels with their own events and middleware.\n- Rooms are groups of sockets inside a namespace that you can broadcast to. A socket can join many rooms. Typical use: a room per organisation, per conversation, or per user (so you can reach all of one user's tabs and devices).",
      code: `
io.on('connection', (socket) => {
  socket.join('org:' + socket.data.user.orgId)
  socket.join('user:' + socket.data.user.id)

  socket.on('chat:open', (chatId) => socket.join('chat:' + chatId))
})

// When a WhatsApp message arrives for a chat:
io.to('chat:' + chatId).emit('message:new', message)
`,
    },
    {
      q: 'How do you authenticate a socket connection?',
      level: 'mid',
      a: "Check auth during the handshake with middleware, before the connection is accepted: read a token from `socket.handshake.auth` (or the cookie), verify it, and attach the user to `socket.data`. Also check permissions when a socket asks to join a room, so users can't listen to another organisation's chats.",
      code: `
io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth.token, ACCESS_SECRET)
    socket.data.user = payload
    next()
  } catch {
    next(new Error('unauthorized'))
  }
})
`,
    },
    {
      q: 'How do you scale Socket.io across several servers?',
      level: 'advanced',
      diagram: `
flowchart TB
  A["Agent A"] --> S1["Socket server 1"]
  B["Agent B"] --> S2["Socket server 2"]
  S1 -- "publish" --> R[("Redis pub/sub")]
  R -- "deliver" --> S2
  S2 --> B
`,
      a: "Each server only knows its own connected sockets. If user A is on server 1 and user B on server 2, an `emit` on server 1 won't reach B. The Redis adapter fixes this: every server publishes broadcasts to Redis pub/sub and receives the others', so `io.to(room).emit()` reaches all servers.\n\nYou also need sticky sessions at the load balancer if clients may use long polling, because its several HTTP requests must reach the same server.",
      code: `
import { createAdapter } from '@socket.io/redis-adapter'

const pub = new Redis(REDIS_URL)
const sub = pub.duplicate()
io.adapter(createAdapter(pub, sub))
`,
    },
    {
      q: 'How do you handle reconnection and missed messages?',
      level: 'advanced',
      a: "Clients will disconnect (network changes, sleeping laptops). On reconnect:\n- Re-join rooms (store which rooms the client needs, or re-send them on connect).\n- Fetch what was missed: the client sends the ID or timestamp of the last event it saw, and the server returns everything newer from the database.\n\nThe database is the source of truth; the socket is only a fast notification channel. Socket.io's connection state recovery can replay short gaps automatically.",
    },
    {
      q: 'How would you design live message delivery for a WhatsApp CRM?',
      level: 'advanced',
      diagram: `
sequenceDiagram
  participant WA as WhatsApp
  participant H as Webhook
  participant Q as Queue
  participant W as Worker
  participant IO as Socket.io
  participant AG as Agent
  WA->>H: Incoming message (signed)
  H->>Q: Add job, reply 200
  Q->>W: Process
  W->>W: Save message
  W->>IO: Emit to chat and org rooms
  IO-->>AG: message:new + unread badge
`,
      a: "- WhatsApp sends a webhook to your API. Verify it, save the message to the database, respond 200 fast.\n- Publish an event (through the Socket.io Redis adapter or a queue).\n- Emit to the conversation's room and the organisation's room, so the open chat updates and the inbox list shows an unread badge.\n- Agents' clients update their TanStack Query cache from the event instead of refetching everything.\n- Status updates (sent, delivered, read) arrive as more webhooks and are emitted the same way.\n- On reconnect, clients fetch messages since their last seen ID.",
    },
    {
      q: 'How do typing indicators and presence work?',
      level: 'mid',
      a: "Typing: the client emits `typing:start` (throttled to about once every 2 seconds) and the server relays it to others in the chat room. Receivers hide the indicator after a few seconds without a new event.\n\nPresence (online or offline): track connected sockets per user, in Redis when you have several servers. Mark online on the first connection, offline when the last one disconnects, usually after a short grace period so a page refresh doesn't flicker.",
    },
    {
      q: 'What are acknowledgements in Socket.io?',
      level: 'mid',
      a: "A callback passed with `emit` that the other side calls to confirm it received and handled the event, optionally returning data. Useful for 'message sent' ticks and for retrying when no acknowledgement arrives within a timeout.",
      code: `
// Client
socket.timeout(5000).emit('message:send', draft, (err, saved) => {
  if (err) markFailed(draft.tempId)
  else replaceTemp(draft.tempId, saved)
})

// Server
socket.on('message:send', async (draft, ack) => {
  const saved = await messages.create(draft)
  ack(saved)
})
`,
    },
  ],
}
