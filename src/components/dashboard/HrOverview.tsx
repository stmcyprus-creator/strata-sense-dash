import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { hrData } from "@/data/mockData";
import { Users, UserCheck, TrendingDown } from "lucide-react";
import { useHrData } from "@/hooks/useSupabaseData";

const HrOverview = () => {
  const { data: supabaseHr } = useHrData();
  const total = supabaseHr?.total ?? hrData.total;
  const onSite = supabaseHr?.onSite ?? hrData.onSite;
  const attendance = supabaseHr?.attendance?.length ? supabaseHr.attendance : hrData.attendance;
  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Персонал</h3>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <Users className="mx-auto mb-1 h-4 w-4 text-info" />
          <p className="font-mono text-lg font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground">Всего</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <UserCheck className="mx-auto mb-1 h-4 w-4 text-success" />
          <p className="font-mono text-lg font-bold">{onSite}</p>
          <p className="text-[10px] text-muted-foreground">На объекте</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <TrendingDown className="mx-auto mb-1 h-4 w-4 text-warning" />
          <p className="font-mono text-lg font-bold">{hrData.turnoverRate}%</p>
          <p className="text-[10px] text-muted-foreground">Текучесть</p>
        </div>
      </div>

      <p className="section-title mb-2">Посещаемость за неделю</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={attendance} barCategoryGap="15%">
          <XAxis
            dataKey="day"
            tick={{ fill: "hsl(220 10% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220 18% 13%)",
              border: "1px solid hsl(220 14% 20%)",
              borderRadius: "8px",
              color: "hsl(40 10% 92%)",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="present"
            name="Присутствуют"
            stackId="a"
            fill="hsl(142 71% 45%)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="absent"
            name="Отсутствуют"
            stackId="a"
            fill="hsl(0 72% 51% / 0.6)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HrOverview;
