"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, DollarSign, Download, Search } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { tickets } from "../services/api"

interface Booking {
  ticketId: string
  movie: {
    _id: string
    title: string
    duration: string
    genre: string
    posterUrl: string
  }
  theater: {
    _id: string
    name: string
    location: string
  }
  showtime: {
    startTime: string
    endTime: string
  }
  seats: Array<{
    seatNumber: string
    row: string
  }>
  price: number
  bookingDate: string
  status: "confirmed" | "completed" | "cancelled"
  totalAmount: number
}

const MyBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await tickets.getUserBookings()
        if (response.data) {
          setBookings(response.data)
          setFilteredBookings(response.data)
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
        setBookings([])
        setFilteredBookings([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const matchesSearch =
        booking.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.theater.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter

      return matchesSearch && matchesStatus
    })

    // Sort by booking date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())

    setFilteredBookings(filtered)
  }, [bookings, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // const handleDownloadTicket = (bookingId: string) => {
  //   // TODO: Implement ticket download functionality
  // }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Please log in to view your bookings</h1>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by movie or theater..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.ticketId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                  {/* Movie Poster */}
                  <div className="md:col-span-1">
                    <img
                      src={booking.movie.posterUrl || "/placeholder.svg"}
                      alt={booking.movie.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="md:col-span-3 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{booking.movie.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Booking ID</p>
                        <p className="font-mono font-medium">#{booking.ticketId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{booking.theater.name}</p>
                            <p className="text-muted-foreground">{booking.theater.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p>{new Date(booking.showtime.startTime).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {booking.seats.map((seat, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {seat.row}{seat.seatNumber}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="font-semibold">${booking.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        // onClick={() => handleDownloadTicket(booking.ticketId)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyBookings
