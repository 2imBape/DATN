import React, { useEffect, useState } from "react";
import { Card, Typography, List, Avatar, Badge } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";

const { Title: AntTitle, Text } = Typography;

interface MovieStatisticsProps {
  type: string;
}

const MovieViewStatistics: React.FC<MovieStatisticsProps> = ({ type }) => {
  const [data, setData] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await instance.get(
          `/generateStatistics/monthly-yearly-topMovie?type=${type}`
        );
        const fetchedData = response.data.data || [];
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const renderRankBadge = (rank: number) => {
    const colors = ["#FFD700", "#C0C0C0", "#CD7F32", "#FF6F61", "#FF6F61", "FF6F61", "FF6F61", "FF6F61", "FF6F61", "FF6F61"];
    return (
      <Badge
        count={rank}
        style={{
          backgroundColor: colors[rank - 1] || "#FACC15",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "50%",
          height: "32px",
          width: "32px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      />
    );
  };

  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        borderRadius: "12px",
        backgroundColor: "#f1f5f9",
        boxShadow: "0 6px 14px rgba(0, 0, 0, 0.15)",
        height: "675px",
        overflowY: "auto",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CrownOutlined
            style={{
              fontSize: "1.5rem",
              color: "#3B82F6",
              marginRight: "8px",
            }}
          />
          <AntTitle
            level={4}
            style={{
              margin: 0,
              color: "#1E293B",
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            Trending Movies -{" "}
            {type === "daily"
              ? "Daily"
              : type === "monthly"
              ? "Monthly"
              : "Yearly"}
          </AntTitle>
        </div>
      </div>

      <List
        loading={isLoading}
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item
            style={{
              padding: "12px 16px",
              backgroundColor: "#ffffff",
              marginBottom: "8px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <List.Item.Meta
              avatar={
                <div style={{ position: "relative" }}>
                  <Avatar
                    src={item.thumbnail || "/default-movie.png"}
                    shape="square"
                    size={70}
                    style={{
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      objectFit: "cover",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "-12px",
                      fontSize: "1vw",
                    }}
                  >
                    {renderRankBadge(index + 1)}
                  </div>
                </div>
              }
              title={
                <Text
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "#1F2937",
                  }}
                >
                  {item.name || "Unknown Movie"}
                </Text>
              }
              description={
                <div className="flex flex-col gap-1">
                  <Text style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                    Views: {item.totalViews?.toLocaleString() || 0}
                  </Text>
                  <Text
                    style={{
                      color: item.isFree ? "#10B981" : "#E11D48",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {item.isFree ? "Miễn phí" : "Trả phí"}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MovieViewStatistics;