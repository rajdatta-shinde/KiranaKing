import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";

/** GET /api/addresses */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  res.json({ addresses });
});

/** POST /api/addresses */
export const addAddress = asyncHandler(async (req, res) => {
  const { label, address, city, state, zip, lat, lng, isDefault } = req.body;
  if (!label || !address || !city || !state || !zip) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  // Only one default address per user.
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const created = await prisma.address.create({
    data: {
      userId: req.userId!,
      label,
      address,
      city,
      state,
      zip,
      lat: Number(lat) || 0,
      lng: Number(lng) || 0,
      isDefault: Boolean(isDefault),
    },
  });
  res.status(201).json({ address: created });
});

/** PUT /api/addresses/:id */
export const updateAddress = asyncHandler(async (req, res) => {
  const existing = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ message: "Address not found" });

  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: req.params.id },
    data: {
      label: req.body.label ?? existing.label,
      address: req.body.address ?? existing.address,
      city: req.body.city ?? existing.city,
      state: req.body.state ?? existing.state,
      zip: req.body.zip ?? existing.zip,
      lat: req.body.lat !== undefined ? Number(req.body.lat) : existing.lat,
      lng: req.body.lng !== undefined ? Number(req.body.lng) : existing.lng,
      isDefault: req.body.isDefault !== undefined ? Boolean(req.body.isDefault) : existing.isDefault,
    },
  });
  res.json({ address });
});

/** DELETE /api/addresses/:id */
export const deleteAddress = asyncHandler(async (req, res) => {
  const existing = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ message: "Address not found" });
  await prisma.address.delete({ where: { id: req.params.id } });
  res.json({ message: "Address deleted" });
});
