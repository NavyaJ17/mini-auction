import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Auction = sequelize.define(
  "Auction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    startingPrice: { type: DataTypes.FLOAT, allowNull: false },
    bidIncrement: { type: DataTypes.FLOAT, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("upcoming", "active", "ended"),
      defaultValue: "upcoming",
    },
    highestBidId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    counterOffer: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    finalized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    decision: {
      type: DataTypes.ENUM("pending", "accepted", "rejected", "counter-offer-accepted", "counter-offer-rejected", "counter"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default Auction;
