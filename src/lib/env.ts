// Centralised, lazily-validated access to required environment variables.
// Getters throw only when accessed without a value, so `next build` (which may
// import modules without runtime env) does not fail at module load.

export type RegistrationMode = 'invite' | 'open';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get databaseUrl(): string {
    return required('DATABASE_URL');
  },
  get authSecret(): string {
    return required('AUTH_SECRET');
  },
  get encryptionKey(): string {
    return required('APP_ENCRYPTION_KEY');
  },
  get registrationMode(): RegistrationMode {
    return process.env.REGISTRATION_MODE === 'open' ? 'open' : 'invite';
  },
};
