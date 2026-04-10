# 🏗️ FoodBridge System Architecture

## System Overview

FoodBridge is a full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) featuring role-based authentication and access control.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                    (React + React Router)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Login/     │  │    Role      │  │  Dashboards  │         │
│  │   Signup     │→ │  Selection   │→ │  (3 types)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                              ↓                   │
│                                       ┌──────────────┐          │
│                                       │   Profile    │          │
│                                       └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │             Admin Portal (Separate)               │          │
│  │  ┌──────────────┐     ┌──────────────┐          │          │
│  │  │ Admin Login  │  →  │   Command    │          │          │
│  │  │   (Secure)   │     │   Center     │          │          │
│  │  └──────────────┘     └──────────────┘          │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Auth Routes │  │ Admin Routes │  │Profile Routes│         │
│  │  /api/auth/* │  │ /api/admin/* │  │ /api/profile │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         ↓                  ↓                  ↓                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │           Middleware Layer                          │        │
│  │  • JWT Authentication                               │        │
│  │  • Role-Based Access Control (RBAC)               │        │
│  │  • Input Validation                                 │        │
│  │  • Rate Limiting                                    │        │
│  │  • Security Headers (Helmet)                       │        │
│  └────────────────────────────────────────────────────┘        │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────┐        │
│  │            Business Logic Layer                     │        │
│  │  • User Management                                  │        │
│  │  • Role Management                                  │        │
│  │  • Admin Operations                                 │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Mongoose
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │    Users     │  │    Admins    │                            │
│  │  Collection  │  │  Collection  │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### User Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Login/Signup    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐      ┌──────────────────┐
│ Validate Input  │  →   │ Hash Password    │
└────┬────────────┘      └────┬─────────────┘
     │                         │
     ▼                         ▼
┌─────────────────┐      ┌──────────────────┐
│ Check Database  │  ←   │  Compare Hash    │
└────┬────────────┘      └──────────────────┘
     │
     ▼
┌─────────────────┐
│ Generate JWT    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐      ┌──────────────────┐
│ Return Token +  │  →   │  Store in        │
│   User Data     │      │  LocalStorage    │
└─────────────────┘      └────┬─────────────┘
                               │
                               ▼
                          ┌──────────────────┐
                          │ Role Selected?   │
                          └────┬─────────────┘
                               │
                   ┌───────────┴───────────┐
                   │ No                    │ Yes
                   ▼                       ▼
           ┌──────────────┐      ┌──────────────────┐
           │    Role      │      │ Redirect to      │
           │  Selection   │      │ Role Dashboard   │
           └──────────────┘      └──────────────────┘
```

### Admin Authentication Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Admin Login Page    │
│ (Separate Entry)    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Validate Admin      │
│ Credentials         │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Check Login         │
│ Attempts & Locks    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Generate Admin JWT  │
│ (Different Secret)  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Admin Dashboard     │
│ (Full Access)       │
└─────────────────────┘
```

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
┌──────────────────────────────────────────────┐
│                   ADMIN                       │
│  • Full platform access                      │
│  • User management                           │
│  • System monitoring                         │
│  • Analytics & reports                       │
└──────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌───────┐   ┌─────────┐  ┌──────────┐
    │ DONOR │   │RECEIVER │  │VOLUNTEER │
    └───────┘   └─────────┘  └──────────┘
        │            │             │
        ▼            ▼             ▼
┌─────────────────────────────────────────┐
│     Donor Dashboard Features            │
│  • Create donations                     │
│  • Track donations                      │
│  • View pickup requests                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Receiver Dashboard Features          │
│  • Browse donations                     │
│  • Request food                         │
│  • Track requests                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Volunteer Dashboard Features          │
│  • View delivery requests               │
│  • Accept deliveries                    │
│  • Track active deliveries              │
│  • Delivery history                     │
└─────────────────────────────────────────┘
```

## Data Models

### User Model

```javascript
User {
  _id: ObjectId
  name: String (required)
  email: String (required, unique)
  phone: String (required, unique)
  password: String (hashed, required)
  role: Enum ['donor', 'receiver', 'volunteer', null]
  location: String (required)
  isVerified: Boolean (default: false)
  isSuspended: Boolean (default: false)
  profileComplete: Boolean (computed)
  
  // Role-specific stats
  donorStats: {
    totalDonations: Number
    totalMealsProvided: Number
    lastDonationDate: Date
  }
  receiverStats: {
    totalRequests: Number
    totalMealsReceived: Number
    lastRequestDate: Date
  }
  volunteerStats: {
    totalDeliveries: Number
    completedDeliveries: Number
    rating: Number
    lastDeliveryDate: Date
  }
  
  createdAt: Date
  lastLogin: Date
}
```

### Admin Model

```javascript
Admin {
  _id: ObjectId
  adminId: String (required, unique)
  password: String (hashed, required)
  name: String
  permissions: Array<String> (default: ['all'])
  lastLogin: Date
  loginAttempts: Number (for security)
  lockUntil: Date (for account lockout)
  createdAt: Date
}
```

## Security Features

### 1. Password Security
- **Bcrypt hashing** with salt rounds = 12
- **Password requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### 2. JWT Token Authentication
```
User Token:
{
  userId: <user_id>,
  type: 'user',
  exp: 7 days
}

Admin Token:
{
  adminId: <admin_id>,
  type: 'admin',
  exp: 1 day
}
```

### 3. Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes
- Prevents brute force attacks
- IP-based tracking

### 4. Security Headers (Helmet.js)
- XSS Protection
- Content Security Policy
- Hide X-Powered-By
- HSTS (HTTPS Strict Transport Security)
- Frame Guard

### 5. Input Validation
- **express-validator** for all inputs
- Sanitization of user inputs
- SQL injection prevention
- XSS prevention

### 6. Admin Security
- Separate authentication system
- Account lockout after 5 failed attempts
- Shorter token expiration (1 day)
- Activity logging

## API Request Flow

### Protected Route Example

```
┌──────────────┐
│   Client     │
│  (Browser)   │
└──────┬───────┘
       │
       │ GET /api/profile
       │ Authorization: Bearer <token>
       ▼
┌──────────────────┐
│  Rate Limiter    │ → Check request count
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  CORS Middleware │ → Validate origin
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Auth Middleware │
│  • Extract token │
│  • Verify JWT    │ → If invalid: 401
│  • Load user     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Role Middleware │
│  • Check role    │ → If wrong role: 403
│  • Verify access │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Route Handler   │
│  • Process req   │
│  • Query DB      │
│  • Return data   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Response       │
│  (JSON + Status) │
└──────────────────┘
```

## Component Hierarchy

### Client-Side React Components

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Public Routes
│       │   ├── Login
│       │   ├── Signup
│       │   └── AdminLogin
│       │
│       ├── Protected Routes (User)
│       │   ├── RoleSelection
│       │   ├── UserProfile
│       │   ├── DonorDashboard
│       │   ├── ReceiverDashboard
│       │   └── VolunteerDashboard
│       │
│       └── Protected Routes (Admin)
│           └── AdminDashboard
```

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────┐
│                    Load Balancer                     │
│                    (NGINX/AWS ALB)                   │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Frontend   │        │   Backend    │
│   (Static)   │        │   (Node.js)  │
│   Server     │        │   Cluster    │
└──────────────┘        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   MongoDB    │
                        │   Replica    │
                        │     Set      │
                        └──────────────┘
```

## Performance Considerations

### 1. Database Indexing
```javascript
// User indexes
email: unique index
phone: unique index
role: index

// Admin indexes
adminId: unique index
```

### 2. Caching Strategy
- JWT tokens cached in localStorage
- User data cached in React context
- API responses can be cached with Redis (future)

### 3. Code Splitting
- Route-based code splitting in React
- Lazy loading of dashboard components
- Optimized bundle size

## Scalability

### Horizontal Scaling
- **Frontend**: CDN distribution
- **Backend**: Node.js cluster mode
- **Database**: MongoDB replica sets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add indexes

## Monitoring & Logging

### Metrics to Track
- API response times
- Error rates
- User registration/login rates
- Role distribution
- Admin activities

### Logging Strategy
- Console logs in development
- File logs in production
- Admin action logging
- Error tracking (Sentry/LogRocket)

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI components |
| Routing | React Router 6 | Client-side routing |
| State | Context API | Global state management |
| Styling | Custom CSS | Role-based themes |
| Backend | Express.js | REST API |
| Authentication | JWT | Token-based auth |
| Database | MongoDB | NoSQL database |
| ODM | Mongoose | MongoDB object modeling |
| Security | Helmet, bcrypt | Security middleware |
| Validation | express-validator | Input validation |

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **Email Verification**
3. **Social Login** (Google, Facebook)
4. **Real-time Notifications** (Socket.io)
5. **Push Notifications**
6. **Mobile App** (React Native)
7. **Analytics Dashboard**
8. **Reporting System**
9. **Map Integration**
10. **Chat System**

---

**Built for scalability, security, and performance** 🚀
