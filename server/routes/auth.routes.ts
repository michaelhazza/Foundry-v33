import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { sendSuccess } from '../lib/response.js';
import * as AuthService from '../services/auth.service.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './schemas/auth.schemas.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await AuthService.getCurrentUser(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await AuthService.resetPassword(token, newPassword);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', authenticate, validateBody(changePasswordSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user!.id, currentPassword, newPassword);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/verify-token
router.get('/verify-token', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader!.substring(7);
    const result = await AuthService.verifyToken(token);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/auth/logout
router.delete('/logout', authenticate, async (_req: AuthenticatedRequest, res, next) => {
  try {
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
