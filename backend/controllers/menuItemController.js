import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItems.js";
import cloudinary from "../config/cloudinary.js";

async function createMenuItem(req, res, next) {
  try {
    const { name, restaurant, description, price, category } = req.body;
    const restaurantExist = await Restaurant.findById(restaurant);
    console.log("created-menu start")

    if (!restaurantExist) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const imagePaths = (req.files?.images || []).map((file) => file.path);

    const menuItem = await MenuItem.create({
      restaurant,
      name,
      description,
      price,
      category,
      images: imagePaths,
    });

    return res.status(201).json(menuItem);
  } catch (error) {
    next(error);
  }
}

async function updateMenuItem(req, res, next) {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const textFields = ["name", "description", "price", "category", "isAvailable"];
    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        menuItem[field] = req.body[field];
      }
    });

    if (req.files?.images?.length > 0) {
      menuItem.images.push(...req.files.images.map((file) => file.path));
    }

    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    next(error);
  }
}

async function deleteMenuItemImage(req, res, next) {
  try {
    const { id } = req.params;
    const { imagePath } = req.body;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    menuItem.images = menuItem.images.filter((img) => img !== imagePath);
    await menuItem.save();

    await deleteFileFromCloud(imagePath);

    res.json(menuItem);
  } catch (error) {
    next(error);
  }
}

async function deleteMenuItem(req, res, next) {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await Promise.all(menuItem.images.map((image) => deleteFileFromCloud(image)));
    await menuItem.deleteOne();

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    next(error);
  }
}

function getCloudinaryPublicId(url) {
  if (!url?.includes("res.cloudinary.com")) return null;

  const { pathname } = new URL(url);
  const uploadPath = pathname.split("/upload/")[1];
  if (!uploadPath) return null;

  return uploadPath.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
}

async function deleteFileFromCloud(url) {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Failed to delete file from Cloudinary:", error.message);
  }
}

export { deleteMenuItem, deleteMenuItemImage, updateMenuItem, createMenuItem };
