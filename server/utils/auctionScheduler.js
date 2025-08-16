import schedule from "node-schedule";
import axios from "axios";
import { Auction } from "../models/relations.js";

export function scheduleAuctionStart(auctionId, startTime) {
  console.log(`Scheduling auction ${auctionId} to start at ${startTime}`);

  const job = schedule.scheduleJob(new Date(startTime), async function () {
    try {
      console.log(`Starting auction ${auctionId}...`);
      const auction = await Auction.findByPk(auctionId);
      auction.status = "active";
      await auction.save();
    } catch (err) {
      console.error(`Failed to end auction ${auctionId}:`, err.message);
    }
  });
}

export function scheduleAuctionEnd(auctionId, endTime) {
  console.log(`Scheduling auction ${auctionId} to end at ${endTime}`);

  const job = schedule.scheduleJob(new Date(endTime), async function () {
    try {
      console.log(`Ending auction ${auctionId}...`);
      await axios.post(`http://localhost:8080/api/auctions/${auctionId}/end`);
    } catch (err) {
      console.error(`Failed to end auction ${auctionId}:`, err.message);
    }
  });
}
