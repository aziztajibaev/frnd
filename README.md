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

The backend implements JWT-based authentication with bcrypt password hashing and role-based access control.

### Authentication Features

- User registration and login endpoints
- JWT token generation and verification
- Bcrypt password hashing (10 salt rounds)
- Role-based access control (USER, MODERATOR, ADMIN)
- HTTP-only cookies and Bearer token support
- CORS configured for Angular frontend
- Protected routes middleware

### API Endpoints

**Public:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear authentication cookie

**Protected:**
- `GET /api/auth/me` - Get current user (requires authentication)
- `GET /api/users/profile` - Get user profile (requires authentication)
- `GET /api/users` - List all users (requires ADMIN role)
- `GET /api/users/moderator-only` - Moderator endpoint (requires MODERATOR or ADMIN role)

### Environment Configuration

Required environment variables:

```env
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

**Security Note:** Generate a cryptographically secure JWT_SECRET for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Complete Documentation

See [AUTH.md](backend/AUTH.md) for:
- Complete API documentation
- Angular integration guide
- Security implementation details
- Troubleshooting guide

---

**Technology Stack:** Node.js · TypeScript · Express 5 · Prisma · PostgreSQL · bcrypt · jsonwebtoken
