import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { financeData } from "@/data/mockData";
import { useFinanceData } from "@/hooks/useSupabaseData";

const FinanceChart = () => {
  const { data: supabaseFinance } = useFinanceData();
  const chartData = supabaseFinance?.monthly?.length ? supabaseFinance.monthly : financeData.monthly;
  return (
    <div className="chart-container">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">Бюджет: план / факт (тыс. ₽)</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }}
            axisLine={{ stroke: "hsl(220 14% 20%)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v / 1000}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220 18% 13%)",
              border: "1px solid hsl(220 14% 20%)",
              borderRadius: "8px",
              color: "hsl(40 10% 92%)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value.toLocaleString("ru-RU")} тыс. ₽`]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "hsl(220 10% 55%)" }}
          />
          <Bar
            dataKey="plan"
            name="План"
            fill="hsl(220 14% 25%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="fact"
            name="Факт"
            fill="hsl(38 92% 50%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
