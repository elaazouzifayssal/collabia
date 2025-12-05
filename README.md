# Collabia

**A platform to find collaborators and people to learn/build with.**

Collabia connects Moroccan students and young builders who want to collaborate, learn together, and build projects.

---

## 🎯 What is Collabia?

Think: **LinkedIn + Bumble for collaboration between students and young builders.**

- Post what you want to build or learn
- Others click "Interested"
- Start conversations with people you want to work with
- Collaborate and learn together

---

## 🏗️ Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Mobile
- React Native
- Expo
- React Navigation
- React Query

---

## 📁 Project Structure

```
Collabiaa/
├── backend/           # API server
├── mobile/            # Mobile app
├── docker-compose.yml # Local development environment
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker Desktop
- Expo CLI (installed via npx)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d  # Start PostgreSQL
npx prisma migrate dev
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your backend URL
npx expo start
```

---

## 📱 MVP Features

- ✅ User registration + login
- ✅ User profiles (name, bio, school, interests, skills)
- ✅ Create Collab Posts (goals/requests)
- ✅ Browse feed of posts
- ✅ Click "Interested" on posts
- ✅ View list of interested users
- ✅ 1-1 messaging
- ✅ Inbox/conversations

---

## 🛠️ Development

Backend runs on: `http://localhost:3000`
Mobile runs via Expo

---

Built with ❤️ for Moroccan students and builders.
