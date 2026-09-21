import mongoose from "mongoose";


const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },   
    price: { type: Number, required: true }, 
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
   
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: function () {
        return this.paymentMethod === "cod" ? "pending" : "pending";
        // COD orders stay "pending" until delivery (you could add a "collected" step later)
        // Razorpay orders start "pending" and become "paid" only after signature verification
      },
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
        deliveryLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },
        cancelledBy: {
      type: String,
      enum: ["user", "admin"],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancellationNote: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    deliveryCancelReason: {
      type: String,
      default: null,
    },
    refundId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
orderSchema.index({ user: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 }); 
orderSchema.index({ deliveryLocation: "2dsphere" });

const Order =  mongoose.model("Order", orderSchema);
export default Order