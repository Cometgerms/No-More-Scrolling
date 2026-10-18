/** Provider boundary for the cloud phase. No fake login or local-only identity. */
export type Account = { id: string; email?: string };
export type AuthSession = { account: Account; expiresAt: number };
export interface AuthGateway {
  getSession(): Promise<AuthSession | null>;
  signInWithGoogle(redirectUrl: string): Promise<void>;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  onSessionChange(listener: (session: AuthSession | null) => void): () => void;
}
// Implement with Supabase Auth after configuring the project and allowed site URLs.
// API keys for the assistant are device/session settings, never account profile data.
