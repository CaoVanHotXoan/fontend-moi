import "@/styles/globals.css";
import "@/styles/HeaderFooter.css";
import type { AppProps } from "next/app";
import HieuUng from "@/TS/HieuUng";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import RouteLoading from "@/components/RouteLoading";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {/* Khởi tạo hiệu ứng dùng chung cho mọi trang */}
          <HieuUng />
          <RouteLoading />
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
