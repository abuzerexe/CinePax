import { Request, Response } from 'express';
import Movie, { IMovie } from '../model/movie.model';
import Showtime, { IShowtime } from '../model/showtime.model';
import Theater, { ITheater } from '../model/theater.model';
import Ticket, { ITicket } from '../model/ticket.model';
import Booking, { IBooking } from '../model/booking.model';
import Payment from '../model/payment.model';
import { Document, Types } from 'mongoose';
import Seat from '../model/seat.model';
import mongoose from 'mongoose';

interface PopulatedMovie {
  _id: Types.ObjectId;
  title: string;
  description: string;
  duration: string;
  genre: string;
  releaseDate: Date;
  image: string;
}

interface PopulatedTheater {
  _id: Types.ObjectId;
  name: string;
  location: string;
  capacity: number;
}

interface PopulatedShowtime {
  _id: Types.ObjectId;
  movieId: PopulatedMovie;
  theaterId: PopulatedTheater;
  startTime: Date;
  endTime: Date;
  price: number;
}

interface PopulatedTicket {
  _id: Types.ObjectId;
  showtime: PopulatedShowtime;
  seat: {
    seatNumber: string;
    row: string;
  };
  price: number;
  status: string;
  purchaseDate: Date;
}

interface BookingRequest {
  showtimeId: string;
  seatNumber: string;
  row: string;
}

interface SearchQuery {
  title?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
}

export const getAllMoviesWithShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;

    const total = await Movie.countDocuments();
    const movies = await Movie.find()
      .skip(skip)
      .limit(limit)
      .lean();

    const allMovies = await Movie.find().select('genre year').lean();
    const genres = [...new Set(allMovies.map(movie => movie.genre))].sort();
    const years = [...new Set(allMovies.map(movie => movie.year))].sort((a, b) => b - a);

    const showtimes = await Showtime.find()
      .populate<{ movieId: PopulatedMovie }>('movieId', 'title description duration genre releaseDate image')
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    const moviesWithShowtimes = movies.map(movie => {
      const movieShowtimes = showtimes.filter(showtime => 
        showtime.movieId._id.toString() === movie._id.toString()
      );

      return {
        ...movie,
        showtimes: movieShowtimes.map(showtime => ({
          id: showtime._id,
          theater: showtime.theaterId,
          startTime: showtime.startTime,
          endTime: showtime.endTime,
          price: showtime.price
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: moviesWithShowtimes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      filters: {
        genres,
        years
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getMovieDetails = async (req: Request<{ movieId: string }>, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId).lean();
    if (!movie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    const showtimes = await Showtime.find({ movieId })
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    const showtimesWithAvailability = await Promise.all(showtimes.map(async (showtime) => {
      const bookedTickets = await Ticket.find({ 
        showtime: showtime._id,
        status: { $ne: 'cancelled' }
      });
      const bookedSeats = bookedTickets.length;
      const availableSeats = showtime.theaterId.capacity - bookedSeats;

      return {
        id: showtime._id,
        theater: showtime.theaterId,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        availableSeats,
        bookedSeats
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        ...movie,
        showtimes: showtimesWithAvailability
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getShowtimeDetails = async (req: Request<{ showtimeId: string }>, res: Response): Promise<void> => {
  try {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findById(showtimeId)
      .populate<{ movieId: PopulatedMovie }>('movieId', 'title description duration genre releaseDate image')
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location capacity')
      .lean();

    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    const bookedTickets = await Ticket.find({ 
      showtime: showtimeId, 
      status: { $ne: 'cancelled' } 
    })
      .populate<{ seat: { seatNumber: string; row: string } }>('seat', 'seatNumber row')
      .lean();

    const bookedSeats = bookedTickets.map(ticket => {
      const seat = ticket.seat as { seatNumber: string; row: string };
      return {
        seatNumber: seat.seatNumber,
        row: seat.row,
        seatId: `${seat.row}${seat.seatNumber}`,
        name: `Seat ${seat.row}${seat.seatNumber}`
      };
    });

    const availableSeats = showtime.theaterId.capacity - bookedSeats.length;

    res.status(200).json({
      success: true,
      data: {
        ...showtime,
        availableSeats,
        bookedSeats: bookedSeats.length,
        seatAvailability: {
          total: showtime.theaterId.capacity,
          available: availableSeats,
          booked: bookedSeats.length
        },
        bookedSeatsList: bookedSeats
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const bookTicket = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatNumber, row } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    try {
      const existingTicket = await Ticket.findOne({
        showtime: showtimeId,
        'seat.seatNumber': seatNumber,
        'seat.row': row,
        status: { $ne: 'cancelled' }
      });

      if (existingTicket) {
        return res.status(400).json({ message: "Seat is already booked" });
      }

      let seat = await Seat.findOne({
        showtimeId,
        seatNumber,
        row
      });

      if (!seat) {
        seat = await Seat.create({
          showtimeId,
          seatNumber,
          row,
          status: 'BOOKED',
          version: 0
        });
      } else {
        seat.status = 'BOOKED';
        seat.version += 1;
        await seat.save();
      }

      const ticket = await Ticket.create({
        showtime: showtimeId,
        customer: customerId,
        seat: seat._id,
        price: showtime.price,
        status: 'confirmed'
      });

      const payment = await Payment.create({
        ticket: ticket._id,
        amount: showtime.price,
        paymentMethod: 'ONLINE',
        paymentStatus: 'COMPLETED'
      });

      const booking = await Booking.create({
        userId: customerId,
        showtimeId,
        seats: [`${row}${seatNumber}`],
        totalAmount: showtime.price,
        status: 'confirmed',
        paymentStatus: 'paid',
        ticket: ticket._id,
        payment: payment._id
      });

      showtime.availableSeats -= 1;
      await showtime.save();

      return res.status(201).json({
        success: true,
        message: "Ticket booked successfully",
        data: {
          ticket: {
            _id: ticket._id,
            showtime: showtimeId,
            customer: customerId,
            seat: {
              seatNumber,
              row
            },
            price: showtime.price,
            status: 'confirmed',
            purchaseDate: new Date()
          },
          payment: {
            _id: payment._id,
            ticket: ticket._id,
            amount: showtime.price,
            paymentMethod: 'ONLINE',
            paymentStatus: 'COMPLETED',
            paymentDate: new Date()
          },
          booking: {
            _id: booking._id,
            userId: customerId,
            showtimeId,
            seats: [`${row}${seatNumber}`],
            totalAmount: showtime.price,
            status: 'confirmed',
            paymentStatus: 'paid'
          }
        }
      });

    } catch (error) {
      throw error;
    }

  } catch (error: any) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: error.message || "Error booking ticket" });
  }
};

export const getUserTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const tickets = (await Ticket.find({ customer: customerId })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movieId', select: 'title duration genre image' },
          { path: 'theaterId', select: 'name location' }
        ]
      })
      .populate('seat', 'seatNumber row')
      .lean()) as unknown as PopulatedTicket[];

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets.map(ticket => ({
        bookingId: ticket._id,
        movie: {
          _id: ticket.showtime.movieId._id,
          title: ticket.showtime.movieId.title,
          duration: ticket.showtime.movieId.duration,
          genre: ticket.showtime.movieId.genre,
          image: ticket.showtime.movieId.image
        },
        theater: ticket.showtime.theaterId,
        showtime: {
          startTime: ticket.showtime.startTime,
          endTime: ticket.showtime.endTime
        },
        seats: [ticket.seat],
        totalAmount: ticket.price,
        price: ticket.price,
        bookingDate: ticket.purchaseDate,
        status: ticket.status,
        paymentStatus: 'paid'
      }))
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const searchMovies = async (req: Request<{}, {}, {}, SearchQuery>, res: Response): Promise<void> => {
  try {
    const { title, genre } = req.query;
    const query: any = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    const movies = await Movie.find(query).lean();
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const filterShowtimes = async (req: Request<{}, {}, {}, SearchQuery>, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, time } = req.query;
    const query: any = {};

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      query.startTime = { ...query.startTime, $gte: timeDate };
    }

    const showtimes = await Showtime.find(query)
      .populate<{ movieId: PopulatedMovie }>('movieId', 'title duration genre image')
      .populate<{ theaterId: PopulatedTheater }>('theaterId', 'name location')
      .lean();

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getBookingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const bookings = await Booking.find({ userId: new Types.ObjectId(customerId) })
      .populate<{ showtimeId: PopulatedShowtime }>({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title duration genre image' },
          { path: 'theaterId', select: 'name location' }
        ]
      })
      .populate('seats')
      .sort({ createdAt: -1 })
      .lean();


    const bookingHistory = bookings.map(booking => {
      const defaultMovie = {
        _id: new Types.ObjectId(),
        title: 'Movie Information Unavailable',
        duration: 'N/A',
        genre: 'N/A',
        image: '/placeholder-movie.jpg'
      };

      const defaultTheater = {
        _id: new Types.ObjectId(),
        name: 'Theater Information Unavailable',
        location: 'N/A'
      };

      const defaultShowtime = {
        startTime: booking.createdAt || new Date(),
        endTime: new Date(booking.createdAt?.getTime() + 7200000) || new Date() 
      };

      const parsedSeats = booking.seats?.map(seatStr => {
        if (typeof seatStr === 'string') {
          const row = seatStr.charAt(0);
          const seatNumber = seatStr.slice(1);
          return {
            row,
            seatNumber
          };
        }
        return {
          row: 'N/A',
          seatNumber: 'N/A'
        };
      }) || [{
        row: 'N/A',
        seatNumber: 'N/A'
      }];

      return {
        _id: booking._id,
        movie: {
          _id: booking.showtimeId?.movieId?._id || defaultMovie._id,
          title: booking.showtimeId?.movieId?.title || defaultMovie.title,
          duration: booking.showtimeId?.movieId?.duration || defaultMovie.duration,
          genre: booking.showtimeId?.movieId?.genre || defaultMovie.genre,
          image: booking.showtimeId?.movieId?.image || defaultMovie.image
        },
        showtime: {
          startTime: booking.showtimeId?.startTime || defaultShowtime.startTime,
          theater: booking.showtimeId?.theaterId?.name || 'N/A',
          location: booking.showtimeId?.theaterId?.location || 'N/A'
        },
        seats: parsedSeats,
        totalAmount: booking.totalAmount || 0,
        status: booking.status || 'UNKNOWN',
        paymentStatus: booking.paymentStatus || 'UNKNOWN'
      };
    });

    res.status(200).json({
      success: true,
      count: bookingHistory.length,
      data: bookingHistory
    });
  } catch (err: any) {
    console.error("Error in getBookingHistory:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const cancelBooking = async (req: Request<{ ticketId: string }>, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const customerId = req.user?.id;
    const { status } = req.body;

    if (!customerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const booking = await Booking.findOne({ _id: ticketId, userId: customerId });
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const ticket = await Ticket.findById(booking.ticket).populate('seat');
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    const showtime = await Showtime.findById(ticket.showtime);
    if (!showtime) {
      res.status(404).json({ message: 'Showtime not found' });
      return;
    }

    const showtimeDate = new Date(showtime.startTime);
    const currentDate = new Date();
    const hoursUntilShowtime = (showtimeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    if (hoursUntilShowtime <= 2) {
      res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
      return;
    }

    if (req.method === 'PUT' && status) {
      ticket.status = status;
      await ticket.save();

      await Payment.findOneAndUpdate(
        { ticket: ticket._id },
        { paymentStatus: 'REFUNDED' }
      );

      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
      await booking.save();
    } else {
      await Ticket.findByIdAndDelete(ticket._id);

      await Payment.findOneAndUpdate(
        { ticket: ticket._id },
        { paymentStatus: 'REFUNDED' }
      );

      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
      await booking.save();
    }

    if (ticket.seat) {
      await Seat.findByIdAndUpdate(ticket.seat._id, {
        status: 'AVAILABLE',
        $unset: { lockExpiresAt: 1, lockedBy: 1 }
      });
    }

    showtime.availableSeats += 1;
    await showtime.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 