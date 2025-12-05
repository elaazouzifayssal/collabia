# Collabia Backend

Node.js + Express + TypeScript + Prisma REST API

---

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database models and relations
├── src/
│   ├── routes/                # API endpoints (organized by resource)
│   │   └── health.ts          # Health check route
│   └── server.ts              # Express app entry point
├── .env                       # Local environment variables (not in git)
├── .env.example               # Template for .env
└── package.json
```

---

## Database Models (Prisma)

Our app has 6 main models:

### User
- Stores user accounts (email, password, profile info)
- Fields: name, bio, school, interests[], skills[], status

### Post
- Collab posts created by users
- Fields: title, description, tags[], author

### Interest
- Tracks who clicked "Interested" on which post
- Links: User ↔ Post (many-to-many)

### Conversation
- Represents a 1-1 chat between two users

### ConversationParticipant
- Junction table linking users to conversations

### Message
- Individual messages within a conversation
- Fields: content, sender, receiver, isRead

---

## How It Works

### Express Server (server.ts)
- Sets up Express app
- Adds middleware (CORS, JSON parsing)
- Registers routes
- Starts HTTP server on port 3000

### Routes (routes/)
- Each file handles endpoints for a resource
- Example: `health.ts` provides `/api/health` endpoint
- Future: `auth.ts`, `posts.ts`, `messages.ts`, etc.

### Prisma ORM
- Connects to PostgreSQL
- Provides type-safe database queries
- Auto-generates TypeScript types from schema

---

## Environment Variables (.env)

```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

---

## Development Workflow

1. **Change database schema:**
   - Edit `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name description`
   - Prisma generates new TypeScript types automatically

2. **Add new route:**
   - Create file in `src/routes/`
   - Import and register in `server.ts`

3. **Query database:**
   ```typescript
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();

   const users = await prisma.user.findMany();
   ```

---

## Next Features to Build

- [ ] POST /api/auth/register - User registration
- [ ] POST /api/auth/login - User login (returns JWT)
- [ ] GET /api/users/me - Get current user profile
- [ ] PATCH /api/users/me - Update profile
- [ ] POST /api/posts - Create collab post
- [ ] GET /api/posts - List all posts (feed)
- [ ] POST /api/posts/:id/interest - Click "Interested"
- [ ] GET /api/posts/:id/interested-users - Get list of interested users
- [ ] POST /api/conversations - Start conversation
- [ ] GET /api/conversations - List user's conversations
- [ ] POST /api/messages - Send message

Each route will be built step-by-step with proper validation, error handling, and auth middleware.
