import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Typography, Spin, Empty } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BarChartOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";

const { Title: AntTitle } = Typography;

interface MonthlyYearlyStatisticsProps {
  type: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyYearlyStatistics: React.FC<MonthlyYearlyStatisticsProps> = ({
  type,
}) => {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalUsers: number;
  } | null>(null);

  useEffect(() => {
    if (type === "daily") return; // Bỏ qua gọi API nếu là "daily"
    const fetchData = async () => {
      try {
        const response = await instance.get(
          `generateStatistics/monthly-yearly-statistics?type=${type}`
        );
        setStats(response.data.stats);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      }
    };
    fetchData();
  }, [type]);

  const chartData = {
    labels: ["Tổng Doanh Thu", "Tổng Người Dùng Mới"],
    datasets: [
      {
        label: "Tổng Doanh Thu",
        data: stats ? [stats.totalRevenue, 0] : [0, 0],
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, "rgba(37, 99, 235, 0.7)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 1)");
          return gradient;
        },
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1.5,
        borderRadius: 10,
        barThickness: 50,
        categoryPercentage: 0.6,
        yAxisID: "y",
      },
      {
        label: "Tổng Người Dùng Mới",
        data: stats ? [0, stats.totalUsers] : [0, 0],
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, "rgba(220, 38, 38, 0.7)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 1)");
          return gradient;
        },
        borderColor: "rgba(220, 38, 38, 1)",
        borderWidth: 1.5,
        borderRadius: 10,
        barThickness: 50,
        categoryPercentage: 0.6,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          color: "#374151",
          font: { size: 14 },
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#808080",
          font: { size: 14, weight: "500" },
          padding: 10,
        },
      },
      y: {
        type: "linear",
        position: "left",
        grid: { color: "rgba(200, 200, 200, 0.1)" },
        ticks: { color: "#374151", font: { size: 12 } },
        beginAtZero: true,
      },
      y1: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { color: "#dc2626", font: { size: 12 } },
        beginAtZero: true,
      },
    },
  };

  if (type === "daily") {
    return (
      <Card
        bordered={false}
        style={{
          width: "100%",
          marginTop: 16,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9fafb",
          textAlign: "center",
          color: "#9ca3af",
        }}
      >
        <Empty description="Không thể thống kê theo ngày" />
      </Card>
    );
  }

  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        marginTop: 16,
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff",
        paddingLeft: "20%"
      }}
    >
      <div className="flex items-center mb-4">
        <BarChartOutlined
          style={{ fontSize: "1.5rem", color: "#2563eb", marginRight: "8px" }}
        />
        <AntTitle level={4} style={{ margin: 0, color: "#1f2937" }}>
          {type === "monthly"
            ? "Tổng Kết Tháng"
            : type === "yearly"
            ? "Tổng Kết Năm"
            : "Tổng Kết"}
        </AntTitle>
      </div>
      {stats ? (
        <div style={{ height: 400 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin tip="Loading..." />
        </div>
      )}
    </Card>
  );
};

export default MonthlyYearlyStatistics;
