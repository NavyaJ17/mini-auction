import axios from "axios";
import React from "react";
import { useRef } from "react";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const { setIsLoggedIn, setUserData, setAccessToken } = useContext(AppContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let res = await axios.post(
        "/api/auth/register",
        {
          name: nameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
        },
        { withCredentials: true }
      );
      setIsLoggedIn(res.data.success);
      setUserData(res.data.user);
      setAccessToken(res.data.accessToken);
      toast.success("Logged in successfully");
      navigate("/auctions");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 border border-gray-500 rounded-2xl">
      <div>
        <h1 className="font-bold text-3xl">Create your account</h1>
        <h2 className="text-center text-lg mt-2">
          Create a new account to get started.
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="text-lg flex flex-col h-full rounded-2xl gap-2"
      >
        <div className="px-3 py-2 border border-gray-500 rounded-full">
          <input
            type="text"
            placeholder="Name"
            ref={nameRef}
            className="w-lg"
          ></input>
        </div>
        <div className="px-3 py-2 border border-gray-500 rounded-full">
          <input
            type="email"
            placeholder="Email"
            ref={emailRef}
            className="w-lg"
          ></input>
        </div>
        <div className="px-3 py-2 border border-gray-500 rounded-full">
          <input
            type="password"
            placeholder="Password"
            ref={passwordRef}
            className="w-lg"
          ></input>
        </div>
        <button
          type="submit"
          className="bg-gray-100 px-3 py-2 text-xl rounded-full mt-4 cursor-pointer"
        >
          Signup
        </button>
        <p className="ml-3 mt-1 text-xs sm:text-sm">
          Already have an account?{" "}
          <span className="text-blue-500 underline">
            <Link to={"/login"}>Login</Link>
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
