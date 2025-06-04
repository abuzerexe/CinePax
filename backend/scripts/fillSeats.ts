import dotenv from 'dotenv';
import connectDB from '../connect';
import Seat from '../model/seat.model';
import Showtime from '../model/showtime.model';
import mongoose from 'mongoose';

dotenv.config();

// Helper function to randomly mark some seats as booked (20-30% of seats)
const getRandomSeatStatus = () => {
  return Math.random() < 0.25 ? 'BOOKED' : 'AVAILABLE';
};

const generateSeats = async () => {
  try {
    await connectDB(process.env.MONGO_URI as string);
    console.log('Connected to database');

    // Get all showtimes
    const showtimes = await Showtime.find();
    console.log(`Found ${showtimes.length} showtimes`);

    for (const showtime of showtimes) {
      // Generate seats for each showtime
      // Theater layout: 5 rows (A-E) with 10 seats each
      const rows = ['A', 'B', 'C', 'D', 'E'];
      const seatsPerRow = 10;

      const seats = [];
      for (const row of rows) {
        for (let number = 1; number <= seatsPerRow; number++) {
          seats.push({
            showtimeId: showtime._id,
            row,
            seatNumber: `${row}${number.toString().padStart(2, '0')}`, // Format: A01, A02, etc.
            status: getRandomSeatStatus()
          });
        }
      }

      // Delete existing seats for this showtime
      await Seat.deleteMany({ showtimeId: showtime._id });
      console.log(`Deleted existing seats for showtime ${showtime._id}`);

      // Insert new seats
      await Seat.insertMany(seats);
      
      // Count booked seats
      const bookedSeats = seats.filter(seat => seat.status === 'BOOKED').length;
      console.log(`Created ${seats.length} seats for showtime ${showtime._id} (${bookedSeats} booked)`);
    }

    console.log('Seat generation completed');
  } catch (error) {
    console.error('Error generating seats:', error);
  } finally {
    // Always disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
};

// Run the script once
generateSeats(); 