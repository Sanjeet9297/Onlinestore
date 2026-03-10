import SideBar from "../../../components/user_components/filter_sidebar/SideBar";
import Navbar from "../../../components/user_components/navbar/Navbar";
import BreadCrumb from "../../../components/user_components/breadcrumb/BreadCrumb";
import Footer from '../../../components/user_components/footer/Footer'

const AllProduct = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <BreadCrumb />
      <SideBar />
      <Footer />
    </div>
  );
};

export default AllProduct;
