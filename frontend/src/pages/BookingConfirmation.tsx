"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Calendar, MapPin, Users, AlertCircle } from "lucide-react"
import useToast from "@/components/ui/use-toast"

interface BookingData {
  _id: string;
  movie: {
    title: string;
    duration: string;
    genre: string;
  };
  showtime: {
    startTime: string;
    theater: string;
    location: string;
  };
  seats: string[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const BookingConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!location.state?.bookingData) {
      navigate("/")
      return
    }

    setBookingData(location.state.bookingData)
    setLoading(false)
  }, [location.state, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!bookingData) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownloadTicket = async () => {
    try {
      const ticketWindow = window.open('', '_blank');
      if (!ticketWindow) {
        throw new Error('Failed to open ticket window');
      }

      const ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Movie Ticket - ${bookingData.movie.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ticket { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .details p { margin: 5px 0; }
            .qr-code { text-align: center; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>Movie Ticket</h1>
              <h2>${bookingData.movie.title}</h2>
            </div>
            <div class="details">
              <p><strong>Date:</strong> ${new Date(bookingData.showtime.startTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(bookingData.showtime.startTime).toLocaleTimeString()}</p>
              <p><strong>Theater:</strong> ${bookingData.showtime.theater}</p>
              <p><strong>Location:</strong> ${bookingData.showtime.location}</p>
              <p><strong>Seats:</strong> ${bookingData.seats.join(', ')}</p>
              <p><strong>Booking ID:</strong> ${bookingData._id}</p>
            </div>
            <div class="qr-code">
              <p>Scan this QR code at the theater</p>
              <div id="qrcode"></div>
            </div>
            <div class="footer">
              <p>Thank you for choosing CinePax!</p>
              <p>Please arrive 15 minutes before the showtime.</p>
            </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qrcode"), {
              text: "${bookingData._id}",
              width: 128,
              height: 128
            });
          </script>
        </body>
        </html>
      `;

      ticketWindow.document.write(ticketHTML);
      ticketWindow.document.close();

      setTimeout(() => {
        ticketWindow.print();
        ticketWindow.close();
      }, 1000);

      toast({
        title: "Ticket Downloaded",
        description: "Your ticket has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            {bookingData.status === 'confirmed' ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            )}
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              {bookingData.status === 'confirmed' ? 'Booking Confirmed!' : 'Booking Pending'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {bookingData.status === 'confirmed' 
                ? 'Your tickets have been successfully booked'
                : 'Please complete the payment to confirm your booking'}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <Badge variant="secondary">#{bookingData._id.slice(-6)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Movie Information</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{bookingData.movie.title}</p>
                    <p className="text-muted-foreground">
                      {bookingData.movie.genre} • {bookingData.movie.duration}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Show Details</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(bookingData.showtime.startTime).toLocaleString()}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {bookingData.showtime.theater} - {bookingData.showtime.location}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Seat Information</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {bookingData.seats.length} Tickets
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {bookingData.seats.map((seat) => (
                        <Badge key={seat} variant="outline" className="text-xs">
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Payment</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">${bookingData.totalAmount.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(bookingData.paymentStatus)}>
                        {bookingData.paymentStatus.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground capitalize">
                        via {bookingData.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Important Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Please arrive 15 minutes before showtime</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• No outside food or beverages allowed</li>
                  <li>• Tickets are non-refundable</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1" 
              onClick={handleDownloadTicket}
              disabled={bookingData.status !== 'confirmed'}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
