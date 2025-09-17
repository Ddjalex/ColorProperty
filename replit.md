# Overview

This is a modern real estate website and admin dashboard for Temer Properties, built to showcase properties in Ethiopia. The application provides a comprehensive property listing platform with advanced filtering, property management, team showcases, blog functionality, and lead management capabilities. It features a public-facing website for property browsing and an admin dashboard for content management.

# Recent Changes

## September 17, 2025 - Fresh GitHub Import and Setup
- Successfully imported fresh GitHub project clone to Replit environment
- Installed Node.js 20 and all project dependencies (frontend and backend)
- Configured secure environment variables: JWT_SECRET, ADMIN_INIT_SECRET, MONGODB_URI
- Set up proper workflows: Frontend (port 5000 with webview), Backend (port 3001)
- Fixed Vite proxy configuration to properly connect frontend to backend API
- Configured autoscale deployment targeting production on port 5000
- Verified MongoDB Atlas connection and database functionality
- All services running successfully with proper API communication
- Website fully operational with real estate property listings and admin dashboard

## September 17, 2025 - Admin Panel Enhancements and Analytics
- **Fixed property data saving issues**: Resolved JSON parsing errors and field mapping mismatches between frontend (price, size) and backend (priceETB, sizeSqm)
- **Removed auto-save functionality**: Admin settings now only save data on explicit form submission for better user control
- **Added admin account management**: Secure email and password change functionality with proper authentication and validation
- **Enhanced dashboard with comprehensive analytics**: Real-time data updates, property status breakdowns, type/location distributions, price range analytics, and recent activity feeds
- **Implemented security improvements**: Protected analytics endpoints with authentication and ensured comprehensive data analysis
- **Added performance optimizations**: Image caching with ETags, limited data queries, and optimized API endpoints for better dashboard responsiveness

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with custom CSS variables for theming
- **UI Components**: Radix UI components via shadcn/ui for consistent, accessible interface elements
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Database**: MongoDB Atlas for data persistence
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API structure with organized route handlers
- **Schema Validation**: Zod schemas shared between frontend and backend for type safety

## Data Models
- **Properties**: Title, description, location, type, pricing, images, amenities, coordinates
- **Projects**: Property development projects with construction updates
- **Blog Posts**: Content management with tags, categories, and publishing workflow
- **Team Members**: Staff profiles with contact information and role hierarchy
- **Users**: Admin authentication with role-based permissions
- **Leads**: Contact form submissions and inquiry management
- **Settings**: Application configuration and customization options

## Authentication & Authorization
- **JWT Tokens**: Stateless authentication with httpOnly cookies for security
- **Role-based Access**: Admin, editor, and agent roles with different permission levels
- **Protected Routes**: Admin dashboard requires authentication
- **Password Security**: Bcrypt hashing for secure password storage

## Media Management
- **Image Handling**: Cloudinary integration for image uploads and optimization
- **File Storage**: Secure URL storage in MongoDB with Cloudinary transformations
- **Image Optimization**: Automatic resizing and format optimization for web delivery

## Localization & Regional Settings
- **Timezone**: Africa/Addis_Ababa for Ethiopian time zone
- **Currency**: Ethiopian Birr (ETB) formatting throughout the application
- **Measurements**: Square meters (m²) for property sizes
- **Language**: English interface with Ethiopian market focus

## Development Tools
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Build System**: Vite for fast development and optimized production builds
- **Development Server**: Hot module replacement and error overlay for development

# External Dependencies

## Database Services
- **MongoDB Atlas**: Primary database for all application data storage
- **Connection Management**: MongoDB Node.js driver for database operations

## Cloud Services
- **Cloudinary**: Image upload, storage, and transformation service
- **Media CDN**: Optimized image delivery with automatic format selection

## Communication Services
- **WhatsApp Integration**: Direct messaging links for property inquiries
- **Phone Integration**: Click-to-call functionality for immediate contact

## UI/UX Libraries
- **Radix UI**: Accessible component primitives for consistent user interface
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Hook Form**: Form state management and validation
- **TanStack Query**: Server state synchronization and caching

## Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and enhanced developer experience
- **Zod**: Runtime type validation and schema definitions
- **Wouter**: Lightweight routing solution for single-page application
- **date-fns**: Date manipulation and formatting utilities

## Authentication & Security
- **bcrypt**: Password hashing for secure authentication
- **jsonwebtoken**: JWT token generation and verification
- **CORS**: Cross-origin resource sharing configuration

## Map Integration
- **Leaflet/Mapbox**: Interactive maps for property location display
- **Coordinate Storage**: Latitude and longitude data for precise property positioning