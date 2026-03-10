import Navbar from "../../../components/user_components/navbar/Navbar";
import ProfileNavbar from "../../../components/user_components/profile_navbar/ProfileNavbar";
import OrderDetails from "../../../components/user_components/order_details/OrderDetails";
import { useParams } from "react-router-dom";

const OrderDetailsPage = () => {
  const { id } = useParams();
  return (
    <div className="text-black min-h-screen h-fit">
      <Navbar />
      <ProfileNavbar />
      {/* <BreadCrumb /> */}

      <div className="pt-8 px-36">
        <OrderDetails id={id} />
      </div>
    </div>
  );
};

export default OrderDetailsPage;
