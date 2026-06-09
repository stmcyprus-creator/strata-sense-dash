import { useRole, ROLE_LABELS, UserRole } from "@/contexts/RoleContext";
import { Shield } from "lucide-react";

const roles: UserRole[] = ["director", "project_manager", "foreman", "supply"];

const RoleSwitcher = () => {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-muted-foreground" />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="rounded-lg border border-border bg-secondary/50 px-2 py-1 text-xs font-medium text-foreground focus:border-primary/40 focus:outline-none"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSwitcher;
