# Weekly Agenda Application

## Overview

This is a full-stack weekly agenda application built with React (frontend) and Express.js (backend). The application allows users to create, manage, and view tasks in a weekly calendar format with features like email reminders, task categorization, and data export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Structure**: Uses shadcn/ui components for consistent UI design
- **State Management**: TanStack Query handles server state, with React hooks for local state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Calendar View**: Custom weekly calendar grid component

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Storage Interface**: Abstract storage interface with in-memory implementation for development
- **Background Services**: Cron-based reminder scheduler
- **Email Service**: SendGrid integration for email notifications

### Database Schema
- **Users Table**: Basic user management (prepared for future use)
- **Tasks Table**: Core task entity with fields for scheduling, categorization, and reminders
- **Categories**: Predefined task categories (work, personal, health, urgent)

### Key Features
- **Task Management**: CRUD operations for tasks with validation
- **Weekly Calendar View**: Visual weekly layout with time slots
- **Email Reminders**: Automated email notifications based on task scheduling
- **Data Export**: ICS (calendar) and CSV export functionality
- **Category Filtering**: Filter tasks by category with visual indicators

## Data Flow

1. **Task Creation**: User fills form → Validation → API call → Database storage → UI update
2. **Calendar Display**: Date range query → Database fetch → Task rendering in calendar grid
3. **Reminder System**: Cron job → Check pending reminders → Send emails → Mark as sent
4. **Data Export**: Query tasks → Format data → Generate file → Download

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Email**: SendGrid for email delivery
- **Utilities**: date-fns for date manipulation, zod for validation

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across the stack
- **Development**: tsx for development server, various type definitions

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds the React application to `dist/public`
- **Backend**: esbuild bundles the Express server to `dist/index.js`
- **Database**: Drizzle migrations stored in `migrations/` directory

### Environment Configuration
- **Development**: Uses `NODE_ENV=development` with Vite dev server
- **Production**: Node.js serves bundled Express app with static frontend
- **Database**: Requires `DATABASE_URL` environment variable
- **Email**: Optional `SENDGRID_API_KEY` for email functionality

### Key Scripts
- `dev`: Runs development server with hot reload
- `build`: Creates production builds for both frontend and backend
- `start`: Runs production server
- `db:push`: Applies database schema changes

### Architecture Decisions

**Monorepo Structure**: Chosen to keep related frontend and backend code together, sharing types and schemas through the `shared/` directory.

**Drizzle ORM**: Selected for type-safe database operations and excellent TypeScript integration, with PostgreSQL as the target database.

**TanStack Query**: Provides robust server state management with caching, background updates, and error handling.

**shadcn/ui**: Offers high-quality, customizable components built on Radix UI primitives with Tailwind CSS styling.

**Express.js**: Simple, well-established framework for the REST API with middleware support for logging and error handling.

**In-Memory Storage**: Implements storage interface pattern, allowing easy switching between development (in-memory) and production (database) storage.