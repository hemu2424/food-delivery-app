const TRANSITIONS = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

function canTransition(from, to) {
  if (!TRANSITIONS[from]) return false;
  return TRANSITIONS[from].includes(to);
}

export { canTransition, TRANSITIONS };