import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user's own profile
 * @access  Private (Any authenticated user)
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Extract role names
    const roles = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);
    const { userRoles: _, ...userWithoutUserRoles } = user;

    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutUserRoles,
          roles,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin only)
 */
router.get('/', authenticate, authorize('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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

    // Format users with roles
    const usersWithRoles = users.map((user: any) => {
      const roles = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);
      const { userRoles: _, ...userWithoutUserRoles } = user;
      return {
        ...userWithoutUserRoles,
        roles,
      };
    });

    res.json({
      success: true,
      data: { users: usersWithRoles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

/**
 * @route   GET /api/users/moderator-only
 * @desc    Example endpoint for moderators and admins
 * @access  Private (Moderator or Admin)
 */
router.get(
  '/moderator-only',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'This is a moderator/admin only route',
      data: {
        user: req.user,
      },
    });
  }
);

export default router;
