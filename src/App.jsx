import React from "react";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "13px",
          },
        }}
      />
      <AppRouter />
    </ErrorBoundary>
  );
}
