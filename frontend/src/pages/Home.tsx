"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import MovieCard from "../components/ui/movie-card"
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
}

const Home = () => {
  const navigate = useNavigate()
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const response = await movies.getFeatured()
        if (response.data) {
          setFeaturedMovies(response.data)
        } else {
          console.error("No featured movies data received")
          setFeaturedMovies([])
        }
      } catch (error) {
        console.error("Error fetching featured movies:", error)
        setFeaturedMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedMovies()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Welcome to CinePax
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Your ultimate destination for movie tickets and entertainment. Experience cinema like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/movies")}
              className="relative px-12 py-4 text-lg font-semibold text-white rounded-full bg-gradient-to-br from-purple-800 to-purple-950 hover:from-purple-900 hover:to-purple-950 transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(128,0,255,0.4)]"
            >
              <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition duration-300 rounded-full pointer-events-none" />

              <span className="absolute -inset-px rounded-full border border-purple-500/30 group-hover:border-purple-400/60 transition duration-300 animate-pulse pointer-events-none" />

              <span className="relative z-10 flex items-center justify-center">
                Browse Movies
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
              </span>
            </Button>

              {/* <Button
                size="lg"
                variant="outline"
                className="border-purple-300 text-purple-100 hover:bg-purple-800/50 px-8 py-3 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Trailer
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Movies</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the latest blockbusters and critically acclaimed films now showing in our theaters
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
            {featuredMovies.map((movie) => (
              <MovieCard key={movie._id} {...movie} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/movies")} className="px-8 py-3 text-lg border-purple-800 text-purple-800 hover:bg-purple-900 hover:text-white hover:border-purple-900 transition-colors duration-300 dark:text-white">
              View All Movies
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-muted-foreground">Movies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-muted-foreground">Theaters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">9.8</div>
              <div className="text-muted-foreground flex items-center justify-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}

export default Home
