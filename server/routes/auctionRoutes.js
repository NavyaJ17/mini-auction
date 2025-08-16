import express from "express";
import { Auction, Bid } from "../models/relations.js";
import { authenticateToken } from "../middleware.js";
import redisClient from "../utils/redisClient.js";
import {
  scheduleAuctionEnd,
  scheduleAuctionStart,
} from "../utils/auctionScheduler.js";

const router = express.Router();

router.post("/new", authenticateToken, async (req, res) => {
  try {
    const {
      itemName,
      description,
      startingPrice,
      bidIncrement,
      startTime,
      endTime,
    } = req.body;

    const sellerId = req.user;
    let start = new Date(startTime);
    let now = new Date();
    const status = now < start ? "upcoming" : "active";

    const auction = await Auction.create({
      itemName,
      description,
      startingPrice,
      bidIncrement,
      startTime,
      endTime,
      status,
      sellerId,
    });

    scheduleAuctionStart(auction.id, auction.startTime);
    scheduleAuctionEnd(auction.id, auction.endTime);

    res.status(201).json({ success: true, auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create auction" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);

    const highestBidData = await redisClient.get(
      `auction:${req.params.id}:highestBid`
    );
    let highestBid = null;

    if (highestBidData) {
      highestBid = JSON.parse(highestBidData); // { amount, bidderId }
    }

    if (!auction) return res.status(404).json({ error: "Auction not found" });
    res.status(200).json({
      success: true,
      auction: {
        ...auction.toJSON(),
        highestBid,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch auction" });
  }
});

router.post("/:id/end", async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);
    if (!auction) {
      return res.status(403).json({ error: "Auction not found" });
    }

    if (auction.status === "ended") {
      return res.status(403).json({ error: "Auction already ended" });
    }

    auction.status = "ended";

    let highestBidData = await redisClient.get(
      `auction:${auction.id}:highestBid`
    );
    let highestBid = null;
    let highestBidderId = null;

    console.log(highestBidData);

    if (!highestBidData) {
      auction.highestBidId = null;
      await auction.save();

      req.io.to(auction.sellerId).emit("auction_ended", {
        auctionId: auction.id,
        highestBid: null,
      });
      return res.json({ message: "Auction ended, no bids" });
    }

    const parsed = JSON.parse(highestBidData);
    let bidId = parsed.id;
    highestBid = parseFloat(parsed.amount);
    highestBidderId = parsed.bidderId;

    auction.highestBidId = bidId;

    await auction.save();

    req.io.to(auction.id).emit("auction_ended", {
      auctionId: auction.id,
      highestBid,
    });

    req.io.to(highestBidderId).emit("you_won", {
      auctionId: auction.id,
      amount: highestBid,
    });

    return res.json({ success: true, message: "Auction ended", highestBid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const auctions = await Auction.findAll({ raw: true });
    return res.status(200).json({ success: true, auctions });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
});

export default router;
