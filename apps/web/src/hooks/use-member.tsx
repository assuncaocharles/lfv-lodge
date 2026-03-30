"use client";

import { createContext, useContext } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface MemberInfo {
  grau: "1" | "2" | "3";
  role: string;
  profileId: string | null;
  isAdmin: boolean;
}

interface MemberContextValue {
  user: User;
  member: MemberInfo;
}

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({
  user,
  member,
  children,
}: MemberContextValue & { children: React.ReactNode }) {
  return (
    <MemberContext.Provider value={{ user, member }}>
      {children}
    </MemberContext.Provider>
  );
}

/**
 * Access the authenticated user and member info from any client component.
 * Must be used inside the (app) layout which provides the MemberProvider.
 */
export function useMember(): MemberContextValue {
  const ctx = useContext(MemberContext);
  if (!ctx) {
    throw new Error("useMember must be used inside MemberProvider");
  }
  return ctx;
}
