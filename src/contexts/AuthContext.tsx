import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AuthUser, getMe, loginUser, registerUser, loginWithGoogle } from "@/lib/api";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_TOKEN = "authToken";
const STORAGE_USER = "authUser";

function getStorageValue(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeParseUser(value: string | null): AuthUser | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => safeParseUser(getStorageValue(STORAGE_USER)));
  const [token, setToken] = useState<string | null>(() => getStorageValue(STORAGE_TOKEN));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function validate() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getMe(token);
        if (!active) return;
        setUser(data);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_USER, JSON.stringify(data));
        }
      } catch {
        if (!active) return;
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_TOKEN);
          localStorage.removeItem(STORAGE_USER);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    validate();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const { user: data, token: newToken } = await loginUser({ email, password });
    setUser(data);
    setToken(newToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_TOKEN, newToken);
      localStorage.setItem(STORAGE_USER, JSON.stringify(data));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: data, token: newToken } = await registerUser({ name, email, password });
    setUser(data);
    setToken(newToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_TOKEN, newToken);
      localStorage.setItem(STORAGE_USER, JSON.stringify(data));
    }
  };

  const loginWithGoogleCredential = async (credential: string) => {
    const { user: data, token: newToken } = await loginWithGoogle(credential);
    setUser(data);
    setToken(newToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_TOKEN, newToken);
      localStorage.setItem(STORAGE_USER, JSON.stringify(data));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, loading, login, register, loginWithGoogleCredential, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
