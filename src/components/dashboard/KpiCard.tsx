import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  accentColor?: string;
  href?: string;
}

const KpiCard = ({ title, value, subtitle, icon, trend, href }: KpiCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`kpi-card ${href ? "cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all" : ""}`}
      onClick={href ? () => navigate(href) : undefined}
      role={href ? "link" : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <div
            className={`badge-status ${
              trend.direction === "up"
                ? "bg-success/10 text-success"
                : trend.direction === "down"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend.direction === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="section-title">{title}</p>
        <p className="value-large mt-1">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
