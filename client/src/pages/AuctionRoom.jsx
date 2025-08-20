import React from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useRef } from "react";
import socket from "../socket";
import Navbar from "../components/Navbar";

function AuctionRoom() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [status, setStatus] = useState(null);
  const { userData, accessToken } = useContext(AppContext);
  const bidRef = useRef();
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [decision, setDecision] = useState(null);
  const [counter, setCounter] = useState(null);
  const counterRef = useRef();

  const updateCountdown = (targetTime, onEnd) => {
    const now = Date.now();
    const end = new Date(targetTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("00:00:00");
      if (onEnd) onEnd();
      return;
    }

    const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

    setTimeLeft(`${hours}:${minutes}:${seconds}`);
  };

  useEffect(() => {
    const getAuction = async () => {
      try {
        let res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auctions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        const auctionData = res.data.auction;
        setAuction(auctionData);
        setHighestBid(auctionData.highestBid?.amount || null);
        setStatus(auctionData.status);
        setDecision(auctionData.decision);
        setCounter(auctionData.counterOffer || null);

        let timer;
        if (auctionData.status === "upcoming") {
          timer = setInterval(
            () =>
              updateCountdown(auctionData.startTime, () => {
                setStatus("active");
                updateCountdown(auctionData.endTime, () => setStatus("ended"));
              }),
            1000
          );
        } else {
          timer = setInterval(
            () =>
              updateCountdown(auctionData.endTime, () => setStatus("ended")),
            1000
          );
        }
        return () => clearInterval(timer);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.error);
      }
    };
    getAuction();
  }, [id, highestBid, decision]);

  useEffect(() => {
    // socket.auth = { userId: userData.id };
    // socket.connect();
    socket.emit("join_room", id);

    socket.on("bid_update", (data) => {
      if (data.auctionId === id) {
        console.log(data.highestBid);
        setHighestBid(data.highestBid);
        toast.info(`A new bid is placed. Current bid $${data.highestBid}`);
      }
    });

    socket.on("outbid", (data) => {
      toast.warn(`You have been outbid. Current bid $${data.newHighestBid}`);
    });

    socket.on("you_won", (data) => {
      toast.success(`Congratulations, you won.`);
    });

    socket.on("bid_accepted", (data) => {
      toast.success(`Congratulations, your bid was accepted.`);
    });

    socket.on("bid_rejected", (data) => {
      toast.error(`Sorry, your bid was rejected.`);
    });

    socket.on("auction_ended", (data) => {
      if (data.auctionId === id) {
        setStatus("ended");
        toast.info(`Auction has ended. $${data.highestBid}`);
      }
    });

    socket.on("decision_update", (data) => {
      if (data.auctionId === id) {
        setDecision(data.decision);
      }
    });

    socket.on("counter_offer", (data) => {
      setCounter(data.counterOffer);
      toast.warn(`Your bid was countered for $${data.counterOffer}`);
    });

    socket.on("counter_offer_accepted", (data) => {
      toast.success(`Your counter offer was accepted`);
    });

    socket.on("counter_offer_rejected", (data) => {
      toast.error(`Your counter offer was rejected`);
    });

    return () => {
      socket.emit("leave_room", id);
      socket.off("bid_update");
      socket.off("outbid");
      socket.off("you_won");
      socket.off("bid_accepted");
      socket.off("bid_rejected");
      socket.off("auction_ended");
      socket.off("counter_offer");
      socket.off("counter_offer_accepted");
      socket.off("counter_offer_rejected");
      socket.off("decision_update");
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bids/${id}`,
        {
          amount: bidRef.current.value,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      bidRef.current.value = "";
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const accept = async () => {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seller/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setDecision("accepted");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };
  const reject = async () => {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seller/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setDecision("rejected");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };
  const counterOffer = async (e) => {
    e.preventDefault();
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seller/${id}/counter`,
        { amount: counterRef.current.value },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setDecision("pending");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const counterAccept = async () => {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seller/${id}/counter-accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setDecision("counter-offer-accepted");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const counterReject = async () => {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seller/${id}/counter-reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setDecision("counter-offer-rejected");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-full w-full mt-19 p-8">
        {auction && (
          <div className="border border-gray-500 h-full w-full overflow-scroll rounded-3xl p-8 flex flex-col gap-16">
            <div className="relative flex items-end justify-between">
              <div className="flex flex-col justify-center items-center">
                <h1>
                  {status === "upcoming"
                    ? "Auction starts in:"
                    : "Auction ends in:"}
                </h1>
                <div className="flex justify-center items-center text-7xl font-bold relative">
                  {timeLeft && timeLeft}
                </div>
              </div>
              <div className="flex flex-col justify-end items-end">
                <h1>
                  Starting Time: {new Date(auction.startTime).toUTCString()}
                </h1>
                <h1>Ending Time: {new Date(auction.endTime).toUTCString()}</h1>
                <h1>Seller ID: {auction.sellerId}</h1>
              </div>
              <div
                className={`absolute text-xs right-0 -top-2 uppercase font-semibold px-2 py-1 rounded-lg ${
                  status === "active"
                    ? "bg-green-200"
                    : status === "ended"
                    ? "bg-red-200"
                    : "bg-yellow-200"
                }`}
              >
                {status}
              </div>
            </div>
            <div className="flex gap-8">
              <div className="flex flex-col gap-8 flex-2">
                <div>
                  <h1>Auction Id:</h1>
                  <h1 className="text-3xl font-semibold">{auction.id}</h1>
                </div>
                <div>
                  <h1>Item Name:</h1>
                  <h1 className="text-3xl font-semibold">{auction.itemName}</h1>
                </div>
                <div>
                  <h1>Description:</h1>
                  <h1 className="text-3xl font-semibold">
                    {auction.description}
                  </h1>
                </div>
              </div>
              <div className="flex flex-col gap-8 flex-1">
                <div className="flex justify-center gap-10">
                  <div>
                    <h1 className="text-5xl font-bold">
                      ${highestBid && highestBid}
                    </h1>
                    <h1 className="text-base text-center">Highest Bid</h1>
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold">
                      ${auction.startingPrice}
                    </h1>
                    <h1 className="text-base text-center">Starting Price</h1>
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold">
                      ${auction.bidIncrement}
                    </h1>
                    <h1 className="text-base text-center">Bid Increment</h1>
                  </div>
                </div>
                {userData.id === auction.sellerId &&
                decision == "pending" &&
                status === "ended" &&
                highestBid &&
                !counter ? (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={accept}
                      className="px-3 py-2 bg-green-200 rounded-full flex-1 cursor-pointer "
                    >
                      Accept
                    </button>
                    <button
                      onClick={reject}
                      className="px-3 py-2 bg-red-200 rounded-full flex-1 cursor-pointer"
                    >
                      Reject
                    </button>
                    <div className="flex flex-col  justify-center items-center p-8 border border-gray-500 rounded-2xl">
                      <form
                        onSubmit={counterOffer}
                        className="flex flex-col gap-4"
                      >
                        <div className="px-3 py-2 border border-gray-500 rounded-full">
                          <input
                            type="number"
                            placeholder={`Counter Bid`}
                            className="w-sm"
                            ref={counterRef}
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-2 bg-yellow-200 rounded-full flex-1 cursor-pointer"
                        >
                          Counter Bid
                        </button>
                      </form>
                    </div>
                  </div>
                ) : status === "active" && auction.sellerId !== userData.id ? (
                  <div className="flex flex-col justify-center items-center p-8 border border-gray-500 rounded-2xl text-xl">
                    <form onSubmit={handleSubmit}>
                      <div className="px-3 py-2 border border-gray-500 rounded-full">
                        <input
                          type="number"
                          placeholder={`Min ${
                            parseFloat(highestBid) ||
                            auction.startingPrice + auction.bidIncrement
                          }`}
                          className="w-sm"
                          ref={bidRef}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!bidRef.current?.value}
                        className="bg-gray-100 px-3 py-2 text-xl rounded-full mt-4 cursor-pointer w-full "
                      >
                        Place Bid
                      </button>
                    </form>
                  </div>
                ) : counter &&
                  auction.highestBid &&
                  auction.highestBid.bidderId === userData.id &&
                  decision === "counter" ? (
                  <div className="flex flex-col gap-4 justify-center items-center p-8 border border-gray-500 rounded-2xl text-xl">
                    {`Counter Bid: $${counter}`}
                    <div className="flex w-full gap-2">
                      <button
                        onClick={counterAccept}
                        className="px-3 py-2 bg-green-200 rounded-full flex-1 cursor-pointer "
                      >
                        Accept
                      </button>
                      <button
                        onClick={counterReject}
                        className="px-3 py-2 bg-red-200 rounded-full flex-1 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-bold text-center">
                    {decision !== "pending" ? `The bid was ${decision}` : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AuctionRoom;
