import { createContext, useContext } from "react";

export type Profile = {
  id: string;
  login: string;
};

export type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  profile: Profile | null;
  signIn: (login: string, password: string) => Promise<string | null>;
  signUp: (login: string, password: string, confirm: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth precisa ficar dentro do AuthProvider.");
  return value;
}
