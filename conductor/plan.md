# ShaadiBoard Implementation Plan

## Background & Motivation
The goal is to build "ShaadiBoard", a shared wedding planner specifically tailored for Indian families, leveraging InstantDB as the real-time, offline-first backend. The app requires multiplayer capabilities, role/side-based access control, offline support for venue visits, and a responsive UI.

## Scope & Impact
- **InstantDB Schema:** Define entities (`weddings`, `members`, `events`, `guests`, `tasks`, `budgetItems`, `vendors`) and their relationships.
- **Permissions:** Granular read/write/delete access based on membership, side (bride/groom/both), and admin roles.
- **UI Screens:** Wedding creation/invites, drag-and-drop checklist, guest list with public RSVP, split budget tracker, vendor board.
- **Tech Stack:** Next.js, `@instantdb/react`, `@dnd-kit/core` (for drag-and-drop), and Shadcn UI (for styled, accessible components).

## Proposed Solution

### 1. Data Model (InstantDB Schema)
We will update `src/instant.schema.ts` with the following entities and links:
- `weddings`: name, date, city, budgetTotal
- `members`: weddingId, userId, role (admin/member), side (bride/groom/both)
- `events`: weddingId, name, date, venue
- `guests`: weddingId, name, phone, side, eventId, rsvpStatus
- `tasks`: weddingId, title, assignedTo, dueDate, done, side (to control access)
- `budgetItems`: weddingId, category, estimated, actual, paidBy, side
- `vendors`: weddingId, type, name, quote, contact
- *Links:* Establish a 1:N relationship from `weddings` to all other entities.

### 2. Permissions (InstantDB Rules)
We will define rules in `src/instant.perms.ts`:
- **Read:** Members can read all data where `data.weddingId == auth.weddingId` (via member lookup).
- **Update (Tasks/Budget):** Allowed if `auth.side == data.side` OR `auth.side == 'both'`.
- **Delete:** Only allowed if `auth.role == 'admin'`.

### 3. Architecture & State Management
- **InstantDB Native:** We will use `db.useQuery` and `db.transact` directly within UI components to fetch nested data (e.g., weddings with tasks, guests, and budget).
- **Drag & Drop:** Use `@dnd-kit/core` for the Checklist board, syncing sorted/status states directly to InstantDB for live updates.
- **Styling:** Use Shadcn UI alongside Tailwind CSS v4.

### 4. Multiplayer & Offline
- Leverage InstantDB's `usePresence` to show online members with avatars across all boards.
- Rely on InstantDB's inherent offline-first and optimistic UI capabilities for venue visits and real-time syncing.

## Phased Implementation Plan

### Phase 1: Setup & Infrastructure
1. Install dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `lucide-react`, `clsx`, `tailwind-merge` (for Shadcn).
2. Configure Shadcn UI components (button, card, dialog, input, label, select, avatar, tabs).
3. Update `src/instant.schema.ts` with the new entities and relationships.
4. Update `src/instant.perms.ts` with the granular rules for side and admin checks.

### Phase 2: Core Data Models & Creation UI
1. Build the "Create Wedding" screen.
2. Implement invite link generation (encoding `weddingId` and side selection: Bride or Groom).
3. Build the join flow for users accessing an invite link.

### Phase 3: Shared Modules
1. Implement the App Shell/Navigation.
2. Build the `PresenceAvatars` component using `db.rooms.presence` to show who is currently online in the wedding room.

### Phase 4: Checklist Board (Tasks)
1. Build the Kanban-style board using `@dnd-kit`.
2. Implement optimistic drag-and-drop to update task status/ordering.
3. Integrate side-based permission checks (UI disable/hide for unauthorized edits).

### Phase 5: Guest List & Public RSVP
1. Build the Guest List manager (add, categorize by side/event).
2. Create a public `/rsvp/[weddingId]` route for guests to submit their RSVP status securely.

### Phase 6: Budget Tracker
1. Build the Budget Tracker grid.
2. Implement split calculations to show totals for the Bride side vs. Groom side.

### Phase 7: Vendor Board
1. Build the Vendor board to store quotes, contact info, and comments/notes.

## Verification & Testing
- Verify schema structure using the InstantDB admin dashboard.
- Test permission rules by simulating different users (Bride side member, Groom side admin) attempting invalid updates.
- Test offline functionality by disconnecting the network, modifying a task, and verifying sync upon reconnection.
- Test multiplayer presence and drag-and-drop syncing across two browser windows.

## Migration & Rollback
- The current schema is mostly a starter template. We will replace it entirely.
- Since this is a new project, rollback simply involves reverting the git commits for `instant.schema.ts` and `instant.perms.ts`.