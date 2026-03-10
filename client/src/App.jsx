import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";

// Protected Routes
import AdminProtectedRoute from "./protectedRoutes/adminProtectedRoute";
import UserProtectedRoute from "./protectedRoutes/UserProtectedRoute";
import Categories from "./pages/user/category/Categories";
import socket from "./utils/socket";
import { logoutUser } from "./features/users/UserSlice";
import { persistor } from "./app/Store";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/admin/dashboard/Dashboard"));
const Signup = lazy(() => import("./pages/user/signup/Signup"));
const Login = lazy(() => import("./pages/user/login/Login"));
const AdminLogin = lazy(() => import("./pages/admin/adminlogin/AdminLogin"));
const Homepage = lazy(() => import("./pages/user/homepage/Homepage"));
const AllProduct = lazy(() => import("./pages/user/all_product/AllProduct"));
const SingleProductPage = lazy(() =>
  import("./pages/user/single_productpage/SingleProductPage")
);
const OtpPage = lazy(() => import("./pages/user/otp/OtpPage"));
const Page404 = lazy(() => import("./components/user_components/404/Page404"));
const ProfilePage = lazy(() => import("./pages/user/profile_page/ProfilePage"));
const Settings = lazy(() => import("./pages/user/settings/Settings"));
const DeliveryAddresses = lazy(() =>
  import("./pages/user/delivery_addresses/DeliveryAddresses")
);
const Bag = lazy(() => import("./pages/user/bag/Bag"));
const Checkout = lazy(() => import("./pages/user/checkout/Checkout"));
const ListOrders = lazy(() => import("./pages/user/orders/ListOrders"));
const Wishlist = lazy(() => import("./pages/user/wishlist/Wishlist"));
const Coupons = lazy(() => import("./pages/user/coupons/Coupons"));
const OrderSuccessPage = lazy(() =>
  import("./pages/user/order_success/OrderSuccessPage")
);
const Wallet = lazy(() => import("./pages/user/wallet/Wallet"));
const OrderDetailsPage = lazy(() =>
  import("./pages/user/orderDetails/OrderDetailsPage")
);
const OrderPendingPage = lazy(() =>
  import("./pages/user/orderPending/OrderPendingPage")
);
const ForgotPassword = lazy(() =>
  import("./pages/user/forgotPassword/ForgotPassword")
);
const ForgotPasswordVerify = lazy(() =>
  import("./pages/user/forgotPassword_verify/ForgotPasswordVerify")
);

const App = () => {
  const { uid } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (uid) {
      // Connect to Socket.IO
      socket.connect();
      console.log("Socket connected");

      // Register user with socket
      socket.emit("registerUser", uid);

      // Listen for userBanned event
      socket.on("userBanned", (data) => {
        console.log("Received userBanned event:", data);
        dispatch(logoutUser());
        toast.info("Account Banned!");
        localStorage.removeItem("userToken");
        persistor.purge(); // Match handleBlockUser
        socket.disconnect();
        navigate("/login");
      });

      // Cleanup on unmount or uid change
      return () => {
        socket.off("userBanned");
        socket.disconnect();
        console.log("Socket disconnected");
      };
    }
  }, [uid, dispatch, navigate]);

  return (
    <PersistGate loading={null} persistor={persistor}>
      <div className="bg-white text-black font-clash-display">
        <ToastContainer theme="dark" />
        <Suspense
          fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-black"></span>
            </div>
          }
        >
          <Routes>
            {/* USER--ROUTES */}
            <Route path="/" element={<Homepage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route
              path="/forgotPassword-verify"
              element={<ForgotPasswordVerify />}
            />
            <Route path="/products" element={<AllProduct />} />
            <Route path="/products/:id" element={<SingleProductPage />} />
            <Route path="/categories" element={<Categories />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <UserProtectedRoute>
                  <ProfilePage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/settings"
              element={
                <UserProtectedRoute>
                  <Settings />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/settings/delivery-addresses"
              element={
                <UserProtectedRoute>
                  <DeliveryAddresses />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/orders"
              element={
                <UserProtectedRoute>
                  <ListOrders />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/orders/:id"
              element={
                <UserProtectedRoute>
                  <OrderDetailsPage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/coupons"
              element={
                <UserProtectedRoute>
                  <Coupons />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/wallet"
              element={
                <UserProtectedRoute>
                  <Wallet />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/bag"
              element={
                <UserProtectedRoute>
                  <Bag />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <UserProtectedRoute>
                  <Wishlist />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/wishlist/:id"
              element={
                <UserProtectedRoute>
                  <SingleProductPage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/bag/checkout"
              element={
                <UserProtectedRoute>
                  <Checkout />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/bag/checkout/order-success"
              element={
                <UserProtectedRoute>
                  <OrderSuccessPage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/bag/checkout/order-pending"
              element={
                <UserProtectedRoute>
                  <OrderPendingPage />
                </UserProtectedRoute>
              }
            />

            {/* ADMIN--ROUTES */}
            <Route
              path="/dashboard/*"
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* 404 PAGE */}
            <Route path="*" element={<Page404 />} />
          </Routes>
        </Suspense>
      </div>
    </PersistGate>
  );
};

export default App;