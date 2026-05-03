import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "job_board_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t) => {
    setTokenState(t);
    if (t) localStorage.setItem(STORAGE_KEY, t);
    else localStorage.removeItem(STORAGE_KEY);
    setAuthToken(t || null);
  }, []);

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setToken]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isRecruiter: user?.role === "recruiter",
      isSeeker: user?.role === "seeker",
    }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
