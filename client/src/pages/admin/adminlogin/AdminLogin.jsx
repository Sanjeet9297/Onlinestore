import React, { useEffect, useState } from "react";
import SignupImg from "../../../assets/images/auth/nike.png";
import { adminlogin } from "../../../api/admin";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  //Checking admin loggedIn or not
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if(token){
      console.log("admin already exists");
      navigate('/dashboard/overview')
    }
  }, []);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation logic
  const validate = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (validate()) {
        const loginSuccess = await adminlogin(formData);

        if (loginSuccess) {
          navigate("/dashboard/overview");
          setLoading(false);
        } else {
          setErrors({ general: "Invalid login credentials" });
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a3120] w-full h-screen flex items-center justify-center">
      <div className="bg-white w-[70%] h-[80%] rounded-md flex">
        <div className="bg-black w-[50%] h-[100%] flex flex-col justify-center items-center">
          <img
            src={SignupImg}
            alt=""
            className="w-[286px] rotate-[321deg] brightness-[0.6] relative right-[40px] bottom-[35px]"
          />

          <h1 className="text-6xl absolute font-bold text-white">StepUp</h1>
        </div>
        <div className="w-[50%] text-black font-clash-grotesk flex flex-col items-center justify-center py-3 gap-8 text-center">
          <div>
            <h1 className="text-3xl font-bold font-clash-grotesk">
              Admin Login
            </h1>
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
              <label className="absolute left-0 top-0 text-gray-400 transition-all duration-300 ease-in-out pointer-events-none peer-focus:top-[-20px] peer-valid:top-[-20px] peer-focus:text-gray-800 peer-valid:text-gray-800 peer-focus:text-sm peer-valid:text-sm">
                Email
              </label>
              <div className="text-red-600">{errors.email}</div>
            </div>

            <div className="relative w-80">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="peer w-full text-lg border-0 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-gray-800 focus:ring-0 transition duration-300 ease-in-out"
                required
              />
              <label className="absolute left-0 top-0 text-gray-400 transition-all duration-300 ease-in-out pointer-events-none peer-focus:top-[-20px] peer-valid:top-[-20px] peer-focus:text-gray-800 peer-valid:text-gray-800 peer-focus:text-sm peer-valid:text-sm">
                Password
              </label>
              <div className="text-red-600">{errors.password}</div>
            </div>
            {errors.general && (
              <div className="text-red-600 mt-2">{errors.general}</div>
            )}
            <button
              type="submit"
              className="btn w-60 text-white mx-auto bg-black"
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
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
