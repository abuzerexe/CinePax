"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

interface Showtime {
  _id: string
  startTime: string
  endTime: string
  theaterId: {
    _id: string
    name: string
    location: string
  }
  availableSeats: number
  price: number
}

interface MovieShowtimesProps {
  movieId: string
  showtimes: Showtime[]
}

const ITEMS_PER_PAGE = 6

const MovieShowtimes = ({ movieId, showtimes }: MovieShowtimesProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(showtimes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentShowtimes = showtimes.slice(startIndex, endIndex)

  const handleBookTickets = (showtimeId: string) => {
    if (!user) {
      navigate("/login", { state: { from: `/movies/${movieId}` } })
      return
    }
    navigate(`/booking/${showtimeId}`)
  }

  const handleViewAllShowtimes = (theaterId: string) => {
    navigate(`/theaters/${theaterId}/showtimes`)
  }

  if (showtimes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">No showtimes available for this movie.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentShowtimes.map((showtime) => (
          <Card key={showtime._id} className="transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{showtime.theaterId.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {showtime.theaterId.location}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(showtime.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {showtime.availableSeats} seats available
                </div>
                <div className="flex items-center font-semibold">
                  Rs. {showtime.price.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleBookTickets(showtime._id)}
                  disabled={showtime.availableSeats === 0}
                >
                  {showtime.availableSeats === 0 ? "Sold Out" : "Book Now"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewAllShowtimes(showtime.theaterId._id)}
                >
                  View All Showtimes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default MovieShowtimes
