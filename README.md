# 💒 ShaadiBoard

A modern, collaborative wedding planning platform built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **InstantDB**. Plan your wedding with your family in real-time, all in one beautiful dashboard.

![Status](https://img.shields.io/badge/status-production_ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## ✨ Features

ShaadiBoard provides everything you need to plan a wedding collaboratively:

### 📋 **Checklist/Tasks Board**
- Create and organize wedding tasks
- Assign tasks to family members (bride/groom side)
- Drag-and-drop reordering to prioritize tasks
- Mark tasks complete with instant visual feedback
- Filter tasks by side (bride, groom, or both)
- Admin delete permissions

### 💰 **Budget Tracking**
- Track estimated vs. actual expenses
- Organize budget by category (catering, photography, venue, etc.)
- Split budget between bride and groom sides
- Real-time budget calculations and summaries
- Assign payment responsibility to family members
- Visual budget cards with spending breakdowns

### 📅 **Event Planning**
- Create wedding events (ceremonies, celebrations, receptions)
- Assign date, time, and venue to each event
- Organize multiple events in one wedding
- Link events to guest invitations

### 👥 **Guest Management**
- Maintain a centralized guest list
- Track guest side (bride/groom)
- Link guests to specific events
- RSVP tracking (pending, attending, declined)
- Generate public RSVP link for easy guest responses
- Real-time guest status updates

### 🏢 **Vendor Management**
- Add and compare vendors for different services
- Track quotes from multiple vendors
- Categorize by service type (catering, photography, etc.)
- Quick vendor comparison dashboard

### 👨‍👩‍👧‍👦 **Team Collaboration**
- Invite family members to the wedding board
- Role-based access (admin, member)
- Side-based permissions (bride, groom, both)
- Real-time sync across all team members
- See who's editing in real-time (with Instant presence)

### 🔐 **Authentication & Security**
- Magic link email authentication (no passwords)
- Secure guest authentication
- Permission-based access control
- Admin-only destructive actions

### 📱 **Real-time & Offline Support**
- Instant real-time synchronization via InstantDB
- Offline support (continues working without internet)
- Automatic sync when connection restored
- No manual refresh needed

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (or **pnpm**/**bun**)
- **InstantDB** account (free tier available at https://instantdb.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/shaadi-board.git
   cd shaadi-board
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create an InstantDB app:**
   ```bash
   npm run instant:init
   # or
   npx instant-cli init-without-files --title "ShaadiBoard"
   ```

4. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_INSTANT_APP_ID=your_app_id_here
   INSTANT_APP_ADMIN_TOKEN=your_admin_token_here
   ```

5. **Pull schema and permissions:**
   ```bash
   npm run instant:pull
   # or
   npx instant-cli pull --yes
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open in browser:**
   Navigate to `http://localhost:3000`

---

## 📚 Project Structure

```
shaadi-board/
├── src/
│   ├── app/
│   │   ├── w/[weddingId]/          # Wedding dashboard pages
│   │   ├── join/                    # Team member invitation link
│   │   ├── rsvp/[weddingId]/       # Public guest RSVP page
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Home/wedding hub
│   │   └── globals.css
│   ├── components/
│   │   ├── boards.tsx               # Feature boards (Tasks, Budget, etc.)
│   │   └── ui/                      # Reusable UI components
│   ├── lib/
│   │   ├── db.ts                    # InstantDB client initialization
│   │   └── utils.ts
│   ├── instant.schema.ts            # InstantDB schema definition
│   └── instant.perms.ts             # InstantDB permissions
├── public/
├── .env.local                       # Environment variables (git-ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 🏗️ Architecture

### Database Schema (InstantDB)

**Entities:**
- `$users` - Authentication & user profiles
- `weddings` - Wedding events and metadata
- `tasks` - Checklist tasks
- `budgetItems` - Budget expenses
- `events` - Wedding events (mehendi, sangeet, etc.)
- `guests` - Guest list entries
- `vendors` - Vendor information and quotes
- `members` - Team members with roles and side assignment

**Relationships:**
- Users → Members → Weddings
- Weddings → Tasks/Budget/Events/Guests/Vendors
- Guests → Events
- Members have roles (admin/member) and sides (bride/groom/both)

### Real-time Sync

ShaadiBoard uses **InstantDB** for automatic real-time synchronization:
- Changes are instantly reflected across all connected devices
- Offline changes sync automatically when connection restored
- No polling or manual refresh needed
- Built-in conflict resolution

### Authentication

Magic link email authentication flow:
1. User enters email
2. Receives magic link via email
3. Clicks link and logs in instantly
4. No password required
5. Session persists across browser sessions

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14+ |
| **Language** | TypeScript 5.0+ |
| **Styling** | Tailwind CSS 4.0 + Custom CSS |
| **UI Components** | Shadcn/ui + Base UI |
| **Database** | InstantDB (Real-time, No Backend) |
| **Auth** | InstantDB Magic Links |
| **Drag & Drop** | dnd-kit |
| **Icons** | Lucide React |
| **Design System** | Airbnb Design System |

---

## 📖 Usage

### Creating a Wedding

1. Sign in with your email
2. Click "Create Wedding" on the home page
3. Enter wedding name, date, city
4. Start adding tasks, budget items, etc.

### Inviting Team Members

1. On your wedding dashboard, click "Invite Bride Side" or "Invite Groom Side"
2. Share the generated link with family members
3. They can join with their email and start collaborating

### Adding Tasks

1. Go to the **Checklist** tab
2. Fill in task details (title, assignee, due date, side)
3. Click "Add Task"
4. Drag to reorder tasks by priority
5. Click the circle to mark complete

### Managing Budget

1. Go to the **Budget** tab
2. Click "Add Expense"
3. Enter category, estimated amount, responsible side
4. View real-time budget totals by side
5. Update actual amounts as expenses are paid

### Managing Guests

1. Go to the **Guests** tab
2. Add guests with their name and side
3. Link guests to events
4. Share the public RSVP link with guests
5. Track RSVP responses in real-time

---

## 🔐 Permissions & Access Control

### Role-Based Access (RBAC)

- **Admin**: Full access, can invite members, delete items
- **Member**: Can view, create, and edit items based on side assignment

### Side-Based Access

- **Bride Side**: Can edit bride-side items only
- **Groom Side**: Can edit groom-side items only
- **Both**: Can edit all items (typically admin)

Permissions are enforced at:
- Database level (InstantDB rules)
- UI level (button visibility)
- API level (server-side validation)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect repo to Vercel
vercel

# Follow prompts and deploy
```

### Environment Variables on Vercel

Set in Vercel dashboard:
- `NEXT_PUBLIC_INSTANT_APP_ID`
- `INSTANT_APP_ADMIN_TOKEN`

### Other Platforms

Works on any platform that supports Next.js 14+:
- Netlify
- Firebase Hosting
- AWS Amplify
- Self-hosted Node.js server

---

## 📱 Mobile Support

ShaadiBoard is fully responsive:
- ✅ Mobile-first design
- ✅ Touch-friendly interface
- ✅ Adaptive layouts
- ✅ Works offline on mobile

---

## 🎨 Design System

Built with the **Airbnb Design System**:
- Clean, minimal aesthetic
- Consistent typography and spacing
- Brand color: Rausch Pink (#ff385c)
- Smooth animations and transitions
- Accessible color contrasts

### Customization

Modify colors and tokens in:
- `src/app/globals.css` - Theme variables
- `tailwind.config.ts` - Tailwind configuration

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style (Prettier configured)
- Write descriptive commit messages
- Test on mobile before submitting PR
- Update README if adding features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **InstantDB** - Real-time database and authentication
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Beautiful React components
- **Airbnb Design System** - Design inspiration

---

## 📞 Support

### Getting Help

- 📖 [InstantDB Docs](https://instantdb.com/docs)
- 🔍 [Next.js Documentation](https://nextjs.org/docs)
- 🐛 [Report a bug](https://github.com/yourusername/shaadi-board/issues)
- 💬 [Discussions](https://github.com/yourusername/shaadi-board/discussions)

---

**Made with 💕 for Indian weddings. Happy planning!**

⭐ If you find this useful, please consider giving it a star!
