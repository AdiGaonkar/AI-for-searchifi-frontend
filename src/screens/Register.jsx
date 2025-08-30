import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    axios
      .post("/users/register", { email, password })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div
        className="w-1/2 relative bg-cover bg-center text-white hidden lg:flex flex-col justify-center items-center px-10 py-16"
        style={{
          backgroundImage: `url('/Motivational Reminder - Mobile Wallpaper.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
        <div className="relative z-10 text-center max-w-md">
          <h1 className="text-5xl font-light font-Quicksand mb-4">
            Welcome to <span className="font-semibold">TheSearchifi</span>
          </h1>
          <p className="text-sm mt-2">
            Discover, share, and build amazing web components and full-stack
            projects with our AI-powered platform.
          </p>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 relative">
        {/* Back text (top-left) */}
        <Link
          to="/"
          className="absolute top-4 left-4 text-sm text-gray-600 hover:text-gray-900"
        >
           ← Back
        </Link>

        <div className="w-full max-w-md p-8">
          <h2 className="text-4xl text-center font-Quicksand font-light mb-6">
            Create Your Account
          </h2>
          <form onSubmit={submitHandler}>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 rounded-md bg-black text-white hover:bg-gray-800"
            >
              Register
            </button>
          </form>
          <p className="text-gray-600 mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
