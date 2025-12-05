# Collabia - Setup Guide

This guide will walk you through setting up Collabia for the first time.

---

## ✅ Prerequisites

Before starting, install these tools:

### 1. Node.js (v18 or higher)
- Download: https://nodejs.org/
- Choose the **LTS version**
- After installation, verify:
  ```bash
  node --version
  npm --version
  ```

### 2. Docker Desktop
- Download: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- Verify:
  ```bash
  docker --version
  ```

---

## 🚀 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

**What this does:** Downloads all the Node.js packages we need (Express, Prisma, TypeScript, etc.)

### Step 2: Configure Environment

```bash
cp .env.example .env
```

**What this does:** Creates your local environment configuration file. The default values are already set for local development.

### Step 3: Start PostgreSQL Database

From the **root directory** (Collabiaa/):

```bash
docker-compose up -d
```

**What this does:**
- Starts PostgreSQL database in a Docker container
- `-d` flag runs it in the background
- Database will be accessible on `localhost:5432`

**Verify it's running:**
```bash
docker ps
```
You should see `collabia-postgres` in the list.

### Step 4: Set Up Database Schema

```bash
cd backend
npx prisma migrate dev --name init
```

**What this does:**
- Creates the database tables based on our schema
- Generates the Prisma Client (TypeScript types for database)
- This is how we turn the schema.prisma file into actual database tables

### Step 5: Start the Backend Server

```bash
npm run dev
```

**What this does:**
- Starts the Express API server
- Runs on `http://localhost:3000`
- Auto-reloads when you change code

**Test it's working:**
Open http://localhost:3000/api/health in your browser. You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "Collabia API"
}
```

---

## 📱 Mobile Setup

### Step 1: Install Dependencies

Open a **new terminal window**, then:

```bash
cd mobile
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

**Note:** The default `API_URL=http://localhost:3000` works for iOS Simulator. For Android Emulator, change it to `http://10.0.2.2:3000`.

### Step 3: Start Expo

```bash
npx expo start
```

**What this does:**
- Starts the Expo development server
- Shows a QR code and menu options

**Options to run the app:**
- Press `i` - Open iOS Simulator (requires macOS with Xcode)
- Press `a` - Open Android Emulator (requires Android Studio)
- Press `w` - Open in web browser
- Scan QR code with Expo Go app on your phone

---

## 🎯 Verify Everything Works

If setup is successful:

1. **Backend** - http://localhost:3000/api/health returns healthy status
2. **Database** - Prisma Studio works: `cd backend && npx prisma studio` (opens database GUI)
3. **Mobile** - App loads and shows 4 tabs: Home, Collab, Messages, Profile

---

## 📂 Project Structure Overview

```
Collabiaa/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database models (Users, Posts, Messages, etc.)
│   ├── src/
│   │   ├── routes/
│   │   │   └── health.ts      # Health check endpoint
│   │   └── server.ts          # Express app setup
│   ├── .env                   # Your local config (not in git)
│   └── package.json
│
├── mobile/
│   ├── app/
│   │   ├── (tabs)/           # Bottom tab screens
│   │   │   ├── index.tsx     # Home feed
│   │   │   ├── collab.tsx    # Collab feed
│   │   │   ├── messages.tsx  # Inbox
│   │   │   └── profile.tsx   # User profile
│   │   └── _layout.tsx       # Root navigation
│   └── package.json
│
└── docker-compose.yml        # PostgreSQL container config
```

---

## 🛠️ Useful Commands

### Backend

```bash
# Start dev server
npm run dev

# View database in browser GUI
npx prisma studio

# Reset database (careful! deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate
```

### Mobile

```bash
# Start Expo
npx expo start

# Clear cache if things act weird
npx expo start -c
```

### Docker

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Make sure PostgreSQL is running: `docker ps`
- Check `.env` file exists with correct DATABASE_URL

### Database connection failed
- Ensure Docker Desktop is running
- Restart database: `docker-compose restart`
- Check credentials match in `.env` and `docker-compose.yml`

### Mobile app won't load
- Check backend is running on `http://localhost:3000/api/health`
- For Android Emulator, use `http://10.0.2.2:3000` in `.env`
- Clear Expo cache: `npx expo start -c`

---

## 🎓 What We've Built

You now have:

1. **Backend API** - Express server with TypeScript
2. **Database** - PostgreSQL with Prisma ORM
3. **Database Schema** - Users, Posts, Interests, Conversations, Messages
4. **Mobile App** - React Native with Expo and 4-tab navigation
5. **Development Environment** - Everything runs locally

---

## ✅ Next Steps

Once this setup is complete, we'll build:

1. User registration + login (auth)
2. Profile creation/editing
3. Create collab posts
4. Interest system
5. Messaging

One feature at a time, until the MVP is complete.

---

Questions? Let me know where you're stuck!
