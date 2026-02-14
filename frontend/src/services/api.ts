import axios, { AxiosInstance } from "axios";

/**
 * API Service
 * Centralized HTTP client for all API calls
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    const response = await this.client.post("/auth/register", {
      username,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  }

  async login(username: string, password: string) {
    const response = await this.client.post("/auth/login", {
      username,
      password,
    });
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  async updateProfile(displayName: string, avatarUrl?: string, bio?: string) {
    const response = await this.client.put("/auth/profile", {
      display_name: displayName,
      avatar_url: avatarUrl,
      bio,
    });
    return response.data;
  }

  // Test endpoints
  async submitTest(
    originalText: string,
    typedText: string,
    duration: number,
    difficulty: string,
    options?: any,
  ) {
    const response = await this.client.post("/tests/submit", {
      originalText,
      typedText,
      duration,
      difficulty,
      ...options,
    });
    return response.data;
  }

  async getTestHistory(limit?: number, offset?: number) {
    const response = await this.client.get("/tests/history", {
      params: { limit, offset },
    });
    return response.data;
  }

  async getStatistics(userId?: string) {
    const url = userId
      ? `/tests/statistics?userId=${userId}`
      : "/tests/statistics";
    const response = await this.client.get(url);
    return response.data;
  }

  async getBestTest() {
    const response = await this.client.get("/tests/best");
    return response.data;
  }

  // Leaderboard endpoints
  async getLeaderboard(period?: string, limit?: number) {
    const response = await this.client.get("/leaderboard", {
      params: { period, limit },
    });
    return response.data;
  }

  async getUserRank(userId: string, period?: string) {
    const response = await this.client.get(`/leaderboard/${userId}/rank`, {
      params: { period },
    });
    return response.data;
  }
}

export const apiService = new APIService();
export default apiService;
