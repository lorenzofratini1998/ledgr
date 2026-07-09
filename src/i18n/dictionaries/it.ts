import { type Dictionary } from "./en";

export const it: Dictionary = {
  auth: {
    login: {
      title: "Bentornato",
      description: "Accedi con la tua email o i tuoi account social",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Password",
      forgotPassword: "Hai dimenticato la password?",
      submit: "Accedi",
      submitting: "Accesso in corso...",
      noAccount: "Non hai un account?",
      switchToSignUp: "Registrati",
      errors: {
        invalidEmail: "Inserisci un indirizzo email valido.",
        passwordRequired: "La password è obbligatoria."
      }
    },
    register: {
      title: "Crea un account",
      description: "Registrati con la tua email o i tuoi account social",
      firstNameLabel: "Nome",
      lastNameLabel: "Cognome",
      optional: "(Opzionale)",
      firstNamePlaceholder: "Mario",
      lastNamePlaceholder: "Rossi",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Password",
      confirmPasswordLabel: "Conferma Password",
      submit: "Registrati",
      submitting: "Registrazione in corso...",
      hasAccount: "Hai già un account?",
      switchToLogin: "Accedi",
      errors: {
        invalidEmail: "Inserisci un indirizzo email valido.",
        passwordMin: "La password deve contenere almeno 8 caratteri.",
        passwordUppercase: "La password deve contenere almeno 1 lettera maiuscola.",
        passwordNumber: "La password deve contenere almeno 1 numero.",
        passwordSpecial: "La password deve contenere almeno 1 carattere speciale.",
        passwordMismatch: "Le password non corrispondono."
      }
    },
    forgotPassword: {
      title: "Reimposta password",
      description: "Inserisci la tua email per ricevere un link di reimpostazione della password",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      submit: "Invia link",
      submitting: "Invio in corso...",
      successMessage: "Se esiste un account con questa email, ti abbiamo inviato un link di reimpostazione.",
      backToLogin: "Torna al login",
      errors: {
        invalidEmail: "Inserisci un indirizzo email valido."
      }
    },
    updatePassword: {
      title: "Aggiorna password",
      description: "Inserisci la tua nuova password qui sotto",
      passwordLabel: "Nuova Password",
      confirmPasswordLabel: "Conferma Nuova Password",
      submit: "Aggiorna password",
      submitting: "Aggiornamento in corso...",
      errors: {
        passwordMin: "La password deve contenere almeno 8 caratteri.",
        passwordUppercase: "La password deve contenere almeno 1 lettera maiuscola.",
        passwordNumber: "La password deve contenere almeno 1 numero.",
        passwordSpecial: "La password deve contenere almeno 1 carattere speciale.",
        passwordMismatch: "Le password non corrispondono."
      }
    },
    social: {
      apple: "Apple",
      google: "Google",
      github: "GitHub",
      orContinueWith: "Oppure continua con"
    },
    terms: {
      agreement: "Cliccando su continua, accetti i nostri",
      tos: "Termini di Servizio",
      and: "e la",
      privacy: "Informativa sulla Privacy"
    }
  }
};
