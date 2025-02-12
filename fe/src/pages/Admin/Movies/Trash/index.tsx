import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  Table,
  notification,
  Pagination,
  Popover,
  Input,
} from "antd";
import { Link } from "react-router-dom";
import {
  UndoOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Movie } from "@/interfaces/Movie";
import instance from "@/configs/axios";

const TrashMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [limit] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchTrashMovies = async (
    page: number = 1,
    limit: number = 8,
    search: string = ""
  ) => {
    try {
      const query = `?page=${page}&limit=${limit}&search=${search}`;
      const response = await instance.get(`/movie/trash/${query}`);
      const { movies, pagination } = response.data;

      if (movies && Array.isArray(movies.docs)) {
        setMovies(movies.docs);
        setTotalMovies(pagination.totalMovies || 0);
        console.error(
          "API returned unexpected movie data format:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching trash movies:", error);
    }
  };

  useEffect(() => {
    fetchTrashMovies(currentPage, limit, searchTerm);
  }, [currentPage, limit, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTrashMovies(1, limit, searchTerm);
  };

  const handleRestore = async (id: string | undefined) => {
    try {
      if (window.confirm("Bạn có muốn khôi phục phim không?")) {
        await instance.put(`/movie/recover/${id}`);
        setMovies(movies.filter((movie) => movie._id !== id));
        notification.success({
          message: "Bộ phim đã được khôi phục.",
        });
      }
    } catch (error: any) {
      console.error("Error restoring movie:", error);
      notification.error({
        message: "Khôi phục thất bại",
        description: error.message,
      });
    }
  };

  const handlePermanentDelete = async (id: string | undefined) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn?")) {
        await instance.delete(`/movie/permanent/${id}`);
        setMovies(movies.filter((movie) => movie._id !== id));
        notification.success({
          message: "Bộ phim đã được xóa vĩnh viễn.",
        });
      }
    } catch (error: any) {
      console.error("Error permanently deleting movie:", error);
      notification.error({
        message: "Xóa vĩnh viễn thất bại",
        description: error.message,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: "Tên phim",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tên gốc",
      dataIndex: "origin_name",
      key: "origin_name",
    },
    {
      title: "Ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (thumbnail: string) => (
        <img
          src={thumbnail}
          alt="Thumbnail"
          style={{ width: 50, height: "auto" }}
        />
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Năm xuất bản",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Thời gian xóa",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (deletedAt: string) => new Date(deletedAt).toLocaleString(),
    },
    {
      title: "Hành động",
      key: "action",
      render: (record: Movie) => (
        <Space size="middle">
          <Popover content="Khôi phục" trigger="hover">
            <Button
              type="primary"
              icon={<UndoOutlined />}
              onClick={() => handleRestore(record._id)}
            />
          </Popover>
          <Popover content="Xóa vĩnh viễn" trigger="hover">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handlePermanentDelete(record._id)}
            />
          </Popover>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-80 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Thùng rác phim</h1>
      <Button>
        <Link to="/admin/movies/">Về trang danh sách</Link>
      </Button>
      <div className="mb-4 flex items-center">
        <Input
          placeholder="Tìm kiếm phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300, marginRight: 8 }}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={movies}
        rowKey="_id"
        pagination={false}
        className="bg-white shadow-md rounded-lg overflow-hidden"
      />
      <div className="mt-6 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={limit}
          total={totalMovies}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default TrashMovies;
