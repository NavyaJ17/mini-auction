import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { isLoggedIn, setIsLoggedIn, userData, setUserData, setAccessToken } =
    useContext(AppContext);
  const navigate = useNavigate();

  async function handleClick() {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setUserData(null);
      setAccessToken(null);
      navigate("/");
      toast.success("Logged out successfully.");
    } catch (error) {
      console.log(error);
      //   toast.error(error.response.data.error);
    }
  }

  return (
    <div className="fixed top-0 left-0 px-8 p-4 border-b border-gray-500 w-full flex items-center gap-2 text-lg font-semibold bg-white">
      <div className="bg-gray-200 flex justify-center items-center px-4 py-2 text-lg font-bold rounded-full">
        {userData.name[0]}
      </div>
      <p className="flex-1">Hi, {userData.name}</p>
      <Link
        to={"/auctions/new"}
        className="hover:underline px-3 py-1 rounded-lg cursor-pointer"
      >
        New Auction
      </Link>
      <button
        onClick={handleClick}
        className="bg-gray-200 px-3 py-1 rounded-lg cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;
