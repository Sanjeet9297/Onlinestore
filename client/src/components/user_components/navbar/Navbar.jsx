import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { logout as logoutFunction } from "../../../api/users";
import { logoutUser } from "../../../features/users/UserSlice";
import { persistor } from "../../../app/Store";

const Navbar = () => {
  const { username, email } = useSelector((state) => state.user);
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [logout, setLogout] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      {
        y: -100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      }
    );
  }, [logout]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  //User Logout
  const handleLogout = async (e) => {
    e.preventDefault();
    await logoutFunction();
    console.log("Logging out..."); 
    dispatch(logoutUser());
    navigate("/login");
    console.log("User logged out."); 
    persistor.purge();
  };

  return (
    <div
      ref={navRef}
      className=" bg-white text-black sticky z-10 top-0 flex justify-between items-center py-5 px-10 font-clash-display font-bold"
    >
      <Link to={"/"}>
        <h1 className="text-2xl font-font-clash-grotesk cursor-pointer">
          StepUp
        </h1>
      </Link>

      {/* Desktop Menu */}
      <nav className="hidden md:flex">
        <ul className="flex gap-10">
          <Link to={"/"}>Home</Link>
          <Link to={"/products"}>Products</Link>
          <Link to={"/wishlist"}>Wishlist</Link>
          <Link to={"/bag"}>Bag</Link>
          {/* <li>About Us</li> */}
        </ul>
      </nav>

      {/* User Icon (Visible on all screens) */}

      <Menu as="div" className="relative inline-block text-left">
        <div>
          {username ? (
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {username}
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 h-5 w-5 text-gray-400"
              />
            </MenuButton>
          ) : (
            <Link
              to="/login"
              className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Sign In
            </Link>
          )}
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            <MenuItem>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                Signed in as <br />
                {email}
              </a>
            </MenuItem>
            <hr />
            <MenuItem>
              <Link
                to={"/profile"}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                Profile
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                to={"/profile/orders"}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                Orders
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                to={"/profile/settings"}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                Account settings
              </Link>
            </MenuItem>
            <form onSubmit={handleLogout}>
              <MenuItem>
                <button
                  type="submit"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                >
                  Log out
                </button>
              </MenuItem>
            </form>
          </div>
        </MenuItems>
      </Menu>

      {/* Hamburger Icon (Visible on mobile) */}
      <div className="md:hidden">
        <button onClick={toggleMenu}>
          {isOpen ? (
            <HiX className="text-3xl" />
          ) : (
            <HiMenuAlt3 className="text-3xl" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg py-5 z-20 md:hidden">
          <nav>
            <ul className="flex flex-col items-center gap-5">
              <Link to={"/"}>Home</Link>
              <Link to={"/products"}>Products</Link>
              <Link to={"/wishlist"}>Wishlist</Link>
              <Link to={"/bag"}>Bag</Link>
            </ul>
          </nav>
        </div>
      )}

      {/* DROPDOWN OF PROFILE */}
    </div>
  );
};

export default Navbar;
