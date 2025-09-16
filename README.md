# Temer Properties - Real Estate Application

A professional full-stack real estate application with separate frontend and backend services.

## Project Structure

```
root/
  frontend/          # React + Vite + TailwindCSS frontend
    package.json
    vite.config.js
    src/
      pages/          # Application pages
      components/     # Reusable components
      lib/           # Utility functions
      index.css      # Global styles
  backend/           # Express.js + MongoDB API
    app.js           # Main server file
    routes/          # API route handlers
    db.js           # MongoDB connection
    storage.js      # Database operations
    middleware/     # Auth middleware
    package.json
    .env           # Environment variables
  README.md
```

## Features

- **Frontend**: React application with modern UI using TailwindCSS
- **Backend**: RESTful API with Express.js and MongoDB
- **Authentication**: JWT-based authentication system
- **Real Estate Features**: Properties, hero slides, team management, blog, leads
- **Admin Dashboard**: Protected admin routes for content management
- **Responsive Design**: Mobile-friendly interface
- **WhatsApp Integration**: Direct contact via WhatsApp

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
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3001
```

#### Frontend Environment (frontend/.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Running the Application

#### Option 1: Run Both Services Independently

**Start Backend (Terminal 1):**
```bash
cd backend
npm start
```
Backend will run on: http://localhost:3001

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5000

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
- Express.js server with CommonJS modules
- MongoDB with native driver
- JWT authentication
- CORS enabled for frontend communication
- Comprehensive error handling

## Technology Stack

### Frontend
- React 18
- Vite 5
- TailwindCSS 3
- React Query (TanStack Query)
- Wouter (routing)
- Radix UI components
- Lucide React (icons)

### Backend
- Node.js
- Express.js 4
- MongoDB 6
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests

## Default Admin User

After starting the backend, you can create an admin user by making a POST request to:
```
POST http://localhost:3001/api/init-admin
```

Default credentials:
- Email: admin@temer.com
- Password: admin123

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