"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { mockAdmins } from "@/lib/mock-data";

const AdminAuthContext = createContext(null);

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export function getAdminsDb() {
  if (typeof window === "undefined") return mockAdmins;
  const stored = localStorage.getItem("orios_admins_db");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return mockAdmins;
    }
  }
  localStorage.setItem("orios_admins_db", JSON.stringify(mockAdmins));
  return mockAdmins;
}

export function saveAdminsDb(admins) {
  if (typeof window !== "undefined") {
    localStorage.setItem("orios_admins_db", JSON.stringify(admins));
  }
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session cookies on mount
    const email = getCookie("orios_session_email");
    const role = getCookie("orios_session_role");
    if (email && role) {
      setUser({ email, role });
    }
    setIsLoading(false);
  }, []);

  function login(email, password) {
    const db = getAdminsDb();
    const found = db.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (found) {
      document.cookie = `orios_session_email=${found.email}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `orios_session_role=${found.role}; path=/; max-age=86400; SameSite=Lax`;
      setUser({ email: found.email, role: found.role });
      return true;
    }
    return false;
  }

  function logout() {
    document.cookie = "orios_session_email=; path=/; max-age=0";
    document.cookie = "orios_session_role=; path=/; max-age=0";
    setUser(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

