import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItems.js";
import { getPaginationParams } from "../utils/paginate.js";
import cloudinary from "../config/cloudinary.js";
import geocodeAddress from "../utils/geocode.js";




async function getCuisines(req, res, next) {
  try {

    const cuisines = await Restaurant.distinct("cuisine", {
      isActive: true,
      cuisine: { $nin: [null, ""] },
    });

    res.json(cuisines.sort());
  } catch (error) {
    next(error);
  }
}

async function getRestaurants(req, res, next) {
  try {
    const { search, cuisine } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    
const [restaurants, totalRestaurants] = await Promise.all([
      Restaurant.find({
    isActive: true,
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(cuisine && { cuisine: { $regex: cuisine, $options: "i" } }),
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),

  Restaurant.countDocuments({
    isActive: true,
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(cuisine && { cuisine: { $regex: cuisine, $options: "i" } }),
  }),
]);

    res.json({
      restaurants,
      pagination: { page, limit, totalRestaurants, totalPages: Math.ceil(totalRestaurants / limit) },
    });
  } catch (error) {
    next(error);
  }
}

async function getRestaurantById(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
      isAvailable: true,
    });

    res.json({ restaurant, menuItems });
  } catch (error) {
    next(error);
  }
}


async function createRestaurant(req, res, next) {
  try {
    const { name, description, cuisine, address, deliveryRadiusKm } = req.body;

    const imageUrls = (req.files?.images || []).map((file) => file.path);
    const videoUrl = req.files?.video?.[0]?.path || null;

  
    const geocoded = await geocodeAddress(address);

    if (!geocoded) {
      return res.status(400).json({
        message: "Could not determine location from the address provided. Please check the address and try again.",
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine,
      address,
      images: imageUrls,
      video: videoUrl,
      deliveryRadiusKm: deliveryRadiusKm || 5,
      location: {
        type: "Point",
        coordinates: [geocoded.longitude, geocoded.latitude], 
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
}

async function updateRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const textFields = ["name", "description", "cuisine", "deliveryRadiusKm", "isActive"];
    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    });

  
    if (req.body.address && req.body.address !== restaurant.address) {
      const geocoded = await geocodeAddress(req.body.address);
      if (!geocoded) {
        return res.status(400).json({
          message: "Could not determine location from the new address. Please check it and try again.",
        });
      }
      restaurant.address = req.body.address;
      restaurant.location = {
        type: "Point",
        coordinates: [geocoded.longitude, geocoded.latitude],
      };
    }

    if (req.files?.images?.length > 0) {
      const newImageUrls = req.files.images.map((file) => file.path);
      restaurant.images.push(...newImageUrls);
    }
    if (req.files?.video?.[0]) {
      restaurant.video = req.files.video[0].path;
    }

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
}

async function deleteRestaurantImage(req, res, next) {
  try {
    const { id } = req.params;
    const { imagePath } = req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const isVideo = restaurant.video === imagePath;
    restaurant.images = restaurant.images.filter((img) => img !== imagePath);
    if (isVideo) {
      restaurant.video = null;
    }

    await restaurant.save();
    await deleteFileFromCloud(
      imagePath,
      isVideo ? "video" : "image"
    );
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
}
async function deleteRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await MenuItem.find({ restaurant: restaurant._id });

    await Promise.all(
      menuItems.flatMap((item) => item.images.map((image) => deleteFileFromCloud(image)))
    );
    await Promise.all(restaurant.images.map((image) => deleteFileFromCloud(image)));
    if (restaurant.video) await deleteFileFromCloud(restaurant.video, "video");

    await MenuItem.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    res.json({ message: "Restaurant deleted successfully" });
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

async function deleteFileFromCloud(url, resourceType = "image") {
  try {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Failed to delete file from Cloudinary:", error.message);
  }
}
const SEARCH_RADII_KM = [3, 5, 7, 10, 15,25,35]; 


async function getNearbyRestaurants(req, res, next) {
  try {
    const { lat, lng } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

  
    if (
      isNaN(latitude) || isNaN(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return res.status(400).json({ message: "Invalid or missing coordinates" });
    }

    let restaurants = [];
    let radiusUsedKm = null;

    for (const radiusKm of SEARCH_RADII_KM) {
      const results = await Restaurant.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [longitude, latitude] },
            distanceField: "distanceInMeters", 
            maxDistance: radiusKm * 1000,        
            spherical: true,                   
            query: { isActive: true },          
          },
        },
      ]);

      const deliverable = results.filter((r) => {
        const distanceKm = r.distanceInMeters / 1000;
        return distanceKm <= (r.deliveryRadiusKm || 5);
      });

      if (deliverable.length > 0) {
        restaurants = deliverable;
        radiusUsedKm = radiusKm;
        break; 
      }
    }


    const restaurantsWithDistance = restaurants.map((r) => ({
      ...r,
      distanceKm: Math.round((r.distanceInMeters / 1000) * 10) / 10, 
    }));

    res.json({
      restaurants: restaurantsWithDistance,
      searchRadiusKm: radiusUsedKm, 
    });
  } catch (error) {
    next(error);
  }
}

async function geocodeAddressEndpoint(req, res, next) {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const geocoded = await geocodeAddress(address);
    if (!geocoded) {
      return res.status(404).json({ message: "Could not find that location" });
    }

    res.json(geocoded); 
  } catch (error) {
    next(error);
  }
}

 
export {geocodeAddressEndpoint,
  getNearbyRestaurants,
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurantImage,
  deleteRestaurant,getCuisines
};
