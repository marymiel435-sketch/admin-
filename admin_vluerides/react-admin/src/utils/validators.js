// Mirrors lib/core/utils/validators.dart
const EMAIL_RE = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const SPECIAL_CHAR_RE = /[!@#$&*~%^()_+=\-{}[\]|:;<>?,./]/;
const PH_PHONE_RE = /^(\+63|0)(9\d{9})$/;

export function emailValidator(value) {
  if (!value || value.trim() === '') return 'Email is required';
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
  return null;
}

export function passwordValidator(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
  if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
  if (!/[0-9]/.test(value)) return 'Must contain at least one number';
  if (!SPECIAL_CHAR_RE.test(value)) return 'Must contain at least one special character';
  return null;
}

export function confirmPasswordValidator(value, password) {
  if (!value) return 'Please confirm your password';
  if (value !== password) return 'Passwords do not match';
  return null;
}

export function required(value, fieldName = 'This field') {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
}

export function philippinePhoneValidator(value) {
  if (!value || value.trim() === '') return 'Phone number is required';
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (!PH_PHONE_RE.test(cleaned)) return 'Enter a valid Philippine phone number (e.g., 09XXXXXXXXX)';
  return null;
}

export function licenseNumberValidator(value) {
  if (!value || value.trim() === '') return "Driver's license number is required";
  if (value.trim().length < 5) return 'Enter a valid license number';
  return null;
}

export function plateNumberValidator(value) {
  if (!value || value.trim() === '') return 'Plate number is required';
  return null;
}

export function storeNameValidator(value) {
  if (!value || value.trim() === '') return 'Store name is required';
  if (value.trim().length < 2) return 'Store name is too short';
  return null;
}
