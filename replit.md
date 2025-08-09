# JIRA Worklog Dashboard

## Overview

This is a full-stack web application that provides automated JIRA worklog tracking and dashboard visualization. The application fetches worklog data from JIRA on a scheduled basis, processes it, and displays comprehensive analytics through an intuitive dashboard interface. It's built with a React frontend, Express.js backend, and uses in-memory storage for development with PostgreSQL/Drizzle ORM ready for production.

## Recent Changes

**August 9, 2025** - Completed secure deployment-ready JIRA worklog bot:
- ✅ Moved all JIRA credentials to secure environment variables (JIRA_URL, JIRA_API_TOKEN, JIRA_USER_EMAIL)
- ✅ Eliminated frontend exposure of sensitive API credentials
- ✅ Simplified settings interface to focus only on assignee management
- ✅ Created deployment documentation and .env.example template
- ✅ Successfully tested end-to-end: environment variables → JIRA API → worklog data → dashboard display
- ✅ System fetching real worklog data: 5 hours logged for Atharva Kulkarni on SUREOP128-8394 task
- ✅ Ready for secure deployment on Netlify, Vercel, Railway, or any cloud platform

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design tokens and Inter font family
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with status code management
- **Development**: Hot reloading with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Three main entities - JIRA settings, assignees, and worklog entries
- **Migrations**: Drizzle Kit for database schema management
- **Storage Layer**: Abstracted storage interface with in-memory fallback for development

### Authentication & Security
- **JIRA Integration**: HTTP Basic Authentication using API tokens
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Environment Variables**: Secure configuration management for sensitive data

### Scheduled Operations
- **Cron Service**: Node-cron for automated daily worklog fetching
- **Job Scheduling**: Configurable timing with timezone support
- **Data Processing**: Automated fetching, processing, and storage of JIRA worklog data

### Development & Build
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development**: Concurrent development servers with hot reloading
- **TypeScript**: Strict type checking across the entire codebase
- **Path Mapping**: Organized imports with @ aliases for cleaner code structure

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **express**: Web application framework for Node.js
- **react**: Frontend UI framework
- **typescript**: Type safety across the application

### UI & Styling
- **@radix-ui/***: Headless UI primitives for accessible components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Database & ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe SQL query builder
- **drizzle-kit**: Database schema management and migrations

### External Service Integration
- **axios**: HTTP client for JIRA API integration
- **node-cron**: Scheduled task execution
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **esbuild**: JavaScript bundler for production builds
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### Form & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation library
- **drizzle-zod**: Zod integration for Drizzle schemas

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **cmdk**: Command palette component