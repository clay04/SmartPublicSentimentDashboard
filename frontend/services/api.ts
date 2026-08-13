import axios from "axios";
import { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";
import { AIResultNews, NewsQueryParams, PaginatedNewsResponse } from "@/types/news";

// Tentukan Base URL berdasarkan environment (Browser vs Node/SSR)
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:3000";
};

const API = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.Message ||
      "Terjadi kesalahan pada server";
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  signIn: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>("/auth/signin", payload);
    return response.data;
  },

  signUp: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>("/auth/signup", payload);
    return response.data;
  },
};

export const newsApi = {
  getNews: async (params?: NewsQueryParams): Promise<PaginatedNewsResponse> => {

    console.log("🔥 GET NEWS DIPANGGIL");
    console.log("📤 Params:", params);
    
    const response = await API.get<PaginatedNewsResponse>("/news/getnews", { params });
    return response.data;
  },
};

export default API;