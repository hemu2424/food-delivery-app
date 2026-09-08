import Address from "../models/Address.js";
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

export { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress ,searchAddressSuggestions};