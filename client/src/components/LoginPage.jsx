import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const LoginPage = () => {
  const { navigate, setUser } = useAppContext();

  const [loginType, setLoginType] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    let identifier =
      loginType === "email" ? email.trim() : phone.slice(-10);

    if (!identifier || !password.trim()) {
      return alert("All fields required");
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!data.success) return alert(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">
      <div className="w-[340px] bg-white rounded-[40px] p-6 shadow-xl relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-orange-400 to-pink-500 rounded-b-[60px]"></div>

        <form onSubmit={handleLogin} className="relative z-10 mt-16">
          <h2 className="text-center text-xl font-semibold mb-6">Login</h2>

          
          <div className="flex mb-4 bg-gray-200 rounded-full p-1 ">
            <button
              type="button"
              onClick={() => {
                setLoginType("email");
                setPhone("");
              }}
              className={`w-1/2 py-1 rounded-full text-gray-900 font-medium ${
                loginType === "email" ? "bg-white shadow" : ""
              }`}
            >
              Email
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType("phone");
                setEmail("");
              }}
              className={`w-1/2 py-1 rounded-full text-gray-900 font-medium ${
                loginType === "phone" ? "bg-white shadow" : ""
              }`}
            >
              Phone
            </button>
          </div>

          
          {loginType === "email" ? (
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full mb-3 px-4 py-2 rounded-full bg-gray-300 outline-none text-gray-900 font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <div className="mb-3 text-gray-900 font-medium">
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={(value) => setPhone(value)}
                inputClass="!w-full !bg-gray-300 !rounded-full !pl-14 !text-gray-900 !font-medium"
              />
            </div>
          )}

          
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-full bg-gray-300 outline-none text-gray-900 font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-4 top-2 cursor-pointer text-sm text-gray-900 font-medium"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button
            disabled={loading}
            className="w-full py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm mt-4 text-gray-900 font-medium">
            Don’t have an account?{" "}
            <span
              className="text-pink-500 cursor-pointer font-medium"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;