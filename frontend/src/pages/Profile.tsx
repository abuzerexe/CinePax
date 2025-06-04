"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Calendar, MapPin } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { tickets, auth } from "../services/api"
import useToast from "@/components/ui/use-toast"

interface Booking {
  bookingId: string
  movie: {
    title: string
    duration: number
    genre: string
    posterUrl: string
  }
  theater: {
    name: string
    location: string
  }
  showtime: {
    startTime: string
    endTime: string
  }
  seats: Array<{
    seatNumber: string
    row: string
  }>
  price: number
  bookingDate: string
  status: string
}

const Profile = () => {
  const { user,  } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([])
  const [isCanceling, setIsCanceling] = useState<string | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalData, setOriginalData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.getProfile()
        
        if (response) {
          const newData = {
            fullName: response.fullName || "",
            email: response.email || "",
            phone: response.phone || "",
          }
          setFormData(newData)
          setOriginalData(newData)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id, toast])

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const response = await tickets.getUserBookings()
        if (response && response.data) {
          setBookingHistory(response.data)
        } else {
          setBookingHistory([])
        }
      } catch (error) {
        console.error("Error fetching booking history:", error)
        setBookingHistory([])
      }
    }

    if (user?.id) {
      fetchBookingHistory()
    }
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }
      await auth.updateProfile(updateData)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        setIsCanceling(bookingId)
        const response = await tickets.update(bookingId, { status: 'cancelled' })
        if (response.success) {
          toast({
            title: "Booking Cancelled",
            description: "Your booking has been cancelled successfully.",
          })
          const updatedResponse = await tickets.getUserBookings()
          if (updatedResponse && updatedResponse.data) {
            setBookingHistory(updatedResponse.data)
          }
        }
      } catch (error: any) {
        console.error('Error cancelling booking:', error)
        toast({
          title: "Cancellation Failed",
          description: error.response?.data?.message || "Failed to cancel booking. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsCanceling(null)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Please log in to view your profile</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="https://avatars.githubusercontent.com/u/140898970?s=400&u=37fd7bdf61f2773df44e33db071c1a4c4bc1604f&v=4" alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {formData.fullName ? formData.fullName[0].toUpperCase() : formData.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{formData.fullName}</h3>
                    <p className="text-muted-foreground">{formData.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 mt-6">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Updating...
                          </div>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Movie</TableHead>
                      <TableHead>Theater</TableHead>
                      <TableHead>Showtime</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingHistory.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell className="font-medium">#{booking.bookingId}</TableCell>
                        <TableCell>{booking.movie.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {booking.theater.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(booking.showtime.startTime).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {booking.seats.map((seat, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {seat.row}{seat.seatNumber}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>${booking.price}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.bookingId)}
                              disabled={isCanceling === booking.bookingId}
                              className="text-red-600 hover:text-red-700"
                            >
                              {isCanceling === booking.bookingId ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                "Cancel"
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {bookingHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground">No booking history found.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Profile
