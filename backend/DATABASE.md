# Database Schema Documentation

Visual guide to understanding our Prisma schema.

---

## Core Flow: Post → Interest → Conversation → Messages

```
User creates Post
  ↓
Other Users click "Interested"
  ↓
Interest record created (User ↔ Post)
  ↓
Post author sees interested users
  ↓
Author starts Conversation with someone
  ↓
They exchange Messages
```

---

## Tables

### users
Stores all user accounts and profiles.

| Column     | Type     | Description                          |
|------------|----------|--------------------------------------|
| id         | UUID     | Primary key                          |
| email      | String   | Unique email for login              |
| password   | String   | Hashed password (bcrypt)            |
| name       | String   | Display name                         |
| bio        | String?  | Short profile description (optional) |
| school     | String?  | University/School name (optional)   |
| avatar     | String?  | Profile picture URL (optional)      |
| status     | String   | "Available", "Busy", etc.           |
| interests  | String[] | Array of tags (e.g., ["React", "AI"]) |
| skills     | String[] | Array of tags (e.g., ["Python"])    |
| createdAt  | DateTime | Account creation timestamp          |
| updatedAt  | DateTime | Last profile update                 |

**Relations:**
- `posts` → User can create many Posts
- `interests_in` → User can be interested in many Posts
- `sentMessages` → User can send many Messages
- `receivedMessages` → User can receive many Messages
- `conversations` → User can be in many Conversations

---

### posts
Collab posts (goals/requests from users).

| Column      | Type     | Description                        |
|-------------|----------|------------------------------------|
| id          | UUID     | Primary key                        |
| title       | String   | Short headline                     |
| description | String?  | Detailed description (optional)   |
| tags        | String[] | Topics/skills (e.g., ["Analyse S1"]) |
| authorId    | UUID     | Foreign key → users.id            |
| createdAt   | DateTime | Post creation time                |
| updatedAt   | DateTime | Last edit time                    |

**Relations:**
- `author` → Post belongs to one User
- `interests` → Post can have many Interests

**Example Post:**
```
title: "Looking for Analyse S1 study partner"
description: "Daily 2h study sessions via Discord"
tags: ["Analyse", "ENSA", "Math"]
```

---

### interests
Tracks who clicked "Interested" on which post.

| Column    | Type     | Description                |
|-----------|----------|----------------------------|
| id        | UUID     | Primary key                |
| userId    | UUID     | Foreign key → users.id    |
| postId    | UUID     | Foreign key → posts.id    |
| createdAt | DateTime | When they clicked         |

**Unique constraint:** A user can only be interested in a post once.

**Relations:**
- `user` → Interest belongs to one User
- `post` → Interest belongs to one Post

**Purpose:** When you click "Interested" on a post, we create a row here. The post author can query all interests for their post to see who's interested.

---

### conversations
Represents a 1-1 chat between two users.

| Column    | Type     | Description            |
|-----------|----------|------------------------|
| id        | UUID     | Primary key            |
| createdAt | DateTime | When chat started      |
| updatedAt | DateTime | Last message timestamp |

**Relations:**
- `participants` → Conversation has 2 participants (users)
- `messages` → Conversation has many Messages

**How it works:** When User A wants to chat with User B, we create a Conversation and link both users via ConversationParticipant.

---

### conversation_participants
Junction table: links users to conversations.

| Column         | Type     | Description                     |
|----------------|----------|---------------------------------|
| id             | UUID     | Primary key                     |
| conversationId | UUID     | Foreign key → conversations.id |
| userId         | UUID     | Foreign key → users.id         |
| joinedAt       | DateTime | When user joined conversation  |

**Unique constraint:** A user can only be in a conversation once.

**Relations:**
- `conversation` → Participant belongs to one Conversation
- `user` → Participant is one User

**Purpose:** Allows us to query "all conversations for this user" and "all users in this conversation".

---

### messages
Individual messages within conversations.

| Column         | Type     | Description                     |
|----------------|----------|---------------------------------|
| id             | UUID     | Primary key                     |
| content        | String   | Message text                    |
| senderId       | UUID     | Foreign key → users.id (sender) |
| receiverId     | UUID     | Foreign key → users.id (receiver) |
| conversationId | UUID     | Foreign key → conversations.id  |
| isRead         | Boolean  | Has receiver seen this?         |
| createdAt      | DateTime | When message was sent           |

**Relations:**
- `sender` → Message sent by one User
- `receiver` → Message sent to one User
- `conversation` → Message belongs to one Conversation

**Purpose:** Stores all messages. We can query "all messages in this conversation" and mark them as read.

---

## Common Queries (Examples)

### Get all posts in feed
```typescript
const posts = await prisma.post.findMany({
  include: {
    author: true, // Include author profile
    interests: true, // Include interest count
  },
  orderBy: { createdAt: 'desc' },
});
```

### Check if user is interested in a post
```typescript
const interest = await prisma.interest.findUnique({
  where: {
    userId_postId: {
      userId: 'user-uuid',
      postId: 'post-uuid',
    },
  },
});
// If interest exists, user already clicked "Interested"
```

### Get all users interested in a post
```typescript
const interestedUsers = await prisma.interest.findMany({
  where: { postId: 'post-uuid' },
  include: { user: true }, // Include user profiles
});
```

### Get conversation between two users
```typescript
const conversation = await prisma.conversation.findFirst({
  where: {
    participants: {
      every: {
        userId: { in: ['user1-uuid', 'user2-uuid'] },
      },
    },
  },
  include: {
    messages: { orderBy: { createdAt: 'asc' } },
  },
});
```

---

## Key Concepts

### UUIDs
We use UUIDs (not auto-incrementing IDs) for better security and distributed system support.

### Timestamps
`createdAt` and `updatedAt` are automatically managed by Prisma.

### Cascading Deletes
If a User is deleted, all their Posts, Interests, Messages are also deleted (`onDelete: Cascade`).

### Arrays in PostgreSQL
`interests: String[]` stores an array directly in PostgreSQL. No junction table needed for simple tag lists.

---

This schema supports the full MVP flow:
1. Users register
2. Create posts
3. Click interested
4. Start conversations
5. Send messages

Simple, clean, and ready to scale.
