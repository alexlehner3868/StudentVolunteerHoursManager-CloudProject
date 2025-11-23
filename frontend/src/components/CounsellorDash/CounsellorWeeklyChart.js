import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const mapStatus = (sub) => {
  if (sub.externsupstatus === "Pending") return "Waiting on Supervisor";

  if (
    sub.externsupstatus === "Approved" &&
    (!sub.guidancecounsellorapproved ||
      sub.guidancecounsellorapproved === "Pending")
  ) {
    return "Pending";
  }

  if (
    sub.externsupstatus === "Approved" &&
    sub.guidancecounsellorapproved === "Approved"
  ) {
    return "Approved";
  }

  if (
    sub.externsupstatus === "Rejected" ||
    sub.guidancecounsellorapproved === "Denied"
  ) {
    return "Rejected";
  }

  return "Pending";
};


const getISOWeek = (dateStr) => {
  const date = new Date(dateStr);
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7; 
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

const CounsellorWeeklyChart = ({ submissions }) => {
  const weeklyData = useMemo(() => {
    const weeks = {};

    submissions.forEach((sub) => {
      const week = getISOWeek(sub.datevolunteered);
      const status = mapStatus(sub);

      if (!weeks[week]) {
        weeks[week] = {
          week,
          Approved: 0,
          Pending: 0,
          "Waiting on Supervisor": 0,
          Rejected: 0
        };
      }

      weeks[week][status] += 1;
    });

    return Object.values(weeks).sort((a, b) => (a.week > b.week ? 1 : -1));
  }, [submissions]);

  return (
    <div style={{ width: "100%", height: "280px" }}>
      <ResponsiveContainer>
        <BarChart data={weeklyData}>
          <XAxis dataKey="week" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />

            <Bar dataKey="Approved" stackId="a" fill="#4caf50" />
            <Bar dataKey="Pending" stackId="a" fill="#ff9900" />
            <Bar dataKey="Waiting on Supervisor" stackId="a" fill="#ffcc00" />
            <Bar dataKey="Rejected" stackId="a" fill="#f44336" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CounsellorWeeklyChart;
