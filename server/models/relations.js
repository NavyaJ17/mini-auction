import sequelize from "./index.js";
import Auction from "./Auction.js";
import Bid from "./Bid.js";
import User from "./User.js";

Auction.belongsTo(User, { as: "seller", foreignKey: "sellerId" });
Bid.belongsTo(User, { as: "bidder", foreignKey: "bidderId" });
Bid.belongsTo(Auction, { foreignKey: "auctionId" });
Auction.belongsTo(Bid, { as: "highestBid", foreignKey: "highestBidId" });

export { Auction, Bid, User };
