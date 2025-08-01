import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { Provider } from "react-redux";
import RouteProvider from "@app/providers/RouteProvider";
import store from "./providers/store";
import { Spin } from "antd";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <Spin size="large" className="h-screen flex justify-center" />
        }
      >
        <RouteProvider />
      </Suspense>
    </QueryClientProvider>
  </Provider>
);
