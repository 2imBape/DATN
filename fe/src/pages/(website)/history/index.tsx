import { useState, useEffect } from "react";
import {
  Table,
  Spin,
  message,
  Button,
  Input,
  DatePicker,
  Select,
  Space,
} from "antd";
import { Payment } from "@/interfaces/Payment";
import instance from "@/configs/axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const WalletHistory = () => {
  const [history, setHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState({
    transactionId: "",
    startDate: null,
    endDate: null,
    status: "",
    page: 1,
  });
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchTransactionHistory = async () => {
    try {
      const { transactionId, startDate, endDate, status, page } = searchParams;
      const response = await instance.get("/wallet/history", {
        params: {
          transactionId,
          startDate: startDate
            ? dayjs(startDate).format("YYYY-MM-DD")
            : undefined,
          endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
          status,
          page,
        },
      });
      setHistory(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      message.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [
    searchParams.page,
    searchParams.transactionId,
    searchParams.startDate,
    searchParams.endDate,
    searchParams.status,
  ]);

  const handleSearchChange = (value: string, key: string) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (dates: any) => {
    setSearchParams((prev) => ({
      ...prev,
      startDate: dates ? dates[0] : null,
      endDate: dates ? dates[1] : null,
    }));
  };

  const handleStatusChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, status: value }));
  };

  const handleAction = async (
    action: string,
    transactionId: string | undefined
  ) => {
    if (action === "upgrade") {
      navigate("/package");
    } else if (action === "cancel") {
      if (confirm("Bạn muốn hủy giao dịch này không?")) {
        try {
          await instance.post("/payment/cancel", { id: transactionId });
          message.success(`Hủy giao dịch thành công?`);
          fetchTransactionHistory();
        } catch (error) {
          message.error("Hủy giao dịch thất bại");
        }
      }
    } else if (action === "continue") {
      if (confirm("Bạn muốn tiếp tục giao dịch này không?")) {
        try {
          const response = await instance.post("/payment/continue", {
            id: transactionId,
          });
          const { paymentUrl } = response.data;
          window.location.href = paymentUrl;
        } catch (error) {
          message.error("Tiếp tục giao dịch thất bại");
        }
      }
    }
  };

  const columns = [
    {
      title: "Mã giao dịch",
      dataIndex: "transactionId",
      key: "transactionId",
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      key: "type",
      render: (text: string) => {
        if (text === "deposit") {
          return "Nạp xu";
        } else {
          return "Thanh toán gói";
        }
      },
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (text: number) => `${text.toLocaleString()} Xu`,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        if (text === "Đang xử lý") {
          return <span className="text-yellow-400">Đang xử lý</span>;
        } else if (text === "Thành công") {
          return <span className="text-green-500">Thành công</span>;
        } else if (text === "Thất bại") {
          return <span className="text-red-500">Thất bại</span>;
        } else if (text === "Đã hủy") {
          return <span className="text-gray-400">Đã hủy</span>;
        } else {
          return <span className="text-gray-400">{text}</span>;
        }
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "Thông báo",
      dataIndex: "notification",
      key: "notification",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Payment) => {
        const { status, _id } = record;

        if (status === "Đang xử lý") {
          return (
            <div>
              <Button
                type="default"
                danger
                onClick={() => handleAction("cancel", _id)}
                className="mr-2"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={() => handleAction("continue", _id)}
              >
                Tiếp tục
              </Button>
            </div>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="container mx-auto p-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải lịch sử giao dịch..." />
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Lịch sử giao dịch</h2>
          <Space className="mb-4" size="large">
            <Input
              placeholder="Tìm kiếm Mã giao dịch"
              value={searchParams.transactionId}
              onChange={(e) =>
                handleSearchChange(e.target.value, "transactionId")
              }
            />
            <RangePicker
              value={[
                searchParams.startDate ? dayjs(searchParams.startDate) : null,
                searchParams.endDate ? dayjs(searchParams.endDate) : null,
              ]}
              onChange={handleDateRangeChange}
            />
            <Select
              value={searchParams.status || ""}
              onChange={handleStatusChange}
              style={{ width: 180 }}
            >
              <Option value="">Tất cả trạng thái</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Thành công">Thành công</Option>
              <Option value="Thất bại">Thất bại</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
            <Button
              type="primary"
              onClick={() => setSearchParams((prev) => ({ ...prev, page: 1 }))}
            >
              Tìm kiếm
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={history}
            rowKey="transactionId"
            pagination={{
              pageSize: 5,
              current: searchParams.page,
              total: total,
              onChange: (page) =>
                setSearchParams((prev) => ({ ...prev, page })),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WalletHistory;
