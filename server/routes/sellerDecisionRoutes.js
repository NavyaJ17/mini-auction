import express from "express";
import { Auction, Bid } from "../models/relations.js";
import { authenticateToken } from "../middleware.js";

const router = express.Router();

router.post("/:id/accept", authenticateToken, async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);

    if (auction.sellerId !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!auction.highestBidId) {
      return res.status(400).json({ error: "No bids to accept" });
    }

    auction.finalized = true;
    auction.decision = "accepted";
    await auction.save();

    const highestBid = await Bid.findByPk(auction.highestBidId, {
      include: ["bidder"],
    });
    req.io
      .to(highestBid.bidderId)
      .emit("bid_accepted", { auctionId: auction.id });
    req.io.to(auction.id).emit("decision_update", {
      auctionId: auction.id,
      decision: auction.decision,
    });

    return res.status(200).json({ success: true, message: "Bid accepted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: true, error: "Failed to accept bid" });
  }
});

router.post("/:id/reject", authenticateToken, async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);

    if (auction.sellerId !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    auction.finalized = true;
    auction.decision = "rejected";
    await auction.save();

    const highestBid = await Bid.findByPk(auction.highestBidId, {
      include: ["bidder"],
    });
    req.io
      .to(highestBid.bidderId)
      .emit("bid_rejected", { auctionId: auction.id });
    req.io.to(auction.id).emit("decision_update", {
      auctionId: auction.id,
      decision: auction.decision,
    });

    return res.status(200).json({ success: true, message: "Bid Rejected" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to reject bid" });
  }
});

router.post("/:id/counter", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findByPk(req.params.id);

    if (auction.sellerId !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (auction.sellerId !== req.user) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid counter-offer amount" });
    }

    auction.counterOffer = amount;
    auction.decision = "counter";
    await auction.save();

    const highestBid = await Bid.findByPk(auction.highestBidId, {
      include: ["bidder"],
    });
    req.io
      .to(highestBid.bidderId)
      .emit("counter_offer", { auctionId: auction.id, counterOffer: amount });
    req.io.to(auction.id).emit("decision_update", {
      auctionId: auction.id,
      decision: auction.decision,
    });

    return res.status(200).json({ success: true, message: "Bid Countered" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to counter bid" });
  }
});

router.post("/:id/counter-accept", authenticateToken, async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);

    const highestBid = await Bid.findByPk(auction.highestBidId, {
      include: ["bidder"],
    });
    if (highestBid.bidderId !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    auction.finalized = true;
    auction.decision = "counter-offer-accepted";
    await auction.save();

    req.io
      .to(auction.sellerId)
      .emit("counter_offer_accepted", { auctionId: auction.id });
    req.io.to(auction.id).emit("decision_update", {
      auctionId: auction.id,
      decision: auction.decision,
    });

    return res
      .status(200)
      .json({ success: true, message: "Counter offer accepted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to accept counter offer" });
  }
});

router.post("/:id/counter-reject", authenticateToken, async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);

    const highestBid = await Bid.findByPk(auction.highestBidId, {
      include: ["bidder"],
    });
    if (highestBid.bidderId !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    auction.finalized = true;
    auction.decision = "counter-offer-rejected";
    await auction.save();

    req.io
      .to(auction.sellerId)
      .emit("counter_offer_rejected", { auctionId: auction.id });
    req.io.to(auction.id).emit("decision_update", {
      auctionId: auction.id,
      decision: auction.decision,
    });

    return res
      .status(200)
      .json({ success: true, message: "Counter offer rejected" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to reject counter offer" });
  }
});

export default router;
