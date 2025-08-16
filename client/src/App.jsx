import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Auctions from "./pages/Auctions";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuctionRoom from "./pages/AuctionRoom";
import Home from "./pages/Home";
import NewAuction from "./pages/NewAuction";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/auctions"
          element={
            <ProtectedRoute>
              <Auctions />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/auctions/new"
          element={
            <ProtectedRoute>
              <NewAuction />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/auctions/:id"
          element={
            <ProtectedRoute>
              <AuctionRoom />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
