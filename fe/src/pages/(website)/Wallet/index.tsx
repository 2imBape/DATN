import instance from "@/configs/axios";
import { DollarOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Spin,
  message,
  notification,
} from "antd";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;

const WalletPage = () => {
  const [wallet, setWallet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [coin, setCoin] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("MoMo");
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDates, setFilterDates] = useState<[string, string] | null>(null);
  const [filterAmountOrder, setFilterAmountOrder] = useState<string>("asc");
  const [api, contextHolder] = notification.useNotification();
  const type = "deposit";

  const formatCurrency = (value: number) => {
    setFilterAmountOrder;
    setFilterStatus;
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 3, // Hiển thị luôn 3 chữ số thập phân
      maximumFractionDigits: 3, // Giới hạn 3 chữ số thập phân
    }).format(value);
  };

  useEffect(() => {
    const fetchUserWallet = async () => {
      try {
        const response = await instance.get(`wallet`);
        setWallet(response.data);
      } catch (error) {
        message.error("Không thể tải ví tiền");
      } finally {
        setLoading(false);
      }
    };
    fetchUserWallet();

    const fetchTransactionHistory = async () => {
      try {
        setHistoryLoading(true);
        const params: any = { page: 1, amountOrder: filterAmountOrder };

        if (filterStatus !== "all") {
          params.status = filterStatus;
        }

        if (filterDates && filterDates.length === 2) {
          params.startDate = filterDates[0];
          params.endDate = filterDates[1];
        }

        const response = await instance.get(`/wallet/history`, { params });
        setHistory(response.data.data);
      } catch (error) {
        message.error("Không thể tải lịch sử giao dịch");
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchTransactionHistory();
  }, [filterStatus, filterDates, filterAmountOrder]);

  const handleAddMoney = async () => {
    if (coin <= 0) {
      message.error("Số xu nạp phải lớn hơn 0");
      return;
    } else if (coin >= 10000) {
      message.error("Mỗi lần nạp được tối đa 10000 xu");
      return;
    }
    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán");
      return;
    }
    try {
      setLoading(true);
      const response = await instance.post(`payment/`, {
        coin: coin,
        paymentMethod,
        type: type,
      });
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        message.error("Thanh toán thất bại, vui lòng thử lại sau.");
      }
    } catch (error) {
      message.error("Không thể nạp xu vào ví");
    } finally {
      setLoading(false);
    }
  };
  const openNotification = (message: string, description: string) => {
    api.info({
      message: message,
      description: description,
      placement: "topRight",
    });
  };
  return (
    <>
      {contextHolder}
      <div className="container mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <Spin size="large" tip="Đang tải ví..." />
          </div>
        ) : (
          <Card
            className="shadow-2xl bg-gradient-to-r from-blue-500 to-green-400 rounded-lg p-6"
            title="Thông tin ví "
            extra={
              <ReloadOutlined
                className="cursor-pointer text-white text-2xl"
                onClick={() => window.location.reload()}
              />
            }
          >
            {wallet ? (
              <div className="flex flex-col items-center space-y-6">
                <DollarOutlined className="text-6xl text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">
                  {wallet.balance !== undefined && wallet.balance !== null
                    ? wallet.balance.toLocaleString()
                    : "0"}{" "}
                  Xu
                </h2>

                <Button
                  type="primary"
                  className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => setIsModalOpen(true)}
                  style={{ width: "100px" }}
                >
                  Nạp xu
                </Button>
              </div>
            ) : (
              <p className="text-center text-lg text-red-500">
                Không tìm thấy thông tin ví
              </p>
            )}
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Biến động số dư</h2>
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <div className="flex space-x-4 mb-6">
              <RangePicker
                className="mb-4"
                onChange={(_, dateStrings) => setFilterDates(dateStrings)}
              />
            </div>
            {historyLoading ? (
              <Spin tip="Đang tải lịch sử..." />
            ) : (
              <div className="transaction-history">
                {historyLoading ? (
                  <Spin tip="Đang tải lịch sử..." />
                ) : history.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Không có giao dịch nào trong khoảng thời gian được chọn.
                  </div>
                ) : (
                  history
                    .filter(
                      (transaction) => transaction.status === "Thành công"
                    ) // Lọc trạng thái Thành công
                    .map((transaction) => (
                      <Card
                        key={transaction.transactionId}
                        className="mb-2 shadow-sm border rounded-md"
                        style={{
                          borderRadius: "8px",
                          background: wallet
                            ? "linear-gradient(to right, #E6F7FF, #FFFFFF)"
                            : "white",
                        }}
                      >
                        <div className="grid grid-cols-4 gap-4 items-center text-sm font-medium text-gray-700">
                          <div>
                            {new Date(transaction.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                            {" - "}
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>

                          <div className="text-gray-800">
                            {transaction.notification}
                          </div>

                          <div
                            className={`${
                              transaction.status === "Thành công"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {transaction.status}
                          </div>

                          {/* Cột 4: Số tiền cộng/trừ */}
                          <div
                            className={`${
                              transaction.type === "withdraw"
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {transaction.type === "deposit"
                              ? `+${transaction.amount.toLocaleString()} Xu`
                              : `-${transaction.amount.toLocaleString()} Xu`}
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            )}
          </div>
        </div>

        <Modal
          title="Nạp xu"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <div className="space-y-4">
            <Form onFinish={handleAddMoney}>
              <Form.Item
                label="Số xu"
                name="coin"
                rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số xu muốn nạp"
                  value={coin}
                  onChange={(e) => setCoin(Number(e.target.value))}
                  min={10}
                  max={10000000}
                  addonAfter="Xu"
                />
              </Form.Item>
              {coin > 0 && (
                <div
                  style={{
                    marginBottom: "16px",
                    fontStyle: "italic",
                    color: "#888",
                  }}
                >
                  Số tiền: {formatCurrency(coin)}
                </div>
              )}
              <label className="font-medium">Phương thức thanh toán</label>
              <Form.Item
                label="pttt"
                name="paymentMethod"
                rules={[
                  { required: true, message: "Vui lòng chọn phương thức!" },
                ]}
              >
                <Radio.Group
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  className="mb-4 w-full"
                >
                  <div className="flex flex-col space-y-4 w-full px-4">
                    {/* Tùy chọn thanh toán MoMo */}
                    <div
                      className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:shadow-lg w-full"
                      style={{ borderRadius: "10px" }}
                      onClick={() => setPaymentMethod("MoMo")}
                    >
                      <div className="flex flex-col">
                        <Radio value="MoMo">Thanh Toán MoMo</Radio>
                        <p className="font-medium">Ví điện tử MoMo</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/MOMOPAY@2x.png"
                          alt="MoMo"
                          className="w-10 h-6"
                        />
                        <i className="fa fa-chevron-right text-gray-400"></i>
                      </div>
                    </div>

                    {/* Tùy chọn thanh toán VNPay */}
                    <div
                      className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:shadow-lg w-full"
                      style={{ borderRadius: "10px" }}
                      onClick={() =>
                        openNotification(
                          "Thông báo",
                          "Tính năng thanh toán bằng VNPay đang phát triển"
                        )
                      }
                    >
                      <div className="flex flex-col cursor-pointer">
                        <Radio disabled value="VNPay">
                          Thanh Toán VNPay
                        </Radio>
                        <p className="font-medium">Cổng thanh toán VNPay</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://tse3.mm.bing.net/th?id=OIP.kklIaX3TV97u5KnjU_Kr4wHaHa&pid=Api&P=0&h=180"
                          alt="VNPay"
                          className="w-8 h-6"
                        />
                        <i className="fa fa-chevron-right text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </Radio.Group>
              </Form.Item>

              <div className="flex justify-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full"
                >
                  Nạp xu
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WalletPage;
