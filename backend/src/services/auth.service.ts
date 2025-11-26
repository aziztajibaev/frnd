import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config/env';

const SALT_ROUNDS = 10;

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  roleNames?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  /**
   * Verify a JWT token
   */
  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwtSecret as jwt.Secret) as JWTPayload;
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Get role IDs for the specified roles (default to USER role)
    const roleNames = data.roleNames || ['USER'];
    const roles = await prisma.role.findMany({
      where: {
        name: {
          in: roleNames,
        },
      },
    });

    if (roles.length === 0) {
      throw new Error('Invalid roles specified');
    }

    // Create user with roles
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        userRoles: {
          create: roles.map((role: { id: number }) => ({
            roleId: role.id,
          })),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Extract role names for the response and token
    const userRoleNames = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      roles: userRoleNames,
    });

    // Format user response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoleNames,
      createdAt: user.createdAt,
    };

    return { user: userResponse, token };
  }

  /**
   * Login a user
   */
  static async login(data: LoginData) {
    // Find user by email with roles
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Extract role names
    const userRoleNames = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      roles: userRoleNames,
    });

    // Return user without password
    const { password: _, userRoles: __, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        roles: userRoleNames,
      },
      token,
    };
  }

  /**
   * Get user by ID (without password)
   */
  static async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Extract role names
    const userRoleNames = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);

    // Return user with roles
    const { userRoles: _, ...userWithoutUserRoles } = user;

    return {
      ...userWithoutUserRoles,
      roles: userRoleNames,
    };
  }
}
