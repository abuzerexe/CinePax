"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Clock, Calendar } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import MovieShowtimes from "../components/MovieShowtimes"
import { movies } from "../services/api"

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
  showtimes?: Array<{
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
  }>
}

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError("Movie ID not provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const movieId = id.toString()
        const response = await movies.getById(movieId)
        if (response.data) {
          setMovie(response.data)
        } else {
          setError("Movie not found")
        }
      } catch (error) {
        console.error("Error fetching movie:", error)
        setError("Failed to load movie details")
        setMovie(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error && !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Movie not found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/movies")}>Back to Movies</Button>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Movie not found</h1>
      </div>
    )
  }

  const handleBookTicket = (showtimeId?: string) => {
    if (!user) {
      navigate("/login", { state: { from: `/movies/${id}` } })
      return
    }
    if (showtimeId) {
      navigate(`/booking/${showtimeId}`)
    } else {
      const showtimesSection = document.getElementById("showtimes-section")
      if (showtimesSection) {
        showtimesSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <img src={movie.image || "https://placehold.co/600x900/e2e8f0/cbd5e1?text=Movie"} alt={movie.title} className="w-full rounded-lg shadow-2xl" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="secondary" className="text-sm">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.rating}
                </Badge>
                <Badge variant="outline">{movie.genre}</Badge>
                <Badge variant="outline">
                  <Calendar className="w-4 h-4 mr-1" />
                  {movie.year}
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-4 h-4 mr-1" />
                  {movie.duration}
                </Badge>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Director</h3>
                <p className="text-muted-foreground">{movie.director}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Cast</h3>
                <p className="text-muted-foreground">{movie.cast?.join(", ")}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => handleBookTicket()} className="w-full sm:w-auto min-w-[200px]">
                Book Tickets
              </Button>
            </div>
          </div>
        </div>

        <div id="showtimes-section" className="mt-12">
          <h2 className="text-3xl font-bold mb-8">Showtimes</h2>
          {movie._id && <MovieShowtimes movieId={movie._id} showtimes={movie.showtimes || []} />}
        </div>
      </div>
    </div>
  )
}

export default MovieDetails
