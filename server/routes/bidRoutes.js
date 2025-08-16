import express from "express";
import { Auction, Bid } from "../models/relations.js";
import redisClient from "../utils/redisClient.js";
import { authenticateToken } from "../middleware.js";

const router = express.Router();

router.post("/:id", authenticateToken, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const bidderId = req.user;
    const { amount } = req.body;

    const auction = await Auction.findByPk(auctionId);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    if (auction.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    let highestBidData = await redisClient.get(
      `auction:${auctionId}:highestBid`
    );
    let highestBid = auction.startingPrice;
    let previousHighestBidderId = null;

    if (!highestBidData) {
      const latestBid = await Bid.findOne({
        where: { auctionId },
        order: [["amount", "DESC"]],
      });
      if (latestBid) {
        highestBid = latestBid.amount;
        previousHighestBidderId = latestBid.bidderId;
      }
    } else {
      const parsed = JSON.parse(highestBidData);
      highestBid = parseFloat(parsed.amount);
      previousHighestBidderId = parsed.bidderId;
    }

    if (amount < highestBid + auction.bidIncrement) {
      return res.status(400).json({
        error: `Bid must be at least ${highestBid + auction.bidIncrement}`,
      });
    }

    const bid = await Bid.create({ auctionId, bidderId, amount });
    const bidId = bid.id;

    await redisClient.set(
      `auction:${auctionId}:highestBid`,
      JSON.stringify({
        id: bidId,
        amount,
        bidderId,
      })
    );

    req.io.to(auctionId).emit("bid_update", {
      auctionId,
      highestBid: amount,
      bidderId,
    });

    if (previousHighestBidderId) {
      req.io.to(previousHighestBidderId).emit("outbid", {
        auctionId,
        newHighestBid: amount,
      });
    }

    res.status(201).json({ success: true, bid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to place bid" });
  }
});

export default router;
