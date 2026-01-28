import { z } from 'zod';

export function requireIntParam(value: string | undefined, name: string): number {
  if (!value) {
    throw new ValidationError(`Missing required parameter: ${name}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new ValidationError(`Invalid ${name}: must be a positive integer`);
  }
  return parsed;
}

export function parseQueryInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return parsed;
}

export function parsePositiveInt(value: string | undefined, name: string, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new ValidationError(`Invalid ${name}: must be a positive integer`);
  }
  return parsed;
}

// Import after definition to avoid circular dependency
import { ValidationError } from '../errors/index.js';
