# FoodBridge - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Page Flow Diagrams](#page-flow-diagrams)
7. [Features & Functionality](#features--functionality)
8. [Installation Guide](#installation-guide)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Security Implementation](#security-implementation)

---

## 📖 Project Overview

**FoodBridge** is a comprehensive food donation management platform that connects food donors with receivers (NGOs, shelters) through volunteer delivery services. The platform includes real-time food quality verification, GPS tracking, and automated delivery management.

### Project Goals
- Reduce food waste by connecting surplus food with those in need
- Ensure food safety through digital verification systems
- Streamline the donation-to-delivery process
- Provide transparency for all stakeholders

---

## 🛠 Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18.2.0** - JavaScript library for building user interfaces
- **React Router DOM 6.x** - Client-side routing
- **React Scripts** - Create React App build tools

#### State Management & Context
- **React Context API** - Global state management for authentication
- **React Hooks** - useState, useEffect, useContext for component logic

#### UI Components & Icons
- **React Icons** - Icon library (FaIcons)
  - FaUtensils, FaBox, FaTruck, FaMapMarkerAlt, FaCamera, etc.

#### Maps & Location
- **Leaflet 1.9.x** - Open-source JavaScript library for interactive maps
- **React-Leaflet** - React components for Leaflet maps
- **Navigator.geolocation API** - Browser GPS location services

#### Authentication
- **@react-oauth/google** - Google OAuth 2.0 authentication
- **JWT (JSON Web Tokens)** - Token-based authentication

#### HTTP Client
- **Axios** - Promise-based HTTP client for API requests

#### Styling
- **CSS3** - Custom styling
- **CSS Modules** - Component-scoped styling
- **Flexbox & CSS Grid** - Modern layout systems

### Backend Technologies

#### Runtime & Framework
- **Node.js 16+** - JavaScript runtime environment
- **Express.js 4.x** - Web application framework

#### Database
- **MongoDB 5.x** - NoSQL document database
- **Mongoose 6.x** - MongoDB object modeling (ODM)

#### Authentication & Security
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing
- **cors** - Cross-Origin Resource Sharing middleware
- **helmet** - Security headers middleware

#### Validation
- **express-validator** - Request validation middleware
- **Custom validators** - Backend validation logic

#### Environment Management
- **dotenv** - Environment variable management

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Donor   │  │ Receiver │  │Volunteer │  │  Admin   │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/HTTPS (REST API)
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Donations │  │ Messages │  │ Profile  │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Middleware Layer                            │  │
│  │  - Authentication (JWT)                               │  │
│  │  - Role-based Access Control                          │  │
│  │  - Request Validation                                 │  │
│  │  - Error Handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│                  MongoDB Database                            │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌────────────────┐   │
│  │ Users  │ │Donations │ │Messages │ │ Notifications  │   │
│  └────────┘ └──────────┘ └─────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
FoodBridge/
├── client/                          # Frontend React Application
│   ├── public/
│   │   ├── index.html
│   │   └── Foodbridge_black.svg    # Logo
│   └── src/
│       ├── App.js                   # Main app component with routes
│       ├── index.js                 # Entry point
│       ├── components/
│       │   ├── Auth/                # Authentication components
│       │   │   ├── Login.js
│       │   │   ├── Signup.js
│       │   │   ├── AdminLogin.js
│       │   │   ├── RoleSelection.js
│       │   │   ├── Auth.css
│       │   │   └── Admin.css
│       │   ├── Dashboard/           # Dashboard components
│       │   │   ├── DonorDashboard.js
│       │   │   ├── ReceiverDashboardNew.js
│       │   │   ├── VolunteerDashboardNew.js
│       │   │   ├── AdminDashboard.js
│       │   │   ├── AddDonation.js
│       │   │   ├── ViewDonations.js
│       │   │   ├── VerifyPickup.js
│       │   │   ├── Chat.js
│       │   │   ├── DeliveryProgress.js
│       │   │   ├── VerificationDetails.js
│       │   │   ├── ReceiverTracking.js
│       │   │   ├── BottomNav.js
│       │   │   └── [CSS files]
│       │   ├── Common/
│       │   │   └── ProtectedRoute.js
│       │   └── Profile/
│       │       ├── UserProfile.js
│       │       └── Profile.css
│       ├── context/
│       │   └── AuthContext.js       # Global auth state
│       ├── styles/
│       │   └── theme.css
│       └── utils/
│           └── api.js
│
└── server/                          # Backend Node.js Application
    ├── index.js                     # Server entry point
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── middleware/
    │   ├── auth.js                  # JWT authentication
    │   └── roleCheck.js             # Role-based access control
    ├── models/                      # Mongoose schemas
    │   ├── User.js
    │   ├── Donation.js
    │   ├── Message.js
    │   ├── Notification.js
    │   └── Admin.js
    ├── routes/                      # API routes
    │   ├── auth.js
    │   ├── donations.js
    │   ├── messages.js
    │   ├── notifications.js
    │   ├── profile.js
    │   ├── admin.js
    │   └── receiver-volunteer.js
    └── utils/
        └── validators.js
```

---

## 💾 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (enum: ['donor', 'receiver', 'volunteer']),
  phone: String,
  address: String,
  organization: String,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Model
```javascript
{
  _id: ObjectId,
  donor: ObjectId (ref: 'User'),
  foodName: String (required),
  foodType: String (enum: ['Cooked Food', 'Raw Food', 'Packaged Food', etc.]),
  quantity: Number (required),
  quantityUnit: String (enum: ['kg', 'liters', 'servings', 'pieces']),
  expiryDate: Date,
  pickupAddress: String,
  pickupLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  status: String (enum: ['available', 'claimed', 'assigned', 'picked-up', 'delivered', 'rejected']),
  assignedTo: {
    receiver: ObjectId (ref: 'User'),
    volunteer: ObjectId (ref: 'User')
  },
  verification: {
    verifiedBy: ObjectId (ref: 'User'),
    cookingTime: Date,
    temperatureRange: String (enum: ['hot', 'warm', 'room', 'cold']),
    smellAppearance: String (enum: ['excellent', 'good', 'acceptable', 'poor']),
    packagingCondition: String (enum: ['sealed', 'intact', 'minor-damage', 'damaged']),
    photos: [String],
    verificationStatus: String (enum: ['safe', 'consume-soon', 'rejected']),
    consumeWithinHours: Number,
    rejectionReason: String,
    notes: String,
    gpsLocation: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    verifiedAt: Date
  },
  claimedAt: Date,
  pickupTime: Date,
  deliveryTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  donation: ObjectId (ref: 'Donation'),
  sender: ObjectId (ref: 'User'),
  receiver: ObjectId (ref: 'User'),
  content: String,
  role: String (enum: ['donor', 'receiver', 'volunteer', 'bot']),
  read: Boolean,
  createdAt: Date
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  type: String,
  title: String,
  message: String,
  read: Boolean,
  link: String,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/signup` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/google-login` | Google OAuth login | Public |
| POST | `/select-role` | Select user role after signup | Authenticated |
| POST | `/admin/login` | Admin login | Public |

### Donation Routes (`/api/donations`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all donations | Authenticated |
| GET | `/my-donations` | Get user's donations | Donor |
| GET | `/:id` | Get donation by ID | Authenticated |
| POST | `/` | Create new donation | Donor |
| PUT | `/:id` | Update donation | Donor |
| DELETE | `/:id` | Delete donation | Donor |
| POST | `/:id/verify-pickup` | Verify food quality at pickup | Volunteer |

### Receiver-Volunteer Routes (`/api/receiver-volunteer`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/available-donations` | Get available donations for receivers | Receiver |
| GET | `/available-for-volunteers` | Get donations ready for volunteer pickup | Volunteer |
| POST | `/:id/claim` | Receiver claims a donation | Receiver |
| POST | `/:id/accept-volunteer` | Volunteer accepts delivery | Volunteer |
| POST | `/:id/verify-quality` | Volunteer verifies food quality | Volunteer |

### Profile Routes (`/api/profile`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user profile | Authenticated |
| PATCH | `/` | Update user profile | Authenticated |
| GET | `/stats` | Get user statistics | Authenticated |

### Message Routes (`/api/messages`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/:donationId` | Get messages for a donation | Authenticated |
| POST | `/:donationId` | Send message | Authenticated |
| PATCH | `/:id/read` | Mark message as read | Authenticated |

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user notifications | Authenticated |
| PATCH | `/:id/read` | Mark notification as read | Authenticated |
| PATCH | `/read-all` | Mark all notifications as read | Authenticated |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Get system statistics | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/donations` | Get all donations | Admin |
| PATCH | `/users/:id` | Update user status | Admin |

---

## 📊 Page Flow Diagrams

### 1. Authentication Flow

```
                    START
                      |
                      v
            ┌─────────────────┐
            │  Landing Page   │
            └─────────────────┘
                      |
        ┌─────────────┴─────────────┐
        v                           v
┌───────────────┐         ┌──────────────┐
│  Login Page   │         │ Signup Page  │
└───────────────┘         └──────────────┘
        |                           |
        |                           v
        |              ┌─────────────────────┐
        |              │ Role Selection Page │
        |              │  - Donor            │
        |              │  - Receiver         │
        |              │  - Volunteer        │
        |              └─────────────────────┘
        |                           |
        └───────────┬───────────────┘
                    v
          ┌──────────────────┐
          │ JWT Token Issued │
          └──────────────────┘
                    |
        ┌───────────┴───────────┐
        v                       v
┌──────────────┐      ┌────────────────┐
│Role=Donor    │      │Role=Receiver   │
│→Donor        │      │→Receiver       │
│ Dashboard    │      │ Dashboard      │
└──────────────┘      └────────────────┘
                    |
                    v
            ┌──────────────────┐
            │Role=Volunteer    │
            │→Volunteer        │
            │ Dashboard        │
            └──────────────────┘
```

### 2. Donor Dashboard Flow

```
              ┌──────────────────────┐
              │  Donor Dashboard     │
              │  - View Stats        │
              │  - Active Deliveries │
              │  - Recent Activity   │
              └──────────────────────┘
                        |
        ┌───────────────┼───────────────┐
        v               v               v
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Create New    │ │View All      │ │Active        │
│Donation      │ │Donations     │ │Deliveries    │
└──────────────┘ └──────────────┘ └──────────────┘
        |               |               |
        v               v               v
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Add Donation  │ │Edit/Delete   │ │View Progress │
│Form:         │ │Donation      │ │- Accepted    │
│- Food Name   │ │- Status      │ │- En Route    │
│- Type        │ │- Details     │ │- Picked Up   │
│- Quantity    │ │              │ │- Delivered   │
│- Expiry      │ │              │ │              │
│- Address     │ │              │ │Verification  │
│- Location    │ │              │ │Details       │
└──────────────┘ └──────────────┘ └──────────────┘
        |
        v
┌──────────────────┐
│Donation Created  │
│Status: Available │
└──────────────────┘
```

### 3. Receiver Dashboard Flow

```
            ┌────────────────────────┐
            │  Receiver Dashboard    │
            │  - Browse Donations    │
            │  - Map View            │
            │  - My Deliveries       │
            └────────────────────────┘
                        |
        ┌───────────────┴───────────────┐
        v                               v
┌──────────────────┐         ┌──────────────────┐
│Available         │         │My Deliveries     │
│Donations Tab     │         │Tab               │
│- Search          │         │- Active          │
│- Filter by Type  │         │- Completed       │
│- Filter Distance │         │- Delivery Status │
│- Map View        │         │- Track Progress  │
└──────────────────┘         └──────────────────┘
        |                               |
        v                               v
┌──────────────────┐         ┌──────────────────┐
│View Donation     │         │View Delivery     │
│Details:          │         │Progress:         │
│- Food Info       │         │- Status Timeline │
│- Quantity        │         │- Volunteer Info  │
│- Donor Info      │         │- Verification    │
│- Distance        │         │  Details         │
│- Location        │         │- Photos          │
│                  │         │- GPS Location    │
│[Claim Donation]  │         │                  │
└──────────────────┘         └──────────────────┘
        |
        v
┌──────────────────┐
│Donation Claimed  │
│Status: Assigned  │
│Waiting for       │
│Volunteer         │
└──────────────────┘
```

### 4. Volunteer Dashboard Flow

```
        ┌──────────────────────────────┐
        │  Volunteer Dashboard         │
        │  - Registration Form         │
        │  - Available Pickup Tasks    │
        │  - Active Deliveries         │
        └──────────────────────────────┘
                    |
        ┌───────────┴──────────┐
        v                      v
┌──────────────────┐  ┌──────────────────┐
│Register as       │  │Available Pickup  │
│Volunteer:        │  │Tasks:            │
│- Full Name       │  │- Food Details    │
│- Phone           │  │- Distance        │
│- Vehicle Type    │  │- Reward Points   │
│- Availability    │  │- Pickup Address  │
│- Service Area    │  │                  │
│                  │  │[Accept Delivery] │
└──────────────────┘  └──────────────────┘
                              |
                              v
                  ┌──────────────────────┐
                  │Verification Page     │
                  │Opens Automatically   │
                  └──────────────────────┘
                              |
                              v
        ┌─────────────────────────────────────┐
        │  Food Pickup Verification           │
        │  ┌───────────────────────────────┐  │
        │  │ Donation Info:                │  │
        │  │ - Food Name, Type, Quantity   │  │
        │  │ - Donor Details               │  │
        │  │ - Pickup Address (Editable)   │  │
        │  └───────────────────────────────┘  │
        │  ┌───────────────────────────────┐  │
        │  │ Live GPS Map                  │  │
        │  │ - Current Location Marker     │  │
        │  │ - Auto-updates                │  │
        │  └───────────────────────────────┘  │
        └─────────────────────────────────────┘
                        |
                        v
        ┌─────────────────────────────────────┐
        │  Hygiene & Safety Checklist         │
        │  ☑ 1. Time of Cooking (DateTime)    │
        │  ☑ 2. Temperature Range (Dropdown)  │
        │  ☑ 3. Smell & Appearance (Dropdown) │
        │  ☑ 4. Packaging Condition (Dropdown)│
        │  ☑ 5. Upload Photos + GPS + Time    │
        │                                     │
        │  Photo Upload Area:                 │
        │  [📷 Click to upload images]        │
        │  [Preview Grid]                     │
        └─────────────────────────────────────┘
                        |
                        v
        ┌─────────────────────────────────────┐
        │  Verification Status Selection      │
        │  [ 🟢 Safe ]                        │
        │  [ 🟡 Consume within X hours ]      │
        │  [ 🔴 Rejected ]                    │
        │                                     │
        │  Additional Notes (Optional)        │
        │  [Text Area]                        │
        │                                     │
        │  [✅ Submit Verification]           │
        └─────────────────────────────────────┘
                        |
                        v
                ┌──────────────┐
                │ Verification │
                │   Saved to   │
                │   Database   │
                └──────────────┘
                        |
                        v
        ┌─────────────────────────────────────┐
        │  Status Updated:                    │
        │  - Donation status: picked-up       │
        │  - Verification data saved          │
        │  - Photos uploaded                  │
        │  - GPS coordinates recorded         │
        │  - Timestamp logged                 │
        │                                     │
        │  ↓ Visible in Donor Dashboard       │
        │  ↓ Visible in Receiver Dashboard    │
        └─────────────────────────────────────┘
```

### 5. Admin Dashboard Flow

```
        ┌──────────────────────────┐
        │  Admin Dashboard         │
        │  - System Statistics     │
        │  - User Management       │
        │  - Donation Overview     │
        │  - Reports               │
        └──────────────────────────┘
                    |
        ┌───────────┼───────────┐
        v           v           v
┌──────────┐ ┌──────────┐ ┌──────────┐
│Manage    │ │Manage    │ │View      │
│Users     │ │Donations │ │Reports   │
└──────────┘ └──────────┘ └──────────┘
```

---

## ✨ Features & Functionality

### 1. User Authentication
- **Email/Password Registration & Login**
- **Google OAuth 2.0 Integration**
- **Role-Based Access Control** (Donor, Receiver, Volunteer, Admin)
- **JWT Token Authentication**
- **Protected Routes**
- **Session Management**

### 2. Donor Features
- **Create Food Donations**
  - Food name, type, quantity
  - Expiry date
  - Pickup address with geolocation
- **View All Donations**
  - Edit/Delete functionality
  - Status tracking
- **Real-Time Statistics**
  - Total donations
  - Meals provided
  - Pending pickups
  - Impact score
- **Active Deliveries Dashboard**
  - Live delivery tracking
  - Progress timeline (Accepted → Picked Up → En Route → Delivered)
  - Verification status display
- **Recent Activity Feed**
  - Last 5 donations with status
  - Creation timestamps
- **Chat System**
  - Communication with receivers/volunteers
  - AI Assistant integration

### 3. Receiver Features
- **Browse Available Donations**
  - Search functionality
  - Filter by food type
  - Filter by distance
- **Interactive Map View**
  - Visual representation of nearby donations
  - Distance calculation
- **Claim Donations**
  - One-click claiming
  - Automatic notification to donor
- **My Deliveries**
  - Track active deliveries
  - View verification details
  - Access delivery progress
- **Delivery Progress Tracking**
  - 4-stage timeline
  - Verification status badges
  - Volunteer contact information

### 4. Volunteer Features
- **Registration System**
  - Personal information
  - Vehicle type
  - Availability schedule
  - Service area radius
- **Available Pickup Tasks**
  - View claimed donations ready for pickup
  - Distance and reward information
- **Accept Deliveries**
  - One-click acceptance
  - Auto-navigation to verification page
- **Real-Time Food Verification** ⭐
  - **5-Point Hygiene Checklist:**
    1. Time of cooking (datetime input)
    2. Temperature range (hot/warm/room/cold)
    3. Smell & appearance (excellent/good/acceptable/poor)
    4. Packaging condition (sealed/intact/minor-damage/damaged)
    5. Photo upload with automatic timestamp
  - **Live GPS Tracking**
    - Real-time location on Leaflet map
    - Coordinates saved with verification
  - **Status Selection**
    - 🟢 Safe - Ready for consumption
    - 🟡 Consume Soon - Time-sensitive (specify hours)
    - 🔴 Rejected - Not safe (requires reason)
  - **Photo Upload**
    - Multiple images support
    - Base64 encoding
    - Preview before submission
  - **Additional Notes** - Optional observations
- **Active Deliveries Dashboard**
  - Track ongoing deliveries
  - View pickup history

### 5. Admin Features
- **System Statistics Dashboard**
  - Total users by role
  - Total donations
  - Active deliveries
  - Success rates
- **User Management**
  - View all users
  - Update user status
  - Access control
- **Donation Oversight**
  - Monitor all donations
  - System-wide status tracking
- **Reports & Analytics**

### 6. Chat & Messaging System
- **Real-Time Chat**
  - Donation-specific conversations
  - Multi-party communication (Donor-Receiver-Volunteer)
- **AI Assistant Integration**
  - Automated responses
  - Food safety tips
  - Process guidance
- **Message Notifications**
  - Unread count
  - Real-time updates

### 7. Delivery Progress Tracking
- **Visual Progress Timeline**
  - Step indicators with icons
  - Completed/Current/Pending states
  - Color-coded status
- **Verification Details Display**
  - Expandable card with all checklist data
  - Photo gallery
  - GPS coordinates
  - Volunteer notes
  - Timestamp information
- **Status Badges**
  - Color-coded for quick identification
  - Icons for visual clarity

### 8. Notification System
- **Real-Time Notifications**
  - Donation claimed
  - Volunteer assigned
  - Pickup completed
  - Delivery status updates
- **Unread Count Badge**
- **Notification History**

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/foodbridge.git
cd foodbridge
```

### Step 2: Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodbridge
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
GOOGLE_CLIENT_ID=your_google_oauth_client_id
NODE_ENV=development
EOL

# Start MongoDB service
# On Windows: net start MongoDB
# On Mac: brew services start mongodb-community
# On Linux: sudo systemctl start mongod

# Start the server
npm start
# or for development with auto-reload
npm run dev
```

### Step 3: Setup Frontend

```bash
# Open new terminal
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
EOL

# Start the React app
npm start
```

### Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

### Step 5: Create Admin Account (Optional)

```bash
# In MongoDB shell or Compass, insert admin user:
db.users.insertOne({
  name: "Admin",
  email: "admin@foodbridge.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash "admin123"
  role: "admin",
  verified: true,
  createdAt: new Date()
})
```

---

## 👥 User Roles & Permissions

### Donor
**Can:**
- Create, edit, delete own donations
- View own donation history
- Track active deliveries
- View delivery verification details
- Chat with receivers and volunteers
- View profile and statistics

**Cannot:**
- Claim other donations
- Accept volunteer tasks
- Access admin functions

### Receiver (NGO/Shelter)
**Can:**
- Browse and search available donations
- Claim donations
- View donation details and location
- Track delivery progress
- View verification details
- Chat with donors and volunteers
- View profile

**Cannot:**
- Create donations
- Accept volunteer deliveries
- Perform food verification
- Access admin functions

### Volunteer
**Can:**
- Register with vehicle and availability
- View available pickup tasks
- Accept deliveries
- Perform food quality verification
- Upload photos with GPS
- Track active deliveries
- Chat with donors and receivers
- View profile

**Cannot:**
- Create donations
- Claim donations as receiver
- Access admin functions

### Admin
**Can:**
- View all system statistics
- Manage all users
- View all donations
- Monitor system activity
- Access reports and analytics
- Override decisions (if needed)

**Cannot:**
- Create donations as regular user
- Participate in regular donation flow

---

## 🔒 Security Implementation

### 1. Authentication Security
- **Password Hashing:** bcryptjs with salt rounds
- **JWT Tokens:** 
  - Signed with secret key
  - Expiration time: 7 days
  - Stored in localStorage (client-side)
- **Protected Routes:** 
  - Middleware checks for valid JWT
  - Role-based access control

### 2. Authorization
- **Role Verification:**
  ```javascript
  checkRole(['donor', 'receiver']) // Middleware
  ```
- **Route Protection:**
  - Public routes: Login, Signup
  - Protected routes: All dashboards, API endpoints
- **Token Validation:**
  - Every API request validates JWT
  - Expired tokens rejected

### 3. Data Validation
- **Backend Validation:**
  - express-validator for request validation
  - Mongoose schema validation
  - Custom validators for complex rules
- **Frontend Validation:**
  - Required field checks
  - Format validation (email, phone)
  - File size/type restrictions

### 4. API Security
- **CORS Configuration:**
  ```javascript
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
  ```
- **Rate Limiting:** (Recommended to add)
- **Helmet.js:** Security headers
- **Input Sanitization:** Prevents XSS attacks

### 5. Database Security
- **MongoDB Security:**
  - Connection string in environment variables
  - No sensitive data in client code
- **Data Encryption:**
  - Passwords hashed before storage
  - Sensitive fields protected

### 6. File Upload Security
- **Photo Upload:**
  - Base64 encoding
  - Size validation
  - Type validation (images only)
  - Client-side preview before upload

---

## 📱 Responsive Design

### Breakpoints
- **Desktop:** > 1024px
- **Tablet:** 768px - 1024px
- **Mobile:** < 768px

### Mobile Optimizations
- Touch-friendly buttons (min 44px height)
- Simplified navigation
- Stacked layouts
- Responsive images
- Optimized map view

---

## 🔄 Real-Time Features

### Auto-Refresh Mechanism
```javascript
// Updates every 30 seconds
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, []);
```

### Real-Time Updates
- Statistics dashboard
- Available donations list
- Active deliveries status
- Notification count
- Chat messages

---

## 📈 Performance Optimizations

### Frontend
- **React.memo** for component memoization
- **Lazy Loading** for routes (Code splitting)
- **Image Optimization** 
- **Debouncing** search inputs
- **Pagination** for large lists

### Backend
- **Database Indexing:**
  ```javascript
  donationSchema.index({ status: 1 });
  donationSchema.index({ donor: 1 });
  donationSchema.index({ 'pickupLocation': '2dsphere' });
  ```
- **Query Optimization**
- **Connection Pooling**

---

## 🐛 Error Handling

### Frontend Error Handling
```javascript
try {
  const response = await axios.get('/api/endpoint');
  // Handle success
} catch (error) {
  console.error('Error:', error);
  alert(error.response?.data?.message || 'An error occurred');
}
```

### Backend Error Handling
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
```

---

## 🧪 Testing Recommendations

### Unit Testing
- Jest for React components
- Mocha/Chai for backend

### Integration Testing
- API endpoint testing
- Database operations

### E2E Testing
- Cypress for full user flows

---

## 🚀 Deployment Guide

### Frontend Deployment (Netlify/Vercel)
1. Build production bundle: `npm run build`
2. Deploy `build` folder
3. Set environment variables

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Configure MongoDB Atlas
3. Deploy with `git push`

### Database (MongoDB Atlas)
1. Create cluster
2. Configure network access
3. Get connection string
4. Update MONGODB_URI

---

## 📊 Future Enhancements

1. **Push Notifications** (Web/Mobile)
2. **Email Notifications** (SendGrid/Nodemailer)
3. **SMS Alerts** (Twilio)
4. **Analytics Dashboard** (Charts, Reports)
5. **Rating System** (User/Volunteer ratings)
6. **Rewards Program** (Points, Badges)
7. **Advanced Search** (Filters, Sorting)
8. **Route Optimization** (Multiple pickups)
9. **Payment Integration** (Donations)
10. **Mobile App** (React Native)

---

## 📞 Support & Contact

For issues or questions:
- GitHub Issues: [repository-url]
- Email: support@foodbridge.com
- Documentation: [docs-url]

---

## 📄 License

[Your License Here - e.g., MIT]

---

## 🙏 Acknowledgments

- React Team for the framework
- Leaflet for mapping solution
- MongoDB for database
- All open-source contributors

---

**Last Updated:** January 24, 2026
**Version:** 1.0.0
**Author:** FoodBridge Development Team
