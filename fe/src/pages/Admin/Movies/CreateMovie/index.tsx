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
  Switch,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";
import { Country } from "@/interfaces/Country";
import { Category } from "@/interfaces/Category";

const { Option } = Select;

const MovieAddPage: React.FC = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [actors, setActors] = useState<any[]>([]); // Danh sách diễn viên
  const [directors, setDirectors] = useState<any[]>([]); // Danh sách đạo diễn
  const [thumbFileList, setThumbFileList] = useState<any[]>([]);
  const [videoFileList, setVideoFileList] = useState<any[]>([]);
  const [trailerFileList, setTrailerFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, countryRes, personRes] = await Promise.all([
          instance.get("/category"),
          instance.get("/country"),
          instance.get("/person"),
        ]);

        setCategories(categoryRes.data.movie);
        setCountries(countryRes.data.country);

        const persons = personRes.data.persons || [];
        setActors(persons.filter((person: any) => person.role === "actors"));
        setDirectors(
          persons.filter((person: any) => person.role === "directors")
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Không thể tải danh mục, quốc gia hoặc người.");
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (setter: any, fileList: any[]) => {
    setter(fileList.slice(-1));
  };

  const handleSubmit = async (values: any) => {
    if (thumbFileList.length === 0) {
      message.error("Vui lòng tải lên thumbnail.");
      return;
    }

    if (videoFileList.length === 0 || trailerFileList.length === 0) {
      message.error("Vui lòng tải lên video và trailer.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("origin_name", values.origin_name);
    formData.append("description", values.description);
    formData.append("time", values.time);
    formData.append("year", values.year);
    formData.append("video", videoFileList[0].originFileObj);
    formData.append("trailer", trailerFileList[0].originFileObj);
    formData.append("quality", values.quality);
    formData.append("status", values.status);
    formData.append("isFree", values.isFree ? "true" : "false");

    if (values.releaseDate) {
      formData.append("releaseDate", values.releaseDate.format("YYYY-MM-DD"));
    }

    // values.category.forEach((cat: string) => {
    //   formData.append("category[]", cat);
    // });

    // values.country.forEach((cnt: string) => {
    //   formData.append("country[]", cnt);
    // });

    formData.append("thumbnail", thumbFileList[0].originFileObj);

    // Kiểm tra nếu không có diễn viên hoặc đạo diễn nào được chọn
    // const selectedActors = values.actors || [];
    // const selectedDirectors = values.directors || [];

    // // Thêm thông tin actors và directors vào formData
    // selectedActors.forEach((actorId: string) => {
    //   formData.append("actors[]", actorId);
    // });

    // selectedDirectors.forEach((directorId: string) => {
    //   formData.append("directors[]", directorId);
    // });

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

    formData.forEach((value) => {
      if (value instanceof File) {
      } else {
      }
    });

    try {
      await instance.post("/movie", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Thêm phim thành công!");
      form.resetFields();
      setThumbFileList([]);
      setVideoFileList([]);
      setTrailerFileList([]);
      // navigate("/admin/movies");
    } catch (error: any) {
      console.error("Lỗi khi thêm phim:", error.response?.data);
      message.error(
        error.response?.data?.message ||
          "Không thể thêm phim. Kiểm tra lại dữ liệu!"
      );
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
        className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-black mb-4 text-center">
          Thêm mới bộ phim
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label={<span className="text-black">Tên phim</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Nhập tên phim" />
          </Form.Item>

          <Form.Item
            name="origin_name"
            label={<span className="text-black">Tên gốc phim</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Nhập tên gốc phim" />
          </Form.Item>

          <Form.Item
            name="actors"
            label={<span className="text-black">Diễn viên</span>}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ít nhất một diễn viên",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn diễn viên"
              optionLabelProp="label"
            >
              {actors.map((actor) => (
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

          <Form.Item
            name="directors"
            label={<span className="text-black">Đạo diễn</span>}
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một đạo diễn" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn đạo diễn"
              optionLabelProp="label"
            >
              {directors.map((director) => (
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
            name="time"
            label={<span className="text-black">Thời gian phim</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Nhập thời gian phim" />
          </Form.Item>

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

          <Form.Item
            name="year"
            label={<span className="text-black">Năm sản xuất</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <InputNumber
              min={1900}
              max={2100}
              placeholder="Nhập năm sản xuất"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={<span className="text-black">Thể loại</span>}
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một thể loại" },
            ]}
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

          <Form.Item
            name="country"
            label={<span className="text-black">Quốc gia</span>}
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một quốc gia" },
            ]}
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
                {
                  required: status === "Sắp ra mắt",
                  message: "Vui lòng chọn thời gian ra mắt",
                },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder="Chọn thời gian ra mắt"
              />
            </Form.Item>
          )}

          <Form.Item
            name="isFree"
            label={<span className="text-black">Miễn phí</span>}
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-black">Mô tả</span>}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả phim" />
          </Form.Item>
        </div>

        <Form.Item
          name="thumbnail"
          label={<span className="text-black">Thumbnail</span>}
          rules={[{ required: true, message: "Vui lòng tải lên thumbnail." }]}
        >
          <Upload
            fileList={thumbFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) =>
              handleFileChange(setThumbFileList, fileList)
            }
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        {thumbFileList.length > 0 && (
          <Image
            width={100}
            src={URL.createObjectURL(thumbFileList[0].originFileObj)}
            preview={false}
          />
        )}

        <Form.Item
          name="video"
          label={<span className="text-black">Video</span>}
          rules={[{ required: true, message: "Vui lòng tải lên video." }]}
        >
          <Upload
            fileList={videoFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) =>
              handleFileChange(setVideoFileList, fileList)
            }
            accept="video/*"
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="trailer"
          label={<span className="text-black">Trailer</span>}
          rules={[{ required: true, message: "Vui lòng tải lên trailer." }]}
        >
          <Upload
            fileList={trailerFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) =>
              handleFileChange(setTrailerFileList, fileList)
            }
            accept="video/*"
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full"
          >
            Thêm phim
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MovieAddPage;
