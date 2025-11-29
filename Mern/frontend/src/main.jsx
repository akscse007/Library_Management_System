// frontend/src/main.jsx
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import API, { TOKEN_KEY } from "./api/axios";

function Root() {
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
