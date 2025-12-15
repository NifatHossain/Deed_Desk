import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { createBrowserRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";
import MainLayout from "./layout/MainLayout";
import UploadPage from "./pages/UploadPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,          
        element: <Home />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
    ],

  },
  
]);

export default router