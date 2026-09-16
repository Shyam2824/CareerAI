"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import  api  from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CHECK AUTH
  // ============================================================

  const checkAuth = async (): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    // ----------------------------------------------------------
    // No token = logged out
    // ----------------------------------------------------------

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Keep token keys synchronized
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);

      // --------------------------------------------------------
      // Verify JWT with backend
      // --------------------------------------------------------

      const response = await api.get<User>("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // --------------------------------------------------------
      // Valid token
      // --------------------------------------------------------

      setUser(response.data);
    } catch (error: unknown) {
      console.error("Authentication failed:", error);

      // --------------------------------------------------------
      // Invalid / expired token
      // --------------------------------------------------------

      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL AUTH CHECK
  // ============================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (token: string): Promise<void> => {
    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    // Save token
    localStorage.setItem("token", token);
    localStorage.setItem("access_token", token);
    localStorage.setItem("token_type", "bearer");

    // Verify token + load user
    await checkAuth();
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
    }

    setUser(null);
    setLoading(false);
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}