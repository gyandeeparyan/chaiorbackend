import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId, // who is subscribing
    ref: "User",
  },
  channel: {
    type: Schema.Types.ObjectId, // who is being subscribed
    ref: "User",
  },
},{
    timestamps:true
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
