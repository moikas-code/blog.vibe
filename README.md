# Blog Feed

A multi-author blog platform built with Next.js, Supabase, Clerk, and RSS feed support.

## Features

- Multi-author support with authentication via Clerk
- Post creation, editing, and deletion
- Category management
- RSS feed generation
- Responsive design with Tailwind CSS
- Type-safe with TypeScript and Zod validation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod

## Setup Instructions

### Prerequisites

- Bun installed
- Supabase account
- Clerk account

### 1. Clone and Install

```bash
cd blog-app
bun install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor

### 4. Clerk Setup

1. Create a Clerk application
2. Configure the webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Set the webhook events: `user.created`, `user.updated`, `user.deleted`

### 5. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## API Endpoints

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a single post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/rss` - RSS feed

## RSS Feed

The RSS feed is available at `/api/rss` and includes all published posts.

## Project Structure

```
blog-app/
├── app/
│   ├── api/          # API routes
│   ├── dashboard/    # Author dashboard
│   ├── posts/        # Post pages
│   └── ...
├── components/       # React components
├── lib/             # Utilities and configurations
│   ├── schemas/     # Zod schemas
│   ├── supabase/    # Supabase clients
│   └── types/       # TypeScript types
└── supabase/        # Database schema
```