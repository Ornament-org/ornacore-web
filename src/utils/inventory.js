// Mirrors the availability check the backend uses before allowing a cart add
// (cart.controller.js) — a variant with no inventory row at all is treated
// as zero stock, same as one that's explicitly been counted down to zero.
export const getAvailableQty = (variant) => {
  const inventory = variant?.inventory;
  if (!inventory) return 0;
  const onHand = Number(inventory.onHandQuantity ?? 0);
  const reserved = Number(inventory.reservedQuantity ?? 0);
  const damaged = Number(inventory.damagedQuantity ?? 0);
  return onHand - reserved - damaged;
};

export const isVariantOutOfStock = (variant) => getAvailableQty(variant) <= 0;

export const isProductOutOfStock = (variants) =>
  (variants ?? []).every((variant) => isVariantOutOfStock(variant));
