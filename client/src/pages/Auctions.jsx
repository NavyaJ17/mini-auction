import axios from "axios";
import React from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Auctions() {
  const [auctions, setAuctions] = useState(null);
  const { accessToken } = useContext(AppContext);

  useEffect(() => {
    const getAuctions = async () => {
      try {
        let res = await axios.get("/api/auctions", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setAuctions(res.data.auctions);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.error);
      }
    };

    getAuctions();
  }, []);

  return (
    <>
      <Navbar />
      <div className="mt-19 text-lg p-8 border border-gray-500 rounded-2xl">
        <table>
          <thead>
            <tr className="border-b border-gray-500">
              <th className="px-4 py-2">Auction ID</th>
              <th className="px-4 py-2">Item Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {auctions &&
              auctions.map((a) => (
                <React.Fragment key={a.id}>
                  <tr>
                    <td className="px-4 py-2">{a.id}</td>
                    <td className="px-4 py-2">{a.itemName}</td>
                    <td className="px-4 py-2">{a.description}</td>
                    <td className="px-4 py-2">{a.status}</td>
                    <td className="px-4 py-2 text-blue-500 cursor-pointer underline">
                      <Link to={`/auctions/${a.id}`}>Join</Link>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Auctions;
