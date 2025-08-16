import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Bid = sequelize.define("Bid", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: { type: DataTypes.FLOAT, allowNull: false }
}, {
  timestamps: true
});

export default Bid;
