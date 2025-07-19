# REST Express - Expiry Management Application

## Overview

This is a full-stack web application for managing product expiry dates, built with Express.js backend and React frontend. The application helps users track household products, receive expiry notifications, and manage product categories with Arabic language support. It features a modern mobile-first UI using shadcn/ui components and TailwindCSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Arabic language support with RTL considerations

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints for CRUD operations
- **Session Management**: PostgreSQL session storage with connect-pg-simple
- **Development**: TSX for TypeScript execution during development

### Database Schema
- **Users**: User profiles with Firebase authentication integration
- **Categories**: Product categories with Arabic/English names and custom icons
- **Products**: Products with expiry tracking, categories, and status management
- **Notifications**: Expiry alerts and system notifications

## Key Components

### Data Models
- User management with Firebase UID integration
- Category system with default categories and custom user categories
- Product tracking with expiry status calculation (fresh/expiring/expired)
- Notification system for expiry alerts
- Dashboard analytics for user insights

### Authentication
- Firebase authentication integration (configured but using mock data)
- User profile management with display names and photos
- Session-based authentication for API access

### Product Management
- Barcode scanning capability (UI prepared)
- Camera integration for product photos
- Expiry date tracking with configurable alert periods
- Quantity management and usage tracking
- Search and filtering functionality

### User Interface
- Mobile-first responsive design
- Bottom navigation for main app sections
- Dark/light theme support
- Arabic font integration (Tajawal, Cairo)
- Loading states and error handling
- Toast notifications for user feedback

## Data Flow

1. **User Authentication**: Users can sign in through Firebase (mock implementation)
2. **Product Creation**: Users add products with categories, expiry dates, and metadata
3. **Status Calculation**: Server calculates product status based on expiry dates
4. **Notifications**: System generates alerts for expiring products
5. **Analytics**: Dashboard aggregates user statistics and trends
6. **Data Persistence**: All data stored in PostgreSQL via Drizzle ORM

## External Dependencies

### Core Dependencies
- **Database**: Neon Database for serverless PostgreSQL
- **Authentication**: Firebase Authentication
- **UI Components**: Radix UI primitives for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: TanStack Query for API state management
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with TailwindCSS and Autoprefixer
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- TSX for backend development with hot reload
- Environment variables for database and Firebase configuration
- Replit-specific development features (cartographer, error overlay)

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving from Express in production
- Database migrations via Drizzle Kit

### Database Management
- Drizzle migrations stored in `./migrations`
- Schema defined in `shared/schema.ts` for type sharing
- PostgreSQL connection via environment variable `DATABASE_URL`
- Session storage using PostgreSQL with connect-pg-simple

### Configuration
- Environment-based configuration for database and Firebase
- TailwindCSS custom theme with CSS variables
- TypeScript path mapping for clean imports
- ESM modules throughout the application

The application is designed as a Progressive Web App with offline-first considerations and mobile-optimized user experience for managing household product expiry dates.