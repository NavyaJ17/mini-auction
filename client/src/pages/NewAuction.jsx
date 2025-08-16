import axios from "axios";
import React from "react";
import { useRef } from "react";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function NewAuction() {
  const itemNameRef = useRef();
  const descRef = useRef();
  const startingPriceRef = useRef();
  const bidIncrementRef = useRef();
  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const { accessToken } = useContext(AppContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let res = await axios.post(
        "/api/auctions/new",
        {
          itemName: itemNameRef.current.value,
          description: descRef.current.value,
          startingPrice: startingPriceRef.current.value,
          bidIncrement: bidIncrementRef.current.value,
          startTime: startTimeRef.current.value,
          endTime: endTimeRef.current.value,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      navigate(`/auctions/${res.data.auction.id}`);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  }

  return (
    <>
      <Navbar />
      <div className="mt-19 flex flex-col items-center justify-center gap-8 p-8 border border-gray-500 rounded-2xl">
        <div>
          <h1 className="font-bold text-3xl text-center">New Auction</h1>
          <h2 className="text-center text-lg mt-2">
            Please enter the following details.
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="text-sm flex flex-col h-full rounded-2xl gap-2"
        >
          <div>
            <h1 className="pl-3">Item Name:</h1>
            <div className="px-3 py-2 border border-gray-500 rounded-full">
              <input type="text" ref={itemNameRef} className="w-lg"></input>
            </div>
          </div>
          <div>
            <h1 className="pl-3">Description:</h1>
            <div className="px-3 py-2 border border-gray-500 rounded-2xl">
              <textarea ref={descRef} className="w-lg"></textarea>
            </div>
          </div>
          <div>
            <h1 className="pl-3">Starting Price:</h1>
            <div className="px-3 py-2 border border-gray-500 rounded-full">
              ${" "}
              <input
                type="number"
                ref={startingPriceRef}
                className="w-lg"
              ></input>
            </div>
          </div>
          <div>
            <h1 className="pl-3">Bid Increment:</h1>
            <div className="px-3 py-2 border border-gray-500 rounded-full">
              ${" "}
              <input
                type="number"
                ref={bidIncrementRef}
                className="w-lg"
              ></input>
            </div>
          </div>
          <div>
            <h1 className="pl-3">Start Time:</h1>
            <div className="px-3 py-2 border border-gray-500 rounded-full">
              <input
                type="datetime-local"
                ref={startTimeRef}
                className="w-lg"
              ></input>
            </div>
          </div>
          <div>
            <h1 className="pl-3">End Time:</h1>
            <div className="px-3 py-2 border border-gray-500 rounded-full">
              <input
                type="datetime-local"
                ref={endTimeRef}
                className="w-lg"
              ></input>
            </div>
          </div>
          <button
            type="submit"
            className="bg-gray-100 px-3 py-2 text-xl rounded-full mt-4 cursor-pointer"
          >
            Create Auction
          </button>
        </form>
      </div>
    </>
  );
}

export default NewAuction;
