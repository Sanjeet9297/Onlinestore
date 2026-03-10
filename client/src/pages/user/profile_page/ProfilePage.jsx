import React from "react";
import ProfileNavbar from "../../../components/user_components/profile_navbar/ProfileNavbar";
import Navbar from "../../../components/user_components/navbar/Navbar";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const {username, email} = useSelector((state) => state.user);
  return (
    <div className="text-black min-h-screen h-fit">
      <Navbar />
      <ProfileNavbar />

      {/* Details Section */}
      <div className="pt-14 px-36 mt-4 flex items-center gap-5">
        {/* img */} <div className="h-28 w-28 bg-black rounded-full"></div>

        {/* details */}
        <div>
            <h1 className="text-lg">{username}</h1>
            <h2 className="text-md text-[#505050c7]">{email}</h2>
            <h3>StepUp Member Since October 2024</h3>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
