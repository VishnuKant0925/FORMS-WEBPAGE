# 🛰️  Smart Form Management System (SFMS)

<div align="center">


![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-Internal%20Use-orange?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-%E2%89%A5%2018.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%E2%89%A5%207.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A production-ready, bilingual, enterprise-grade Leave & Form Management System **

[Features](#-features) · [Architecture](#-system-architecture) · [Quick Start](#-quick-start-clone--run) · [API Reference](#-api-reference) · [Tech Stack](#️-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema-erd)
- [Authentication Flow](#-authentication-flow)
- [Form Submission Workflow](#-form-submission-workflow)
- [Project Structure](#-project-structure)
- [Quick Start: Clone & Run](#-quick-start-clone--run)
- [Environment Variables](#-environment-variables)
- [Default Accounts](#-default-accounts)
- [API Reference](#-api-reference)
- [Available Forms](#-available-forms)
- [Supported Languages](#-supported-languages-transliteration)
- [Security Architecture](#-security-architecture)
- [Available Scripts](#️-available-scripts)
- [Troubleshooting](#-troubleshooting)
- [Production Deployment](#-production-deployment)
- [License](#-license)

---

## 🔍 Overview

 SFMS digitises the paper-based leave and biodata forms used across government organisations. Employees fill forms in their preferred Indian language (with live Indic transliteration support for 21 languages), HR/Admin review and approve submissions through a role-based workflow, and the system generates print-ready PDFs with embedded Google Noto Indic fonts.

### Key Highlights

- 🌐 **Bilingual UI** — Hindi (default) + English interface with real-time language switching
- 🔤 **21-Language Transliteration** — Type in English phonetics, get output in any of 21 Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Assamese, and more
- 📄 **Pixel-Perfect PDFs** — Puppeteer + Google Noto fonts generate A4 PDFs identical to the original government forms
- 🔒 **Enterprise Security** — Argon2id hashing, JWT rotation, rate limiting, NoSQL injection protection
- 👥 **4-Tier Role System** — Employee → Supervisor → HR → Admin with granular access control

---

## ✨ Features

| Category | Highlights |
|----------|------------|
| **Authentication** | Email/password (Argon2id) + Google OAuth, JWT rotation, httpOnly cookies |
| **Forms** | 4 bilingual forms with live Indic transliteration (21 languages) |
| **PDF Generation** | Puppeteer + Google Noto fonts — pixel-perfect A4 PDFs |
| **Workflow** | Draft → Submit → HR Review (Approve / Reject / Return) |
| **Dashboard** | Real-time stats, submission history, pagination |
| **Analytics** | Monthly trends, status breakdown, form-type breakdown (Admin) |
| **Role-Based Access** | Employee · Supervisor · HR · Admin |
| **Security** | Helmet, CORS, rate limiting, NoSQL injection protection, Zod validation |
| **Bilingual** | Hindi (default) + English UI, 21-language transliteration |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org) | 15.0.0 | React framework with App Router |
| [React](https://react.dev) | 19.0.0 | UI library |
| TypeScript | ^5.3 | Static typing |
| Tailwind CSS | ^3.4 | Utility-first CSS |
| [Zustand](https://zustand-demo.pmnd.rs) | ^4.5 | Lightweight global state (access token in memory) |
| [React Hook Form](https://react-hook-form.com) | ^7.51 | Performant form handling |
| [Zod](https://zod.dev) | ^3.23 | Schema validation |
| [Axios](https://axios-http.com) | ^1.7 | HTTP client with auto token-refresh interceptor |
| [Recharts](https://recharts.org) | ^2.12 | Analytics charts |
| [Lucide React](https://lucide.dev) | ^0.400 | Icon library |
| [@ai4bharat/indic-transliterate](https://github.com/AI4Bharat/indic-transliterate) | ^1.3.8 | Live Indic transliteration |
| [@react-oauth/google](https://github.com/MomenSherif/react-oauth) | ^0.12 | Google OAuth button |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Express.js](https://expressjs.com) | ^4.19 | REST API server |
| TypeScript | ^5.4 | Static typing |
| [Mongoose](https://mongoosejs.com) | ^8.4 | MongoDB ODM |
| [Argon2](https://github.com/ranisalt/node-argon2) | ^0.31 | Password hashing (Argon2id) |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | ^9.0 | JWT access + refresh tokens |
| [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) | ^9.11 | Google ID token verification |
| [Puppeteer](https://pptr.dev) | ^22.10 | Headless Chrome PDF generation |
| [Helmet](https://helmetjs.github.io) | ^7.1 | Security headers |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | ^7.3 | Rate limiting |
| [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize) | ^2.2 | NoSQL injection protection |
| [Zod](https://zod.dev) | ^3.23 | Request validation schemas |
| [compression](https://github.com/expressjs/compression) | ^1.7 | Gzip response compression |

### Database

| Technology | Details |
|------------|---------|
| MongoDB | Local: `mongodb://127.0.0.1:27017/nrsc_slms` |
| MongoDB Atlas | Cloud: `mongodb+srv://...` (for production) |
| Mongoose ODM | Models: User, Submission, AuditLog |

---

## 🏗 System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        NextApp["Next.js 15 App<br/>(React 19 + TypeScript)"]
        Zustand["Zustand Store<br/>(Auth Token in Memory)"]
        RHF["React Hook Form<br/>+ Zod Validation"]
        Translit["AI4Bharat<br/>Indic Transliteration"]
    end

    subgraph Server["⚙️ Express.js Backend"]
        direction TB
        Middleware["Middleware Stack<br/>Helmet · CORS · Rate Limiter<br/>Mongo Sanitize · Compression"]
        Routes["API Routes<br/>/auth · /forms · /pdf<br/>/admin · /profile · /xlit-api-proxy"]
        Controllers["Controllers<br/>Auth · Form · PDF<br/>Admin · Profile"]
        Services["Services Layer"]
    end

    subgraph Data["🗄️ Data Layer"]
        MongoDB[("MongoDB<br/>(Local / Atlas)")]
        PDFEngine["Puppeteer<br/>PDF Generator"]
        Fonts["Google Noto<br/>Indic Fonts"]
        Templates["HTML Templates<br/>(4 Form Types)"]
    end

    subgraph External["🌐 External Services"]
        GoogleOAuth["Google OAuth 2.0"]
        AI4Bharat["AI4Bharat<br/>Transliteration API"]
    end

    NextApp <--> |"REST API<br/>(Axios + JWT)"| Middleware
    Middleware --> Routes
    Routes --> Controllers
    Controllers --> MongoDB
    Controllers --> PDFEngine
    PDFEngine --> Templates
    PDFEngine --> Fonts
    NextApp <--> |"OAuth"| GoogleOAuth
    Controllers <--> |"Token Verify"| GoogleOAuth
    Translit <--> |"Proxy"| AI4Bharat
    Zustand --> NextApp
    RHF --> NextApp
    Translit --> NextApp

    style Client fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#e2e8f0
    style Server fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#e2e8f0
    style Data fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e2e8f0
    style External fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#e2e8f0
```

### Request-Response Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js Frontend
    participant A as Axios Interceptor
    participant M as Middleware Stack
    participant C as Controller
    participant DB as MongoDB

    B->>N: User Action (Click / Submit)
    N->>A: API Request
    A->>A: Attach Bearer Token<br/>(from Zustand memory store)
    A->>M: HTTP Request + JWT

    rect rgb(30, 41, 59)
        Note over M: Middleware Pipeline
        M->>M: 1. Helmet (Security Headers)
        M->>M: 2. CORS Check
        M->>M: 3. Rate Limiter
        M->>M: 4. Body Parser
        M->>M: 5. Mongo Sanitize
        M->>M: 6. JWT Verify
        M->>M: 7. Role Guard
    end

    M->>C: Validated Request
    C->>DB: Query / Mutation
    DB-->>C: Result
    C-->>M: JSON Response
    M-->>A: HTTP Response

    alt 401 Unauthorized (Token Expired)
        A->>M: POST /auth/refresh (httpOnly cookie)
        M-->>A: New Access Token
        A->>A: Update Zustand Store
        A->>M: Retry Original Request
        M-->>A: Success Response
    end

    A-->>N: Response Data
    N-->>B: Updated UI
```

---

## 📊 Database Schema (ERD)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name "required, trimmed"
        String email UK "required, unique, lowercase"
        String passwordHash "optional (null for Google users)"
        String employeeCode "optional, sparse index"
        String department "optional"
        String designation "optional"
        String profilePhoto "optional URL"
        Enum role "employee | supervisor | hr | admin"
        Enum authProvider "local | google"
        String googleId UK "optional, sparse unique"
        String refreshToken "Argon2id hashed"
        Date createdAt "auto"
        Date updatedAt "auto"
    }

    SUBMISSION {
        ObjectId _id PK
        ObjectId userId FK "indexed, ref: User"
        Enum formType "casual_leave_nrsc | earned_leave | casual_leave_rrsc | trainee_biodata"
        String language "default: hi"
        Mixed formData "JSON form field values"
        Enum status "draft | submitted | recommended | approved | rejected | returned"
        String supervisorComment "optional"
        String hrComment "optional"
        ObjectId reviewedBy FK "optional, ref: User"
        Date reviewedAt "optional"
        Date createdAt "auto"
        Date updatedAt "auto"
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK "indexed, ref: User"
        String action "required (e.g., LOGIN, SUBMIT_FORM)"
        String target "optional (e.g., submission ID)"
        Mixed metadata "optional JSON context"
        Date createdAt "auto"
    }

    USER ||--o{ SUBMISSION : "submits"
    USER ||--o{ AUDIT_LOG : "generates"
    USER ||--o{ SUBMISSION : "reviews (reviewedBy)"
```

### Collection Indexes

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| `users` | `email` | Unique | Fast lookup by email |
| `users` | `googleId` | Sparse Unique | Google OAuth lookup |
| `users` | `employeeCode` | Sparse | Employee code search |
| `submissions` | `userId` | Regular | User's submissions |
| `submissions` | `formType` | Regular | Filter by form type |
| `submissions` | `status` | Regular | Filter by status |
| `auditlogs` | `userId` | Regular | User activity trail |

---

## 🔐 Authentication Flow

```mermaid
flowchart TD
    Start([User visits app]) --> Check{Has valid<br/>access token?}

    Check -->|Yes| Dashboard[✅ Access Dashboard]
    Check -->|No| LoginPage[Show Login Page]

    LoginPage --> Method{Auth Method}

    Method -->|Email/Password| Local["POST /auth/login<br/>(Rate limited: 10/15min)"]
    Method -->|Google| Google["Google OAuth Popup<br/>→ POST /auth/google"]

    Local --> Validate["Server validates credentials<br/>(Argon2id verify)"]
    Google --> VerifyToken["Server verifies Google ID Token<br/>(google-auth-library)"]

    Validate -->|Invalid| Error[❌ 401 Error]
    Validate -->|Valid| IssueTokens
    VerifyToken -->|Invalid| Error
    VerifyToken -->|First Time| CreateUser["Auto-create account<br/>(role: employee)"]
    VerifyToken -->|Existing| IssueTokens
    CreateUser --> IssueTokens

    IssueTokens["Issue JWT Tokens"] --> AccessToken["Access Token (15 min)<br/>→ Stored in Zustand (memory)"]
    IssueTokens --> RefreshToken["Refresh Token (7 days)<br/>→ httpOnly cookie<br/>→ Argon2id hash stored in DB"]

    AccessToken --> Dashboard
    RefreshToken --> Dashboard

    Dashboard --> APICall{API Request}
    APICall -->|Token Valid| Success[✅ Process Request]
    APICall -->|Token Expired| Refresh["Axios interceptor calls<br/>POST /auth/refresh"]
    Refresh -->|Cookie Valid| NewTokens["Issue new token pair<br/>(Token Rotation)"]
    NewTokens --> RetryAPI["Retry original request"]
    Refresh -->|Cookie Invalid| ForceLogout["🔒 Force logout<br/>Clear all tokens"]

    style Dashboard fill:#059669,stroke:#047857,color:#fff
    style Error fill:#dc2626,stroke:#b91c1c,color:#fff
    style ForceLogout fill:#dc2626,stroke:#b91c1c,color:#fff
    style IssueTokens fill:#2563eb,stroke:#1d4ed8,color:#fff
```

---

## 📝 Form Submission Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Employee saves draft

    Draft --> Submitted: Employee submits
    Draft --> Draft: Employee edits draft
    Draft --> [*]: Employee deletes draft

    Submitted --> Recommended: Supervisor recommends
    Submitted --> Returned: HR returns for correction
    Submitted --> Rejected: HR rejects (with comment)
    Submitted --> Approved: HR approves

    Recommended --> Approved: HR approves
    Recommended --> Rejected: HR rejects
    Recommended --> Returned: HR returns for correction

    Returned --> Submitted: Employee re-submits
    Returned --> Draft: Employee saves as draft

    Approved --> PDFReady: Generate PDF
    PDFReady --> [*]: Download PDF

    state Approved {
        [*] --> Final
        Final: ✅ Approved
    }

    state Rejected {
        [*] --> RejectedFinal
        RejectedFinal: ❌ Rejected (with reason)
    }
```

### Role-Based Permissions Matrix

```mermaid
graph LR
    subgraph Roles["👥 Role Hierarchy"]
        E["🧑‍💼 Employee"]
        S["👔 Supervisor"]
        H["📋 HR"]
        A["🔧 Admin"]
    end

    subgraph Permissions["🔑 Permissions"]
        P1["Submit Forms"]
        P2["View Own History"]
        P3["Download PDFs"]
        P4["Recommend Submissions"]
        P5["Approve / Reject / Return"]
        P6["View All Submissions"]
        P7["View Analytics"]
        P8["Manage User Roles"]
        P9["View All Users"]
    end

    E --> P1
    E --> P2
    E --> P3
    S --> P1
    S --> P2
    S --> P3
    S --> P4
    H --> P5
    H --> P6
    H --> P7
    A --> P5
    A --> P6
    A --> P7
    A --> P8
    A --> P9

    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style S fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style H fill:#f59e0b,stroke:#d97706,color:#fff
    style A fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## 📁 Project Structure

```
nrsc-slms/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                  # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts      # Register, Login, Google OAuth, Refresh, Logout
│   │   │   ├── formController.ts      # Draft, Submit, History, Stats
│   │   │   ├── pdfController.ts       # PDF generation (Puppeteer)
│   │   │   ├── adminController.ts     # Approve/Reject/Return, Analytics, Users
│   │   │   └── profileController.ts   # Get/Update profile
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT verifyToken middleware
│   │   │   ├── errorHandler.ts        # Global Express error handler
│   │   │   ├── rateLimiter.ts         # Global (100/min) + Login (10/15min) limiters
│   │   │   └── roleGuard.ts           # Role-based access control
│   │   ├── models/
│   │   │   ├── User.ts                # User schema (roles, authProvider, refreshToken)
│   │   │   ├── Submission.ts          # Form submission schema
│   │   │   └── AuditLog.ts            # Audit trail schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts          # /api/auth/*
│   │   │   ├── formRoutes.ts          # /api/forms/*
│   │   │   ├── pdfRoutes.ts           # /api/pdf/*
│   │   │   ├── adminRoutes.ts         # /api/admin/*
│   │   │   ├── profileRoutes.ts       # /api/profile/*
│   │   │   └── translitRoutes.ts      # /api/xlit-api-proxy/*
│   │   ├── services/                  # Business logic layer
│   │   ├── templates/                 # HTML form templates (4 forms)
│   │   │   ├── casual_leave_nrsc.html
│   │   │   ├── casual_leave_rrsc.html
│   │   │   ├── earned_leave.html
│   │   │   └── trainee_biodata.html
│   │   ├── fonts/                     # Google Noto Indic TTF fonts
│   │   ├── types/                     # TypeScript type definitions
│   │   ├── utils/
│   │   │   ├── validate.ts            # Zod schemas for all endpoints
│   │   │   └── seed.ts                # Database seeder (default accounts)
│   │   └── server.ts                  # App entry point
│   ├── .env.example                   # Environment variable template
│   ├── copy-assets.js                 # Build script (copies templates & fonts to dist/)
│   ├── nodemon.json                   # Nodemon config (watches src/ only)
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/             # Login page
│   │   │   │   └── register/          # Registration page
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/         # Employee dashboard
│   │   │   │   ├── forms/             # Form pages (4 forms)
│   │   │   │   ├── history/           # Submission history
│   │   │   │   ├── profile/           # User profile
│   │   │   │   └── admin/             # HR/Admin panel
│   │   │   ├── splash/                # Splash/landing page
│   │   │   ├── globals.css            # Global styles + Tailwind
│   │   │   ├── layout.tsx             # Root layout
│   │   │   └── page.tsx               # Entry redirect
│   │   ├── components/
│   │   │   ├── Providers.tsx          # GoogleOAuthProvider + session restore
│   │   │   ├── auth/                  # LoginForm, RegisterForm, GuestGuard
│   │   │   ├── dashboard/             # Stats cards, charts
│   │   │   ├── forms/                 # Form components
│   │   │   ├── admin/                 # Admin review UI
│   │   │   ├── common/                # Shared UI components
│   │   │   ├── history/               # Submission history components
│   │   │   └── layout/                # Sidebar, Header
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/
│   │   │   └── axios.ts               # Axios instance + 401 auto-refresh interceptor
│   │   ├── services/
│   │   │   ├── authService.ts         # Auth API calls
│   │   │   ├── formService.ts         # Form API calls
│   │   │   ├── adminService.ts        # Admin API calls
│   │   │   └── profileService.ts      # Profile API calls
│   │   ├── store/
│   │   │   ├── useAuthStore.ts        # Zustand auth store (token in memory)
│   │   │   ├── useLangStore.ts        # Language/i18n store
│   │   │   ├── useLayoutStore.ts      # Sidebar/layout state
│   │   │   └── useTranslitStore.ts    # Transliteration settings
│   │   └── types/                     # Shared TypeScript interfaces
│   ├── public/                        # Static assets
│   ├── .env.local.example             # Frontend env template
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   └── package.json
│
├── transliteration-server/
│   ├── server.py                      # Flask transliteration API (port 8000)
│   ├── download_dicts.py              # Word probability dictionary downloader
│   ├── fairseq/                       # Facebook AI Research Sequence-to-Sequence (git submodule)
│   ├── venv/                          # Python virtual environment (not tracked)
│   └── README.md                      # Transliteration server setup guide
│
├── .gitignore
└── README.md
```

### Module Dependency Diagram

```mermaid
graph TD
    subgraph Frontend["🖥️ Frontend (Next.js 15)"]
        Pages["App Pages<br/>(auth, dashboard, forms, admin)"]
        Components["Components<br/>(auth, forms, admin, layout)"]
        Services["Services<br/>(auth, form, admin, profile)"]
        Stores["Zustand Stores<br/>(auth, lang, layout, translit)"]
        AxiosLib["Axios Instance<br/>(auto-refresh interceptor)"]
        Hooks["Custom Hooks"]
    end

    subgraph Backend["⚙️ Backend (Express.js)"]
        ServerTS["server.ts<br/>(Entry Point)"]
        RoutesB["Routes<br/>(auth, form, pdf, admin, profile, translit)"]
        ControllersB["Controllers<br/>(auth, form, pdf, admin, profile)"]
        MiddlewareB["Middleware<br/>(auth, roleGuard, rateLimiter, errorHandler)"]
        ModelsB["Models<br/>(User, Submission, AuditLog)"]
        UtilsB["Utils<br/>(validate, seed)"]
        TemplatesB["HTML Templates + Fonts"]
    end

    Pages --> Components
    Pages --> Services
    Pages --> Stores
    Pages --> Hooks
    Components --> Stores
    Services --> AxiosLib
    AxiosLib --> Stores

    ServerTS --> RoutesB
    ServerTS --> MiddlewareB
    RoutesB --> ControllersB
    ControllersB --> ModelsB
    ControllersB --> UtilsB
    ControllersB --> TemplatesB
    MiddlewareB --> ModelsB

    Services -.->|"REST API"| RoutesB

    style Frontend fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#e2e8f0
    style Backend fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#e2e8f0
```

---

## 🚀 Quick Start: Clone & Run

### Prerequisites

Before starting, ensure you have the following installed on your machine:

| Tool | Version | Download Link |
|------|---------|---------------|
| **Node.js** | ≥ 18.x (LTS recommended) | [https://nodejs.org](https://nodejs.org) |
| **npm** | ≥ 9.x (bundled with Node.js) | — |
| **MongoDB Community Server** | ≥ 7.x | [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **Git** | Any recent version | [https://git-scm.com](https://git-scm.com) |
| **Google Chrome** | Any (for Puppeteer PDF generation) | [https://www.google.com/chrome](https://www.google.com/chrome) |

> 💡 **Tip**: You can verify installations with `node -v`, `npm -v`, `mongod --version`, and `git --version`.

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-username>/nrsc-slms.git
cd nrsc-slms
```

---

### Step 2 — Start MongoDB

MongoDB must be running locally before starting the backend.

<details>
<summary><strong>🪟 Windows</strong></summary>

**Option A — MongoDB as a Windows Service (recommended)**
```bash
# If MongoDB was installed as a service during setup:
net start MongoDB
```

**Option B — Run mongod manually**
```bash
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB server
mongod --dbpath "C:\data\db"
```

> Leave this terminal open — MongoDB runs in the foreground.

</details>

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
# Using Homebrew
brew services start mongodb-community

# Or run manually
mongod --dbpath /usr/local/var/mongodb
```

</details>

<details>
<summary><strong>🐧 Linux (Ubuntu/Debian)</strong></summary>

```bash
# Start MongoDB service
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

</details>

> ✅ Verify MongoDB is running: `mongosh` should connect successfully to `mongodb://127.0.0.1:27017`.

---

### Step 3 — Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install
```

#### Configure Environment Variables

```bash
# Copy the example environment file
# Windows (CMD)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `backend/.env` in your editor and fill in the values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nrsc_slms
JWT_ACCESS_SECRET=<generate-a-64-char-hex-string>
JWT_REFRESH_SECRET=<generate-a-different-64-char-hex-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GOOGLE_CLIENT_ID=your-google-client-id-here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

> **Generate JWT secrets** using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Run this command **twice** — one for `JWT_ACCESS_SECRET` and one for `JWT_REFRESH_SECRET`.

#### Start the Backend Server

```bash
npm run dev
```

You should see:
```
✅ NRSC SLMS Server — http://localhost:5000 [development]
```

#### Seed the Database (First Time Only)

Open a **new terminal** and run:

```bash
cd backend
npm run seed
```

This creates 4 default user accounts (see [Default Accounts](#-default-accounts)).

---

### Step 4 — Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install
```

#### Configure Frontend Environment

```bash
# Windows (CMD)
copy .env.local.example .env.local

# macOS / Linux
cp .env.local.example .env.local
```

Open `frontend/.env.local` and verify:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

#### Start the Frontend Dev Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.0
- Local: http://localhost:3000
```

---

### Step 5 — Transliteration Server (Optional but Recommended)

The transliteration server provides **offline, local** transliteration for 21 Indian languages. Without it, the backend will fall back to external APIs.

Open a **new terminal** window:

```bash
cd transliteration-server
```

<details>
<summary><strong>🪟 Windows</strong></summary>

```cmd
python -m venv venv
venv\Scripts\activate
pip install --force pip==24.0
pip install numpy editdistance
cd fairseq && pip install --editable ./ && cd ..
pip install ai4bharat-transliteration flask-cors requests
```

</details>

<details>
<summary><strong>🍎 macOS / 🐧 Linux</strong></summary>

```bash
python3 -m venv venv
source venv/bin/activate
pip install ai4bharat-transliteration flask-cors requests
```

</details>

#### Download dictionaries (first time only)

```bash
python download_dicts.py
```

#### Start the server

```bash
python server.py
```

> **⚠️ First Run:** The first time you run `server.py`, it downloads AI model weights (~2-3 GB). An internet connection is required for the first run only.

You can configure the port via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `XLIT_PORT` | `8000` | Port to run the transliteration server on |
| `XLIT_HOST` | `0.0.0.0` | Host to bind to |

> For details, see [`transliteration-server/README.md`](transliteration-server/README.md).

---

### Step 6 — Open in Browser

Navigate to **http://localhost:3000** and log in with one of the [default accounts](#-default-accounts).

> 📌 **Summary of running services:**
> | Service | URL | Terminal |
> |---------|-----|----------|
> | MongoDB | `mongodb://127.0.0.1:27017` | Terminal 1 |
> | Backend API | `http://localhost:5000` | Terminal 2 |
> | Frontend App | `http://localhost:3000` | Terminal 3 |
> | Transliteration Server | `http://localhost:8000` | Terminal 4 (optional) |

---

### Step 7 — Install Puppeteer Chromium (If PDF Fails)

If PDF generation fails, install Chromium for Puppeteer:

```bash
cd backend
npx puppeteer browsers install chrome
```

---

## 🔐 Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Backend server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | — | 64-char hex string for access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | — | 64-char hex string for refresh tokens |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token expiry duration |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh token expiry duration |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth Client ID (leave empty to disable) |
| `CLIENT_URL` | **Yes** | — | Comma-separated frontend origins for CORS |
| `LOCAL_XLIT_URL` | No | `http://localhost:8000` | URL of the local transliteration server |

### `frontend/.env.local`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | — | Backend API base URL (e.g., `http://localhost:5000/api`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | — | Google OAuth Client ID (leave empty to hide Google login button) |

### Transliteration Server (Environment Variables)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XLIT_PORT` | No | `8000` | Port for the transliteration server |
| `XLIT_HOST` | No | `0.0.0.0` | Host to bind to |

---

## 👤 Default Accounts

After running `npm run seed` in the backend directory:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | `admin@isro.gov.in` | `Password@123` | Full system access, user role management |
| **HR** | `hr@isro.gov.in` | `Password@123` | Review all submissions, approve/reject/return |
| **Supervisor** | `supervisor@isro.gov.in` | `Password@123` | View submissions, recommend approval |
| **Employee** | `employee@isro.gov.in` | `Password@123` | Submit forms, view own history, download PDFs |

> ⚠️ **Change these passwords** before deploying to production.

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `POST` | `/auth/register` | ❌ | `name, email, password` | Register new account |
| `POST` | `/auth/login` | ❌ | `email, password` | Login (rate limited: 10/15min) |
| `POST` | `/auth/google` | ❌ | `credential` | Google OAuth login |
| `POST` | `/auth/refresh` | Cookie | — | Refresh access token |
| `POST` | `/auth/logout` | Cookie | — | Logout & clear session |

### Forms — `/api/forms` _(requires Bearer token)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/forms/stats` | Dashboard stats (total/approved/pending/rejected) |
| `POST` | `/forms/draft` | Save a draft form |
| `POST` | `/forms/submit` | Submit a form for HR review |
| `GET` | `/forms/history` | Paginated submission history |
| `GET` | `/forms/:id` | Get single submission |
| `PUT` | `/forms/:id` | Update a draft |
| `DELETE` | `/forms/:id` | Delete a draft |

### PDF — `/api/pdf` _(requires Bearer token)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pdf/:submissionId` | Download submission as PDF |

### Admin — `/api/admin` _(requires HR or Admin role)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/submissions` | All submissions (filterable, paginated) |
| `PATCH` | `/admin/submissions/:id/approve` | Approve a submission |
| `PATCH` | `/admin/submissions/:id/reject` | Reject with mandatory comment |
| `PATCH` | `/admin/submissions/:id/return` | Return for correction |
| `GET` | `/admin/analytics` | Monthly + status + form-type analytics |
| `GET` | `/admin/users` | All registered users |
| `PATCH` | `/admin/users/:id/role` | Update user role _(Admin only)_ |

### Profile — `/api/profile` _(requires Bearer token)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get current user profile |
| `PATCH` | `/profile` | Update name, employeeCode, department, designation |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

---

## 📄 Available Forms

| # | Form Name | Organisation | Form Type Key |
|---|-----------|-------------|---------------|
| 1 | Casual Leave Application | NRSC | `casual_leave_nrsc` |
| 2 | Earned Leave / Extension of Leave | NRSC | `earned_leave` |
| 3 | Casual / Special CL / Compensatory Off | RRSC-W | `casual_leave_rrsc` |
| 4 | Trainee Bio-Data Form | RRSC-W | `trainee_biodata` |

All forms support **live Indic transliteration** while typing in English phonetics.

---

## 🌐 Supported Languages (Transliteration)

Powered by **AI4Bharat IndicXlit** — 21 Indian languages supported:

| Language | Code | Script | Example Input → Output |
|----------|------|--------|------------------------|
| Assamese | `as` | Bengali | `namaskar` → `নমস্কাৰ` |
| Bengali | `bn` | Bengali | `namaskar` → `নমস্কার` |
| Bodo | `brx` | Devanagari | `namaskar` → `नमस्कार` |
| Gujarati | `gu` | Gujarati | `namaste` → `નમસ્તે` |
| Hindi | `hi` | Devanagari | `namaste` → `नमस्ते` |
| Kannada | `kn` | Kannada | `namaskara` → `ನಮಸ್ಕಾರ` |
| Kashmiri | `ks` | Devanagari | `namaskar` → `नमस्कार` |
| Konkani | `gom` | Devanagari | `namaskar` → `नमस्कार` |
| Maithili | `mai` | Devanagari | `pranam` → `प्रणाम` |
| Malayalam | `ml` | Malayalam | `namasthe` → `നമസ്തേ` |
| Manipuri | `mni` | Bengali | `namaskar` → `নমস্কাৰ` |
| Marathi | `mr` | Devanagari | `namaskar` → `नमस्कार` |
| Nepali | `ne` | Devanagari | `namaste` → `नमस्ते` |
| Odia | `or` | Odia | `namaskar` → `ନମସ୍କାର` |
| Punjabi | `pa` | Gurmukhi | `sat sri akal` → `ਸਤ ਸ੍ਰੀ ਅਕਾਲ` |
| Sanskrit | `sa` | Devanagari | `namaste` → `नमस्ते` |
| Sindhi | `sd` | Arabic | `salam` → `سلام` |
| Sinhala | `si` | Sinhala | `ayubowan` → `ආයුබෝවන්` |
| Tamil | `ta` | Tamil | `vanakkam` → `வணக்கம்` |
| Telugu | `te` | Telugu | `namaskaram` → `నమస్కారం` |
| Urdu | `ur` | Arabic | `adab` → `آداب` |

---

## 🔒 Security Architecture

```mermaid
graph TD
    subgraph Incoming["Incoming Request"]
        Req["HTTP Request"]
    end

    subgraph SecurityLayers["🛡️ Security Middleware Stack"]
        L1["1. Helmet<br/>CSP, HSTS, X-Frame-Options"]
        L2["2. CORS<br/>Allowlist-based origin check"]
        L3["3. Rate Limiter<br/>Global: 100/min<br/>Login: 10/15min per IP"]
        L4["4. Body Parser<br/>50KB limit"]
        L5["5. Mongo Sanitize<br/>Strip $ and . operators"]
        L6["6. Zod Validation<br/>Schema-based input validation"]
        L7["7. JWT Verification<br/>Access token validation"]
        L8["8. Role Guard<br/>RBAC enforcement"]
    end

    subgraph DataSecurity["🗄️ Data Layer Security"]
        DS1["Argon2id Password Hashing<br/>64 MiB memory, 3 iterations, 4 threads"]
        DS2["JWT Token Rotation<br/>New refresh token on every refresh"]
        DS3["httpOnly Cookies<br/>Refresh token not accessible via JS"]
        DS4["Audit Logging<br/>All auth + form events tracked"]
    end

    Req --> L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
    L8 --> DS1
    L8 --> DS2
    L8 --> DS3
    L8 --> DS4

    style SecurityLayers fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#e2e8f0
    style DataSecurity fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#e2e8f0
```

| Layer | Mechanism |
|-------|-----------|
| **Password Hashing** | Argon2id (64 MiB memory, 3 iterations, 4 threads) |
| **Access Token** | JWT — short-lived (15 min), stored in memory only |
| **Refresh Token** | JWT — long-lived (7 days), httpOnly cookie + Argon2id hash in DB |
| **Token Rotation** | New refresh token issued on every `/auth/refresh` call |
| **CORS** | Allowlist-based; all localhost ports in dev, strict origin in prod |
| **Rate Limiting** | Global: 100 req/min · Login: 10 attempts/15 min (per IP) |
| **Input Validation** | Zod schemas on every endpoint — malformed requests rejected with 400 |
| **NoSQL Injection** | `express-mongo-sanitize` strips `$` and `.` from all inputs |
| **Security Headers** | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| **Audit Logging** | All auth events and form actions written to AuditLog collection |

---

## 🛠️ Available Scripts

### Backend (`cd backend`)

```bash
npm run dev          # Start dev server with hot-reload (nodemon + ts-node)
npm run build        # Compile TypeScript + copy HTML templates & fonts to dist/
npm run start        # Run compiled production build
npm run seed         # Populate DB with 4 default user accounts
npm run type-check   # TypeScript type check (no emit)
npm run lint         # ESLint check
```

### Frontend (`cd frontend`)

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build
npm run type-check   # TypeScript type check
npm run lint         # Next.js ESLint check
```

---

## 🐛 Troubleshooting

### ❌ `EADDRINUSE: address already in use :::5000`

Another process is already using port 5000.

```bash
# Windows — find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :5000
kill -9 <PID>
```

### ❌ `MongoDB connection error` / cannot connect

Make sure MongoDB is running:

```bash
# Windows — start MongoDB service
net start MongoDB
# OR run mongod manually
mongod --dbpath "C:\data\db"

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### ❌ `AxiosError: Network Error` on login

1. Confirm backend is running at `http://localhost:5000`
2. Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
3. **Restart the frontend** after changing `.env.local` (Next.js requires a restart for env changes)

### ❌ CORS error in browser console

- Ensure `CLIENT_URL` in `backend/.env` includes the frontend origin (e.g., `http://localhost:3000`)
- The backend automatically allows all `localhost:*` ports when `NODE_ENV=development`

### ❌ `[GSI_LOGGER]: The given Client ID is not found`

This is a Google OAuth warning — **harmless**. To resolve:
- Set a real `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from [Google Cloud Console](https://console.cloud.google.com)
- Or leave the placeholder — the Google login button is automatically hidden when not configured

### ❌ PDF download fails / blank PDF

1. Install Chromium for Puppeteer:
   ```bash
   npx puppeteer browsers install chrome
   ```
2. Ensure HTML templates exist in `backend/src/templates/`
3. Ensure Google Noto font files exist in `backend/src/fonts/`

### ❌ `npm install` fails with node-gyp errors (Argon2)

Argon2 requires native compilation. Install build tools:

```bash
# Windows
npm install -g windows-build-tools

# macOS
xcode-select --install

# Linux (Ubuntu/Debian)
sudo apt-get install build-essential python3
```

---

## 📦 Production Deployment

### Backend (Render / Railway / VPS)

1. Set all environment variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Set `MONGODB_URI` to your MongoDB Atlas connection string
4. Set `CLIENT_URL` to your frontend's production URL
5. Build and start:
   ```bash
   npm run build && npm start
   ```

### Frontend (Vercel)

1. Set `NEXT_PUBLIC_API_URL` to your backend's production URL
2. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if using Google login
3. Push to GitHub and connect to Vercel — it auto-deploys

---

## 📜 License

**Vishnu Kant **



---


