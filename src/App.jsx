import React from "react";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router";

export default function App() {
  return (
    <>
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
    </>
  );
}
