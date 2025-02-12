import React, { useState } from "react";
import UserStatistics from "../Dashboard/UserStatistics";
import RevenueStatistics from "../Dashboard/RevenueStatistics";
import MonthlyYearlyStatistics from "../Dashboard/MonthlyYearlyStatistics";
import MovieLikeStatistics from "./MovieLikeStatistics";
import MovieStatistics from "./MovieStatictics";
import MovieViewStatistics from "./ViewMovieSatistics";

const DashboardPage: React.FC = () => {
  const [type, setType] = useState<string>("daily"); 

  return (
    <div className="App p-8 " style={{ backgroundColor: "#ffffff" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bảng thống kê</h1>

        <div className="flex items-center">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as string)}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm flex items-center"
          >
            <option value="daily">Ngày</option>
            <option value="monthly">Tháng</option>
            <option value="yearly">Năm</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7">
        <div className="md:col-span-5 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-3 rounded-lg">
              <RevenueStatistics type={type} />
            </div>
            <div className="md:col-span-2 rounded-lg">
              <MovieStatistics type={type} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-2 rounded-lg">
              <UserStatistics type={type} />
            </div>
            <div className="rounded-lg md:col-span-3" style={{ marginTop: "15px" }}>
              <MovieLikeStatistics type={type} />
            </div>
          </div>
        </div>
        <div className="rounded-lg md:col-span-2" style={{ marginTop: "15px" }}>
          <MovieViewStatistics type={type} />
        </div>
      </div>
      <div className="rounded-lg md:col-span-3" >
          <MonthlyYearlyStatistics type={type} />
      </div>
    </div>
  );
};

export default DashboardPage;
