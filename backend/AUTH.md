# Authentication & Authorization Guide

This backend implements JWT (JSON Web Tokens) authentication with bcrypt password hashing, designed for seamless integration with modern frontend frameworks.

## Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Security Features](#security-features)
- [Middleware Usage](#middleware-usage)
- [Testing with cURL](#testing-with-curl)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)
- [Implementation Notes](#implementation-notes)

## Overview

The authentication system provides:

- **JWT-based authentication** - Stateless and scalable token management
- **bcrypt password hashing** - Industry-standard password security (10 salt rounds)
- **Role-based access control (RBAC)** - Three-tier permission system (USER, MODERATOR, ADMIN)
- **Dual token storage** - HTTP-only cookies and Bearer token support
- **CORS configuration** - Configurable for any frontend framework

## Environment Setup

Add these variables to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:3001
```

⚠️ **IMPORTANT**: Generate a strong JWT_SECRET for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🛣️ API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER" // Optional: USER (default), MODERATOR, ADMIN
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Protected Endpoints

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer {token}
```

#### Moderator/Admin Only Route
```http
GET /api/users/moderator-only
Authorization: Bearer {token}
```

## Frontend Integration

This API can be integrated with any frontend framework or library. Below are general guidelines and examples.

### Authentication Flow

1. **User Registration/Login**
   - Send credentials to `/api/auth/register` or `/api/auth/login`
   - Receive JWT token in response
   - Store token securely (localStorage, sessionStorage, or use HTTP-only cookies)

2. **Authenticated Requests**
   - Include token in `Authorization` header: `Bearer <token>`
   - Server validates token and authorizes request
   - On 401 response, redirect to login

3. **Logout**
   - Clear stored token
   - Optionally call `/api/auth/logout` to clear HTTP-only cookie

### JavaScript/Fetch Example

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include cookies
  });

  const data = await response.json();

  if (data.success) {
    // Store token in localStorage
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
}

// Make authenticated request
async function fetchProtectedData() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login';
    return;
  }

  return await response.json();
}

// Logout function
async function logout() {
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### Axios Example

```javascript
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage
async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.data.token);
  return data.data.user;
}

async function getProfile() {
  const { data } = await api.get('/auth/me');
  return data.data.user;
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return { user, loading, login, logout };
}
```

## 🔒 Security Features

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Minimum 6 characters required
- Never stored in plain text

### Token Security
- JWT signed with secret key
- 7-day expiration (configurable)
- Includes userId, email, and role in payload
- Tokens sent via both HTTP-only cookies and response body

### CORS Protection
- Configured for specific origin (frontend application)
- Credentials enabled for cookie support
- Easily configurable via environment variables

### Request Validation
- Email format validation
- Password strength requirements
- Duplicate email prevention

## 🛡️ Middleware Usage

### Protect Routes (Authentication)
```typescript
import { authenticate } from '../middleware/auth.middleware';

router.get('/protected', authenticate, (req, res) => {
  // req.user contains: { userId, email, role }
  res.json({ user: req.user });
});
```

### Role-Based Access (Authorization)
```typescript
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

// Single role
router.get('/admin-only', authenticate, authorize(Role.ADMIN), handler);

// Multiple roles
router.get('/staff-only', authenticate, authorize(Role.MODERATOR, Role.ADMIN), handler);
```

### Optional Authentication
```typescript
import { optionalAuth } from '../middleware/auth.middleware';

router.get('/public-but-enhanced', optionalAuth, (req, res) => {
  // req.user will be populated if valid token exists
  // but route is accessible without authentication
});
```

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📊 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `USER` | Default role | Access own profile, basic features |
| `MODERATOR` | Moderate content | USER permissions + content moderation |
| `ADMIN` | Full access | All permissions + user management |

## 🔧 Troubleshooting

### CORS Issues
If you get CORS errors from your frontend:
1. Check `CORS_ORIGIN` in `.env` matches your frontend URL
2. Ensure server is running on http://localhost:3000
3. Verify frontend application URL matches CORS_ORIGIN

### Token Not Working
1. Check token is being sent in `Authorization: Bearer TOKEN` header
2. Verify JWT_SECRET is the same in `.env`
3. Check token hasn't expired (default 7 days)
4. Ensure cookie-parser middleware is enabled

### 401 Unauthorized
1. Verify token is valid and not expired
2. Check user still exists in database
3. Ensure authenticate middleware is applied to route

## Production Deployment

### Security Checklist

Before deploying to production:

1. **JWT Secret**: Generate a cryptographically secure secret
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Environment Variables**: Never commit `.env` files to version control
   - Set `JWT_SECRET` on your hosting platform
   - Configure `CORS_ORIGIN` to match your production frontend URL
   - Set `NODE_ENV=production`

3. **HTTPS**: Always use HTTPS in production
   - HTTP-only cookies require `secure: true` flag (automatically enabled in production)
   - Update `CORS_ORIGIN` to use `https://` protocol

4. **Database**: Ensure database connection is secure
   - Use SSL/TLS connections
   - Restrict database access by IP
   - Use strong database credentials

### Example Production Environment

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/frnd?sslmode=require
JWT_SECRET=<64-byte-hex-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://app.example.com
```

## Implementation Notes

### Token Storage Strategy

This implementation supports two token storage methods:

1. **HTTP-only Cookies** (Recommended for web browsers)
   - More secure against XSS attacks
   - Automatically sent with requests to same origin
   - Token stored in `token` cookie

2. **localStorage/Bearer Token** (Required for mobile apps)
   - Token returned in API response body
   - Client must include in `Authorization: Bearer <token>` header
   - Necessary for React Native, mobile apps, etc.

### Password Requirements

Current implementation enforces:
- Minimum 6 characters
- Valid email format
- No duplicate emails

Consider adding additional validation for production:
- Password complexity requirements
- Email verification workflow
- Account lockout after failed attempts

### Role Assignment

User roles can be assigned during registration or modified later. To prevent unauthorized role escalation:

```typescript
// Only allow admins to assign ADMIN or MODERATOR roles
if (data.role && data.role !== Role.USER) {
  // Verify requesting user is an admin
  // This check should be added to the register endpoint
}
```

---

**Built with:** TypeScript · Express · Prisma · bcrypt · jsonwebtoken · CORS
