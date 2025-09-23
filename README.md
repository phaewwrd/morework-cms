# Morework Dev - Full Stack Next.js Application

A comprehensive full-stack Next.js application built with TypeScript, featuring authentication, database integration, and modern UI components.

## 🚀 Features

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** with shadcn/ui components
- **Prisma ORM** with SQLite database (easily switchable to PostgreSQL)
- **Authentication** using bcryptjs for password hashing
- **API Routes** with Zod validation for type-safe requests
- **ESLint** configured with TypeScript rules
- **Responsive Design** with modern UI components

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **UI Components**: shadcn/ui, Radix UI primitives
- **Validation**: Zod schemas for type-safe API validation
- **Authentication**: bcryptjs for password hashing
- **Styling**: Tailwind CSS with custom design system

## 📦 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── users/         # User management
│   │   │   ├── posts/         # Post CRUD operations
│   │   │   └── health/        # Health check endpoint
│   │   ├── auth/              # Authentication pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions
│       ├── auth.ts           # Authentication helpers
│       ├── prisma.ts         # Database client
│       ├── utils.ts          # General utilities
│       └── validations.ts    # Zod schemas
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Prisma schema
│   └── seed.ts              # Database seeding script
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── .eslintrc.json          # ESLint configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd morework-dev
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database URL and other settings.

4. **Initialize the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `PUT /api/users?id={userId}` - Update user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts?id={postId}` - Update post
- `DELETE /api/posts?id={postId}` - Delete post

### System
- `GET /api/health` - Health check

## 🎯 Key Features Examples

### 1. Type-Safe API Routes with Zod
```typescript
import { userRegisterSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validatedData = userRegisterSchema.parse(body)
  // ... handle validated data
}
```

### 2. Prisma Database Queries
```typescript
const users = await prisma.user.findMany({
  include: {
    posts: {
      select: { id: true, title: true }
    }
  }
})
```

### 3. Responsive UI Components
```typescript
<Card className="max-w-2xl mx-auto">
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline">Get Started</Button>
  </CardContent>
</Card>
```

## 🔒 Security Features

- Password hashing with bcryptjs (12 rounds)
- Input validation with Zod schemas
- Type-safe API responses
- SQL injection protection via Prisma ORM

## 🎨 UI/UX Features

- Dark/light mode support
- Responsive design for all screen sizes
- Accessible components with Radix UI primitives
- Toast notifications for user feedback
- Form validation with error handling

## 🗄️ Database Schema

### Users Table
- `id` - Unique identifier (CUID)
- `email` - Email address (unique)
- `name` - User's display name
- `password` - Hashed password
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Posts Table
- `id` - Unique identifier (CUID)
- `title` - Post title
- `content` - Post content (optional)
- `published` - Publication status
- `authorId` - Foreign key to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
