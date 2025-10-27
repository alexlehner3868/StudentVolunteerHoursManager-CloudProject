import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip,Legend,ResponsiveContainer} from "recharts";

function StudentMonthlyView({ data }) {
  
  // Group data by month and status
  const grouped = {};
  data.forEach((entry) => {
    const month = entry.month;

    if (!grouped[month]) grouped[month] = { month };

    grouped[month][entry.status] = (grouped[month][entry.status] || 0) + parseFloat(entry.hours);
  });

  // Create an object for BarChart 
  const chartData = Object.values(grouped);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="month" />
        <YAxis/>
        <Tooltip/>
        <Legend/>
        <Bar dataKey="waiting_supervisor" stackId="a" fill="#ffcc00" name="Pending - Supervisor" />
        <Bar dataKey="waiting_gc" stackId="a" fill="#ff9900" name="Pending - GC" />
        <Bar dataKey="approved" stackId="a" fill="#4caf50" name="Approved" />
        <Bar dataKey="rejected" stackId="a" fill="#f44336" name="Rejected" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default StudentMonthlyView;
