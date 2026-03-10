import React, { useEffect, useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import SignupImg from "../../../assets/images/auth/nike.png";
import { Link, useNavigate } from "react-router-dom";
import { login, storeGoogleInfo } from "../../../api/users";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../../firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../features/users/UserSlice";
import { initializeBag } from "../../../features/bag/BagSlice";
import { HiEye, HiEyeOff } from "react-icons/hi";

const Login = () => {
  const isVerified = useSelector((state) => state.user.isVerified);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isVerified) {
      navigate("/");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation logic
  const validate = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.password) tempErrors.password = "Password is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (validate()) {
      setLoading(true);
      try {
        const { user } = await login(formData);
        dispatch(
          setUser({
            uid: user._id,
            username: user.username,
            email: user.email,
            isVerified: true,
          })
        );
        dispatch(initializeBag({ userId: user._id }));
        navigate("/");
      } catch (error) {
        setErrorMessage("Invalid email or password");
      } finally {
        setLoading(false);
      }
    }
  };

  //google login
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Get user information from result
      const user = result.user;
      const userDetails = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        profileImage: user.photoURL,
      };
      const googleUser = await storeGoogleInfo(userDetails);
      dispatch(
        setUser({
          uid: googleUser.user.uid,
          username: user.displayName,
          email: user.email,
          isVerified: true,
          googleUser: true,
        })
      );
      dispatch(initializeBag({ userId: googleUser.user.uid }));

      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="bg-[#dbdbdb] w-full h-screen flex items-center justify-center">
      <div className="bg-white w-[70%] h-[80%] rounded-md flex">
        <div className="bg-black w-[50%] h-[100%] rounded-md flex flex-col justify-center items-center">
          <img
            src={SignupImg}
            alt=""
            className="w-[286px] rotate-[321deg] brightness-[0.6] relative right-[40px] bottom-[35px]"
          />

          <h1 className="text-6xl absolute font-bold text-white">StepUp</h1>
        </div>
        <div className="w-[50%] text-black font-clash-grotesk flex flex-col items-center justify-evenly py-3 gap-3 text-center">
          <div>
            <h1 className="text-3xl font-bold font-clash-grotesk">
              Welcome Back
            </h1>
            <h3 className="text-sm text-[#201f1fde] font-semibold">
              New to StepUp?{" "}
              <Link to={"/signup"} className="text-black underline">
                Sign Up
              </Link>
            </h3>
          </div>
          <form
            className="flex flex-col gap-8 relative top-2"
            onSubmit={handleSubmit}
          >
            {/* Input section */}
            <div className="relative w-80">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="peer w-full text-lg border-0 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-black focus:ring-0 transition duration-300 ease-in-out"
                required
              />
              <label className="absolute left-0 top-[22px] text-gray-400 transition-all duration-300 ease-in-out pointer-events-none peer-focus:top-[-12px] peer-valid:top-[-12px] peer-focus:text-gray-800 peer-valid:text-gray-800 peer-focus:text-sm peer-valid:text-sm">
                Email
              </label>
              <div className="text-red-600">{errors.email}</div>
            </div>

            <div className="relative w-80">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="peer w-full text-lg border-0 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-gray-800 focus:ring-0 transition duration-300 ease-in-out"
                required
              />
              <label className="absolute left-0 top-[22px] text-gray-400 transition-all duration-300 ease-in-out pointer-events-none peer-focus:top-[-12px] peer-valid:top-[-12px] peer-focus:text-gray-800 peer-valid:text-gray-800 peer-focus:text-sm peer-valid:text-sm">
                Password
              </label>
              <div
                className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? (
                  <HiEyeOff className="text-gray-500" />
                ) : (
                  <HiEye className="text-gray-500" />
                )}
              </div>
              <Link to={"/forgotPassword"}>
                <p className="text-left text-gray-700 mt-2 text-sm cursor-pointer underline">
                  Forgot password?
                </p>
              </Link>
              <div className="text-red-600">{errors.password}</div>
            </div>
            {errorMessage && <div className="text-red-600">{errorMessage}</div>}

            <button
              type="submit"
              className={`btn w-60 text-white mx-auto bg-black`}
              disabled={loading}
            >
              {loading ? (
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* LINE */}
          <div className="w-80 h-[2px] bg-gray-500"></div>
          {/* Icons */}
          <div className="flex space-x-4 relative bottom-2">
            {/* Google Icon */}
            <div
              className="flex gap-8 items-center justify-center w-fit px-3 h-12 border-2 border-black rounded cursor-pointer"
              onClick={handleGoogleSignIn}
            >
              <FaGoogle className="text-black text-xl" />
              Continue With Google
            </div>

            {/* Facebook Icon */}
            {/* <div className="flex gap-2 items-center justify-center w-fit h-12 border-2 px-3 border-black rounded cursor-pointer">
              <FaFacebookF className="text-black text-xl" />
              Continue With facebook
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
