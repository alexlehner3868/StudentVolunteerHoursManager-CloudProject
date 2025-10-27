import React from "react";
import { BarChart, Bar, XAxis,YAxis, Tooltip,Legend,ReferenceLine,ResponsiveContainer} from "recharts";

function StudentBarSummary({ data }) {
  
  // Aggregate total hours by status
  const grouped = data.reduce((acc, d) => {
    const status = d.status;
    acc[status] = (acc[status] || 0) + parseFloat(d.hours);
    return acc;
  }, {});

  // Create obejct for graphing
  const chartData = 
    [{
      name: "Total Hours",
      waiting_supervisor: grouped.waiting_supervisor || 0,
      waiting_gc: grouped.waiting_gc || 0,
      approved: grouped.approved || 0,
      rejected: grouped.rejected || 0,
    }];

  // Get the max on the yaxis 
  const totalHours = Object.values(grouped).reduce((sum, val) => sum + val, 0);
  const yMax = Math.max(60, totalHours);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name"/>
        <YAxis domain={[0, yMax]}/>
        <Tooltip/>
        <Legend/>
        <ReferenceLine y={40} stroke="black" strokeDasharray="3 3"/>
        <Bar dataKey="waiting_supervisor" stackId="a" fill="#ffcc00" name="Pending - Supervisor"/>
        <Bar dataKey="waiting_gc" stackId="a" fill="#ff9900" name="Pending - GC"/>
        <Bar dataKey="approved" stackId="a" fill="#4caf50" name="Approved"/>
        <Bar dataKey="rejected" stackId="a" fill="#f44336" name="Rejected"/>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default StudentBarSummary;
