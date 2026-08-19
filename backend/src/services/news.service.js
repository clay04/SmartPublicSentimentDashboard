import AIResult from "../models/aiResult.model.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const fetchNewsFromDB = async ({
  sw_lat,
  sw_lng,
  ne_lat,
  ne_lng,

  search,
  keyword,
  category,
  location,
  sentiment,
  urgency,

  page = 1,
  limit = 20,
}) => {
  const query = {};

  if (
    sw_lat !== undefined &&
    sw_lng !== undefined &&
    ne_lat !== undefined &&
    ne_lng !== undefined
  ) {
    query.latitude = {
      $gte: Number(sw_lat),
      $lte: Number(ne_lat),
    };

    query.longitude = {
      $gte: Number(sw_lng),
      $lte: Number(ne_lng),
    };
  }

  const searchTerm = keyword || search;

  if (searchTerm?.trim()) {
    const safeSearch = escapeRegex(searchTerm.trim());

    query.$or = [
      {
        title: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        content: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        location: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  if (category?.trim()) {
    const safeCategory = escapeRegex(category.trim());

    query.category = {
      $regex: `^${safeCategory}$`,
      $options: "i",
    };
  }

  if (location?.trim()) {
    const safeLocation = escapeRegex(location.trim());

    query.location = {
      $regex: safeLocation,
      $options: "i",
    };
  }

  if (sentiment?.trim()) {
    const safeSentiment = escapeRegex(sentiment.trim());

    query.sentiment = {
      $regex: `^${safeSentiment}$`,
      $options: "i",
    };
  }

  if (urgency?.trim()) {
    const safeUrgency = escapeRegex(urgency.trim());

    query.urgency = {
      $regex: `^${safeUrgency}$`,
      $options: "i",
    };
  }

  const pageNum = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  const limitNum = Math.min(
    100,
    Math.max(
      1,
      parseInt(limit, 10) || 20
    )
  );

  const skip = (pageNum - 1) * limitNum;

  const [data, totalData] = await Promise.all([
    AIResult.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),

    AIResult.countDocuments(query),
  ]);

  const totalPage = Math.ceil(
    totalData / limitNum
  );

  return {
    data,

    pagination: {
      totalData,
      totalPage,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPage,
      hasPrevPage: pageNum > 1,
    },
  };
};