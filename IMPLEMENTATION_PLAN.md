# Implementation Plan: Structured Interests with History Tracking

## Overview
This plan outlines the implementation of structured current interests (books, games, skills) with progress tracking, history management, and an enhanced Same Interests discovery UI.

---

## Phase 1: Database Schema Changes

### 1.1 New Prisma Models

```prisma
// CurrentBook - Structured book tracking
model CurrentBook {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title       String
  totalPages  Int?
  pagesRead   Int      @default(0)
  status      String   @default("reading") // reading | paused | completed
  startDate   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("current_books")
}

// CurrentSkill - Structured skill tracking
model CurrentSkill {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name      String
  level     String   @default("beginner") // beginner | intermediate | advanced
  notes     String?
  startDate DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("current_skills")
}

// CurrentGame - Structured game tracking
model CurrentGame {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name      String
  rank      String?
  frequency String?  // daily | weekly | occasionally
  startDate DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("current_games")
}

// BookHistory - Completed/paused books
model BookHistory {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  title       String
  totalPages  Int?
  pagesRead   Int?
  status      String    // completed | paused
  rating      Int?      // 1-5 stars (for completed)
  startedAt   DateTime
  finishedAt  DateTime  @default(now())

  @@map("book_history")
}

// SkillHistory - Past skills learned
model SkillHistory {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name         String
  levelReached String   // beginner | intermediate | advanced
  notes        String?
  startedAt    DateTime
  completedAt  DateTime @default(now())

  @@map("skill_history")
}

// GameHistory - Past games played
model GameHistory {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name       String
  rank       String?
  playedFrom DateTime
  playedTo   DateTime @default(now())

  @@map("game_history")
}
```

### 1.2 User Model Relations Update
Add relations to User model:
```prisma
currentBook    CurrentBook?
currentSkill   CurrentSkill?
currentGame    CurrentGame?
bookHistory    BookHistory[]
skillHistory   SkillHistory[]
gameHistory    GameHistory[]
```

---

## Phase 2: Backend API Changes

### 2.1 New Routes: `/api/interests`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interests/current` | Get user's current book, skill, game |
| PUT | `/api/interests/book` | Update current book (moves old to history) |
| PUT | `/api/interests/skill` | Update current skill (moves old to history) |
| PUT | `/api/interests/game` | Update current game (moves old to history) |
| PATCH | `/api/interests/book/progress` | Update book progress (pagesRead) |
| PATCH | `/api/interests/skill/level` | Update skill level |
| GET | `/api/interests/history` | Get all history (books, skills, games) |
| DELETE | `/api/interests/book` | Clear current book |
| DELETE | `/api/interests/skill` | Clear current skill |
| DELETE | `/api/interests/game` | Clear current game |

### 2.2 Update Same Interests Endpoint
Modify `/api/swipes/same-interests` to return:
- Structured user data with progress percentages
- User's reading/playing/learning status
- Badge indicators (e.g., "Not currently reading")

---

## Phase 3: Frontend Type Definitions

### 3.1 New TypeScript Interfaces

```typescript
interface CurrentBook {
  id: string;
  title: string;
  totalPages?: number;
  pagesRead: number;
  status: 'reading' | 'paused' | 'completed';
  startDate: string;
}

interface CurrentSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
  startDate: string;
}

interface CurrentGame {
  id: string;
  name: string;
  rank?: string;
  frequency?: 'daily' | 'weekly' | 'occasionally';
  startDate: string;
}

interface BookHistoryItem {
  id: string;
  title: string;
  totalPages?: number;
  pagesRead?: number;
  status: 'completed' | 'paused';
  rating?: number;
  finishedAt: string;
}

interface SkillHistoryItem {
  id: string;
  name: string;
  levelReached: string;
  completedAt: string;
}

interface GameHistoryItem {
  id: string;
  name: string;
  rank?: string;
  playedTo: string;
}
```

---

## Phase 4: Frontend Services

### 4.1 New Service: `interestService.ts`

```typescript
export const interestService = {
  // Current interests
  getCurrentInterests: async () => { ... },

  // Book operations
  updateCurrentBook: async (data: UpdateBookData) => { ... },
  updateBookProgress: async (pagesRead: number) => { ... },
  clearCurrentBook: async () => { ... },

  // Skill operations
  updateCurrentSkill: async (data: UpdateSkillData) => { ... },
  updateSkillLevel: async (level: string) => { ... },
  clearCurrentSkill: async () => { ... },

  // Game operations
  updateCurrentGame: async (data: UpdateGameData) => { ... },
  clearCurrentGame: async () => { ... },

  // History
  getHistory: async () => { ... },
};
```

---

## Phase 5: UI Components

### 5.1 New Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `CurrentBookCard` | `components/interests/` | Display current book with progress bar |
| `CurrentSkillCard` | `components/interests/` | Display current skill with level badge |
| `CurrentGameCard` | `components/interests/` | Display current game with rank/frequency |
| `BookHistoryList` | `components/interests/` | Collapsible list of past books |
| `SkillHistoryList` | `components/interests/` | Collapsible list of past skills |
| `GameHistoryList` | `components/interests/` | Collapsible list of past games |
| `ProgressBar` | `components/ui/` | Reusable progress bar |
| `LevelBadge` | `components/ui/` | Skill level indicator |
| `StatusBadge` | `components/ui/` | Reading/playing status badge |
| `SameInterestUserCard` | `components/discover/` | Enhanced user card with progress |

### 5.2 Design Specifications

**Current Book Card:**
- Large gradient header
- Book title prominent
- Progress bar (pagesRead / totalPages)
- Status pill (reading/paused)
- Days since started

**Same Interest User Card (Enhanced):**
- 140px width
- Avatar (72px)
- Name + location
- Progress percentage badge
- Status indicator ("Currently reading" / "Paused")
- Gradient border matching interest type

---

## Phase 6: Screen Updates

### 6.1 ProfileScreen Updates
- Replace simple "NOW" section with structured cards
- Add collapsible history sections
- Show progress bars for books
- Show level badges for skills

### 6.2 EditProfileScreen → EditInterestsScreen
Create dedicated screen for editing interests:
- Book form: title, total pages, pages read
- Skill form: name, level selector, notes
- Game form: name, rank, frequency

### 6.3 SwipeScreen Same Interests Mode
- Enhanced section headers (already done)
- New user cards with progress info
- "Not currently reading" badge for inactive users
- Posts related to each interest (optional v2)

### 6.4 CollaboratorProfileScreen
Add sections for:
- Current interests with full details
- Book history (completed + paused)
- Skill history
- Game history

---

## Phase 7: Implementation Order

### Step 1: Database (Day 1)
1. Add new models to schema.prisma
2. Run migration
3. Update seed with sample structured data

### Step 2: Backend API (Day 1-2)
1. Create `/api/interests` routes
2. Implement CRUD operations
3. Update same-interests endpoint
4. Add history management logic

### Step 3: Frontend Types & Services (Day 2)
1. Create TypeScript interfaces
2. Create interestService.ts
3. Update AuthContext with new types

### Step 4: UI Components (Day 2-3)
1. Create CurrentBookCard
2. Create CurrentSkillCard
3. Create CurrentGameCard
4. Create ProgressBar & badges
5. Create history list components

### Step 5: Screen Integration (Day 3-4)
1. Update ProfileScreen
2. Create EditInterestsScreen
3. Update SwipeScreen Same Interests
4. Update CollaboratorProfileScreen

### Step 6: Polish & Testing (Day 4)
1. Test history transitions
2. Verify progress calculations
3. UI polish and animations

---

## Files to Create/Modify

### New Files:
```
backend/src/routes/interests.ts
mobile/src/services/interestService.ts
mobile/src/components/interests/CurrentBookCard.tsx
mobile/src/components/interests/CurrentSkillCard.tsx
mobile/src/components/interests/CurrentGameCard.tsx
mobile/src/components/interests/BookHistoryList.tsx
mobile/src/components/interests/SkillHistoryList.tsx
mobile/src/components/interests/GameHistoryList.tsx
mobile/src/components/ui/ProgressBar.tsx
mobile/src/components/ui/LevelBadge.tsx
mobile/src/screens/EditInterestsScreen.tsx
```

### Modified Files:
```
backend/prisma/schema.prisma
backend/src/server.ts (add interests routes)
backend/src/routes/swipes.ts (update same-interests)
mobile/src/context/AuthContext.tsx
mobile/src/screens/ProfileScreen.tsx
mobile/src/screens/SwipeScreen.tsx
mobile/src/screens/CollaboratorProfileScreen.tsx
mobile/src/navigation/AppNavigator.tsx
backend/prisma/seed.ts
```

---

## Questions for User

1. **Book progress tracking**: Should we track by pages or percentage? (Pages allows more detail)

2. **History limits**: How many items to keep in history? (Suggest: 20 per category)

3. **Auto-archive**: When switching to a new book, should the old one automatically go to "paused" or ask the user?

4. **Posts integration**: Should we show posts tagged with the same book/game/skill? (Can be v2)

5. **Notifications**: Notify users when someone starts reading the same book? (Can be v2)
