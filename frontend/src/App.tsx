import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import ScrollToTop from "./components/ScrollToTop"
import { Toaster } from "@/components/ui/toaster"

import Home from "./pages/Home"
import Movies from "./pages/Movies"
import MovieDetails from "./pages/MovieDetails"
import Theaters from "./pages/Theaters"
import Login from "./pages/Login"
import Register from "./pages/Register"

import Dashboard from "./pages/admin/Dashboard"
import MoviesManagement from "./pages/admin/MoviesManagement"
import TheatersManagement from "./pages/admin/TheatersManagement"
import UsersManagement from "./pages/admin/UsersManagement"
import BookingsManagement from "./pages/admin/BookingsManagement"

import Profile from "./pages/Profile"
import Booking from "./pages/Booking"
import BookingConfirmation from "./pages/BookingConfirmation"
import MyBookings from "./pages/MyBookings"
import TheaterShowtimes from "./pages/TheaterShowtime"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/theaters" element={<Theaters />} />
              <Route path="/theaters/:theaterId/showtimes" element={<TheaterShowtimes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/movies"
                element={
                  <ProtectedRoute requireAdmin>
                    <MoviesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/theaters"
                element={
                  <ProtectedRoute requireAdmin>
                    <TheatersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute requireAdmin>
                    <BookingsManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:showtimeId"
                element={
                  <ProtectedRoute>
                    <Booking />
                   </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl">Page Not Found</h1>
                  </div>
                }
              />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
