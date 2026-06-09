import { financeData } from "@/data/mockData";
import { useFinanceData } from "@/hooks/useSupabaseData";

const BudgetBreakdown = () => {
  const { data: supabaseFinance } = useFinanceData();
  const categories = supabaseFinance?.categories?.length ? supabaseFinance.categories : financeData.categories;
  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Структура расходов</h3>
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between text-sm">
              <span>{cat.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {(cat.amount / 1_000_000).toFixed(1)} млн ₽
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percent}%`,
                    background: `hsl(38 92% ${50 - (idx * 8)}%)`,
                  }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                {cat.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetBreakdown;
