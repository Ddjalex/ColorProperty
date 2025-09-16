# Temer Properties - Property Management Website

A modern property management website built with separate frontend and backend architecture, converted from TypeScript to pure JavaScript with CommonJS modules.

## Project Structure

```
.
├── frontend/           # React + Vite frontend application (JavaScript)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   │   ├── admin/     # Admin dashboard pages
│   │   │   ├── blog.jsx
│   │   │   ├── blog-post.jsx
│   │   │   ├── contact.jsx
│   │   │   └── home.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── assets/        # Static assets
│   │   ├── App.jsx        # Main application component
│   │   ├── main.jsx       # Application entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── index.html         # HTML template
│
└── backend/            # Express.js backend API (CommonJS modules)
    ├── models/            # Database models
    │   ├── userModel.js
    │   └── propertyModel.js
    ├── routes/            # API route handlers
    │   ├── auth.js
    │   ├── properties.js
    │   ├── blog.js
    │   ├── team.js
    │   ├── heroSlides.js
    │   ├── leads.js
    │   ├── settings.js
    │   └── index.js
    ├── middleware/        # Express middleware
    │   └── auth.js
    ├── app.js            # Express application setup
    ├── db.js             # Database connection
    ├── storage.js        # Storage interface
    └── package.json      # Backend dependencies
```

## Features

- **Frontend**: React 18 application with modern JavaScript (no TypeScript)
- **Backend**: RESTful API with Express.js and MongoDB using CommonJS modules
- **Authentication**: JWT-based authentication system
- **Property Management**: Full CRUD operations for properties, team, blog, leads
- **Admin Dashboard**: Complete admin interface for content management
- **Modern UI**: Shadcn/ui components with Tailwind CSS and dark mode support
- **Responsive Design**: Mobile-first responsive interface
- **WhatsApp Integration**: Direct contact via WhatsApp
- **SEO Optimized**: Proper meta tags and Open Graph support

## Prerequisites

- Node.js (version 18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment (backend/.env)
```env
MONGODB_URI=mongodb://localhost:27017/temer-properties
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5000
ADMIN_INIT_SECRET=your-secure-admin-init-secret-here
```

#### Frontend Environment (frontend/.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE=Temer Properties
```

### 3. Running the Application

#### Option 1: Run Both Services Independently

**Start Backend (Terminal 1):**
```bash
cd backend
node app.js
```
Backend will run on: http://localhost:5000

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

#### Option 2: Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Preview Production Build:**
```bash
cd frontend
npm run preview
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/slug/:slug` - Get property by slug
- `POST /api/properties` - Create property (auth required)
- `PUT /api/properties/:id` - Update property (auth required)
- `DELETE /api/properties/:id` - Delete property (auth required)

### Other Endpoints
- `GET /api/hero-slides` - Get hero slides
- `GET /api/team` - Get team members
- `GET /api/blog` - Get blog posts
- `POST /api/leads` - Submit contact form
- `GET /api/settings` - Get site settings

## Development

### Frontend Development
- Built with React + Vite for fast development
- TailwindCSS for styling with custom design system
- React Query for state management and API calls
- Wouter for lightweight routing

### Backend Development
- Express.js server with **pure CommonJS modules** (require/module.exports)
- **MongoDB with native driver** (not Mongoose) for lightweight performance
- JWT authentication with bcrypt password hashing
- CORS enabled for frontend communication
- Comprehensive error handling and graceful database connection failures
- **No ES modules** - strictly CommonJS for compatibility

## Technology Stack

### Frontend
- **React 18** - Pure JavaScript (no TypeScript)
- **Vite 5** - Fast development and build tool
- **TailwindCSS 3** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library built on Radix UI
- **Wouter** - Lightweight client-side routing
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Efficient form handling
- **Dark/Light Theme** - Built-in theme switching

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 4** - Web framework with CommonJS modules
- **MongoDB 6** - Native driver (not Mongoose) for optimal performance
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Secure password hashing
- **CORS** - Cross-origin request handling

## Admin User Initialization (Development Only)

In development mode, you can create an admin user by making a POST request to:
```
POST http://localhost:5000/api/init-admin
```

**Requirements:**
- Set `ADMIN_INIT_SECRET` in your backend .env file
- Include the secret in request header: `x-init-secret: your-secret-value`
- Only works when `NODE_ENV=development`

**Default credentials created:**
- Email: admin@temer.com
- Password: TempAdmin2024!ChangeMe

**⚠️ IMPORTANT:** Change the password immediately after first login for security.

## Production Deployment

1. Set production environment variables
2. Build the frontend: `npm run build`
3. Configure your web server to serve the frontend build
4. Deploy the backend to your Node.js hosting service
5. Update VITE_API_URL to point to your production backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## Security Notes

- Change default admin credentials in production
- Use strong JWT secrets
- Keep MongoDB connection strings secure
- Enable HTTPS in production
- Regularly update dependencies

## Support

For issues and questions:
- Check the logs in the console
- Ensure both services are running on correct ports
- Verify environment variables are set correctly
- Check MongoDB connection status