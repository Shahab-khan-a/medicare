/**
 * Small composable validators for forms. Each returns an error message,
 * or `undefined` when the value is valid — pass the result straight to
 * `<InputField error={...} />`.
 *
 *   const emailError = validate(email, [required('Email'), email()]);
 */
export type Validator = (value: string) => string | undefined;

export const required =
  (label = 'This field'): Validator =>
  (value) =>
    value.trim().length === 0 ? `${label} is required` : undefined;

export const email =
  (message = 'Enter a valid email address'): Validator =>
  (value) =>
    value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? undefined : message;

export const phone =
  (message = 'Enter a valid phone number'): Validator =>
  (value) => {
    const digits = value.replace(/\D/g, '');
    return value.length === 0 || (digits.length >= 10 && digits.length <= 15) ? undefined : message;
  };

export const minLength =
  (min: number, message?: string): Validator =>
  (value) =>
    value.length === 0 || value.length >= min
      ? undefined
      : message ?? `Must be at least ${min} characters`;

export const matches =
  (other: string, message = 'Values do not match'): Validator =>
  (value) =>
    value.length === 0 || value === other ? undefined : message;

export const validate = (value: string, validators: Validator[]): string | undefined => {
  for (const check of validators) {
    const error = check(value);
    if (error) return error;
  }
  return undefined;
};
