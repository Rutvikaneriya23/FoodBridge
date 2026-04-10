# 🌱 FoodBridge - No Food Should Go to Waste

A secure, modern, role-based authentication system for food redistribution.

## 🎯 Features

### User Authentication
- ✅ Secure login/signup with JWT tokens
- ✅ Role-based access control (Donor, Receiver, Volunteer)
- ✅ Automatic role-based dashboard redirection
- ✅ Profile management with role switching
- ✅ Password reset functionality

### Admin System
- ✅ Separate admin login with enhanced security
- ✅ Full platform access and user management
- ✅ Real-time monitoring and analytics
- ✅ User verification and account management

### Security Features
- 🔐 bcrypt password hashing
- 🔐 JWT token authentication
- 🔐 Rate limiting on login endpoints
- 🔐 Helmet.js security headers
- 🔐 Input validation and sanitization
- 🔐 Separate admin authentication layer

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)

### Installation

1. **Clone and navigate to project**
   ```bash
   cd FoodBridgeVolunteer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (backend + frontend)
   npm run dev:full
   
   # Backend only
   npm run dev
   
   # Frontend only
   npm run client
   ```

6. **Access the application**
   - User Portal: http://localhost:3000
   - Admin Portal: http://localhost:3000/admin/login
   - API Server: http://localhost:5000

## 🔐 Default Admin Credentials

**⚠️ CHANGE THESE IMMEDIATELY IN PRODUCTION!**

- Admin ID: `admin@foodbridge.com`
- Password: `Admin@FoodBridge2026`

## 📁 Project Structure

```
FoodBridgeVolunteer/
├── server/
│   ├── index.js                 # Express server
│   ├── config/
│   │   └── db.js               # Database configuration
│   ├── models/
│   │   ├── User.js             # User model
│   │   └── Admin.js            # Admin model
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   └── roleCheck.js        # Role-based access control
│   ├── routes/
│   │   ├── auth.js             # User authentication routes
│   │   ├── admin.js            # Admin routes
│   │   └── profile.js          # User profile routes
│   └── utils/
│       └── validators.js       # Input validation
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   ├── Signup.js
│   │   │   │   ├── RoleSelection.js
│   │   │   │   └── AdminLogin.js
│   │   │   ├── Dashboard/
│   │   │   │   ├── DonorDashboard.js
│   │   │   │   ├── ReceiverDashboard.js
│   │   │   │   ├── VolunteerDashboard.js
│   │   │   │   └── AdminDashboard.js
│   │   │   ├── Profile/
│   │   │   │   └── UserProfile.js
│   │   │   └── Common/
│   │   │       ├── Header.js
│   │   │       ├── Footer.js
│   │   │       └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── theme.css
│   └── package.json
└── package.json
```

## 🎨 Role-Based Design

### Color Themes
- **Donor**: Green (#4CAF50) / Orange (#FF9800)
- **Receiver**: Soft Green (#8BC34A) / Beige (#F5E6D3)
- **Volunteer**: Green (#4CAF50) / Blue (#2196F3)
- **Admin**: Grey (#607D8B) / Dark Green (#2E7D32)

## 🧭 User Flow

1. **Login/Signup** → Enter credentials
2. **Role Selection** → Choose role (Donor/Receiver/Volunteer)
3. **Auto-Redirect** → Taken to role-specific dashboard
4. **Profile Management** → Edit profile, switch roles (if allowed)

## 🛡️ Security Best Practices

1. Always use HTTPS in production
2. Change default admin credentials immediately
3. Use strong JWT secrets (minimum 32 characters)
4. Enable MongoDB authentication
5. Set proper CORS origins
6. Regular security audits
7. Keep dependencies updated

## 📚 API Documentation

### User Authentication

#### POST /api/auth/signup
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "location": "New York, NY"
}
```

#### POST /api/auth/login
User login
```json
{
  "emailOrPhone": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST /api/auth/select-role
Select user role
```json
{
  "role": "donor"
}
```

### Admin Authentication

#### POST /api/admin/login
Admin login
```json
{
  "adminId": "admin@foodbridge.com",
  "password": "Admin@FoodBridge2026"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Support

For support, email support@foodbridge.com or open an issue.

---

**Built with ❤️ for a world with zero food waste**
