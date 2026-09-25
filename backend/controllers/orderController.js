import Order from "../models/Order.js";
import MenuItems from "../models/MenuItems.js";
import { getIO } from "../socket/socket.js";
import generateInvoicePdf from "../utils/generateInvoice.js";
import { getPaginationParams } from "../utils/paginate.js";
import crypto from "crypto";

import razorpay from "../config/razorpay.js";

import Restaurant from "../models/Restaurant.js";

async function createOrder(req, res, next) {
  try {
    const { restaurant, items, deliveryAddress, latitude, longitude, paymentMethod } = req.body;

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (!restaurantDoc.isActive) {
      return res.status(400).json({ message: "This restaurant is not currently accepting orders" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const menuItem = await MenuItems.findById(cartItem.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${cartItem.menuItem}` });
      }
      if (menuItem.restaurant.toString() !== restaurant) {
        return res.status(400).json({ message: `${menuItem.name} does not belong to this restaurant` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }
      totalAmount += menuItem.price * cartItem.quantity;
      orderItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: cartItem.quantity });
    }

    const order = await Order.create({
      user: req.user._id,
      restaurant,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      deliveryLocation: { type: "Point", coordinates: [longitude, latitude] },
      paymentMethod: paymentMethod || "cod",
    });

    if (order.paymentMethod === "cod") {
      return res.status(201).json({ order });
    }


    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), 
      currency: "INR",
      receipt: order._id.toString(), 
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      order,
      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID, // safe to send — this is the PUBLIC key
      },
    });
  } catch (error) {
    next(error);
  }
}


async function getMyOrders(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const [orders, totalOrders] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate("restaurant", "name images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      orders,
      pagination: { page, limit, totalOrders, totalPages: Math.ceil(totalOrders / limit) },
    });
  } catch (error) {
    next(error);
  }
}


async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant", "name address")
      .populate("user", "name phone")
      .populate("deliveryPartner", "name phone");
      console.log(order)

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAssignedPartner =
      order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAssignedPartner && !isAdmin) {
      return res.status(403).json({ message: "You do not have access to this order" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}


async function getAllOrders(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const [orders, totalOrders] = await Promise.all([
      Order.find()
        .populate("restaurant", "name")
        .populate("user", "name email")
        .populate("deliveryPartner", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(),
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}


import { canTransition } from "../utils/orderStateMachine.js";

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role === "delivery") {
      const isAssignedPartner =
        order.deliveryPartner && order.deliveryPartner.toString() === req.user._id.toString();

      if (!isAssignedPartner) {
        return res.status(403).json({ message: "This order is not assigned to you" });
      }
      if (status !== "delivered") {
        return res.status(403).json({ message: "Delivery partners can only mark orders as delivered" });
      }
    }

    if (!canTransition(order.status, status)) {
      return res.status(400).json({ message: `Cannot change order status from "${order.status}" to "${status}"` });
    }

    order.status = status;
    await order.save();


    const io = getIO();
    io.to(`user:${order.user.toString()}`).emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });

  
    io.to("admins").emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function getAvailableOrders(req, res, next) {
  try {
    const orders = await Order.find({
      status: "preparing",
      deliveryPartner: null,
    })
      .populate("restaurant", "name address")
      .sort({ createdAt: 1 }); 

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getMyDeliveries(req, res, next) {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .populate("restaurant", "name address")
      .populate("user", "name phone address")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}
async function downloadInvoice(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant", "name address")
      .populate("user", "name phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

   
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAssignedPartner =
      order.deliveryPartner && order.deliveryPartner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAssignedPartner && !isAdmin) {
      return res.status(403).json({ message: "You do not have access to this invoice" });
    }

    // These headers tell the browser: "this is a file to download, not a page to render"
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id.toString().slice(-6)}.pdf`
    );

    generateInvoicePdf(order, res);
  } catch (error) {
    next(error);
  }
}

async function acceptOrder(req, res, next) {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: "Your account is pending admin approval" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, deliveryPartner: null, status: "preparing" },
      { deliveryPartner: req.user._id },
      { new: true }
    );

    if (!order) {
      const existingOrder = await Order.findById(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (existingOrder.deliveryPartner) {
        return res.status(400).json({ message: "This order has already been claimed" });
      }
      return res.status(400).json({ message: "Order is not ready for pickup yet" });
    }
    const io = getIO();
    

  
    io.emit("order:claimed", { orderId: order._id });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function markPickedUp(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAssignedPartner =
      order.deliveryPartner && order.deliveryPartner.toString() === req.user._id.toString();
    if (!isAssignedPartner) {
      return res.status(403).json({ message: "This order is not assigned to you" });
    }

    if (!canTransition(order.status, "out_for_delivery")) {
      return res.status(400).json({ message: `Cannot mark as picked up from status "${order.status}"` });
    }

    order.status = "out_for_delivery";
    order.pickedUpAt = new Date();
    await order.save();

    const io = getIO();
    io.to(`user:${order.user.toString()}`).emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });
    io.to("admins").emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { reason, note } = req.body;

    const CANCELLABLE_STATUSES = ["placed", "confirmed", "preparing"];

    const orderCheck = await Order.findById(req.params.id);
    if (!orderCheck) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (orderCheck.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have access to this order" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: { $in: CANCELLABLE_STATUSES } },
      {
        status: "cancelled",
        cancelledBy: "user",
        cancellationReason: reason,
        cancellationNote: note || null,
        cancelledAt: new Date(),
        deliveryPartner: null,
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        message: "This order can no longer be cancelled — it's already out for delivery.",
      });
    }

    if (order.paymentMethod === "razorpay" && order.paymentStatus === "paid") {
      try {
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.totalAmount * 100),
        });
        order.paymentStatus = "refunded";
        order.refundId = refund.id;
        await order.save();
      } catch (refundError) {
        console.error(`Refund failed for order ${order._id}:`, refundError.message);
      }
    }

    const io = getIO();
    io.to(`user:${order.user.toString()}`).emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });
    io.to("admins").emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function cancelAssignedOrder(req, res, next) {
  try {
    const { reason, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAssignedPartner =
      order.deliveryPartner && order.deliveryPartner.toString() === req.user._id.toString();
    if (!isAssignedPartner) {
      return res.status(403).json({ message: "This order is not assigned to you" });
    }

    if (order.pickedUpAt) {
      return res.status(400).json({
        message: "You can't cancel after picking up the order. Contact support instead.",
      });
    }

    order.deliveryPartner = null;
    order.deliveryCancelReason = reason;
    // status stays "preparing" — it goes back into the available pool
    await order.save();

    const io = getIO();
    io.to(`user:${order.user.toString()}`).emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });
    io.emit("order:unassigned", { orderId: order._id, order });

    res.json({ message: "You've backed out of this delivery. It's back in the pool." });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Order mismatch" });
    }


    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Signature matches — this payment is genuinely confirmed by Razorpay
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    res.json({ message: "Payment verified successfully", order });
  } catch (error) {
    next(error);
  }
}

async function razorpayWebhookHandler(req, res) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw Buffer, thanks to express.raw() on this route
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Razorpay webhook: signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());
    console.log(`Razorpay webhook received: ${event.event}`);

    // Acknowledge immediately once the signature checks out — Razorpay retries
    // with backoff if we don't respond fast, and retries can pile up otherwise.
    res.status(200).json({ received: true });

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (!order) {
        console.error(`Webhook: no order found for razorpay order ${payment.order_id}`);
        return;
      }
      if (order.paymentStatus === "paid") {
        return; // already processed — Razorpay can send this event more than once
      }
      order.paymentStatus = "paid";
      order.razorpayPaymentId = payment.id;
      await order.save();
      console.log(`Webhook: order ${order._id} marked paid via payment.captured`);
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (!order) return;
      if (order.paymentStatus === "paid") return; // don't downgrade an already-confirmed payment
      order.paymentStatus = "failed";
      await order.save();
      console.log(`Webhook: order ${order._id} marked failed via payment.failed`);
    }

    if (event.event === "refund.processed") {
      const refund = event.payload.refund.entity;
      const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
      if (!order) return;
      if (order.paymentStatus === "refunded") return; // idempotent
      order.paymentStatus = "refunded";
      order.refundId = refund.id;
      await order.save();
      console.log(`Webhook: order ${order._id} marked refunded via refund.processed`);
    }
  } catch (error) {
    console.error("Razorpay webhook error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Webhook processing failed" });
    }
  }
}

export {
  razorpayWebhookHandler,
  verifyPayment,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAvailableOrders,
  getMyDeliveries,
  acceptOrder,
  downloadInvoice,
  markPickedUp,
  cancelOrder,
  cancelAssignedOrder,
};