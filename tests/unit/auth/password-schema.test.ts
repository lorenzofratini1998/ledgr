import {describe, expect, it} from 'vitest';
import {getRegisterSchema} from '@/features/auth/schemas';
import {en} from '@/i18n/dictionaries/en';

describe('Password Validation Schema (AC-2)', () => {
  const schema = getRegisterSchema(en.auth.register.errors);

  const testData = {
    email: 'test@example.com',
  };

  it('should pass with a valid password matching all criteria', () => {
    const validData = {
      ...testData,
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
    };
    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if password is less than 8 characters', () => {
    const invalidData = {
      ...testData,
      password: 'Short1!',
      confirmPassword: 'Short1!',
    };
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.find(e => e.path.includes('password'))?.message;
      expect(errorMsg).toBe(en.auth.register.errors.passwordMin);
    }
  });

  it('should fail if password has no uppercase letter', () => {
    const invalidData = {
      ...testData,
      password: 'nouppercase123!',
      confirmPassword: 'nouppercase123!',
    };
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.find(e => e.path.includes('password'))?.message;
      expect(errorMsg).toBe(en.auth.register.errors.passwordUppercase);
    }
  });

  it('should fail if password has no number', () => {
    const invalidData = {
      ...testData,
      password: 'NoNumberHere!',
      confirmPassword: 'NoNumberHere!',
    };
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.find(e => e.path.includes('password'))?.message;
      expect(errorMsg).toBe(en.auth.register.errors.passwordNumber);
    }
  });

  it('should fail if password has no special character', () => {
    const invalidData = {
      ...testData,
      password: 'NoSpecialChar123',
      confirmPassword: 'NoSpecialChar123',
    };
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.find(e => e.path.includes('password'))?.message;
      expect(errorMsg).toBe(en.auth.register.errors.passwordSpecial);
    }
  });

  it('should fail if passwords do not match', () => {
    const invalidData = {
      ...testData,
      password: 'ValidPassword123!',
      confirmPassword: 'DifferentPassword123!',
    };
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.find(e => e.path.includes('confirmPassword'))?.message;
      expect(errorMsg).toBe(en.auth.register.errors.passwordMismatch);
    }
  });
});
