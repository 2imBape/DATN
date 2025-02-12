import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Typography, Statistic } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BarChartOutlined, UserOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";

const { Title: AntTitle } = Typography;

interface MovieStatisticsProps {
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

const MovieStatistics: React.FC<MovieStatisticsProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [totalMovies, setTotalMovies] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get(
            `generateStatistics/monthly-yearly-NewMovie?type=${type}`
        );
        const fetchedData = response.data.data;
        setData(fetchedData);

        const total = fetchedData.reduce((sum: number, item: any) => sum + item.movies, 0);
        setTotalMovies(total);
      } catch (error) {
        console.error("Error fetching movie statistics:", error);
      }
    };
    fetchData();
  }, [type]);

  // Dynamic labels based on the type
  const getLabels = () => {
    if (type === "daily") {
      return data.map((item) => item.date);
    } else if (type === "monthly") {
      return data.map((item) => item.month);
    } else if (type === "yearly") {
      return data.map((item) => item.year);
    }
    return [];
  };

  const chartData = {
    labels: getLabels(),
    datasets: [
      {
        label: "Số lượng phim",
        data: data.map((item) => item.movies),
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
          gradient.addColorStop(1, "rgba(37, 99, 235, 1)");
          return gradient;
        },
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        barThickness: 30,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#808080",
          font: { size: 8, weight: "200" },
        },
      },
      y: {
        grid: { color: "rgba(200, 200, 200, 0.2)" },
        ticks: { color: "#374151", font: { size: 7 } },
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
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <UserOutlined
            style={{ fontSize: "1.5rem", color: "#2563eb", marginRight: "8px" }}
          />
          <AntTitle level={4} style={{ margin: 0, color: "#1f2937" }}>
            Thống kê số lượng phim được thêm -{" "}
            {type === "daily"
              ? "Hàng ngày"
              : type === "monthly"
              ? "Hàng tháng"
              : "Hàng năm"}
          </AntTitle>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          color: "#16a34a",
        }}
      >
        <BarChartOutlined
          style={{
            fontSize: "1.2rem",
            marginRight: "8px",
            color: "#16a34a",
          }}
        />
        <Statistic
          value={totalMovies.toLocaleString()}
          valueStyle={{
            fontSize: "1rem",
            fontWeight: 100,
            color: "#16a34a",
          }}
          style={{ marginRight: "8px" }}
        />
        <span
          style={{
            fontSize: "1rem",
            color: "#16a34a",
            fontWeight: 500,
          }}
        >
          Phim
        </span>
      </div>

      <div style={{ height: "100%", overflow: "hidden", position: "relative" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default MovieStatistics;
