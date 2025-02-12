import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AutoComplete,
  Button,
  Space,
  Table,
  Tag,
  notification,
  Pagination,
  Popover,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Movie } from "@/interfaces/Movie";
import instance from "@/configs/axios";
import { Category } from "@/interfaces/Category";
import { Country } from "@/interfaces/Country";

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [limit] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Hàm tải lại phim
  const fetchMovies = async (
    search: string = "",
    page: number = 1,
    limit: number = 8
  ) => {
    try {
      const query = `?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
      const response = await instance.get(`/movie/${query}`);
      const movieData = response.data.data;
      const pagination = response.data.pagination;

      if (Array.isArray(movieData.docs)) {
        setMovies(movieData.docs);
        setTotalMovies(pagination.totalMovies || 0);
      } else {
        console.error("API returned unexpected movie data format:", movieData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchMovies(searchTerm, currentPage, limit);
  }, [searchTerm, currentPage, limit]);

  const handleRemove = async (id: string | undefined) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
        await instance.delete(`/movie/${id}`);
        setMovies(movies.filter((movie) => movie._id !== id));
        notification.success({
          message: "Bộ phim đã được chuyển vào thùng rác.",
        });
      }
    } catch (error: any) {
      console.error("Error removing movie:", error);
      let errorMessage = "Xóa thất bại";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      notification.error({
        message: "Xóa thất bại",
        description: errorMessage,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (
    movieId: string | undefined,
    newStatus: string
  ) => {
    try {
      // Gửi yêu cầu cập nhật trạng thái
      await instance.put(`/movie/${movieId}/status`, { status: newStatus });

      // Đưa về trang 1 sau khi thay đổi trạng thái
      setCurrentPage(1);

      // Gọi lại API để tải lại dữ liệu từ trang 1
      fetchMovies(searchTerm, 1, limit);

      notification.success({
        message: "Cập nhật trạng thái thành công",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      notification.error({
        message: "Cập nhật trạng thái thất bại",
        description: "Có lỗi xảy ra khi cập nhật trạng thái",
      });
    }
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a: Movie, b: Movie) =>
        (a.status || "").localeCompare(b.status || ""),
      render: (status: string | undefined, record: Movie) => {
        const handleClick = (newStatus: string) => {
          handleStatusChange(record._id, newStatus);
        };

        if (!status) {
          return (
            <Tag color="gray" onClick={() => handleClick("Chưa xác định")}>
              Chưa xác định
            </Tag>
          );
        }

        switch (status.toLowerCase()) {
          case "đã xuất bản":
            return (
              <Tag color="red" onClick={() => handleClick("Sắp ra mắt")}>
                {status.toUpperCase()}
              </Tag>
            );
          case "sắp ra mắt":
            return (
              <Tag color="green" onClick={() => handleClick("Đã xuất bản")}>
                {status.toUpperCase()}
              </Tag>
            );
          default:
            return (
              <Tag color="gray" onClick={() => handleClick("Đã xuất bản")}>
                Chưa xác định
              </Tag>
            );
        }
      },
    },
    {
      title: "Thời gian đăng",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: Date) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: "Thời gian ra mắt",
      dataIndex: "releaseDate",
      key: "releaseDate",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (categories: Category[] | string[] | undefined) => (
        <>
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category, index) => (
              <Tag color="green" key={index}>
                {typeof category === "string" ? category : category.name}
              </Tag>
            ))
          ) : (
            <Tag color="gray">Chưa xác định</Tag>
          )}
        </>
      ),
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      render: (countries: Country[] | string[] | undefined) => (
        <>
          {Array.isArray(countries) && countries.length > 0 ? (
            countries.map((country, index) => (
              <Tag color="geekblue" key={index}>
                {typeof country === "string" ? country : country.name}
              </Tag>
            ))
          ) : (
            <Tag color="gray">Chưa xác định</Tag>
          )}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (record: Movie) => (
        <Space size="middle">
          <Popover content="Xem chi tiết" trigger="hover">
            <Link to={`detail/${record._id}`}>
              <Button type="primary" icon={<EyeOutlined />} />
            </Link>
          </Popover>
          <Popover content="Chỉnh sửa" trigger="hover">
            <Link to={`update/${record._id}`}>
              <Button type="primary" icon={<EditOutlined />} />
            </Link>
          </Popover>
          <Popover content="Xóa" trigger="hover">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemove(record._id)}
            />
          </Popover>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-80 min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-4">Danh sách phim</h1>
      <div className="mb-4 flex flex-col sm:flex-row items-center">
        <Button type="primary" className="mt-4 sm:mt-0 sm:ml-4">
          <Link to="/admin/movies/create">Thêm phim</Link>
        </Button>
        <Button
          type="default"
          className="mt-4 sm:mt-0 sm:ml-4"
          icon={<DeleteOutlined />}
        >
          <Link to="/admin/movies/trash">Xem thùng rác</Link>
        </Button>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row items-center">
        <AutoComplete
          style={{ width: 400 }}
          placeholder="Tìm kiếm phim..."
          size="large"
          onSearch={(value) => setSearchTerm(value)}
        />
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

export default Movies;
