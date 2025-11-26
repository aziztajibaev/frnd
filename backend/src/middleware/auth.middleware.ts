import { Request, Response, NextFunction } from 'express';
import { AuthService, JWTPayload } from '../services/auth.service';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header or cookies
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookie
    let token: string | undefined;

    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookies (fallback)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
        return;
      }
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
        });
        return;
      }
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has at least one of the allowed roles
    const hasRequiredRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const payload = AuthService.verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (_error) {
    // Silently fail for optional auth
    next();
  }
};
