"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { theaters } from "../../services/api"
import useToast from "@/components/ui/use-toast"

interface Theater {
  _id: string
  name: string
  location: string
  capacity: number
  status: "active" | "maintenance" | "closed"
  screens: number
  amenities: string[]
}

const TheatersManagement = () => {
  const { toast } = useToast()
  const { isAdmin} = useAuth()
  const [theatersList, setTheaters] = useState<Theater[]>([])
  const [filteredTheaters, setFilteredTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const itemsPerPage = 10
  const [formData, setFormData] = useState<Partial<Theater>>({
    name: "",
    location: "",
    capacity: 0,
    status: "active",
    screens: 1,
    amenities: []
  })

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setLoading(true)
        const response = await theaters.getAll()
        const theatersData = response.data || []
        setTheaters(theatersData)
        setFilteredTheaters(theatersData)
      } catch (error) {
        console.error("Error fetching theaters:", error)
        setTheaters([])
        setFilteredTheaters([])
      } finally {
        setLoading(false)
      }
    }

    fetchTheaters()
  }, [])

  useEffect(() => {
    const filtered = theatersList.filter(theater =>
      theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theater.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTheaters(filtered)
    setCurrentPage(1)
  }, [searchQuery, theatersList])

  const handleOpenDialog = (theater?: Theater) => {
    if (theater) {
      setSelectedTheater(theater)
      setFormData(theater)
    } else {
      setSelectedTheater(null)
      setFormData({
        name: "",
        location: "",
        capacity: 0,
        status: "active",
        screens: 1,
        amenities: []
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedTheater(null)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      if (selectedTheater) {
        const response = await theaters.update(selectedTheater._id, formData)
        setTheaters((prev) =>
          prev.map((theater) => (theater._id === selectedTheater._id ? response.data : theater))
        )
        toast({
          title: "Success",
          description: "Theater updated successfully",
        })
      } else {
        const response = await theaters.create(formData)
        setTheaters((prev) => [...prev, response.data])
        toast({
          title: "Success",
          description: "Theater added successfully",
        })
      }
      handleCloseDialog()
    } catch (error) {
      console.error("Error saving theater:", error)
      toast({
        title: "Error",
        description: "Failed to save theater. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this theater?")) {
      try {
        setIsDeleting(id)
        await theaters.delete(id)
        setTheaters((prev) => prev.filter((theater) => theater._id !== id))
        toast({
          title: "Success",
          description: "Theater deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting theater:", error)
        toast({
          title: "Error",
          description: "Failed to delete theater. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "active":
  //       return "bg-green-100 text-green-800"
  //     case "maintenance":
  //       return "bg-yellow-100 text-yellow-800"
  //     case "closed":
  //       return "bg-red-100 text-red-800"
  //     default:
  //       return "bg-gray-100 text-gray-800"
  //   }
  // }

  // Filter theaters for staff members
  // const filteredTheatersForStaff = isStaff()
  //   ? theatersList.filter((theater) => theater._id === getAssignedTheater()?.toString())
  //   : theatersList

  const totalPages = Math.ceil(filteredTheaters.length / itemsPerPage)
  const paginatedTheaters = filteredTheaters.slice(
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
          <h1 className="text-4xl font-bold">Theaters Management</h1>
          {isAdmin() && (
            <Button 
              onClick={() => handleOpenDialog()} 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Add Theater
            </Button>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search theaters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              disabled={loading}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Theaters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Screens</TableHead>
                  <TableHead>Amenities</TableHead>
                  {isAdmin() && <TableHead className="text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTheaters.map((theater) => (
                  <TableRow key={theater._id}>
                    <TableCell className="font-medium">{theater.name}</TableCell>
                    <TableCell>{theater.location}</TableCell>
                    <TableCell>{theater.capacity}</TableCell>
                    <TableCell>{theater.screens}</TableCell>
                    <TableCell>{theater.amenities?.join(", ") || "None"}</TableCell>
                    {isAdmin() && (
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenDialog(theater)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(theater._id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={loading || isDeleting === theater._id}
                          >
                            {isDeleting === theater._id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
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
              <DialogTitle>{selectedTheater ? "Edit Theater" : "Add Theater"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter theater name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter theater location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    placeholder="Enter theater capacity"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="screens">Number of Screens</Label>
                  <Input
                    id="screens"
                    type="number"
                    min="1"
                    value={formData.screens}
                    onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) })}
                    placeholder="Enter number of screens"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input
                    id="amenities"
                    value={formData.amenities?.join(", ") || ""}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(",").map(item => item.trim()) })}
                    placeholder="Enter amenities (e.g., 3D, IMAX, Dolby)"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default TheatersManagement
