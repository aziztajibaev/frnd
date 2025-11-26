# 🖖 FRND

**Simple Framework for Everything**

TypeScript + Express + Prisma asosidagi backend framework.

## 🚀 Tezkor Boshlash

```bash
# 1. Dependency'larni o'rnatish
cd backend
npm install

# 2. Environment sozlash
cp .env.example .env
# .env faylda DATABASE_URL ni to'ldiring

# 3. Database sozlash
npm run db:generate  # Prisma client
npm run db:migrate   # Migration

# 4. Ishga tushirish
npm run dev          # Development
npm run build && npm start  # Production
```

Server: `http://localhost:3000`
API: `GET /api/health`

## 📁 Struktura

```
backend/
├── src/
│   ├── config/          # Environment config
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Error handling, etc.
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   ├── lib/             # Prisma, etc.
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # DB schema
└── dist/                # Build output
```

## 🛠 Scripts

```bash
npm run dev          # Development (hot-reload)
npm run build        # Build TypeScript
npm start            # Production

# Database
npm run db:generate  # Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # DB GUI
```

## 🗄️ Database

**User Model:**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role { USER, ADMIN, MODERATOR }
```

## 🏗️ Strukturaviy To'g'irlashlar

**✅ Tuzatilgan:**
- MVC pattern (routes → controllers → services)
- Middleware separation (error handling)
- Config management (env.ts)
- Type definitions papkasi
- Prisma scripts qo'shildi
- To'g'ri folder structure (6 ta yangi papka)

## 🔐 Authentication

JWT-based authentication with bcrypt password hashing, ready for Angular integration.

**Features:**
- ✅ User registration & login
- ✅ JWT token generation & verification
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (USER, MODERATOR, ADMIN)
- ✅ HTTP-only cookies + Bearer tokens
- ✅ CORS configured for Angular frontend
- ✅ Protected routes middleware

**See [AUTH.md](backend/AUTH.md)** for complete documentation and Angular integration guide.

**📋 Keyingi Qadamlar:**
- [x] JWT authentication + bcrypt
- [x] CORS
- [ ] Validation (zod)
- [ ] Logging (winston)
- [ ] Testing (jest)
- [ ] API docs (swagger)
- [ ] Helmet, rate-limiting

---

**Tech:** Node.js · TypeScript · Express 5 · Prisma · PostgreSQL
