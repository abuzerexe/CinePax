import axios from "axios"

const API_URL = "/"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post("/signin", { email, password })
    return response.data
  },
  signup: async (userData: {
    email: string
    password: string
    fullName: string
    phone: string
  }) => {
    const response = await api.post("/signup", userData)
    return response.data
  },
  logout: async () => {
    const response = await api.post("/logout")
    return response.data``
  },
  updateProfile: async (userData: {
    fullName: string
    email: string
    phone: string
  }) => {
    const response = await api.put("/customer/profile", userData)
    return response.data
  },
  getProfile: async () => {
    const response = await api.get("/customer/profile")
    return response.data
  },
}

export const theaters = {
  getAll: async () => {
    const response = await api.get("/theaters")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/theaters/${id}`)
    return response.data
  },
  getShowtimes: async (theaterId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/theaters/${theaterId}/showtimes`, { params })
    return response.data
  },
  getShowtime: async (showtimeId: string) => {
    const response = await api.get(`/user/showtimes/${showtimeId}`)
    return response.data
  },
  create: async (theaterData: any) => {
    const response = await api.post("/theaters", theaterData)
    return response.data
  },
  update: async (id: string, theaterData: any) => {
    const response = await api.put(`/theaters/${id}`, theaterData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/theaters/${id}`)
    return response.data
  },
}

export const movies = {
  getAll: async () => {
    const response = await api.get("/movies")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/movies/${id}`)
    return response.data
  },
  getFeatured: async () => {
    const response = await api.get("/movies/featured")
    console.log(response)
    return response.data
  },
  create: async (movieData: any) => {
    const response = await api.post("/movies", movieData)
    return response.data
  },
  update: async (id: string, movieData: any) => {
    const response = await api.put(`/movies/${id}`, movieData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/movies/${id}`)
    return response.data
  },
}

export const showtimes = {
  getAll: async () => {
    const response = await api.get("/showtimes")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/showtimes/${id}`)
    return response.data
  },
  create: async (showtimeData: any) => {
    const response = await api.post("/showtimes", showtimeData)
    return response.data
  },
  update: async (id: string, showtimeData: any) => {
    const response = await api.put(`/showtimes/${id}`, showtimeData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/showtimes/${id}`)
    return response.data
  },
}

export const tickets = {
  getAll: async () => {
    const response = await api.get("/tickets")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },
  getUserBookings: async () => {
    const response = await api.get(`/user/bookings`)
    return response.data
  },
  create: async (bookingData: {
    showtimeId: string;
    seats: string[];
    totalAmount: number;
  }) => {
    // Transform the data to match backend expectations
    const seat = bookingData.seats[0]; // For now, we'll send the first seat
    const requestData = {
      showtimeId: bookingData.showtimeId,
      seatNumber: seat.slice(1), // Get the number part (e.g., "8" from "A8")
      row: seat.charAt(0) // Get the row letter (e.g., "A" from "A8")
    }
    const response = await api.post("/user/book", requestData)
    return response.data
  },
  update: async (id: string, bookingData: {
    status?: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  }) => {
    const response = await api.put(`/tickets/${id}/status`, bookingData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/user/bookings/${id}`)
    return response.data
  },
}

export const payments = {
  create: async (paymentData: {
    bookingId: string;
    amount: number;
    method: string;
  }) => {
    const response = await api.post("/payments", paymentData)
    return response.data
  },
  getStatus: async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}/status`)
    return response.data
  }
}

export const users = {
  getAll: async () => {
    const response = await api.get("/admin/users")
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },
  create: async (userData: {
    fullName: string;
    email: string;
    password: string;
    role: "admin" | "staff" | "customer";
    theater?: string;
    phone?: string;
  }) => {
    const response = await api.post("/admin/users", userData)
    return response.data
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
}