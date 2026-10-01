// Turns ?page=2&limit=12 into safe numbers (never trust the client).
export const parsePagination = (query = {}, { defaultLimit = 12, maxLimit = 50 } = {}) => {
  const page = Math.min(Math.max(parseInt(query.page, 10) || 1, 1), 10000);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPageMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
