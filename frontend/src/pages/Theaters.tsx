"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Star, Users, Wifi, Car, Coffee, Accessibility } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { theaters } from "../services/api"

interface Theater {
  _id: string
  name: string
  location: string
  amenities: string[]
  capacity: number
  screens: number
  createdAt: string
  updatedAt: string
}

const amenityIcons: Record<string, any> = {
  IMAX: Star,
  "Dolby Atmos": Star,
  "Premium Seating": Users,
  "Food Court": Coffee,
  Parking: Car,
  WiFi: Wifi,
  "4K Projection": Star,
  Bar: Coffee,
  "VIP Lounge": Star,
  "Valet Parking": Car,
  "Classic Seating": Users,
  "Snack Bar": Coffee,
  "Wheelchair Accessible": Accessibility,
  "Family Friendly": Users,
}

const Theaters = () => {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [theatersList, setTheaters] = useState<Theater[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await theaters.getAll()
        setTheaters(response.data || [])
      } catch (error) {
        console.error("Error fetching theaters:", error)
        setTheaters([])
      } finally {
        setLoading(false)
      }
    }

    fetchTheaters()
  }, [])

  const filteredTheaters = theatersList.filter(
    (theater) =>
      theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theater.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Theaters</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our premium theater locations with state-of-the-art technology and comfort
          </p>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search theaters by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTheaters.map((theater) => (
            <Card key={theater._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src="https://i.tribune.com.pk/media/images/image1632989079-0/image1632989079-0.png"
                  alt={theater.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {theater.screens} Screens
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{theater.name}</CardTitle>
                <p className="text-muted-foreground flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {theater.location}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {theater.amenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Star
                      return (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          <IconComponent className="w-3 h-3 mr-1" />
                          {amenity}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Theater Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <p className="text-sm">Total Capacity</p>
                      <p className="font-semibold text-sm">{theater.capacity} seats</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <p className="text-sm">Number of Screens</p>
                      <p className="font-semibold text-sm">{theater.screens}</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={() => navigate(`/theaters/${theater._id}/showtimes`)}>
                  View Showtimes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTheaters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No theaters found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Theaters
