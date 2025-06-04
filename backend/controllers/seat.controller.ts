import { Request, Response } from 'express';
import Seat from '../model/seat.model';
import Showtime from '../model/showtime.model';

export const addSeat = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seatNumber } = req.body;

    if (!showtimeId || !seatNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    const existingSeat = await Seat.findOne({
      showtimeId,
      seatNumber
    });

    if (existingSeat) {
      return res.status(400).json({ message: 'Seat already exists for this showtime' });
    }

    const seat = await Seat.create({
      showtimeId,
      seatNumber,
      status: 'available'
    });

    res.status(201).json({
      success: true,
      data: seat
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAllSeats = async (req: Request, res: Response) => {
  try {
    const seats = await Seat.find().populate('showtimeId', 'movieId theaterId startTime');
    
    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getSeatsByShowtime = async (req: Request, res: Response) => {
  try {
    const { showtimeId } = req.params;
    
    const seats = await Seat.find({ showtimeId });
    
    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteSeat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id);
    
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    await Seat.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Seat deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 