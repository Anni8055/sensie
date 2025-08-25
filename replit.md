# Overview

This is a Lissajous curve generator web application built with React and TypeScript. The application creates interactive mathematical visualizations of Lissajous figures - complex harmonic motion patterns formed by combining two perpendicular sinusoidal oscillations. Users can adjust frequency ratios, phase relationships, and visual parameters to explore different curve patterns in real-time through an HTML5 canvas interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **UI Library**: Radix UI components with shadcn/ui styling system for consistent, accessible interface elements
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: React hooks (useState, useRef, useCallback) for local component state and animation control
- **Data Fetching**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for consistency across frontend and backend
- **Development**: tsx for TypeScript execution in development mode
- **Production**: esbuild for bundling server code into optimized JavaScript

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Schema**: Centralized schema definitions in shared directory for type consistency
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Canvas Rendering System
- **Visualization**: HTML5 Canvas API for high-performance real-time mathematical curve rendering
- **Animation**: RequestAnimationFrame for smooth 60fps animations
- **Mathematical Engine**: Custom algorithms for generating Lissajous curve coordinates using sine wave calculations
- **Performance**: Circular buffer system for efficient trail rendering and memory management

## Project Structure
- **Monorepo Layout**: Client and server code in separate directories with shared types
- **Shared Directory**: Common TypeScript interfaces and database schemas
- **Component Organization**: UI components separated by feature with reusable component library
- **Path Aliases**: TypeScript path mapping for clean imports (@/ for client, @shared for shared code)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with automatic migration generation

## UI Component Libraries
- **Radix UI**: Headless, accessible React component primitives
- **shadcn/ui**: Pre-styled component system built on top of Radix UI
- **Lucide React**: SVG icon library with consistent styling

## Development Tools
- **Replit Integration**: Runtime error overlay and cartographer plugin for enhanced development experience
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins
- **ESBuild**: Fast bundling for production server builds

## Styling and Design
- **Tailwind CSS**: Utility-first CSS framework with custom design system variables
- **Class Variance Authority**: Type-safe utility for creating component variants
- **clsx & tailwind-merge**: Conditional class name utilities for dynamic styling

## Mathematical Visualization
- **Date-fns**: Date manipulation utilities for timestamp calculations
- **Custom Canvas Implementation**: Direct Canvas API usage for optimal performance in mathematical rendering