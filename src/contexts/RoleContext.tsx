import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "director" | "project_manager" | "foreman" | "supply";

export const ROLE_LABELS: Record<UserRole, string> = {
  director: "Директор",
  project_manager: "Руководитель проекта",
  foreman: "Прораб",
  supply: "Снабженец",
};

/** Pages each role can access */
export const ROLE_PAGES: Record<UserRole, string[]> = {
  director: ["/", "/budget", "/schedule", "/workers", "/progress", "/materials", "/safety", "/foreman"],
  project_manager: ["/", "/budget", "/schedule", "/workers", "/progress", "/materials", "/safety", "/foreman"],
  foreman: ["/foreman"],
  supply: ["/materials"],
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (path: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("director");

  const canAccess = (path: string) => ROLE_PAGES[role].includes(path);

  return (
    <RoleContext.Provider value={{ role, setRole, canAccess }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
