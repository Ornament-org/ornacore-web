// Tunch is shown on cards as e.g. "65T" — a whole number by default, one
// decimal place only when the value actually needs it (91.6T), matching how
// weight/price already trim trailing zeros elsewhere in this app.
export const formatTunch = (tunch) => {
  const value = Number(tunch);
  if (!Number.isFinite(value) || value <= 0) return null;
  return `${value.toFixed(2).replace(/\.?0+$/, '')}T`;
};

// Card badge convention: tunch first (what shops actually care about),
// falling back to purity/karat when a variant has no tunch value recorded.
export const cardBadgeLabel = (tunch, purity) => formatTunch(tunch) ?? purity ?? null;
