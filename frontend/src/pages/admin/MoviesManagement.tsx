"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Plus, Search } from "lucide-react"
import { movies } from "../../services/api"
import useToast from "@/components/ui/use-toast"

interface Movie {
  _id: string
  title: string
  description: string
  genre: string
  duration: number
  releaseDate: string
  rating: number
  image: string
  year: number
}

const MoviesManagement = () => {
  const { toast } = useToast()
  const [moviesList, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [formData, setFormData] = useState<Partial<Movie>>({
    title: "",
    description: "",
    genre: "",
    duration: 0,
    releaseDate: "",
    rating: 0,
    image: "",
    year: new Date().getFullYear(),
  })

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const response = await movies.getAll()
        const moviesData = response.data || []
        setMovies(moviesData)
        setFilteredMovies(moviesData)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([])
        setFilteredMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    const filtered = moviesList.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMovies(filtered)
    setCurrentPage(1)
  }, [searchQuery, moviesList])

  const handleOpenDialog = (movie?: Movie) => {
    if (movie) {
      setSelectedMovie(movie)
      setFormData(movie)
    } else {
      setSelectedMovie(null)
      setFormData({
        title: "",
        description: "",
        genre: "",
        duration: 0,
        releaseDate: "",
        rating: 0,
        image: "",
        year: new Date().getFullYear(),
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedMovie(null)
  }

  const handleSubmit = async () => {
    try {
      const movieData = {
        ...formData,
        duration: Number(formData.duration),
        year: Number(formData.year),
        releaseDate: new Date(formData.releaseDate || "").toISOString(),
      }

      if (selectedMovie) {
        const response = await movies.update(selectedMovie._id, movieData)
        setMovies((prev) =>
          prev.map((movie) => (movie._id === selectedMovie._id ? response.data : movie))
        )
        toast({
          title: "Success",
          description: "Movie updated successfully",
        })
      } else {
        const response = await movies.create(movieData)
        setMovies((prev) => [...prev, response.data])
        toast({
          title: "Success",
          description: "Movie added successfully",
        })
      }
      handleCloseDialog()
    } catch (error) {
      console.error("Error saving movie:", error)
      toast({
        title: "Error",
        description: "Failed to save movie. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await movies.delete(id)
        setMovies((prev) => prev.filter((movie) => movie._id !== id))
        toast({
          title: "Success",
          description: "Movie deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting movie:", error)
        toast({
          title: "Error",
          description: "Failed to delete movie. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage)
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Movies Management</h1>
          <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Movie
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovies.map((movie) => (
                  <TableRow key={movie._id}>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>{movie.genre}</TableCell>
                    <TableCell>{movie.duration} min</TableCell>
                    <TableCell>{new Date(movie.releaseDate).toLocaleDateString()}</TableCell>
                    <TableCell>{movie.rating}/10</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(movie)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(movie._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMovie ? "Edit Movie" : "Add Movie"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter movie title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter movie description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Enter movie genre"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    placeholder="Enter movie duration"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    placeholder="Enter movie rating (0-10)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Poster URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter movie poster URL"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    placeholder="Enter movie year"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default MoviesManagement
