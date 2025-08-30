import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();

    axios
      .post("/users/login", {
        email,
        password,
      })
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
      {/* Left Side with background image */}
      <div
        className="hidden md:flex w-1/2 text-white flex-col items-center justify-center p-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/Motivational Reminder - Mobile Wallpaper.png')",
        }}
      >
        <div className="bg-black bg-opacity-60 p-6 rounded-lg text-center">
          <h1 className="text-6xl font-light font-Quicksand mb-4">Welcome Back</h1>
          <p className="text-sm text-gray-200 max-w-md">
            Discover, share, and build amazing web components and full-stack
            projects with our AI-powered platform.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white relative">
        {/* Back button on top-left */}
        <div className="absolute top-6 left-6">
          <Link
            to="https://thesearchifi.netlify.app/"
            className="flex items-center text-gray-600 hover:text-indigo-600 font-light"
          >
            ← Back
          </Link>
        </div>

        <div className="w-full max-w-md text-sm p-8">
          <h2 className="text-4xl font-thin font-Quicksand text-gray-900 mb-2">
            Welcome Back To{" "}
            <span className="text-black">TheSearchifi</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:underline font-normal"
            >
              Create a new account now
            </Link>
            , it’s FREE! Takes less than a minute.
          </p>

          <form onSubmit={submitHandler} className="space-y-4 rounded-lg">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                required
                placeholder="********"
                className="w-full px-4 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition"
            >
              Login Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 