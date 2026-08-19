import { fetchNewsFromDB } from "../services/news.service.js";

export const getNews = async (req, res) => {
  try {
    const {
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

      page,
      limit,
    } = req.query;

    const result = await fetchNewsFromDB({
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

      page,
      limit,
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ getNews error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data berita",
      error: error.message,
    });
  }
};