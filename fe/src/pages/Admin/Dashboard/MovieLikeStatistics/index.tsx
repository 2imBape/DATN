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
import { HeartOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";

const { Title: AntTitle, Text } = Typography;

interface MovieLikeStatisticsProps {
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

const MovieLikeStatistics: React.FC<MovieLikeStatisticsProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get(
          `generateStatistics/monthly-yearly-likeMovie?type=${type}`
        );
        const fetchedData = response.data.data;

        const growthData = calculateLikeGrowth(fetchedData, type);

        const total = fetchedData.reduce(
          (sum: number, item: any) => sum + item.likes,
          0
        );

        setData(growthData);
        setTotalLikes(total);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê lượt yêu thích:", error);
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

  const calculateLikeGrowth = (data: any[], type: string) => {
    type;
    if (!data || data.length === 0) return [];
    return data.map((item, index) => {
      if (index === 0) {
        return { ...item, growth: null };
      }

      const previousLikes = data[index - 1].likes;
      const currentLikes = item.likes;
      const growth = currentLikes - previousLikes;

      return { ...item, growth };
    });
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
        label: "Lượt yêu thích",
        data: data.map((item) => item.likes),
        borderColor: "rgba(99, 102, 241, 1)", // Violet border
        backgroundColor: "rgba(165, 180, 252, 0.3)", // Soft violet background
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#6366f1",
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#d1d5db",
        titleFont: { size: 14, weight: "500" },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6b7280",
          font: { size: 12, weight: "500" },
          padding: 8,
        },
      },
      y: {
        grid: { color: "rgba(229, 231, 235, 0.5)" },
        ticks: { color: "#6b7280", font: { size: 12 }, padding: 8 },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        height: "330px",
      }}
    >
      <div className=" items-center justify-between mb-6" style={{display: "flex"}} >
        <div className="flex items-center">
          <HeartOutlined
            style={{
              fontSize: "1.5rem",
              color: "#f43f5e",
              marginRight: "8px",
            }}
          />
          <AntTitle
            level={4}
            style={{
              margin: 0,
              color: "#111827",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Thống kê Lượt Yêu Thích -{" "}
            {type === "daily"
              ? "Hàng ngày"
              : type === "monthly"
                ? "Hàng tháng"
                : "Hàng năm"}
          </AntTitle>
        </div>
        <Text
          style={{ fontSize: "1rem", color: "#10b981", fontWeight: "bold", marginLeft: "100px" }}
        >
          {totalLikes.toLocaleString()} likes
        </Text>
      </div>

      <div style={{ height: "350px", position: "relative", marginTop: "-25px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default MovieLikeStatistics;
