import React from "react";
import ReactDOM from "react-dom/client";
// Router'ı tüm uygulamada aktif hale getirmek için BrowserRouter'ı import ediyoruz.
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Uygulamamızın tamamını BrowserRouter ile sarmalayarak yönlendirme özelliklerini aktif hale getiriyoruz. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
