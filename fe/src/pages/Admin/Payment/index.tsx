import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Pagination,
  Input,
  Spin,
  Alert,
  Modal,
  Button,
  Popover,
  DatePicker,
  Tag,
} from "antd";
import { Payment } from "@/interfaces/Payment";
import {
  CaretUpOutlined,
  CaretDownOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import instance from "@/configs/axios";
import { debounce } from "lodash";
import dayjs, { Dayjs } from "dayjs";

const ListPayment: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [sortOrderStatus, setSortOrderStatus] = useState<"ascend" | "descend">(
    "ascend"
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const limit = 8;

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    console.log(totalPages);

    const params: Record<string, any> = {
      page: currentPage,
      limit,
      transactionId: searchTerm || undefined,
    };

    if (dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].toISOString();
      params.endDate = dateRange[1].toISOString();
    }

    try {
      const { data } = await instance.get("wallet/historyAdmin", { params });
      setPayments(data?.data || []);
      setTotalPayments(data?.totalRecords || 0);
      const totalPages = Math.ceil(data?.totalRecords / limit);
      setTotalPages(totalPages);
      setCurrentPage(data?.currentPage || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, dateRange]);

  const handleSortStatus = () => {
    const newOrder = sortOrderStatus === "ascend" ? "descend" : "ascend";
    setSortOrderStatus(newOrder);

    const sortedPayments = [...payments].sort((a, b) => {
      const statusA = a.status || "";
      const statusB = b.status || "";
      return newOrder === "ascend"
        ? statusA.localeCompare(statusB)
        : statusB.localeCompare(statusA);
    });

    setPayments(sortedPayments);
  };

  const showModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedPayment(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedPayment(null);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const columns = [
    { title: "Mã giao dịch", dataIndex: "transactionId", key: "transactionId" },
    {
      title: "Tên người dùng",
      dataIndex: "user",
      key: "userName",
      render: (user: { name?: string }) =>
        user?.name ? user.name : "Không xác định",
    },
    {
      title: "Loại giao dịch",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text: string) => {
        if (text === "MoMo") {
          return "MoMo";
        } else if (text === "VNPay") {
          return "VNPay";
        } else {
          return "Ví xu";
        }
      },
    },
    {
      title: "Giao dịch bằng",
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
      title: (
        <div onClick={handleSortStatus} style={{ cursor: "pointer" }}>
          Trạng thái{" "}
          {sortOrderStatus === "ascend" ? (
            <CaretUpOutlined />
          ) : (
            <CaretDownOutlined />
          )}
        </div>
      ),

      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color: string;

        switch (status) {
          case "Thành công":
            color = "green";
            break;
          case "Đang xử lý":
            color = "orange";
            break;
          case "Thất bại":
            color = "red";
            break;
          case "Đã hủy":
            color = "gray";
            break;
          case "Đã hết hạn":
            color = "volcano";
            break;
          default:
            color = "default";
            break;
        }
        return <Tag color={color}>{status || "Không xác định"}</Tag>;
      },
    },
    {
      title: "Số tiền thanh toán",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) =>
        amount ? `${amount.toLocaleString()} Xu` : "0 Xu",
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) =>
        createdAt
          ? dayjs(createdAt).format("DD/MM/YYYY HH:mm")
          : "Không xác định",
    },

    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Payment) => (
        <Popover content="Chi tiết" trigger="hover">
          <Button
            type="primary"
            onClick={() => showModal(record)}
            icon={<EyeOutlined />}
          />
        </Popover>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-80 min-h-screen">
      <div>
        <h2
          style={{
            fontWeight: "bold",
            marginBottom: 20,
            fontSize: "20px",
            color: "black",
          }}
        >
          Danh sách thanh toán
        </h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
          <Input.Search
            placeholder="Tìm kiếm mã giao dịch"
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates || [null, null]);
              setCurrentPage(1);
            }}
            style={{ width: 300 }}
            format="DD/MM/YYYY"
          />
        </div>

        {error && (
          <Alert type="error" message={error} style={{ marginBottom: 20 }} />
        )}

        <Table
          columns={columns}
          dataSource={payments}
          loading={loading}
          pagination={false}
          rowKey="transactionId"
          locale={{ emptyText: "Không có giao dịch nào được tìm thấy" }}
        />

        <Pagination
          current={currentPage}
          total={totalPayments}
          pageSize={limit}
          onChange={(page) => setCurrentPage(page)}
          style={{ marginTop: 20 }}
          showSizeChanger={false}
        />

        <Modal
          title="Chi tiết thanh toán"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Đóng
            </Button>,
            <Button key="submit" type="primary" onClick={handleOk}>
              Xác nhận
            </Button>,
          ]}
        >
          {selectedPayment ? (
            <div style={{ lineHeight: 1.6 }}>
              <p>
                <strong>Mã giao dịch:</strong> {selectedPayment.transactionId}
              </p>
              <p>
                <strong>Tên người dùng:</strong>{" "}
                {selectedPayment.user?.name || "Không xác định"}
              </p>
              <p>
                <strong>Số tiền thanh toán:</strong>{" "}
                {selectedPayment.amount?.toLocaleString()} VND
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <Tag
                  color={
                    selectedPayment.status === "Thành công"
                      ? "green"
                      : selectedPayment.status === "Đang xử lý"
                        ? "orange"
                        : selectedPayment.status === "Thất bại"
                          ? "red"
                          : selectedPayment.status === "Đã hủy"
                            ? "gray"
                            : selectedPayment.status === "Đã hết hạn"
                              ? "volcano"
                              : "default"
                  }
                >
                  {selectedPayment.status || "Không xác định"}
                </Tag>
              </p>
              <p>
                <strong>Ngày thanh toán:</strong>{" "}
                {selectedPayment.createdAt
                  ? dayjs(selectedPayment.createdAt).format("DD/MM/YYYY HH:mm")
                  : "Không xác định"}
              </p>
            </div>
          ) : (
            <Spin />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ListPayment;
