// Mirrors ORDER_STATUSES in the backend (constants/app.constants.js) and the
// transitions map in order.controller.js — kept as display metadata only,
// the backend remains the source of truth for which transitions are legal.
export const ORDER_STATUS_META = {
  REQUESTED: { label: 'Requested', tone: 'neutral' },
  PRICE_CONFIRMED: { label: 'Price Confirmed', tone: 'amber' },
  CONFIRMED: { label: 'Confirmed', tone: 'blue' },
  PACKED: { label: 'Packed', tone: 'purple' },
  DISPATCHED: { label: 'Dispatched', tone: 'cyan' },
  DELIVERED: { label: 'Delivered', tone: 'green' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
};
