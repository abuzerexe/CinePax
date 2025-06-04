"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Clock, CreditCard } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { movies, theaters, tickets } from "../services/api"
import useToast from "@/components/ui/use-toast"

interface Showtime {
  _id: string
  startTime: string
  endTime: string
  theaterId: {
    _id: string
    name: string
    location: string
  }
  movieId: string
  availableSeats: number
  price: number
}

interface Movie {
  _id: string
  title: string
  image: string
  description: string
  genre: string
  year: number
  rating: number
  duration: string
  director: string
  cast: string[]
}

const Booking = () => {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [ticketCount, setTicketCount] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [bookedSeats, setBookedSeats] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true)
        const showtimeResponse = await theaters.getShowtime(showtimeId!)
        setShowtime(showtimeResponse.data)
        
        const movieResponse = await movies.getById(showtimeResponse.data.movieId._id)
        setMovie(movieResponse.data)

        const seatsResponse = await tickets.getBookedSeats(showtimeId!)
        const bookedSeats = Array.isArray(seatsResponse.data.bookedSeats) 
          ? seatsResponse.data.bookedSeats 
          : []
        setBookedSeats(bookedSeats)
      } catch (error) {
        console.error("Error fetching booking data:", error)
        toast({
          title: "Error",
          description: "Failed to load booking information. Please try again.",
          variant: "destructive"
        })
        navigate("/movies")
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      navigate("/login")
      return
    }

    if (showtimeId) {
      fetchBookingData()
    }
  }, [showtimeId, user, navigate])

  const handleSeatSelection = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((seat) => seat !== seatNumber)
      } else if (prev.length < ticketCount) {
        return [...prev, seatNumber]
      }
      return prev
    })
  }

  const validateBooking = async () => {
    if (!showtime) return false;
    
    const unavailableSeats = selectedSeats.filter(seat => 
      bookedSeats.some(bookedSeat => bookedSeat.id === seat)
    );
    
    if (unavailableSeats.length > 0) {
      toast({
        title: "Seats Unavailable",
        description: `Seats ${unavailableSeats.join(', ')} are no longer available. Please select different seats.`,
        variant: "destructive"
      });
      return false;
    }

    if (selectedSeats.length !== ticketCount) {
      toast({
        title: "Invalid Selection",
        description: "Please select the correct number of seats.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    try {
      setProcessing(true);

      if (!await validateBooking()) {
        return;
      }

      if (!showtime || !movie) {
        throw new Error("Showtime or movie information is missing");
      }

      const bookingResponse = await tickets.create({
        showtimeId: showtime._id,
        seats: selectedSeats,
        totalAmount: showtime.price * ticketCount
      });

      navigate("/booking-confirmation", {
        state: {
          bookingData: {
            ...bookingResponse.data.ticket,
            movie: {
              title: movie.title,
              duration: movie.duration,
              genre: movie.genre
            },
            showtime: {
              startTime: showtime.startTime,
              theater: showtime.theaterId.name,
              location: showtime.theaterId.location
            },
            seats: selectedSeats,
            totalAmount: showtime.price * ticketCount,
            paymentMethod: 'ONLINE',
            paymentStatus: 'COMPLETED'
          }
        }
      });
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "An error occurred while processing your booking.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const generateSeatGrid = () => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
    const seatsPerRow = 10
    const seats = []

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatNumber = `${row}${i}`
        const isSelected = selectedSeats.includes(seatNumber)
        const isOccupied = bookedSeats.some(seat => seat.id === seatNumber)

        seats.push(
          <button
            key={seatNumber}
            onClick={() => !isOccupied && handleSeatSelection(seatNumber)}
            disabled={isOccupied}
            className={`
              w-8 h-8 m-1 rounded text-xs font-medium transition-colors
              ${
                isOccupied
                  ? "bg-red-200 text-red-800 cursor-not-allowed"
                  : isSelected
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }
            `}
          >
            {seatNumber}
          </button>
        )
      }
    }

    return seats
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!movie || !showtime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Booking information not found</h1>
      </div>
    )
  }

  const totalAmount = showtime.price * ticketCount

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Book Your Tickets</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Movie Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src={movie.image || "https://placehold.co/600x900/e2e8f0/cbd5e1?text=Movie"}
                    alt={movie.title}
                    className="w-24 h-36 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{movie.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{movie.genre}</Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {movie.duration}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {showtime.theaterId.name} - {showtime.theaterId.location}
                      </p>
                      <p className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(showtime.startTime || "").toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Your Seats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-gray-800 text-white px-8 py-2 rounded-t-lg text-sm">SCREEN</div>
                  </div>

                  <div className="flex justify-center">
                    <div className="grid grid-cols-10 gap-1">{generateSeatGrid()}</div>
                  </div>

                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-600 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-200 rounded"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tickets">Number of Tickets</Label>
                  <Input
                    id="tickets"
                    type="number"
                    min="1"
                    max="8"
                    value={ticketCount}
                    onChange={(e) => {
                      const count = Math.max(1, Number.parseInt(e.target.value) || 1)
                      setTicketCount(count)
                      setSelectedSeats([])
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Selected Seats</Label>
                  <div className="min-h-[40px] p-2 border rounded bg-muted">
                    {selectedSeats.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedSeats.map((seat) => (
                          <Badge key={seat} variant="secondary">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No seats selected</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ticket Price</span>
                    <span>${showtime.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span>{ticketCount}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="apple">Apple Pay</SelectItem>
                      <SelectItem value="google">Google Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleBooking}
                  disabled={processing || selectedSeats.length === 0}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Book Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
