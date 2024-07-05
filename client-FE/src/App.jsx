import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorPage from "./layout/ErrorPage";
import Register from "./views/register/Register.jsx";
import Messenger from "./views/messenger/Messenger.jsx";
import "@fontsource/inter";
// Supports weights 100-900
import "@fontsource-variable/inter";

function App() {
  const [user, setUser] = useState(null);

  // Get user from context provider
  useEffect(() => {
    let currUser = JSON.parse(localStorage.getItem("user")) || null;
    setUser(currUser);
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: !user ? <Navigate to="/register" /> : <Messenger />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/register",
      element: user ? <Navigate to="/" /> : <Register />,
      errorElement: <ErrorPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
