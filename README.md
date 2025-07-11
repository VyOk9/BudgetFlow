# 📊 BudgetFlow

**BudgetFlow** is a full-stack personal expense tracking application built with **Next.js** (frontend) and **NestJS** (backend), using **PostgreSQL** via **Prisma ORM**, and a **Redis** cache for performance. The architecture is containerized with **Docker Compose**.

## 📦 Tech Stack

- **Frontend**: Next.js last version, TypeScript, Tailwind CSS
- **Backend**: NestJS last version, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis
- **Auth**: JWT-based authentication
- **Containerization**: Docker Compose

---

## 🏗️ Project Structure

### Backend (NestJS)

```

src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── categories/
│   ├── categories.controller.ts
│   ├── categories.module.ts
│   └── categories.service.ts
├── expense/
│   ├── expense.controller.ts
│   ├── expense.module.ts
│   └── expense.service.ts
└── summary/
    ├── summary.controller.ts
    ├── summary.module.ts
    └── summary.service.ts

```

### Frontend (Next.js)

```

src/
├── app/
│   ├── dashboard/
│   ├── expenses/
│   ├── categories/
│   ├── summary/
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── expenses/
│   ├── categories/
│   ├── common/
│   └── summary/
├── contexts/
├── hooks/
├── lib/
├── services/
├── constants/
└── types/

````

---

## 🗄️ Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         Int        @id @default(autoincrement())
  email      String     @unique
  password   String
  categories Category[]
  expenses   Expense[]
  createdAt  DateTime   @default(now())
}

model Category {
  id         Int        @id @default(autoincrement())
  name       String
  userId     Int
  user       User       @relation(fields: [userId], references: [id])
  isDefault  Boolean    @default(false)
  expenses   Expense[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@unique([userId, name])
}

model Expense {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  amount      Float
  date        DateTime
  categoryId  Int
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  category    Category  @relation(fields: [categoryId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
````

---

## 🐳 Docker Setup

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: budgetflow
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    restart: always
    ports:
      - "6379:6379"
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379

volumes:
  pgdata:
```

### How to run

```bash
docker-compose up -d
```

Set up your `.env` in the backend folder:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/budgetflow?schema=public"
```

Then run:

```bash
# Install Prisma CLI if not already
npm install prisma --save-dev
npm install @prisma/client

# Generate client
npx prisma generate

# Apply DB schema
npx prisma migrate dev

# Optional: open DB interface
npx prisma studio
```

---

## 🔐 Authentication

* Auth is JWT-based
* Auth endpoints: `/auth/signup` and `/auth/login`
* Token is stored in `localStorage`
* Protected routes are guarded via middleware (`JwtAuthGuard` in backend)

---

## 📈 Features

* ✅ Sign up & Login
* ✅ Create / Delete expenses
* ✅ Create / Update / Delete categories
* ✅ Summary and statistics with charts
* ✅ Expense export to CSV & PDF (html)
* ✅ Caching with Redis for performance
* ✅ Responsive and accessible UI

---

## 🚀 Run Project

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License

MIT © \[Lylian Hay]
