
function getPaginationParams(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);        // never less than page 1
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10)); // between 1 and 50, default 10

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export { getPaginationParams };