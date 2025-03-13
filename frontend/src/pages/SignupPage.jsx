import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const SignupPage = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
    email: "",
    address: "",
    mobile_number: "",
  });

  const { signup, isSigningUp, error } = useAuthStore();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-full max-w-sm shadow-xl bg-base-200 p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="input input-bordered w-full"
              value={data.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="input input-bordered w-full"
              value={data.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="input input-bordered w-full"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              className="input input-bordered w-full"
              value={data.address}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="mobile_number" className="block text-sm font-medium">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobile_number"
              id="mobile_number"
              className="input input-bordered w-full"
              value={data.mobile_number}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;