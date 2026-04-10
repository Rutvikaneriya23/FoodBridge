# 🚀 FoodBridge Setup Guide

## Prerequisites

Before you begin, make sure you have these installed:

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB** (v5 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`

## Quick Installation (Windows)

### Option 1: Automated Installation

1. **Open PowerShell as Administrator** in the FoodBridgeVolunteer folder

2. **Run the installation script:**
   ```powershell
   .\install.ps1
   ```

3. **Start MongoDB** (if not already running):
   ```powershell
   net start MongoDB
   ```

4. **Start the application:**
   ```powershell
   .\start.ps1
   ```
   OR
   ```powershell
   npm run dev:full
   ```

### Option 2: Manual Installation

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Configure environment:**
   - The `.env` file is already created with default values
   - **⚠️ IMPORTANT:** Change the default admin password before deployment!

4. **Start MongoDB:**
   ```bash
   net start MongoDB
   ```

5. **Run the application:**
   ```bash
   # Run both backend and frontend
   npm run dev:full

   # OR run separately:
   # Backend only
   npm run dev

   # Frontend only (in a new terminal)
   npm run client
   ```

## Access the Application

Once running, you can access:

- **User Portal**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin/login
- **API Server**: http://localhost:5000
- **API Documentation**: http://localhost:5000/

## Default Admin Credentials

```
Admin ID: admin@foodbridge.com
Password: Admin@FoodBridge2026
```

**⚠️ CRITICAL**: Change these credentials immediately in production!

## Testing the System

### 1. Test User Registration

1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1234567890
   - Location: New York, NY
   - Password: Test@123456
4. Click "Create Account"
5. Select a role (Donor/Receiver/Volunteer)
6. You'll be redirected to your dashboard

### 2. Test Admin Access

1. Go to http://localhost:3000/admin/login
2. Enter admin credentials
3. Access the admin dashboard
4. View and manage users

### 3. Test Role Switching

1. Login as a user
2. Go to Profile (click on "Profile" button)
3. Click on "Switch Role" section
4. Select a different role
5. You'll be redirected to the new role's dashboard

## Project Structure

```
FoodBridgeVolunteer/
├── server/                  # Backend code
│   ├── config/             # Database configuration
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & role middleware
│   └── index.js            # Express server
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── utils/          # API utilities
│   │   └── styles/         # CSS files
│   └── public/
├── .env                    # Environment variables
├── package.json            # Backend dependencies
└── README.md              # This file
```

## Available Scripts

### Backend Scripts
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

### Frontend Scripts
```bash
cd client
npm start        # Start React development server
npm run build    # Build for production
```

### Combined Scripts
```bash
npm run dev:full   # Run both backend and frontend
```

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solutions**:
1. Make sure MongoDB is running:
   ```bash
   net start MongoDB
   ```
2. Check MongoDB connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/foodbridge
   ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solutions**:
1. Change the port in `.env`:
   ```
   PORT=5001
   ```
2. Or kill the process using the port:
   ```powershell
   # Find process on port 5000
   netstat -ano | findstr :5000
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

### React Not Starting

**Solutions**:
1. Clear npm cache:
   ```bash
   cd client
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. Check if port 3000 is available:
   ```bash
   netstat -ano | findstr :3000
   ```

### Admin Login Not Working

**Solutions**:
1. Verify admin credentials in `.env` file
2. Check MongoDB is running
3. Delete admin from database to recreate:
   ```bash
   mongosh
   use foodbridge
   db.admins.deleteMany({})
   ```
4. Restart the server (admin will be auto-created)

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET in `.env`
- [ ] Change JWT_ADMIN_SECRET in `.env`
- [ ] Change ADMIN_PASSWORD in `.env`
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Update CORS settings in `server/index.js`
- [ ] Set NODE_ENV to `production`
- [ ] Use environment variables (not .env file) in production
- [ ] Enable firewall rules
- [ ] Regular security audits

## Features Implemented

### ✅ Authentication
- User signup with validation
- User login with JWT tokens
- Admin login with separate authentication
- Password hashing with bcrypt
- Token-based session management
- Rate limiting on auth endpoints

### ✅ Role-Based Access
- 3 User roles: Donor, Receiver, Volunteer
- Role selection during onboarding
- Role switching capability
- Role-specific dashboards
- Admin role with full access

### ✅ User Management (Admin)
- View all users
- Verify user accounts
- Suspend/activate users
- Platform statistics
- User filtering and search

### ✅ Profile Management
- View profile information
- Edit profile details
- Change role
- View account statistics

### ✅ Security
- JWT token authentication
- Password complexity requirements
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection with Helmet.js
- CORS configuration

### ✅ UI/UX
- Modern, responsive design
- Role-specific color themes
- Smooth animations
- Loading states
- Error handling
- Success notifications

## API Endpoints

### Authentication
```
POST /api/auth/signup        # Register new user
POST /api/auth/login         # User login
POST /api/auth/select-role   # Select user role
GET  /api/auth/me            # Get current user
POST /api/auth/logout        # Logout user
```

### Admin
```
POST  /api/admin/login          # Admin login
GET   /api/admin/users          # Get all users
GET   /api/admin/users/:id      # Get user by ID
PATCH /api/admin/users/:id/verify    # Verify user
PATCH /api/admin/users/:id/suspend   # Suspend user
GET   /api/admin/stats          # Get platform stats
POST  /api/admin/logout         # Admin logout
```

### Profile
```
GET   /api/profile       # Get user profile
PATCH /api/profile       # Update profile
PATCH /api/profile/role  # Change role
```

## Need Help?

- **Documentation**: Check the README.md file
- **API Reference**: Visit http://localhost:5000/
- **Issues**: Check error messages in terminal
- **MongoDB**: Check MongoDB logs in `C:\Program Files\MongoDB\Server\{version}\log\`

## Next Steps

After successful installation:

1. ✅ Test all authentication flows
2. ✅ Create test users for each role
3. ✅ Test admin capabilities
4. ✅ Test role switching
5. 🔄 Implement donation management
6. 🔄 Implement request system
7. 🔄 Implement volunteer delivery tracking
8. 🔄 Add real-time notifications
9. 🔄 Add analytics and reporting

---

**Built with ❤️ for a world with zero food waste**
