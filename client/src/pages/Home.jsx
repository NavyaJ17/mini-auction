import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";

function Home() {
  const { isLoggedIn } = useContext(AppContext);
  return (
    <>
      {isLoggedIn ? <Navbar /> : ""}
      <div className="flex flex-col justify-center items-center gap-8">
        <div className="flex flex-col items-center">
          <h1 className="text-5xl font-bold text-center">
            Welcome to Mini Auction
          </h1>
          <p className="text-xl text-center w-120">
            A mini real-time auction platform where users can create and view
            auctions, place bids, view highest bids, get notified, and accept,
            rejct or counter highest bids all in real-time.
          </p>
        </div>
        {isLoggedIn ? (
          <Link
            to={"/auctions"}
            className="px-4 py-2 bg-gray-200 rounded-lg text-lg font-semibold"
          >
            View auctions list
          </Link>
        ) : (
          <Link
            to={"/login"}
            className="px-4 py-2 bg-gray-200 rounded-lg text-lg font-semibold"
          >
            Login to get started
          </Link>
        )}
      </div>
    </>
  );
}

export default Home;
