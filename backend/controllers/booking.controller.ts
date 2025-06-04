import { Request, Response } from 'express';
import { Types, Document } from 'mongoose';
import Booking from '../model/booking.model';

interface PopulatedUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
}

interface PopulatedMovie {
  _id: Types.ObjectId;
  title: string;
  duration: string;
  genre: string;
  image: string;
}

interface PopulatedTheater {
  _id: Types.ObjectId;
  name: string;
  location: string;
}

interface PopulatedShowtime {
  _id: Types.ObjectId;
  movieId: PopulatedMovie;
  theaterId: PopulatedTheater;
  startTime: Date;
  endTime: Date;
}

interface PopulatedBooking extends Document {
  _id: Types.ObjectId;
  userId: PopulatedUser;
  showtimeId: PopulatedShowtime;
  seats: string[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate<{ showtimeId: PopulatedShowtime }>({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title duration genre image' },
          { path: 'theaterId', select: 'name location' }
        ]
      })
      .populate<{ userId: PopulatedUser }>('userId', 'fullName email')
      .populate('seats')
      .sort({ createdAt: -1 })
      .lean();

    const bookingList = bookings.map(booking => {
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
        userId: {
          _id: booking.userId?._id || 'N/A',
          fullName: booking.userId?.fullName || 'N/A',
          email: booking.userId?.email || 'N/A'
        },
        showtimeId: {
          _id: booking.showtimeId?._id || 'N/A',
          startTime: booking.showtimeId?.startTime || defaultShowtime.startTime,
          endTime: booking.showtimeId?.endTime || defaultShowtime.endTime,
          movieId: {
            _id: booking.showtimeId?.movieId?._id || defaultMovie._id,
            title: booking.showtimeId?.movieId?.title || defaultMovie.title,
            duration: booking.showtimeId?.movieId?.duration || defaultMovie.duration,
            genre: booking.showtimeId?.movieId?.genre || defaultMovie.genre,
            image: booking.showtimeId?.movieId?.image || defaultMovie.image
          },
          theaterId: {
            _id: booking.showtimeId?.theaterId?._id || defaultTheater._id,
            name: booking.showtimeId?.theaterId?.name || defaultTheater.name,
            location: booking.showtimeId?.theaterId?.location || defaultTheater.location
          }
        },
        seats: parsedSeats,
        totalAmount: booking.totalAmount || 0,
        status: booking.status || 'UNKNOWN',
        paymentStatus: booking.paymentStatus || 'UNKNOWN',
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: bookingList.length,
      data: bookingList
    });
  } catch (err: any) {
    console.error("Error in getAllBookings:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 