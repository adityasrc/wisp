# Wisp Project Status & Roadmap

## Overview
Wisp is a privacy-first real-time chat application built as a Turborepo monorepo:
- `apps/http-backend`: Express REST API (Auth, Users, Requests, Conversations, Messages).
- `apps/ws-backend`: Real-time WebSocket server (RFC 6455 compliant, cookie + query param auth, multi-device UserManager, atomic DB transactions, 15-min edit window, ephemeral sensitive messages, runtime Zod validation).
- `packages/database`: Prisma schema (PostgreSQL) with `uuid(7)` messages, dormant conversation tracking, etc.
- `packages/common`: Shared Zod validation schemas (`z.uuid()`, login, signup, sendMessage, editMessage, etc.).
- `apps/web`: Next.js 16 (App Router) + React 19 frontend.

---

## What Was Completed Before OS Migration:
1. **HTTP Backend**: 100% completed, tested, and CORS credentials enabled for `http://localhost:3000`.
2. **WebSocket Backend**: 100% completed, reviewed, hardened (all 9 feedback items resolved), and pushed to `main`.
3. **Frontend Initial Setup**:
   - `apps/web/app/signup/page.tsx`: Updated with `credentials: "include"`, `useRouter` redirect to `/chats` on 200 OK.

---

## Working Rules & Pair-Programming Philosophy:
- **Learning & Muscle Memory**: The user writes the React & Next.js code themselves.
- **Role of the Assistant**: Architectural guidance, mental models, code reviews, spotting edge cases, and explaining interview-level concepts (Server vs Client components, useEffect closures, CORS cookies, etc.).
- **No Code Dumps**: Keep guidance structured, concise, and let the user implement the solution step by step.
- **Style-free First**: Focus strictly on business logic and state management first. Styling comes later.

---

## Next Immediate Steps (Where to Resume):
1. **Update `apps/web/app/login/page.tsx`**:
   - Add `credentials: "include"` so login cookies persist in the browser jar.
   - Verify redirect to `/chats`.
2. **Global Auth State & Session Check**:
   - Create an Auth Context / Hook or Next.js route protection check (`GET /api/v1/users/profile`).
3. **WebSocket Connection (`useWebSocket` Hook)**:
   - Connect to `ws://localhost:5100` once user is authenticated.
   - Handle connection lifecycle (open, message, close, cleanup on unmount).
4. **Conversations & Active Chat UI Logic**:
   - Fetch conversations list, load messages, send/edit messages via WebSocket.
