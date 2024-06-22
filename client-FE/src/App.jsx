import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useContext,  } from "react";
import { AuthContext } from "./context/AuthContext";
import ErrorPage from "./layout/ErrorPage";
import Register from "./views/register/Register.jsx";
import Messenger from "./views/messenger/Messenger.jsx";
import "@fontsource/inter";
// Supports weights 100-900
import '@fontsource-variable/inter';

function App() {
  // Get user from context provider
  const { user } = useContext(AuthContext);

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
