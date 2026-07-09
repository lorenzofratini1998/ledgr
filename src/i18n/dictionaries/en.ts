export const en = {
  auth: {
    login: {
      title: "Welcome back",
      description: "Login with your email or social accounts",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Password",
      forgotPassword: "Forgot your password?",
      submit: "Login",
      submitting: "Logging in...",
      noAccount: "Don't have an account?",
      switchToSignUp: "Sign up",
      errors: {
        invalidEmail: "Please enter a valid email address.",
        passwordRequired: "Password is required."
      }
    },
    register: {
      title: "Create an account",
      description: "Sign up with your email or social accounts",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      optional: "(Optional)",
      firstNamePlaceholder: "Jane",
      lastNamePlaceholder: "Doe",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      submit: "Sign Up",
      submitting: "Signing up...",
      hasAccount: "Already have an account?",
      switchToLogin: "Login",
      errors: {
        invalidEmail: "Please enter a valid email address.",
        passwordMin: "Password must be at least 8 characters long.",
        passwordUppercase: "Password must contain at least 1 uppercase letter.",
        passwordNumber: "Password must contain at least 1 number.",
        passwordSpecial: "Password must contain at least 1 special character.",
        passwordMismatch: "Passwords do not match."
      }
    },
    forgotPassword: {
      title: "Reset password",
      description: "Enter your email to receive a password reset link",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      submit: "Send reset link",
      submitting: "Sending...",
      successMessage: "If an account exists with this email, a password reset link has been sent.",
      backToLogin: "Back to login",
      errors: {
        invalidEmail: "Please enter a valid email address."
      }
    },
    updatePassword: {
      title: "Update password",
      description: "Enter your new password below",
      passwordLabel: "New Password",
      confirmPasswordLabel: "Confirm New Password",
      submit: "Update password",
      submitting: "Updating...",
      errors: {
        passwordMin: "Password must be at least 8 characters long.",
        passwordUppercase: "Password must contain at least 1 uppercase letter.",
        passwordNumber: "Password must contain at least 1 number.",
        passwordSpecial: "Password must contain at least 1 special character.",
        passwordMismatch: "Passwords do not match."
      }
    },
    social: {
      apple: "Apple",
      google: "Google",
      github: "GitHub",
      orContinueWith: "Or continue with"
    },
    terms: {
      agreement: "By clicking continue, you agree to our",
      tos: "Terms of Service",
      and: "and",
      privacy: "Privacy Policy"
    }
  }
};

export type Dictionary = typeof en;
