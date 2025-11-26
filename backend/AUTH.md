# Authentication & Authorization Guide

This backend uses **JWT (JSON Web Tokens)** for secure, stateless authentication, designed to work seamlessly with Angular frontends.

## 🔐 Overview

- **JWT-based authentication** - Stateless and scalable
- **bcrypt password hashing** - Secure password storage (10 salt rounds)
- **Role-based access control (RBAC)** - USER, MODERATOR, ADMIN
- **HTTP-only cookies + Bearer tokens** - Dual token storage options
- **CORS enabled** - Ready for Angular integration

## 📋 Environment Setup

Add these variables to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration (Angular frontend URL)
CORS_ORIGIN=http://localhost:4200
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

## 🎯 Angular Integration

### 1. Create Auth Service

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface User {
  id: number;
  email: string;
  name?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  register(email: string, password: string, name?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      email,
      password,
      name
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('token');
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.getMe().subscribe();
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }
}
```

### 2. Create HTTP Interceptor

```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Add Authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 3. Register in app.config.ts

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
};
```

### 4. Create Route Guard

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check for required roles
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && !this.authService.hasRole(requiredRoles)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
```

### 5. Use in Routes

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'moderator',
    component: ModeratorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MODERATOR', 'ADMIN'] }
  }
];
```

### 6. Login Component Example

```typescript
// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <form (submit)="onSubmit()">
      <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required>
      <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
      <p *ngIf="error" class="error">{{ error }}</p>
    </form>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.error = err.error.message || 'Login failed'
    });
  }
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
- Configured for specific origin (Angular dev server)
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

## 🚀 Next Steps

1. **Add refresh tokens** - Implement token refresh mechanism
2. **Email verification** - Add email confirmation on registration
3. **Password reset** - Implement forgot password flow
4. **Rate limiting** - Add rate limits to auth endpoints
5. **2FA** - Two-factor authentication support
6. **OAuth** - Social login (Google, GitHub, etc.)
7. **Session management** - Track active sessions
8. **Audit logging** - Log authentication events

## 🔧 Troubleshooting

### CORS Issues
If you get CORS errors in Angular:
1. Check `CORS_ORIGIN` in `.env` matches your Angular URL
2. Ensure server is running on http://localhost:3000
3. Angular dev server should be on http://localhost:4200

### Token Not Working
1. Check token is being sent in `Authorization: Bearer TOKEN` header
2. Verify JWT_SECRET is the same in `.env`
3. Check token hasn't expired (default 7 days)
4. Ensure cookie-parser middleware is enabled

### 401 Unauthorized
1. Verify token is valid and not expired
2. Check user still exists in database
3. Ensure authenticate middleware is applied to route

---

**Built with:** TypeScript · Express · Prisma · bcrypt · jsonwebtoken · CORS
