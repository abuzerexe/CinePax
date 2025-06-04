"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Star, MapPin } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { theaters } from "../services/api"

interface ShowtimeResponse {
  _id: string
  startTime: string
  endTime: string
  price: number
  availableSeats: number
  movie: {
    _id: string
    title: string
    duration: number
    genre: string
    rating: number
    image : string
  }
}

interface Showtime {
  _id: string
  startTime: string
  endTime: string
  price: number
  availableSeats: number
  movie: {
    _id: string
    title: string
    duration: number
    genre: string
    rating: number
    image: string
  }
}

interface Theater {
  _id: string
  name: string
  location: string
  capacity: number
}


const TheaterShowtimes = () => {
  const { theaterId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [theater, setTheater] = useState<Theater | null>(null)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("All Dates")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)


  useEffect(() => {
    const fetchTheaterData = async () => {
      try {
        setLoading(true)
        const theaterResponse = await theaters.getById(theaterId!)
        setTheater(theaterResponse.data)

        const showtimesResponse = await theaters.getShowtimes(theaterId!, { page: currentPage, limit: 10 })
        if (showtimesResponse.success && Array.isArray(showtimesResponse.data)) {
          const transformedShowtimes: Showtime[] = showtimesResponse.data.map((showtime: ShowtimeResponse) => ({
            _id: showtime._id,
            startTime: showtime.startTime,
            endTime: showtime.endTime,
            price: showtime.price,
            availableSeats: showtime.availableSeats,
            movie: {
              _id: showtime.movie._id,
              title: showtime.movie.title,
              duration: showtime.movie.duration,
              genre: showtime.movie.genre,
              rating: showtime.movie.rating,
              image: showtime.movie.image
            }
          }))
          setShowtimes(transformedShowtimes)
          setFilteredShowtimes(transformedShowtimes)
          setTotalPages(showtimesResponse.totalPages)
        } else {
          console.error('Invalid showtimes response:', showtimesResponse)
          setShowtimes([])
          setFilteredShowtimes([])
        }
      } catch (error) {
        console.error("Error fetching theater data:", error)
        setShowtimes([])
        setFilteredShowtimes([])
      } finally {
        setLoading(false)
      }
    }

    if (theaterId) {
      fetchTheaterData()
    }
  }, [theaterId, currentPage])

  useEffect(() => {
    let filtered = [...showtimes]

    if (searchQuery) {
      filtered = filtered.filter(showtime =>
        showtime.movie?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter(showtime => {
          const showtimeDate = new Date(showtime.startTime)
          const showtimeUTC = new Date(Date.UTC(
            showtimeDate.getFullYear(),
            showtimeDate.getMonth(),
            showtimeDate.getDate()
          ))
          return showtimeUTC.getTime() === todayUTC.getTime()
        })
        break
      case "tomorrow":
        const tomorrowUTC = new Date(todayUTC)
        tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1)
        filtered = filtered.filter(showtime => {
          const showtimeDate = new Date(showtime.startTime)
          const showtimeUTC = new Date(Date.UTC(
            showtimeDate.getFullYear(),
            showtimeDate.getMonth(),
            showtimeDate.getDate()
          ))
          return showtimeUTC.getTime() === tomorrowUTC.getTime()
        })
        break
      case "week":
        const weekLaterUTC = new Date(todayUTC)
        weekLaterUTC.setUTCDate(weekLaterUTC.getUTCDate() + 7)
        filtered = filtered.filter(showtime => {
          const showtimeDate = new Date(showtime.startTime)
          const showtimeUTC = new Date(Date.UTC(
            showtimeDate.getFullYear(),
            showtimeDate.getMonth(),
            showtimeDate.getDate()
          ))
          return showtimeUTC >= todayUTC && showtimeUTC <= weekLaterUTC
        })
        break
    }

    setFilteredShowtimes(filtered)
  }, [showtimes, searchQuery, dateFilter])

  const handleBookTicket = (showtimeId: string) => {
    if (!user) {
      navigate("/login", { state: { from: `/theaters/${theaterId}/showtimes` } })
      return
    }
    navigate(`/booking/${showtimeId}`)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!theater) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Theater not found</h1>
          <Button onClick={() => navigate("/theaters")}>Back to Theaters</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{theater.name}</h1>
          <p className="text-muted-foreground flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {theater.location}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="all">All Dates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredShowtimes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">No showtimes found matching your criteria.</p>
            </div>
          ) : (
            <>
              {filteredShowtimes.map((showtime) => (
                <Card key={showtime._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                      <div className="md:col-span-1">
                        <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                          <img
                            src={showtime.movie?.image}
                            alt={showtime.movie?.title || "Movie poster"}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => navigate(`/movies/${showtime.movie?._id}`)}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3
                              className="text-xl font-bold mb-2 cursor-pointer hover:text-purple-600"
                              onClick={() => navigate(`/movies/${showtime.movie?._id}`)}
                            >
                              {showtime.movie?.title || "Unknown Movie"}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">{showtime.movie?.genre || "Unknown Genre"}</Badge>
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                {showtime.movie?.duration ? `${showtime.movie.duration} min` : "Unknown Duration"}
                              </Badge>
                              <Badge variant="secondary">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {showtime.movie?.rating || "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">Rs. {showtime.price}</p>
                            <p className="text-sm text-muted-foreground">per ticket</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              <p>{formatDate(showtime.startTime)}</p>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                              <p>
                                {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Available Seats:</span> {showtime.availableSeats}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Theater Capacity:</span> {theater.capacity}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                          <Button
                            onClick={() => handleBookTicket(showtime._id)}
                            disabled={showtime.availableSeats === 0}
                            className="flex-1"
                          >
                            {showtime.availableSeats === 0 ? "Sold Out" : "Book Tickets"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/movies/${showtime.movie?._id}`)}
                            className="flex-1"
                          >
                            Movie Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TheaterShowtimes
