import AIResult from "../models/aiResult.model.js"

export const fetchNewsFromDB = async ({
  sw_lat,
  sw_lng,
  ne_lat,
  ne_lng,
  search,
  page = 1,
  limit = 10,
}) => {
  let query = {};

  // Filter Bounding Box Peta
  if (sw_lat && sw_lng && ne_lat && ne_lng) {
    query.latitude = { $gte: Number(sw_lat), $lte: Number(ne_lat) };
    query.longitude = { $gte: Number(sw_lng), $lte: Number(ne_lng) };
  }

  // Filter Kata Kunci Pencarian
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  // Sanitasi & Kalkulasi Offset
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 500);
  const skip = (pageNum - 1) * limitNum;

  // Eksekusi query data dan hitung total data secara paralel
  const [data, totalData] = await Promise.all([
    AIResult.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AIResult.countDocuments(query),
  ]);

  const totalPage = Math.ceil(totalData / limitNum);

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