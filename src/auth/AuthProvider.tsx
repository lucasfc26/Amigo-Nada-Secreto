import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { accountError, loginEmail, normalizeLogin, translateError } from "../lib/account.ts";
import { supabase, supabaseConfigured } from "../lib/supabase.ts";
import { AuthContext, type Profile } from "./useAuth.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [storedProfile, setStoredProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const profile = storedProfile?.id === userId ? storedProfile : null;

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUserId(data.session?.user.id ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !userId) return;

    let active = true;
    void supabase
      .from("sort_profiles")
      .select("id, login")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setStoredProfile({ id: data.id, login: data.login });
          return;
        }
        setStoredProfile({ id: userId, login: "você" });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(async (login: string, password: string) => {
    const invalid = accountError({ login, password });
    if (invalid) return invalid;
    if (!supabase) return "Configure o Supabase no arquivo .env antes de entrar.";

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail(login),
      password,
    });
    return error ? translateError(error.message) : null;
  }, []);

  const signUp = useCallback(async (login: string, password: string, confirm: string) => {
    const invalid = accountError({ login, password, confirm });
    if (invalid) return invalid;
    if (!supabase) return "Configure o Supabase no arquivo .env antes de criar a conta.";

    const normalized = normalizeLogin(login);
    const { data, error } = await supabase.auth.signUp({
      email: loginEmail(normalized),
      password,
      options: { data: { login: normalized } },
    });
    if (error) return translateError(error.message);
    if (!data.session) {
      return "Conta criada, mas o Supabase ainda pede confirmação de e-mail. Desative Confirm email no projeto para entrar só com login e senha.";
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      configured: supabaseConfigured,
      loading,
      profile,
      signIn,
      signUp,
      signOut,
    }),
    [loading, profile, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
