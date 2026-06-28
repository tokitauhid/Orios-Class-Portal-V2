"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check active session on mount
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch role from profile table
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: profile.role,
            });
          } else {
            // Logged in but not an authorized admin
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch role from profile table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: profile.role,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error.message);
      return { success: false, error: error.message };
    }

    if (data?.user) {
      // Fetch role
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileErr || !profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
        console.error("Profile check failed:", profileErr, profile);
        // Sign out immediately so they aren't half-logged in
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: `Access denied. ${profileErr ? profileErr.message : "You do not have administrator permissions in the profiles table."}` 
        };
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
      });
      return { success: true };
    }

    return { success: false, error: "Unknown error occurred" };
  }

  async function logout() {
    await supabase.auth.signOut();
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
