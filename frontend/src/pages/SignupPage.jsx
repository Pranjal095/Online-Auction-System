import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, Mail, Lock, MapPin, Phone, Rocket } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl shadow-xl rounded-lg overflow-hidden bg-base-200">
        {/* Left Side - Signup Form */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">Create an Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="text-primary w-5 h-5" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input input-bordered w-full"
                value={data.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Lock className="text-primary w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input input-bordered w-full"
                value={data.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-primary w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={data.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5" />
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="input input-bordered w-full"
                value={data.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-primary w-5 h-5" />
              <input
                type="text"
                name="mobile_number"
                placeholder="Mobile Number"
                className="input input-bordered w-full"
                value={data.mobile_number}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? "Signing Up..." : "Sign Up"}
            </button>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center bg-primary text-primary-content p-8">
          <Rocket className="w-16 h-16" />
          <h2 className="text-3xl font-bold mt-4">Join the Auction Community</h2>
          <p className="text-center mt-2 text-sm opacity-80">
            Discover exclusive deals, bid on unique items, and sell effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;