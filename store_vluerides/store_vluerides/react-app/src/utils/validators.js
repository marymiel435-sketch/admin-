export const Validators = {
  required(value, field = 'This field') {
    if (value == null || value.trim() === '') return `${field} is required`;
    return null;
  },

  email(value) {
    if (value == null || value.trim() === '') return 'Email is required';
    const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!regex.test(value.trim())) return 'Enter a valid email';
    return null;
  },

  password(value) {
    if (value == null || value === '') return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  phone(value) {
    if (value == null || value.trim() === '') return 'Phone number is required';
    const regex = /^[0-9+\-\s()]{7,15}$/;
    if (!regex.test(value.trim())) return 'Enter a valid phone number';
    return null;
  },

  price(value) {
    if (value == null || value.trim() === '') return 'Price is required';
    const parsed = Number.parseFloat(value.trim());
    if (Number.isNaN(parsed)) return 'Enter a valid number';
    if (parsed < 0) return 'Price cannot be negative';
    return null;
  },

  optionalPrice(value) {
    if (value == null || value.trim() === '') return null;
    const parsed = Number.parseFloat(value.trim());
    if (Number.isNaN(parsed)) return 'Enter a valid number';
    if (parsed < 0) return 'Price cannot be negative';
    return null;
  },

  optionalPositiveInt(value) {
    if (value == null || value.trim() === '') return null;
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isNaN(parsed)) return 'Enter a whole number';
    if (parsed <= 0) return 'Must be greater than 0';
    return null;
  },
};
