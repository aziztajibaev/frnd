import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../types';
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
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
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
router.get('/', authenticate, authorize(Role.ADMIN), async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { users },
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
  authorize(Role.MODERATOR, Role.ADMIN),
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
