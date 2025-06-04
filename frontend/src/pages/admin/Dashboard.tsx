"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, MapPin, Users, Ticket, TrendingUp, DollarSign } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { movies, theaters, users, bookings, payments } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

interface Stats {
  totalMovies: number
  totalTheaters: number
  totalUsers: number
  totalBookings: number
  activeMovies: number
  activeTheaters: number
  pendingBookings: number
  totalRevenue: number
}

interface Movie {
  _id: string
  status: string
}

interface Theater {
  _id: string
  status: string
}

interface Booking {
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
}

interface Payment {
  ticket: {
    price: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalMovies: 0,
    totalTheaters: 0,
    totalUsers: 0,
    totalBookings: 0,
    activeMovies: 0,
    activeTheaters: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/")
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const [moviesResponse, theatersResponse, usersResponse, bookingsResponse, paymentsResponse] = await Promise.all([
          movies.getAll({ limit: 1000 }),
          theaters.getAll(),
          users.getAll(),
          bookings.getAll(),
          payments.getAll()
        ])
        
        const moviesList = moviesResponse.data || []
        const theatersList = theatersResponse.data || []
        const usersList = usersResponse.data || []
        const bookingsList = bookingsResponse.data || []
        const paymentsList = paymentsResponse.data || []

        const pendingBookings = bookingsList.filter((booking: Booking) => booking.status === "pending").length
        const totalRevenue = paymentsList.reduce((sum: number, payment: Payment) => sum + (payment.ticket?.price || 0), 0)

        setStats({
          totalMovies: moviesResponse.total || moviesList.length,
          totalTheaters: theatersList.length,
          totalUsers: usersList.length,
          totalBookings: bookingsList.length,
          activeMovies: moviesResponse.total || moviesList.length,
          activeTheaters: theatersList.length,
          pendingBookings,
          totalRevenue,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError("Failed to load dashboard stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isAdmin, navigate])

  const quickActions = [
    {
      title: "Manage Movies",
      description: "Add, edit, or remove movies from the catalog",
      icon: <Film className="h-8 w-8" />,
      path: "/admin/movies",
      color: "bg-blue-500",
    },
    {
      title: "Manage Theaters",
      description: "Manage theater information and showtimes",
      icon: <MapPin className="h-8 w-8" />,
      path: "/admin/theaters",
      color: "bg-green-500",
    },
    {
      title: "User Management",
      description: "View and manage all user accounts",
      icon: <Users className="h-8 w-8" />,
      path: "/admin/users",
      color: "bg-purple-500",
    },
    {
      title: "Bookings",
      description: "View and manage all ticket bookings",
      icon: <Ticket className="h-8 w-8" />,
      path: "/admin/bookings",
      color: "bg-orange-500",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Movies</p>
                  <p className="text-3xl font-bold">{stats.totalMovies}</p>
                  <p className="text-sm text-blue-200 mt-1">{stats.activeMovies} Active</p>
                </div>
                <Film className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Theaters</p>
                  <p className="text-3xl font-bold">{stats.totalTheaters}</p>
                  <p className="text-sm text-green-200 mt-1">{stats.activeTheaters} Active</p>
                </div>
                <MapPin className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-orange-200 mt-1">{stats.pendingBookings} Pending</p>
                </div>
                <Ticket className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Total revenue from all bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Movies</span>
                  <span className="font-medium">{stats.activeMovies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Theaters</span>
                  <span className="font-medium">{stats.activeTheaters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Bookings</span>
                  <span className="font-medium">{stats.pendingBookings}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
                  >
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">{action.description}</p>
                  <Button onClick={() => navigate(action.path)} className="w-full">
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
