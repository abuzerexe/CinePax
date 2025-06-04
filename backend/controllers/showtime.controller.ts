import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Showtime from '../model/showtime.model';
import Movie from '../model/movie.model';
import Theater from '../model/theater.model';

interface ShowtimeRequest {
  movieId: string;
  theaterId: string;
  startTime: string;
  endTime: string;
  price: number;
}

export const addShowtime = async (req: Request<{}, {}, ShowtimeRequest>, res: Response) => {
  try {
    const { movieId, theaterId, startTime, endTime, price } = req.body;

    if (!movieId || !theaterId || !startTime || !endTime || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const theaterExists = await Theater.findById(theaterId);
    if (!theaterExists) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const overlappingShowtime = await Showtime.findOne({
      theaterId,
      $or: [
        {
          startTime: { $lt: endDateTime },
          endTime: { $gt: startDateTime }
        }
      ]
    });

    if (overlappingShowtime) {
      return res.status(400).json({ 
        message: 'Showtime overlaps with existing showtime in this theater',
        existingShowtime: overlappingShowtime
      });
    }

    const showtime = await Showtime.create({
      movieId,
      theaterId,
      startTime: startDateTime,
      endTime: endDateTime,
      price,
      availableSeats: theaterExists.capacity 
    });

    res.status(201).json({
      success: true,
      data: showtime
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAllShowtimes = async (req: Request, res: Response) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title duration genre')
      .populate('theaterId', 'name location');
    
    const formattedShowtimes = showtimes.map(showtime => ({
      ...showtime.toObject(),
      ticketPrice: showtime.price
    }));

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: formattedShowtimes
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteShowtime = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findById(id);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    await Showtime.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Showtime deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getShowtimeById = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findById(id)
      .populate('movieId', 'title duration genre image')
      .populate('theaterId', 'name location');

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.status(200).json({
      success: true,
      data: showtime
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 