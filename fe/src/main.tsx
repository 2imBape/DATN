import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./global.css";
import "./styles/style.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleProvider } from "@ant-design/cssinjs";
import { I18nextProvider } from "react-i18next";
import i18n from "./common/lib/i18n";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <StyleProvider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </StyleProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
