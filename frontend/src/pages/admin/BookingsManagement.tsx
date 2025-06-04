"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { tickets } from "../../services/api"
import useToast from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

interface Booking {
  _id: string
  userId: {
    _id: string
    fullName: string
    email: string
  }
  showtimeId: {
    _id: string
    startTime: string
    endTime: string
    movieId: {
      _id: string
      title: string
    }
    theaterId: {
      _id: string
      name: string
      location: string
    }
  }
  seats: string[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  updatedAt: string
}

const BookingsManagement = () => {
  const {  isStaff, getAssignedTheater } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await tickets.getAll()
      const mapped = response.data.map((b: any) => {
        return {
          _id: b._id,
          userId: {
            _id: b.customer?._id || 'N/A',
            fullName: b.customer?.fullName || 'N/A',
            email: b.customer?.email || 'N/A',
          },
          showtimeId: {
            _id: b.showtime?._id || 'N/A',
            startTime: b.showtime?.startTime || new Date().toISOString(),
            endTime: b.showtime?.endTime || new Date().toISOString(),
            movieId: {
              _id: b.showtime?.movie?._id || 'N/A',
              title: b.showtime?.movie?.title || 'N/A',
            },
            theaterId: {
              _id: b.showtime?.theater?._id || 'N/A',
              name: b.showtime?.theater?.name || 'N/A',
              location: b.showtime?.theater?.location || 'N/A',
            },
          },
          seats: b.seat ? [`${b.seat.row}${b.seat.seatNumber}`] : ['N/A'],
          totalAmount: b.price || 0,
          status: b.status || 'pending',
          paymentStatus: b.paymentStatus || 'pending',
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
        }
      })
      setBookings(mapped)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }



  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedBooking(null)
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await tickets.update(bookingId, { status: newStatus })
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Booking status updated successfully.",
        })
        fetchBookings() 
      } else {
        throw new Error(response.message || "Failed to update booking status")
      }
    } catch (error: any) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update booking status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.showtimeId.movieId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.showtimeId.theaterId.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesPayment = paymentFilter === "all" || booking.paymentStatus === paymentFilter

    const matchesTheater = isStaff() ? booking.showtimeId.theaterId._id === getAssignedTheater()?.toString() : true

    return matchesSearch && matchesStatus && matchesPayment && matchesTheater
  })

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Bookings Management</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Status</Label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPaymentFilter("all")
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Movie</TableHead>
              <TableHead>Theater</TableHead>
              <TableHead>Showtime</TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.userId.fullName}</div>
                    <div className="text-sm text-muted-foreground">{booking.userId.email}</div>
                  </div>
                </TableCell>
                <TableCell>{booking.showtimeId.movieId.title}</TableCell>
                <TableCell>{booking.showtimeId.theaterId.name}</TableCell>
                <TableCell>
                  <div>
                    <div>{new Date(booking.showtimeId.startTime).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.showtimeId.endTime).toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.seats.map((seat) => (
                    <span key={seat}>{seat} </span>
                  ))}
                </TableCell>
                <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                          className="text-green-600 hover:text-green-700"
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Booking Information</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">User:</span> {selectedBooking.userId.fullName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {selectedBooking.userId.email}
                      </p>
                      <p>
                        <span className="font-medium">Movie:</span> {selectedBooking.showtimeId.movieId.title}
                      </p>
                      <p>
                        <span className="font-medium">Theater:</span> {selectedBooking.showtimeId.theaterId.name}
                      </p>
                      <p>
                        <span className="font-medium">Showtime:</span>{" "}
                        {new Date(selectedBooking.showtimeId.startTime).toLocaleString()} - {new Date(selectedBooking.showtimeId.endTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Seats:</span>{" "}
                        {selectedBooking.seats.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium">Total Amount:</span> ${selectedBooking.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Status Management</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Booking Status</label>
                        <Select
                          value={selectedBooking.status}
                          onValueChange={(value) => handleStatusUpdate(selectedBooking._id, value as Booking["status"])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default BookingsManagement
