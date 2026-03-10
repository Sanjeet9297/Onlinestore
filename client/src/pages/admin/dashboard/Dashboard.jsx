import { Routes, Route } from "react-router-dom";
import AdminNavbar from "../../../components/admin_components/AdminNavbar";
import AdminSidebar from "../../../components/admin_components/AdminSidebar";
import { lazy, Suspense } from "react";

const UserManagement = lazy(() =>
  import("../../../components/admin_components/UserManagement")
);
const ProductManagement = lazy(() =>
  import("../../../components/admin_components/ProductManagement")
);
const CategoryManagement = lazy(() =>
  import("../../../components/admin_components/CategoryManagement")
);
const OrderManagement = lazy(() =>
  import("../../../components/admin_components/OrderManagement")
);
const CouponManagement = lazy(() =>
  import("../../../components/admin_components/CouponManagement")
);
const SalesReport = lazy(() =>
  import("../../../components/admin_components/SalesReport")
);
const OfferManagement = lazy(() =>
  import("../../../components/admin_components/OfferManagement")
);
const Overview = lazy(() =>
  import("../../../components/admin_components/Overview")
);

const Dashboard = () => {
  return (
    <div className="h-screen bg-[#1f2937]">
      <AdminNavbar />
      <AdminSidebar />
      <div className="content-area">
        <Suspense
          fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-black"></span>
            </div>
          }
        >
          <Routes>
            <Route path="user_management" element={<UserManagement />} />
            <Route path="product_management" element={<ProductManagement />} />
            <Route
              path="category_management"
              element={<CategoryManagement />}
            />
            <Route path="order_management" element={<OrderManagement />} />
            <Route path="coupon_management" element={<CouponManagement />} />
            <Route path="offer_management" element={<OfferManagement />} />
            <Route path="sales_report" element={<SalesReport />} />
            <Route path="overview" element={<Overview />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
