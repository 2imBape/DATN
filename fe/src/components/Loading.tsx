import React from "react";
import { Spin } from "antd";

const Loading: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px 0" }}>
      <Spin size="large" />
    </div>
  );
};

export default Loading;
