"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface MovieCardProps {
  _id: string
  title: string
  image: string
  description: string
  genre: string
  year: number
  rating?: number
  duration?: string
}

const MovieCard = ({ _id, title, image, description, genre, year, rating, duration }: MovieCardProps) => {
  const navigate = useNavigate()

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/movies/${_id}`)}
    >
      <div className="relative overflow-hidden">
        <img
          src={image || "https://placehold.co/400x600/e2e8f0/cbd5e1?text=Movie"}
          alt={title}
          className="aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105 w-full"
        />
        {rating && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-black/70 text-white">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              {rating}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{genre}</Badge>
          <Badge variant="outline" className="text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {year}
          </Badge>
          {duration && (
            <Badge variant="outline" className="text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {duration}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/movies/${_id}`)
          }}
        >
          Book Tickets
        </Button>
      </CardFooter>
    </Card>
  )
}

export default MovieCard
