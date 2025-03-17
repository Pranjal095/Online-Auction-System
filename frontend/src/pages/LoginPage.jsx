import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn } from "lucide-react";

const LoginPage = () => {
  const [data, setData] = useState({ username: "", password: "" });
  const { login, isLoggingIn, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(data);
    const error = useAuthStore.getState().error;
    if (!error) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl shadow-xl rounded-lg overflow-hidden bg-base-200">
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="text-primary w-5 h-5" />
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
            <button type="submit" className="btn btn-primary w-full">
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </form>
        </div>

        <div className="hidden md:flex items-center justify-center bg-primary text-primary-content p-8">
          <div className="text-center">
            <LogIn className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Login to Your Account</h3>
            <p className="text-sm opacity-80 mt-2">
              Experience the best auctions and deals!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
