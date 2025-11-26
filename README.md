# 🖖 FRND

**Simple Framework for Everything**

FRND - bu zamonaviy veb-ilovalar uchun mo'ljallangan TypeScript asosidagi backend framework. Express.js va Prisma ORM yordamida qurilgan, tez va xavfsiz API yaratish imkonini beradi.

## 📋 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [O'rnatish](#-ornatish)
- [Foydalanish](#-foydalanish)
- [API Endpoints](#-api-endpoints)
- [Ma'lumotlar Bazasi](#-malumotlar-bazasi)
- [Loyiha Strukturasi](#-loyiha-strukturasi)
- [Development](#-development)
- [Production](#-production)
- [Hissa qo'shish](#-hissa-qoshish)
- [Litsenziya](#-litsenziya)

## ✨ Xususiyatlar

- ⚡ **Tez ishga tushirish** - Nodemon bilan hot-reload
- 🔒 **TypeScript** - Type-safe kod yozish
- 🗄️ **Prisma ORM** - Zamonaviy database boshqaruvi
- 🎯 **Express 5** - Eng yangi Express versiyasi
- 🔐 **User Authentication** - Tayyor user model va role-based access
- 📦 **PostgreSQL** - Ishonchli relational database
- 🏥 **Health Check** - Database connection monitoring
- 🛠️ **Strict TypeScript** - Qattiq type checking

## 🛠 Texnologiyalar

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **ORM**: Prisma 6.19.0
- **Database**: PostgreSQL
- **Dev Tools**: Nodemon, ts-node

## 📦 O'rnatish

### Talablar

- Node.js (v18 yoki yuqori)
- PostgreSQL (v14 yoki yuqori)
- npm yoki yarn

### Qadamlar

1. **Repository'ni klonlash**
```bash
git clone <repository-url>
cd frnd
```

2. **Backend papkasiga o'tish**
```bash
cd backend
```

3. **Dependencies o'rnatish**
```bash
npm install
```

4. **Environment variables sozlash**
```bash
cp .env.example .env
```

`.env` faylini tahrirlang:
```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/frnd?schema=public"
```

5. **Database migration**
```bash
npx prisma migrate dev
```

6. **Prisma Client generatsiya qilish**
```bash
npx prisma generate
```

## 🚀 Foydalanish

### Development Mode

Development rejimda ishga tushirish (hot-reload bilan):

```bash
npm run dev
```

Server `http://localhost:3000` da ishga tushadi.

### Production Mode

Production uchun build qilish va ishga tushirish:

```bash
# TypeScript kodlarni JavaScript'ga compile qilish
npm run build

# Production server'ni ishga tushirish
npm start
```

### Boshqa Buyruqlar

```bash
# Build papkasini tozalash
npm run clean

# Prisma Studio (database GUI)
npx prisma studio
```

## 🌐 API Endpoints

### Health Check

Server va database holatini tekshirish:

```http
GET /api/health
```

**Response (Success):**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-11-26T15:17:00.000Z"
}
```

**Response (Error):**
```json
{
  "status": "ERROR",
  "database": "Disconnected",
  "timestamp": "2025-11-26T15:17:00.000Z"
}
```

## 🗄️ Ma'lumotlar Bazasi

### Prisma Schema

Loyihada `User` modeli mavjud:

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

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Prisma Buyruqlari

```bash
# Migration yaratish
npx prisma migrate dev --name migration_nomi

# Database reset qilish
npx prisma migrate reset

# Prisma Studio ochish
npx prisma studio

# Schema'ni format qilish
npx prisma format
```

## 📁 Loyiha Strukturasi

```
frnd/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Main application entry
│   │   └── lib/
│   │       └── prisma.ts      # Prisma client configuration
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── dist/                  # Compiled JavaScript (git ignored)
│   ├── .env.example           # Environment variables template
│   ├── .gitignore
│   ├── nodemon.json           # Nodemon configuration
│   ├── package.json
│   └── tsconfig.json          # TypeScript configuration
├── .vscode/                   # VS Code settings
└── README.md
```

## 💻 Development

### TypeScript Configuration

Loyihada qattiq TypeScript sozlamalari qo'llanilgan:

- Strict mode yoqilgan
- No implicit any
- Strict null checks
- Unused locals va parameters tekshiruvi
- Source maps generatsiya

### Nodemon Configuration

Development rejimda avtomatik restart:

- `src/` papkasidagi o'zgarishlarni kuzatadi
- `.ts` va `.json` fayllar uchun ishlaydi
- Test fayllarni ignore qiladi

### Best Practices

1. **Environment Variables**: Hech qachon `.env` faylni commit qilmang
2. **Type Safety**: TypeScript turlaridan to'liq foydalaning
3. **Error Handling**: Barcha async funksiyalarda try-catch bloklaridan foydalaning
4. **Database**: Prisma migration'larni muntazam yarating
5. **Git**: Meaningful commit message'lar yozing

## 🏭 Production

### Production'ga o'tkazish

1. **Environment Variables**: Production database URL'ini sozlang
2. **Build**: `npm run build` buyrug'ini ishga tushiring
3. **Database Migration**: Production database'da migration'larni bajaring
4. **Start**: `npm start` bilan server'ni ishga tushiring

### Production Checklist

- [ ] Environment variables to'g'ri sozlangan
- [ ] Database migration'lari bajarilgan
- [ ] CORS sozlamalari qo'shilgan (kerak bo'lsa)
- [ ] Rate limiting qo'shilgan (kerak bo'lsa)
- [ ] Logging tizimi sozlangan
- [ ] Error handling to'liq implement qilingan
- [ ] Security headers qo'shilgan (helmet.js)
- [ ] Database connection pool sozlangan

## 🤝 Hissa qo'shish

Hissa qo'shish uchun:

1. Repository'ni fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing-feature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add amazing feature'`)
4. Branch'ni push qiling (`git push origin feature/amazing-feature`)
5. Pull Request oching

## 📄 Litsenziya

ISC

---

## 📝 Keyingi Qadamlar (Recommended)

Loyihani yanada yaxshilash uchun tavsiyalar:

### 1. Authentication & Authorization
```bash
# JWT va bcrypt o'rnatish
npm install jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

### 2. Validation
```bash
# Zod yoki Joi validation library
npm install zod
```

### 3. Security
```bash
# Helmet va CORS
npm install helmet cors
npm install --save-dev @types/cors
```

### 4. Logging
```bash
# Winston yoki Pino
npm install winston
```

### 5. Testing
```bash
# Jest va Supertest
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### 6. API Documentation
```bash
# Swagger/OpenAPI
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

### 7. Environment Configuration
```bash
# Dotenv-safe yoki env validation
npm install dotenv-safe
```

### 8. Rate Limiting & Security
```bash
npm install express-rate-limit express-validator
```

---

**Muallif**: Aziz Tajibaev
**Sana**: 2025
**Versiya**: 1.0.0

Savollaringiz bo'lsa, issue oching yoki pull request yuboring! 🚀
