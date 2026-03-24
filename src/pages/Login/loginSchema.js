import * as Yup from 'yup';
import { normalizeEmail } from '@shared/lib/auth/clearAuthState';

export const EMAIL_MAX_LENGTH = 100;

// Allow internationalized email addresses, including accented characters.
const unicodeEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => normalizeEmail(value))
    .matches(unicodeEmailRegex, 'Please enter a valid email')
    .max(
      EMAIL_MAX_LENGTH,
      `Email must not exceed ${EMAIL_MAX_LENGTH} characters`
    )
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});
