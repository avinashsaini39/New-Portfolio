import type { Topic } from './types'

export const devops: Topic = {
  id: 'devops',
  title: 'Docker, CI/CD & AWS',
  group: 'Quality & Ops',
  summary:
    'Multi-stage Docker builds, docker-compose, GitHub Actions pipelines, Nginx and SSL on EC2, S3, and observability with structured logs, Sentry and health checks.',
  questions: [
    {
      q: 'What is Docker, and what problem does it solve?',
      level: 'basic',
      a: "Docker packages an app with its runtime, libraries and config into an image, which runs as an isolated container. The same image runs identically on your laptop, CI and production, which ends 'works on my machine'. Containers are lighter than virtual machines because they share the host's kernel.",
    },
    {
      q: 'Image vs container?',
      level: 'basic',
      a: "An image is a read-only template built from a Dockerfile, made of cached layers. A container is a running instance of an image, with its own writable layer on top. You can run many containers from one image.",
    },
    {
      q: 'What is a multi-stage build, and why use it?',
      level: 'mid',
      diagram: `
flowchart LR
  subgraph Build["Stage 1: build (discarded)"]
    S["Source + all deps"] --> D["dist/"]
  end
  subgraph Run["Stage 2: runtime (shipped)"]
    N["node:alpine + dist + prod deps"]
  end
  D --> N
`,
      a: "A Dockerfile with several `FROM` stages. You install all dependencies and build in the first stage, then copy only the output and production dependencies into a small final image. The final image leaves out compilers, dev dependencies and source files: smaller, faster to deploy, and a smaller attack surface.",
      code: `
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
`,
    },
    {
      q: 'How do you use Docker layer caching well?',
      level: 'mid',
      a: "Each instruction is a cached layer, and a changed layer rebuilds everything after it. Copy `package*.json` and run `npm ci` before copying the rest of the source, so dependencies only reinstall when the package files change, not on every code edit. Add a `.dockerignore` for `node_modules`, `.git` and `.env`.",
    },
    {
      q: 'What is docker-compose used for?',
      level: 'basic',
      a: "It defines several containers that work together (API, worker, MongoDB, Redis) in one YAML file, with their networks, volumes, environment and dependencies, so `docker compose up` starts the whole stack with one command. Great for local development and simple deployments.",
      code: `
services:
  api:
    build: .
    ports: ['3000:3000']
    env_file: .env
    depends_on: [mongo, redis]
  worker:
    build: .
    command: node dist/worker.js
    depends_on: [redis]
  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]
  redis:
    image: redis:7-alpine
volumes:
  mongo-data:
`,
    },
    {
      q: 'What are volumes, and why do databases need them?',
      level: 'basic',
      a: "A container's own filesystem is thrown away when the container is removed. Volumes store data outside the container's lifecycle, so the database files survive restarts and upgrades. Bind mounts map a host folder into the container, which is handy in development for live code reloading.",
    },
    {
      q: 'What is CI/CD?',
      level: 'basic',
      a: "- Continuous Integration: every push or pull request automatically installs, lints, type-checks, tests and builds the code, so problems are caught before merging.\n- Continuous Delivery/Deployment: after the checks pass on the main branch, the app is automatically packaged and deployed (to staging, then production, possibly with an approval step).",
    },
    {
      q: 'Write a GitHub Actions pipeline for a Node app.',
      level: 'mid',
      diagram: `
flowchart LR
  P["Push / PR"] --> I["Install (cached)"] --> C["Lint, typecheck, test"] --> B["Build image"] --> R["Push to registry"] --> S["Staging"] --> PR["Production"]
`,
      a: "A workflow file in `.github/workflows/` defines when it runs and the jobs. Cache npm dependencies for speed, run checks in parallel where possible, and keep secrets in repository secrets, never in the file.",
      code: `
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myapp:\${{ github.sha }} .
      # push the image to a registry, then tell the server to pull and restart
`,
    },
    {
      q: 'How do you deploy without downtime?',
      level: 'mid',
      a: "- Rolling deploy: replace instances one by one behind a load balancer, only sending traffic to ones that pass health checks.\n- Blue-green: run the new version alongside the old one, switch traffic over, and keep the old one ready for instant rollback.\n- Canary: send a small percentage of traffic to the new version first and watch errors.\n\nAll need graceful shutdown in the app and database migrations that work with both old and new code.",
    },
    {
      q: 'What does Nginx do in front of a Node app?',
      level: 'mid',
      diagram: `
flowchart LR
  U["Users"] -- "HTTPS 443" --> N["Nginx: TLS, gzip, static,<br/>WebSocket upgrade"]
  N -- "http://127.0.0.1:3000" --> A["Node API"]
`,
      a: "Nginx acts as a reverse proxy: it receives public traffic on ports 80 and 443 and forwards it to Node on an internal port. It also terminates SSL, serves static files and compressed responses efficiently, handles slow clients, can load-balance between several Node processes, and adds security headers and basic rate limits. For WebSockets it needs the `Upgrade` headers passed through.",
      code: `
server {
  listen 443 ssl;
  server_name api.example.com;
  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
`,
    },
    {
      q: 'How do you get free SSL on an EC2 server?',
      level: 'basic',
      a: "Use Let's Encrypt with Certbot: it proves you control the domain, installs a certificate into Nginx, and sets up automatic renewal (certificates last 90 days). Point the domain's DNS at the server's Elastic IP first. Alternatively, put an AWS load balancer in front with a free ACM certificate.",
    },
    {
      q: 'Which AWS services should a MERN developer know?',
      level: 'basic',
      a: "- EC2: virtual servers to run your app.\n- S3: file storage (uploads, exports, static sites), often with pre-signed URLs.\n- CloudFront: CDN in front of S3 or your app.\n- IAM: users, roles and permissions. Give EC2 an IAM role instead of storing access keys.\n- Security Groups: firewall rules for instances.\n- RDS / DocumentDB / ElastiCache: managed Postgres, Mongo-compatible and Redis.\n- ECR and ECS: store Docker images and run containers.\n- CloudWatch: logs, metrics and alarms.",
    },
    {
      q: 'What is structured logging?',
      level: 'mid',
      a: "Logging JSON objects with consistent fields (level, time, message, requestId, userId, orgId, duration) instead of free-form strings. Log tools can then search and filter ('all errors for org 42 in the last hour'). Add a request ID to every log line of a request so you can follow it through the system. Pino is the fast, popular choice in Node. Never log passwords, tokens or full personal data.",
      code: `
import pino from 'pino'
const logger = pino()

logger.info({ requestId, orgId, campaignId, recipients: 1200 }, 'Campaign queued')
logger.error({ err, jobId: job.id }, 'Audit job failed')
`,
    },
    {
      q: 'What is Sentry used for?',
      level: 'basic',
      a: "Error tracking: it captures exceptions from the frontend and backend with stack traces (mapped to your source code with source maps), the user and browser, and the steps leading up to the error, then groups duplicates and alerts you. It also offers performance tracing. You find bugs before users report them.",
    },
    {
      q: 'What are health checks?',
      level: 'basic',
      a: "Endpoints load balancers and orchestrators call to decide whether an instance should get traffic.\n- Liveness (`/healthz`): is the process running? If not, restart it.\n- Readiness (`/readyz`): can it serve requests right now (database and Redis reachable, warm-up done)? If not, stop sending traffic but don't restart.\n\nKeep them fast and don't make liveness depend on external services, or a database blip restarts every instance.",
    },
    {
      q: 'What are the three pillars of observability?',
      level: 'mid',
      diagram: `
flowchart TD
  S["Services"] --> L["Logs: what happened"]
  S --> M["Metrics: numbers over time"]
  S --> T["Traces: path of one request"]
  M --> A["Alerts"]
`,
      a: "- Logs: detailed records of individual events.\n- Metrics: numbers over time (requests per second, error rate, p95 latency, queue length, memory).\n- Traces: the path of one request across services, with timing for each step (OpenTelemetry).\n\nTogether they answer: is something wrong (metrics and alerts), where (traces), and why (logs).",
    },
    {
      q: 'How do you manage different environments (dev, staging, production)?',
      level: 'basic',
      a: "Same code and Docker image everywhere, different configuration through environment variables and secrets per environment. Staging mirrors production closely so problems show up there first. Promote the exact image that passed staging to production rather than rebuilding it.",
    },
  ],
}
