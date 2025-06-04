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
import useToast from "@/components/ui/use-toast"

interface Booking {
  bookingId: string
  movie: {
    _id: string
    title: string
    duration: number
    genre: string
    posterUrl?: string
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
    row: string
    seatNumber: string
  }>
  totalAmount: number
  price: number
  bookingDate: string
  status: 'pending' | 'confirmed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
}

const MyBookings = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await tickets.getUserBookings()
      setBookings(response.data)
      setFilteredBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const matchesSearch =
        booking.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.theater.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => new Date(b.showtime.startTime).getTime() - new Date(a.showtime.startTime).getTime())

    setFilteredBookings(filtered)
  }, [bookings, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setLoading(true)
      const response = await tickets.update(bookingId, { status: 'cancelled' })
      if (response.success) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully.",
        })
        fetchBookings()
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTicket = (booking: Booking) => {
    try {
      const ticketWindow = window.open('', '_blank')
      if (!ticketWindow) {
        throw new Error('Failed to open ticket window')
      }

      const ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Movie Ticket - ${booking.movie.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ticket { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .details p { margin: 5px 0; }
            .qr-code { text-align: center; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>Movie Ticket</h1>
              <h2>${booking.movie.title}</h2>
            </div>
            <div class="details">
              <p><strong>Date:</strong> ${new Date(booking.showtime.startTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(booking.showtime.startTime).toLocaleTimeString()}</p>
              <p><strong>Theater:</strong> ${booking.theater.name}</p>
              <p><strong>Location:</strong> ${booking.theater.location}</p>
              <p><strong>Seats:</strong> ${booking.seats.map(seat => `${seat.row}${seat.seatNumber}`).join(', ')}</p>
              <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            </div>
            <div class="qr-code">
              <p>Scan this QR code at the theater</p>
              <div id="qrcode"></div>
            </div>
            <div class="footer">
              <p>Thank you for choosing CinePax!</p>
              <p>Please arrive 15 minutes before the showtime.</p>
            </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qrcode"), {
              text: "${booking.bookingId}",
              width: 128,
              height: 128
            });
          </script>
        </body>
        </html>
      `

      ticketWindow.document.write(ticketHTML)
      ticketWindow.document.close()

      setTimeout(() => {
        ticketWindow.print()
        ticketWindow.close()
      }, 1000)

      toast({
        title: "Ticket Downloaded",
        description: "Your ticket has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading ticket:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive"
      })
    }
  }

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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.bookingId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                  <div className="md:col-span-1">
                    <img
                      src={booking.movie.posterUrl}
                      alt={booking.movie.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-3 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{booking.movie.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Booking ID</p>
                        <p className="font-mono font-medium">#{booking.bookingId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{booking.theater.name} - {booking.theater.location}</p>
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
                                {`${seat.row}${seat.seatNumber}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="font-semibold">${booking.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.bookingId)}
                            disabled={loading}
                          >
                            Cancel Booking
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadTicket(booking)}
                            disabled={loading}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Ticket
                          </Button>
                        )}
                      </div>
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
