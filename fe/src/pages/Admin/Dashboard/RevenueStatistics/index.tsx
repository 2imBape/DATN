import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, Typography } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { DollarCircleOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";

const { Title: AntTitle } = Typography;

interface RevenueStatisticsProps {
  type: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueStatistics: React.FC<RevenueStatisticsProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get(
          `generateStatistics/revenue-statistics?type=${type}`
        );
        const fetchedData = response.data.revenue_stats[type];

        const growthData = calculateRevenueGrowth(fetchedData, type);

        const total = fetchedData.reduce(
          (sum: number, item: any) => sum + item.revenue,
          0
        );

        setData(growthData);
        setTotalRevenue(total);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê doanh thu:", error);
      }
    };
    fetchData();
  }, [type]);

  const getDayOfWeek = (dateString: string): string => {
    const daysOfWeek = [
      "Chủ nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  };

  const calculateRevenueGrowth = (data: any[], type: string) => {
    type
    if (!data || data.length === 0) return [];
    const growthData = data.map((item, index) => {
      if (index === 0) {
        return {
          ...item,
          growth: null,
        };
      }

      const previousRevenue = data[index - 1].revenue;
      const currentRevenue = item.revenue;
      const growth = currentRevenue - previousRevenue;

      return {
        ...item,
        growth,
      };
    });

    return growthData;
  };

  const chartData = {
    labels: data.map((item) =>
      type === "daily"
        ? getDayOfWeek(item.date)
        : type === "monthly"
          ? item.month
          : item.year
    ),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: data.map((item) => item.revenue),
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(147, 197, 253, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(37, 99, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(37, 99, 235, 1)",
        pointRadius: 4,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#374151",
          font: { size: 10 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#808080",
          font: { size: 12 },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          autoSkipPadding: 20,
        },
      },
      y: {
        grid: { color: "rgba(200, 200, 200, 0.2)" },
        ticks: {
          color: "#374151",
          font: { size: 10 },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        marginTop: 16,
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9fafb",
        height: "330px",
        position: "relative",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DollarCircleOutlined
            style={{
              fontSize: "1.5rem",
              color: "#2563eb",
              marginRight: "8px",
            }}
          />
          <AntTitle level={4} style={{ margin: 0, color: "#1f2937" }}>
            Thống kê Doanh Thu -{" "}
            {type === "daily"
              ? "Hàng ngày"
              : type === "monthly"
                ? "Hàng tháng"
                : "Hàng năm"}
          </AntTitle>
        </div>
        <div>
          <Typography.Text strong style={{ color: "#16a34a" }}>
            {totalRevenue.toLocaleString()} VNĐ
          </Typography.Text>
        </div>
      </div>

      <div
        style={{
          height: "250px",
          width: "100%",
          position: "relative",
        }}
      >
        <Line
          data={chartData}
          options={{
            ...chartOptions,
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </Card>
  );
};

export default RevenueStatistics;
