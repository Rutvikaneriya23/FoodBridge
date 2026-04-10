# 🧪 FoodBridge Testing Guide

## Test Environment Setup

Before testing, ensure:
- MongoDB is running
- Backend server is running on port 5000
- Frontend is running on port 3000

```bash
# Start MongoDB
net start MongoDB

# Start the application
npm run dev:full
```

## Test Scenarios

### 1️⃣ User Registration Flow

#### Test Case 1.1: Successful Registration

**Steps:**
1. Navigate to http://localhost:3000
2. Click "Create Account"
3. Fill in the form:
   - Name: `John Doe`
   - Email: `john.doe@example.com`
   - Phone: `+1234567890`
   - Location: `New York, NY`
   - Password: `Test@123456`
   - Confirm Password: `Test@123456`
4. Click "Create Account"

**Expected Result:**
- ✅ Account created successfully
- ✅ JWT token received
- ✅ Redirected to role selection page
- ✅ User data stored in localStorage

**Validation:**
```javascript
// Check in browser console
localStorage.getItem('authToken'); // Should return JWT token
localStorage.getItem('user'); // Should return user JSON
```

#### Test Case 1.2: Registration with Invalid Email

**Steps:**
1. Try to register with email: `invalid-email`
2. Submit form

**Expected Result:**
- ❌ Form validation error: "Please enter a valid email"
- ❌ Form not submitted

#### Test Case 1.3: Registration with Weak Password

**Steps:**
1. Try to register with password: `12345678`
2. Submit form

**Expected Result:**
- ❌ Error: "Password must contain uppercase, lowercase, number and special character"

#### Test Case 1.4: Registration with Duplicate Email

**Steps:**
1. Try to register with an email that already exists
2. Submit form

**Expected Result:**
- ❌ Error: "Email already registered"

---

### 2️⃣ User Login Flow

#### Test Case 2.1: Successful Login

**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email/Phone: `john.doe@example.com`
   - Password: `Test@123456`
3. Click "Continue"

**Expected Result:**
- ✅ Login successful
- ✅ If role is selected: Redirect to role dashboard
- ✅ If no role: Redirect to role selection

#### Test Case 2.2: Login with Invalid Credentials

**Steps:**
1. Enter incorrect password
2. Submit form

**Expected Result:**
- ❌ Error: "Invalid credentials"
- ❌ User not logged in

#### Test Case 2.3: Login with Phone Number

**Steps:**
1. Enter phone number instead of email: `+1234567890`
2. Enter correct password
3. Submit

**Expected Result:**
- ✅ Login successful
- ✅ System accepts both email and phone

---

### 3️⃣ Role Selection Flow

#### Test Case 3.1: Select Donor Role

**Steps:**
1. After login (first-time user), on role selection page
2. Click on "Donor" card
3. Click "Continue to Dashboard"

**Expected Result:**
- ✅ Role saved as "donor"
- ✅ Redirected to `/donor-dashboard`
- ✅ Donor dashboard displays with green theme

#### Test Case 3.2: Select Receiver Role

**Steps:**
1. Select "Needy / Receiver" card
2. Continue

**Expected Result:**
- ✅ Role saved as "receiver"
- ✅ Redirected to `/receiver-dashboard`
- ✅ Receiver dashboard displays with soft green theme

#### Test Case 3.3: Select Volunteer Role

**Steps:**
1. Select "Volunteer" card
2. Continue

**Expected Result:**
- ✅ Role saved as "volunteer"
- ✅ Redirected to `/volunteer-dashboard`
- ✅ Volunteer dashboard displays with blue theme

---

### 4️⃣ Role-Based Dashboard Access

#### Test Case 4.1: Donor Dashboard Access

**Steps:**
1. Login as donor user
2. Navigate to `/donor-dashboard`

**Expected Result:**
- ✅ Dashboard displays with:
  - Green color theme
  - "FoodBridge Donor" header
  - Total Donations stat
  - Meals Provided stat
  - Quick action cards
  - "Create New Donation" button

#### Test Case 4.2: Unauthorized Role Access

**Steps:**
1. Login as donor
2. Try to access `/receiver-dashboard` directly

**Expected Result:**
- ✅ Automatically redirected to `/donor-dashboard`
- ✅ Cannot access other role dashboards

#### Test Case 4.3: Access Without Login

**Steps:**
1. Clear localStorage (logout)
2. Try to access `/donor-dashboard`

**Expected Result:**
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes

---

### 5️⃣ Profile Management

#### Test Case 5.1: View Profile

**Steps:**
1. Login as any user
2. Click "Profile" button in header
3. View profile page

**Expected Result:**
- ✅ Profile displays:
  - User name
  - Email
  - Phone
  - Location
  - Role badge
  - Verification status
  - Member since date

#### Test Case 5.2: Edit Profile

**Steps:**
1. On profile page, click "Edit Profile"
2. Change name to `Jane Doe`
3. Change location to `Los Angeles, CA`
4. Click "Save Changes"

**Expected Result:**
- ✅ Success message: "Profile updated successfully"
- ✅ Changes reflected immediately
- ✅ Updated data saved in database
- ✅ Edit mode exits automatically

#### Test Case 5.3: Change Role

**Steps:**
1. On profile page, scroll to "Switch Role" section
2. Click "Receiver" button
3. Confirm the change

**Expected Result:**
- ✅ Role changed to "receiver"
- ✅ Redirected to `/receiver-dashboard`
- ✅ Dashboard theme changes
- ✅ Role-specific features available

---

### 6️⃣ Admin Login Flow

#### Test Case 6.1: Admin Login Success

**Steps:**
1. Navigate to http://localhost:3000/admin/login
2. Enter credentials:
   - Admin ID: `admin@foodbridge.com`
   - Password: `Admin@FoodBridge2026`
3. Click "Login as Admin"

**Expected Result:**
- ✅ Admin logged in
- ✅ Redirected to `/admin/dashboard`
- ✅ Admin token stored separately
- ✅ Grey/dark green theme

#### Test Case 6.2: Admin Login with Invalid Credentials

**Steps:**
1. Enter wrong admin password
2. Submit

**Expected Result:**
- ❌ Error: "Invalid admin credentials"
- ❌ Login attempts counter increments
- ❌ Shows remaining attempts

#### Test Case 6.3: Admin Account Lockout

**Steps:**
1. Try to login with wrong password 5 times

**Expected Result:**
- ❌ After 5 attempts: "Account locked due to too many failed attempts"
- ❌ Account locked for 1 hour
- ❌ Cannot login even with correct password during lockout

---

### 7️⃣ Admin Dashboard Functions

#### Test Case 7.1: View Platform Statistics

**Steps:**
1. Login as admin
2. View admin dashboard

**Expected Result:**
- ✅ Displays statistics:
  - Total Users
  - Donors count
  - Receivers count
  - Volunteers count
  - Verified users
  - Suspended users

#### Test Case 7.2: View All Users

**Steps:**
1. On admin dashboard, view users table
2. Check displayed information

**Expected Result:**
- ✅ Table shows:
  - User name
  - Email
  - Role
  - Verification status
  - Action buttons

#### Test Case 7.3: Verify User

**Steps:**
1. Find an unverified user in the table
2. Click the verify button (checkmark icon)

**Expected Result:**
- ✅ User verified successfully
- ✅ Badge changes from "Pending" to "Verified"
- ✅ Table updates automatically

#### Test Case 7.4: Suspend User

**Steps:**
1. Find an active user
2. Click suspend button

**Expected Result:**
- ✅ User suspended
- ✅ Badge changes to "Suspended"
- ✅ User cannot login

#### Test Case 7.5: Suspended User Login Attempt

**Steps:**
1. Admin suspends a user
2. User tries to login

**Expected Result:**
- ❌ Error: "Your account has been suspended. Please contact support."
- ❌ Cannot access the system

---

### 8️⃣ Authentication & Authorization

#### Test Case 8.1: Token Expiration

**Steps:**
1. Login as user
2. Manually modify token expiration in JWT
3. Try to access protected route

**Expected Result:**
- ❌ Error: "Token expired, please login again"
- ✅ Redirected to login page
- ✅ Token cleared from localStorage

#### Test Case 8.2: Invalid Token

**Steps:**
1. Manually change JWT token in localStorage to invalid value
2. Try to access protected route

**Expected Result:**
- ❌ Error: "Invalid token"
- ✅ Redirected to login page
- ✅ Token cleared

#### Test Case 8.3: No Role Selected Access

**Steps:**
1. Create new user
2. Don't select role
3. Try to access dashboard directly via URL

**Expected Result:**
- ✅ Redirected to `/select-role`
- ✅ Cannot access dashboards without role

---

### 9️⃣ Security Tests

#### Test Case 9.1: XSS Prevention

**Steps:**
1. Try to register with name: `<script>alert('XSS')</script>`
2. Submit form

**Expected Result:**
- ✅ Script tags escaped/sanitized
- ✅ No script execution
- ✅ Safe string stored in database

#### Test Case 9.2: SQL Injection Prevention

**Steps:**
1. Try to login with email: `' OR '1'='1`
2. Submit

**Expected Result:**
- ❌ Login fails
- ✅ No database manipulation
- ✅ Input treated as literal string

#### Test Case 9.3: Rate Limiting

**Steps:**
1. Attempt to login 6 times rapidly (within 15 minutes)

**Expected Result:**
- ❌ After 5 attempts: "Too many authentication attempts, please try again later"
- ✅ Further requests blocked for 15 minutes

---

### 🔟 Logout Flow

#### Test Case 10.1: User Logout

**Steps:**
1. Login as user
2. Click "Logout" button in header

**Expected Result:**
- ✅ User logged out
- ✅ Token removed from localStorage
- ✅ User data cleared
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes

#### Test Case 10.2: Admin Logout

**Steps:**
1. Login as admin
2. Click "Logout" button

**Expected Result:**
- ✅ Admin logged out
- ✅ Admin token removed
- ✅ Redirected to `/admin/login`

---

## API Testing with Postman/curl

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "Test@123456",
    "location": "New York, NY"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    ...
  },
  "requiresRoleSelection": true
}
```

### Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "Test@123456"
  }'
```

### Test Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Admin Login

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin@foodbridge.com",
    "password": "Admin@FoodBridge2026"
  }'
```

### Test Get All Users (Admin)

```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Automated Testing Checklist

### ✅ Authentication Tests
- [ ] User registration with valid data
- [ ] User registration with invalid data
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Admin login with correct credentials
- [ ] Admin login with incorrect credentials
- [ ] Token generation
- [ ] Token validation
- [ ] Token expiration

### ✅ Authorization Tests
- [ ] Role-based access control
- [ ] Dashboard access restrictions
- [ ] Admin-only routes protection
- [ ] Profile access
- [ ] Role switching permissions

### ✅ User Management Tests
- [ ] View profile
- [ ] Update profile
- [ ] Change role
- [ ] View statistics

### ✅ Admin Functions Tests
- [ ] View all users
- [ ] Verify users
- [ ] Suspend users
- [ ] View platform statistics
- [ ] User search and filtering

### ✅ Security Tests
- [ ] Password hashing
- [ ] JWT validation
- [ ] Rate limiting
- [ ] XSS prevention
- [ ] Input validation
- [ ] Admin account lockout

### ✅ UI/UX Tests
- [ ] Responsive design
- [ ] Role-specific themes
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications
- [ ] Form validation feedback

---

## Performance Testing

### Load Testing Scenarios

1. **Concurrent Logins**: 100 users logging in simultaneously
2. **Role Selection**: 50 users selecting roles at once
3. **Admin Operations**: Admin querying 1000+ users
4. **Profile Updates**: Multiple profile updates per second

### Performance Benchmarks

| Operation | Target Time | Acceptable Time |
|-----------|-------------|-----------------|
| User Login | < 200ms | < 500ms |
| User Registration | < 300ms | < 800ms |
| Dashboard Load | < 100ms | < 300ms |
| Profile Update | < 250ms | < 600ms |
| Admin User List | < 400ms | < 1000ms |

---

## Bug Reporting Template

```markdown
## Bug Report

**Title**: [Brief description]

**Environment**:
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Node Version: 
- MongoDB Version:

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[If applicable]

**Error Messages**:
```
[Paste error from console/logs]
```

**Priority**: High/Medium/Low
```

---

## Testing Database

### Create Test Users

Run this in MongoDB shell:

```javascript
use foodbridge

// Create test donor
db.users.insertOne({
  name: "Test Donor",
  email: "donor@test.com",
  phone: "+1111111111",
  password: "$2a$12$encrypted_password_here",
  role: "donor",
  location: "Test City",
  isVerified: false,
  isSuspended: false,
  createdAt: new Date()
})

// Create test receiver
db.users.insertOne({
  name: "Test Receiver",
  email: "receiver@test.com",
  phone: "+2222222222",
  password: "$2a$12$encrypted_password_here",
  role: "receiver",
  location: "Test City",
  isVerified: true,
  isSuspended: false,
  createdAt: new Date()
})

// Create test volunteer
db.users.insertOne({
  name: "Test Volunteer",
  email: "volunteer@test.com",
  phone: "+3333333333",
  password: "$2a$12$encrypted_password_here",
  role: "volunteer",
  location: "Test City",
  isVerified: true,
  isSuspended: false,
  createdAt: new Date()
})
```

### Clear Test Data

```javascript
// Clear all users
db.users.deleteMany({})

// Clear all admins
db.admins.deleteMany({})
```

---

## Test Results Documentation

After testing, document:

1. ✅ **Passed Tests**: List all successful test cases
2. ❌ **Failed Tests**: Document failures with screenshots
3. 🐛 **Bugs Found**: Create detailed bug reports
4. 📊 **Performance Results**: Document response times
5. 💡 **Improvements**: Suggest enhancements

---

**Happy Testing! 🧪**
