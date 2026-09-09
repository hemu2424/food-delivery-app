import Address from "../models/Address.js";
import getPlaceDetails from "../utils/getPlaceDetails.js";
import reverseGeocode from "../utils/reverseGeocode.js";
import searchAddress from "../utils/searchAddress.js";


async function getMyAddresses(req, res, next) {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
}


async function createAddress(req, res, next) {
  try {
    const { latitude, longitude, isDefault, ...rest } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id, isDefault: true }, { isDefault: false });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || existingCount === 0;

    const address = await Address.create({
      ...rest,
      city: rest.city || rest.locality || "Not specified", 
      user: req.user._id,
      isDefault: shouldBeDefault,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
}


async function updateAddress(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const { latitude, longitude, isDefault, ...rest } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id, isDefault: true, _id: { $ne: address._id } },
        { isDefault: false }
      );
      address.isDefault = true;
    }

    Object.assign(address, rest);

    if (latitude !== undefined && longitude !== undefined) {
      address.location = { type: "Point", coordinates: [longitude, latitude] };
    }

    await address.save();
    res.json(address);
  } catch (error) {
    next(error);
  }
}


async function deleteAddress(req, res, next) {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.isDefault) {
      const anotherAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    res.json({ message: "Address deleted" });
  } catch (error) {
    next(error);
  }
}

async function setDefaultAddress(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await Address.updateMany({ user: req.user._id, isDefault: true }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error) {
    next(error);
  }
}
async function searchAddressSuggestions(req, res, next) {
  try {
    const { query } = req.query;
    const suggestions = await searchAddress(query);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
}

async function reverseGeocodeLocation(req, res, next) {
  try {
    const { lat, lng } = req.query;
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    if (!result) {
      return res.status(404).json({ message: "Could not determine address for this location" });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
}
async function getPlaceDetailsEndpoint(req, res, next) {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ message: "placeId is required" });
    }

    const details = await getPlaceDetails(placeId);
    if (!details) {
      return res.status(404).json({ message: "Could not fetch location details" });
    }

    res.json(details);
  } catch (error) {
    next(error);
  }
}

export { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress ,searchAddressSuggestions,reverseGeocodeLocation,getPlaceDetailsEndpoint};