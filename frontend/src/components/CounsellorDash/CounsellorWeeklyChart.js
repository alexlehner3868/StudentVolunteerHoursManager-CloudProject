import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { startOfWeek, format } from "date-fns";

const CounsellorWeeklyChart = ({ submissions }) => {
  // Group by week
  const weeklyGroups = {};

  submissions.forEach((sub) => {
    const date = new Date(sub.datevolunteered);

    // Always group Monday–Sunday
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekKey = format(weekStart, "MMM dd");

    if (!weeklyGroups[weekKey]) {
      weeklyGroups[weekKey] = {
        week: weekKey,
        Pending: 0,
        Approved: 0,
        Rejected: 0,
      };
    }

    // Each submission already has unifiedStatus added in parent component
    const status = sub.unifiedStatus;

    if (weeklyGroups[weekKey][status] !== undefined) {
      weeklyGroups[weekKey][status] += parseFloat(sub.hours || 0);
    }
  });

  const chartData = Object.values(weeklyGroups);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />

        {/* Only these 4 statuses remain */}
        <Bar dataKey="Pending" stackId="a" fill="#ffcc00" />
        <Bar dataKey="Approved" stackId="a" fill="#4caf50" />
        <Bar dataKey="Rejected" stackId="a" fill="#f44336" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CounsellorWeeklyChart;
