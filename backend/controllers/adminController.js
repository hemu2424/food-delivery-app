import Order from "../models/Order.js";
import Restaurants from "../models/Restaurant.js";
import { Users } from "../models/Users.js";



async function getDashboardStats(req, res, next) {
  try {
    const [totalCustomers, totalDeliveryPartners, totalRestaurants, totalOrders, deliveredOrders] =
      await Promise.all([
        Users.countDocuments({ role: "user" }),
        Users.countDocuments({ role: "delivery" }),
        Restaurants.countDocuments(),
        Order.countDocuments(),
        Order.find({ status: "delivered" }).select("totalAmount"),
      ]);

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalCustomers,
      totalDeliveryPartners,
      totalRestaurants,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
}

async function getAllCustomers(req, res, next) {
  try {
    const customers = await Users.find({ role: "user" }).select("-password");
    res.json(customers);
  } catch (error) {
    next(error);
  }
}


async function getAllDeliveryPartners(req, res, next) {
  try {
    const partners = await Users.find({ role: "delivery" }).select("-password");
    res.json(partners);
  } catch (error) {
    next(error);
  }
}


async function toggleBlockUser(req, res, next) {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot block an admin account" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User is now ${user.isBlocked ? "blocked" : "unblocked"}`, user });
  } catch (error) {
    next(error);
  }
}


async function approveDeliveryPartner(req, res, next) {
  try {
    const partner = await Users.findOne({ _id: req.params.id, role: "delivery" });
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    partner.isApproved = true;
    await partner.save();

    res.json({ message: "Delivery partner approved", partner });
  } catch (error) {
    next(error);
  }
}

export { getAllCustomers, getAllDeliveryPartners, toggleBlockUser, approveDeliveryPartner ,getDashboardStats};