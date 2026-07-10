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
  },
  onboarding: {
      welcome_title: "Benvenuto in Ledgr",
      welcome_subtitle: "Configuriamo le tue preferenze iniziali.",
      theme_label: "Tema",
      theme_placeholder: "Seleziona un tema",
      theme_light: "Chiaro",
      theme_dark: "Scuro",
      theme_system: "Predefinito di sistema",
      language_label: "Lingua",
      language_placeholder: "Seleziona una lingua",
      date_format_label: "Formato data",
      date_format_placeholder: "Seleziona formato data",
      currency_label: "Valuta principale",
      currency_placeholder: "Seleziona valuta",
      currency_search: "Cerca valuta...",
      currency_not_found: "Nessuna valuta trovata.",
      currency_popular: "Valute popolari",
      currency_all: "Tutte le valute",
      currency_description: "Questa è la valuta di base per tutti i calcoli del patrimonio netto e i grafici della dashboard.",
      important_title: "Importante",
      important_description_1: "La tua valuta principale è completamente immutabile e",
      important_description_bold: "non può essere modificata",
      important_description_2: ". Controlla attentamente.",
      btn_saving: "Salvataggio preferenze...",
      btn_submit: "Completa la configurazione",
      preview_net_worth: "Patrimonio Netto",
      preview_checking: "Conto Corrente",
      preview_savings: "Conto di Risparmio",
  }
};
