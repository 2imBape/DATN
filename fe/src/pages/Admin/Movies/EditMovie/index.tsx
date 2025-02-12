import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Image,
  DatePicker,
  Switch,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import instance from "@/configs/axios";
import { Country } from "@/interfaces/Country";
import { Category } from "@/interfaces/Category";

const { Option } = Select;

const MovieEditPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [thumbFileList, setThumbFileList] = useState<any[]>([]);
  const [videoFileList, setVideoFileList] = useState<any[]>([]);
  const [trailerFileList, setTrailerFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [status, setStatus] = useState<string>("");
  const [persons, setPersons] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, countryRes, personRes, movieRes] =
          await Promise.all([
            instance.get(`/category`),
            instance.get(`/country`),
            instance.get("/person"),
            instance.get(`/movie/${id}`),
          ]);
        setCategories(categoryRes.data.movie);
        setCountries(countryRes.data.country);
        setPersons(personRes.data.persons);
        setInitialValues(movieRes.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Không thể tải danh mục, quốc gia hoặc thông tin phim.");
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (
    fileList: any[],
    type: "thumbnail" | "video" | "trailer"
  ) => {
    if (type === "thumbnail") {
      setThumbFileList(fileList.slice(-1));
    } else if (type === "video") {
      setVideoFileList(fileList.slice(-1));
    } else if (type === "trailer") {
      setTrailerFileList(fileList.slice(-1));
    }
  };

  useEffect(() => {
    if (initialValues) {
      console.log("Initial values:", initialValues);
      form.setFieldsValue({
        ...initialValues,
        releaseDate: initialValues.releaseDate
          ? moment(initialValues.releaseDate)
          : null,
        category: initialValues.category.map((cat: any) => cat._id),
        country: initialValues.country.map((cnt: any) => cnt._id),
        director: initialValues.directors,
        actors: initialValues.actors,
      });

      // Set file lists if initial values exist
      if (initialValues.thumbnail) {
        setThumbFileList([
          {
            uid: "-1",
            name: "thumbnail",
            status: "done",
            url: initialValues.thumbnail,
          },
        ]);
      }
      if (initialValues.video) {
        setVideoFileList([
          {
            uid: "-2",
            name: "video",
            status: "done",
            url: initialValues.video,
          },
        ]);
      }
      if (initialValues.trailer) {
        setTrailerFileList([
          {
            uid: "-3",
            name: "trailer",
            status: "done",
            url: initialValues.trailer,
          },
        ]);
      }
    }
  }, [initialValues, form, persons]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("origin_name", values.origin_name);
    formData.append("description", values.description);
    formData.append("time", values.time);
    formData.append("year", values.year);
    formData.append("quality", values.quality);
    formData.append("status", values.status);
    formData.append("isFree", values.isFree ? "true" : "false");

    if (values.releaseDate) {
      formData.append("releaseDate", values.releaseDate.format("YYYY-MM-DD"));
    }
    if (Array.isArray(values.category)) {
      values.category.forEach((cat: string) => {
        formData.append("category[]", cat);
      });
    }

    if (Array.isArray(values.country)) {
      values.country.forEach((cnt: string) => {
        formData.append("country[]", cnt);
      });
    }

    if (Array.isArray(values.actors)) {
      values.actors.forEach((actorId: string) => {
        formData.append("actors[]", actorId);
      });
    }

    if (Array.isArray(values.directors)) {
      values.directors.forEach((directorId: string) => {
        formData.append("directors[]", directorId);
      });
    }

    formData.append("thumbnail", initialValues.thumbnail);
    formData.append("video", initialValues.video);
    formData.append("trailer", initialValues.trailer);

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      await instance.put(`/movie/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Cập nhật phim thành công!");
      form.resetFields();
      setThumbFileList([]);
      setVideoFileList([]);
      setTrailerFileList([]);
      navigate("/admin/movies");
    } catch (error) {
      console.error("Lỗi khi cập nhật phim:", error);
      message.error("Không thể cập nhật phim.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  return (
    <div className="p-4 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md text-blue-500"
      >
        <h1 className="text-2xl font-bold mb-4 text-black">Chỉnh sửa phim</h1>
        <div className="grid grid-cols-2 gap-4">
          {/* Movie Name */}
          <Form.Item
            name="name"
            label={<span className="text-black">Tên phim</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Mời nhập tên phim" />
          </Form.Item>
          {/* Origin Name */}
          <Form.Item
            name="origin_name"
            label={<span className="text-black">Tên gốc phim</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Mời nhập tên gốc phim" />
          </Form.Item>

          <Form.Item
            name="directors"
            label={<span className="text-black">Đạo diễn</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Select placeholder="Chọn đạo diễn" optionLabelProp="label">
              {persons
                .filter((person) => person.role === "directors")
                .map((director) => (
                  <Option
                    key={director._id}
                    value={director._id}
                    label={director.name}
                  >
                    <div className="flex items-center">
                      <Image
                        width={20}
                        src={director.thumbnail || "/path/to/default-image.jpg"}
                        alt={director.name}
                        style={{ marginRight: 10 }}
                      />
                      <span style={{ marginLeft: "5px" }}>{director.name}</span>
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="actors"
            label={<span className="text-black">Diễn viên</span>}
          >
            <Select
              mode="multiple"
              placeholder="Chọn diễn viên"
              optionLabelProp="label"
            >
              {persons
                .filter((person) => person.role === "actors")
                .map((actor) => (
                  <Option key={actor._id} value={actor._id} label={actor.name}>
                    <div className="flex items-center">
                      <Image
                        width={20}
                        src={actor.thumbnail || "/path/to/default-image.jpg"}
                        alt={actor.name}
                        style={{ marginRight: 10 }}
                      />
                      <span style={{ marginLeft: "5px" }}>{actor.name}</span>
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {/* Time */}
          <Form.Item
            name="time"
            label={<span className="text-black">Thời gian phim</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Mời nhập thời gian phim" />
          </Form.Item>

          {/* Year */}
          <Form.Item
            name="isFree"
            label={<span className="text-black">Miễn phí</span>}
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
          <Form.Item
            name="year"
            label={<span className="text-black">Năm sản xuất</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <InputNumber
              min={1900}
              max={2100}
              placeholder="Mời nhập năm sản xuất"
              style={{ width: "100%" }}
            />
          </Form.Item>
          {/* Categories */}
          <Form.Item
            name="category"
            label={<span className="text-black">Thể loại</span>}
          >
            <Select mode="multiple" placeholder="Chọn thể loại">
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-black">Trạng thái</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Select placeholder="Chọn trạng thái" onChange={handleStatusChange}>
              <Option value="Đã xuất bản">Đã xuất bản</Option>
              <Option value="Sắp ra mắt">Sắp ra mắt</Option>
            </Select>
          </Form.Item>

          {/* Countries */}
          <Form.Item
            name="country"
            label={<span className="text-black">Quốc gia</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Select mode="multiple" placeholder="Chọn quốc gia">
              {countries.map((country) => (
                <Option key={country._id} value={country._id}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {status === "Sắp ra mắt" && (
            <Form.Item
              name="releaseDate"
              label={<span className="text-black">Thời gian ra mắt</span>}
              rules={[
                { required: true, message: "Vui lòng chọn thời gian ra mắt" },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder="Chọn thời gian ra mắt"
              />
            </Form.Item>
          )}

          {/* Quality */}
          <Form.Item
            name="quality"
            label={<span className="text-black">Chất lượng</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Select placeholder="Chọn chất lượng">
              <Option value="HD">HD</Option>
              <Option value="Full HD">Full HD</Option>
              <Option value="4K">4K</Option>
            </Select>
          </Form.Item>
          {/* Video URL */}
          <Form.Item
            name="video"
            label="Video URL"
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Nhập video URL" />
          </Form.Item>
          {/* Trailer URL */}
          <Form.Item
            name="trailer"
            label="Trailer URL"
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Nhập trailer URL" />
          </Form.Item>
          {/* Description */}
          <Form.Item
            name="description"
            label={<span className="text-black">Mô tả</span>}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả phim" />
          </Form.Item>
          {/* Thumbnail Upload */}
          <Form.Item label="Thumbnail" className="col-span-2">
            <Upload
              accept="image/*"
              fileList={thumbFileList}
              onChange={(info) => handleFileChange(info.fileList, "thumbnail")}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên thumbnail</Button>
            </Upload>
            {thumbFileList.length > 0 && (
              <Image
                width={100}
                src={thumbFileList[0]?.url}
                alt="Thumbnail Preview"
                className="mt-2"
              />
            )}
          </Form.Item>
          {/* Video Upload */}
          <Form.Item label="Video" className="col-span-2">
            <Upload
              accept="video/*"
              fileList={videoFileList}
              onChange={(info) => handleFileChange(info.fileList, "video")}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên video</Button>
            </Upload>
            {videoFileList.length > 0 && (
              <video width={100} controls className="mt-2">
                <source src={videoFileList[0]?.url} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            )}
          </Form.Item>
          {/* Trailer Upload */}
          <Form.Item label="Trailer" className="col-span-2">
            <Upload
              accept="video/*"
              fileList={trailerFileList}
              onChange={(info) => handleFileChange(info.fileList, "trailer")}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên trailer</Button>
            </Upload>
            {trailerFileList.length > 0 && (
              <video width={100} controls className="mt-2">
                <source src={trailerFileList[0]?.url} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            )}
          </Form.Item>
        </div>
        <Form.Item className="col-span-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MovieEditPage;
