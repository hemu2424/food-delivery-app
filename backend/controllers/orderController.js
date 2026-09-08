import Order from "../models/Order.js";
import MenuItems from "../models/MenuItems.js";
import { getIO } from "../socket/socket.js";
import generateInvoicePdf from "../utils/generateInvoice.js";
import { getPaginationParams } from "../utils/paginate.js";


async function createOrder(req, res, next) {
  try {
    const { restaurant, items, deliveryAddress } = req.body;


    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const menuItem = await MenuItems.findById(cartItem.menuItem);

      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${cartItem.menuItem}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }

      totalAmount += menuItem.price * cartItem.quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,   
        price: menuItem.price, 
        quantity: cartItem.quantity,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      restaurant,
      items: orderItems,
      totalAmount,
      deliveryAddress,
    });

    res.status(201).json(order);
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
      { deliveryPartner: req.user._id, status: "out_for_delivery" },
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
    io.to(`user:${order.user.toString()}`).emit("order:statusUpdated", {
      orderId: order._id,
      status: order.status,
    });

  
    io.emit("order:claimed", { orderId: order._id });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

export {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAvailableOrders,
  getMyDeliveries,
  acceptOrder,
  downloadInvoice
};