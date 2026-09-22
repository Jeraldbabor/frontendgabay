"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@gabay/types";
import { api, ApiClientError } from "@/shared/lib/api-client";
type AuthState = {
  user: SessionUser | null;
  loading: boolean;
  error: string;
  accept: (user: SessionUser) => void;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);
async function fetchSession() {
  try {
    return await api.get<SessionUser>("/auth/me");
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
    return (await api.post<{ user: SessionUser }>("/auth/refresh")).user;
  }
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const reload = useCallback(async () => {
    try {
      let account: SessionUser;
      try {
        account = await api.get<SessionUser>("/auth/me");
      } catch (e) {
        if (!(e instanceof ApiClientError) || e.status !== 401) throw e;
        const refreshed = await api.post<{ user: SessionUser }>(
          "/auth/refresh",
        );
        account = refreshed.user;
      }
      setUser(account);
      setError("");
    } catch (e) {
      setUser(null);
      if (!(e instanceof ApiClientError) || e.status !== 401)
        setError(e instanceof Error ? e.message : "Connection unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    fetchSession()
      .then((account) => {
        if (active) {
          setUser(account);
          setError("");
        }
      })
      .catch((error) => {
        if (
          active &&
          (!(error instanceof ApiClientError) || error.status !== 401)
        )
          setError(
            error instanceof Error ? error.message : "Connection unavailable.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const accept = (account: SessionUser) => {
    setUser(account);
    setLoading(false);
    setError("");
  };
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    router.replace("/login");
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, error, accept, reload, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is required");
  return context;
}
export function AuthGate({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user && !error) router.replace("/login");
  }, [loading, user, error, router]);
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Opening GABAY…
      </div>
    );
  if (error)
    return (
      <div className="grid min-h-screen place-items-center p-8">
        <div className="panel max-w-md p-8">
          <h1 className="text-xl font-semibold">Let’s reconnect</h1>
          <p className="my-4 text-sm text-muted-foreground">{error}</p>
          <button
            className="text-primary underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  if (!user) return null;
  if (admin && user.role !== "ADMIN")
    return <div className="p-10">Administrator access is required.</div>;
  return children;
}
