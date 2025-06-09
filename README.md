# Feed - Modern Blog Platform

A full-stack blog platform built with Next.js, Supabase, and Clerk authentication featuring a rich text editor and category management.

## Features

- **Multi-author Support**: Secure authentication and user management with Clerk
- **Rich Text Editor**: TipTap editor with comprehensive formatting options
  - Bold, italic, underline, strikethrough
  - Headings (H1, H2, H3)
  - Lists (bullet and numbered)
  - Code blocks with syntax highlighting
  - Tables, links, and images
  - Character count
- **Category Management**: Organize posts with categories
- **Author Dashboard**: Personal dashboard for content management
- **RSS Feed**: Auto-generated RSS feed for subscribers
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript support with Zod validation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Editor**: TipTap with extensions
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod
- **Language**: TypeScript

## Setup Instructions

### Prerequisites

- Bun installed
- Supabase account
- Clerk account

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/feed.git
cd feed
bun install
```

### 2. Environment Variables

Create a `.env.local` file and add your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies (already included in schema)

### 4. Clerk Setup

1. Create a Clerk application
2. Configure the webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Set the webhook events: `user.created`, `user.updated`, `user.deleted`
4. Add your webhook secret to environment variables

### 5. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage Guide

### Creating Posts

1. Sign in to your account
2. Navigate to the dashboard (`/dashboard`)
3. Click "New Post"
4. Use the rich text editor to write your content
5. Select a category (or create one first)
6. Choose to publish immediately or save as draft

### Managing Categories

1. From the dashboard, click "Manage Categories"
2. Create new categories with name and slug
3. Edit or delete existing categories
4. Categories are immediately available for posts

### Editor Features

The TipTap editor supports:
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H1, H2, H3)
- Lists (bullet and numbered)
- Code blocks with syntax highlighting (JavaScript, TypeScript, Python, etc.)
- Tables with customizable rows and columns
- Links and images
- Character count tracking

## API Endpoints

### Posts
- `GET /api/posts` - List all published posts
- `POST /api/posts` - Create a new post (requires auth)
- `GET /api/posts/:id` - Get a single post
- `PUT /api/posts/:id` - Update a post (author only)
- `DELETE /api/posts/:id` - Delete a post (author only)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a category (requires auth)
- `PUT /api/categories/:id` - Update a category (requires auth)
- `DELETE /api/categories/:id` - Delete a category (requires auth)

### RSS Feed
- `GET /api/rss` - RSS feed of all published posts

## Database Schema

The application uses the following main tables:
- `authors` - User profiles linked to Clerk
- `categories` - Post categories
- `posts` - Blog posts with rich content
- `tags` - Post tags (optional)
- `post_tags` - Many-to-many relationship

## Project Structure

```
feed/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── posts/         # Post CRUD endpoints
│   │   ├── categories/    # Category CRUD endpoints
│   │   ├── rss/           # RSS feed
│   │   └── webhooks/      # Clerk webhooks
│   ├── dashboard/         # Author dashboard
│   │   ├── posts/         # Post management
│   │   └── categories/    # Category management
│   ├── posts/             # Public post pages
│   └── categories/        # Categories listing
├── components/            # React components
│   ├── editor/           # TipTap editor components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── schemas/          # Zod validation schemas
│   ├── supabase/         # Supabase clients
│   └── types/            # TypeScript types
└── supabase/             # Database configuration
    └── schema.sql        # Database schema
```

## Development Commands

```bash
# Development
bun dev              # Start development server
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint

# Database
bun supabase:start   # Start local Supabase
bun supabase:stop    # Stop local Supabase
bun supabase:status  # Check Supabase status
bun supabase:db:reset # Reset database
bun supabase:gen-types # Generate TypeScript types
```

## Deployment

1. Push your code to GitHub
2. Deploy to Vercel:
   ```bash
   vercel
   ```
3. Add environment variables in Vercel dashboard
4. Configure Clerk webhook URL in production
5. Update Supabase URL and keys for production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.