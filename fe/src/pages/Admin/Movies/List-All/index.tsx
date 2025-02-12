import React, { useEffect, useState } from "react";
import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";
import { Category } from "@/interfaces/Category";
import { Country } from "@/interfaces/Country";
import {
  AutoComplete,
  Button,
  Table,
  Tag,
  notification,
  Pagination,
  Space,
  Popover,
  Modal,
  Typography,
  Col,
  Row,
  Image,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, UndoOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Person } from "@/interfaces/Person";

const { Title, Text } = Typography;

const AllMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [limit] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchMovies = async (
    page: number = 1,
    limit: number = 8,
    search: string = ""
  ) => {
    try {
      const query = `?page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}`;
      const response = await instance.get(`/movie/${query}`);
      const movieData = response.data.data;
      const pagination = response.data.pagination;

      if (Array.isArray(movieData)) {
        setMovies(movieData);
        setTotalMovies(pagination.total || 0);
      } else {
        console.error("API returned unexpected movie data format:", movieData);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      notification.error({
        message: "Lỗi tải danh sách phim",
        description: "Không thể lấy danh sách phim, vui lòng thử lại sau.",
      });
    }
  };

  useEffect(() => {
    fetchMovies(currentPage, limit, searchTerm);
  }, [currentPage, limit, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMovie(null);
  };

  const handleRestore = async (id: string | undefined) => {
    Modal.confirm({
      title: "Xác nhận khôi phục phim",
      content: "Bạn có chắc chắn muốn khôi phục phim này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await instance.put(`/movie/recover/${id}`);
          setMovies(
            movies.map((movie) =>
              movie._id === id ? { ...movie, isPendingDelete: false } : movie
            )
          );
          notification.success({
            message: "Thành công",
            description: "Phim đã được khôi phục thành công.",
          });
        } catch (error: any) {
          notification.error({
            message: "Khôi phục thất bại",
            description: error.response?.data.message || "Có lỗi xảy ra.",
          });
        }
      },
    });
  };  

  const handleRemove = async (id: string | undefined) => {
    Modal.confirm({
      title: "Xác nhận xóa phim",
      content: "Bạn có chắc chắn muốn đánh dấu phim này để xóa sau 3 ngày?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await instance.delete(`/movie/${id}`);
          setMovies(movies.map(movie => movie._id === id ? { ...movie, isPendingDelete: true } : movie));
          notification.success({
            message: "Thành công",
            description: "Phim đã được đánh dấu để xóa sau 3 ngày.",
          });
        } catch (error: any) {
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
      },
    });
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
        render: (time) =>  `${time} phút`,
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
      render: (status: string | undefined, record: Movie) => {
        if (record.isPendingDelete) {
          return <Tag color="orange">Đánh dấu để xóa</Tag>;
        }
        return (
          <Tag color={status === "Đã xuất bản" ? "green" : "red"}>
            {status || "Chưa xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian ra mắt",
      dataIndex: "releaseDate",
      key: "releaseDate",
      render: (releaseDate: string) =>
        releaseDate ? new Date(releaseDate).toLocaleDateString() : "N/A",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 100,
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
      title: "Đạo diễn",
      dataIndex: "directors",
      key: "directors",
      width: 200,
      render: (directors: Person[] | undefined) => {
        return directors && directors.length > 0 ? (
          directors.map((director, index) => (
            <Tag color="geekblue" key={index}>
              {director.name}
            </Tag>
          ))
        ) : (
          <Tag color="gray">Chưa xác định</Tag>
        );
      },
    },
    {
      title: "Diễn viên",
      dataIndex: "actors",
      key: "actors",
      width: 200,
      render: (actors: Person[] | undefined) => {
        return actors && actors.length > 0 ? (
          actors.map((actor, index) => (
            <Tag color="purple" key={index}>
              {actor.name}
            </Tag>
          ))
        ) : (
          <Tag color="gray">Chưa xác định</Tag>
        );
      },
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      width: 100,
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
        <Space size="middle" style={{ 
          paddingLeft: 0, 
          whiteSpace: 'nowrap', 
          textAlign: 'center',
          display: 'inline-flex',
          paddingRight: "10px"
        }}
  >
          <Popover content="Xem chi tiết" trigger="hover">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleDetailClick(record)}
            />
          </Popover>
          <Popover content="Chỉnh sửa" trigger="hover">
            <Link to={`update/${record._id}`}>
              <Button type="primary" icon={<EditOutlined />} />
            </Link>
          </Popover>
          {record.isPendingDelete ? (
            <Popover content="Khôi phục" trigger="hover">
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={() => handleRestore(record._id)}
              >
              </Button>
            </Popover>
          ) : (
            <Popover content="Xóa" trigger="hover">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(record._id)}
              />
            </Popover>
          )}
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
        scroll={{ x: 'max-content' }} 
        className="bg-white shadow-md rounded-lg overflow-hidden"
      />
      <MovieDetailModal
        visible={isModalVisible}
        movie={selectedMovie}
        onClose={handleCloseModal}
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

const MovieDetailModal: React.FC<{ visible: boolean; movie: Movie | null; onClose: () => void }> = ({ visible, movie, onClose }) => {
  if (!movie) return null;

  return (
    <Modal
      title={<Title level={2} style={{ color: '#2C3E50', fontWeight: '600' }}>{movie.name}</Title>}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} type="primary" style={{ backgroundColor: '#3498DB', borderColor: '#2980B9', boxShadow: '0 4px 6px rgba(41, 128, 185, 0.1)' }}>
          Đóng
        </Button>,
      ]}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      centered
    >
      <Row gutter={24}>
        <Col span={10}>
          <Image
            width="100%"
            src={movie.thumbnail}
            alt={`Thumbnail of ${movie.name}`}
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              border: '3px solid #ddd',
              transition: 'transform 0.3s ease-in-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </Col>
        <Col span={14}>
          <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
            <Title level={4} style={{ color: '#2C3E50', marginBottom: '12px' }}>Thông tin chi tiết</Title>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#2C3E50' }}>Thời gian:</Text>
              <Text style={{ marginLeft: '8px', fontSize: '16px', color: '#34495E' }}>{movie.time}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#2C3E50' }}>Năm xuất bản:</Text>
              <Text style={{ marginLeft: '8px', fontSize: '16px', color: '#34495E' }}>{movie.year}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#2C3E50' }}>Danh mục:</Text>
              <div style={{ marginTop: '8px' }}>
                {movie.category?.map((category, index) => (
                  <Tag key={index} color="green" style={{ marginRight: '4px', borderRadius: '6px', fontSize: '14px', boxShadow: '0 2px 4px rgba(0, 128, 0, 0.1)' }}>
                    {typeof category === "string" ? category : category.name}
                  </Tag>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#2C3E50' }}>Đạo diễn:</Text>
              <div style={{ marginTop: '8px' }}>
                {movie.directors && movie.directors.length > 0 ? (
                  movie.directors.map((director, index) => (
                    <Tag key={director._id || index} color="geekblue" style={{ marginRight: '4px', borderRadius: '6px', fontSize: '14px', boxShadow: '0 2px 4px rgba(41, 128, 185, 0.1)' }}>
                      {director.name ? director.name : "Không có tên"}
                    </Tag>
                  ))
                ) : (
                  <Tag color="gray">Chưa xác định</Tag>
                )}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ color: '#2C3E50' }}>Diễn viên:</Text>
            <div style={{ marginTop: '8px' }}>
              {movie.actors && movie.actors.length > 0 ? (
                <>
                  {movie.actors.map((actor, index) => (
                    <Tag key={actor._id || index} color="purple" style={{ marginRight: '4px', borderRadius: '6px', fontSize: '14px', boxShadow: '0 2px 4px rgba(128, 0, 128, 0.1)' }}>
                      {actor.name ? actor.name : "Không có tên"}
                    </Tag>
                  ))}
                  {movie.actors.length > 1 && (
                    <Text style={{ marginLeft: '8px', fontSize: '14px', color: '#34495E' }}>
                      và một số diễn viên khác
                    </Text>
                  )}
                </>
              ) : (
                <Tag color="gray">Chưa xác định</Tag>
              )}
            </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#2C3E50' }}>Quốc gia:</Text>
              <div style={{ marginTop: '8px' }}>
                {movie.country?.map((country, index) => (
                  <Tag key={index} color="geekblue" style={{ marginRight: '4px', borderRadius: '6px', fontSize: '14px', boxShadow: '0 2px 4px rgba(41, 128, 185, 0.1)' }}>
                    {typeof country === "string" ? country : country.name}
                  </Tag>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#2C3E50' }}>Trạng thái:</Text>
              <Tag color={movie.status === "Đã xuất bản" ? "green" : "red"} style={{ marginLeft: '8px', borderRadius: '6px', fontSize: '14px', boxShadow: '0 2px 4px rgba(255, 0, 0, 0.1)' }}>
                {movie.status || "Chưa xác định"}
              </Tag>
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default AllMovies;
