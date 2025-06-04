import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from '../model/movie.model';
import Theater from '../model/theater.model';
import Showtime from '../model/showtime.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax';
const THEATER_CAPACITY = 50; // Set fixed capacity to 50 seats

// Helper function to add hours to a date
const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

// Helper function to generate random price between min and max
const getRandomPrice = (min: number, max: number) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

// Helper function to get price based on time of day
const getPriceForTime = (hour: number) => {
  if (hour < 12) { // Morning shows
    return getRandomPrice(8, 12);
  } else if (hour < 17) { // Afternoon shows
    return getRandomPrice(10, 15);
  } else { // Evening shows
    return getRandomPrice(15, 25);
  }
};

async function seedShowtimes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all movies and theaters
    const movies = await Movie.find();
    const theaters = await Theater.find();

    if (movies.length === 0 || theaters.length === 0) {
      console.log('No movies or theaters found. Please seed them first.');
      return;
    }

    // Clear existing showtimes
    await Showtime.deleteMany({});
    console.log('Cleared existing showtimes');

    // Generate showtimes for the next 14 days (2 weeks)
    const showtimes = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Define showtime slots
    const morningSlots = [10, 11];
    const afternoonSlots = [13, 15, 17];
    const eveningSlots = [19, 20, 21];

    for (let day = 0; day < 14; day++) {
      const currentDate = addHours(today, day * 24);
      
      // For each theater
      for (const theater of theaters) {
        // For each movie
        for (const movie of movies) {
          // Generate showtimes for different times of day
          const allSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];
          
          // Randomly select 4-6 slots for each movie
          const selectedSlots = allSlots
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 slots
          
          for (const hour of selectedSlots) {
            const startTime = new Date(currentDate);
            startTime.setHours(hour, 0, 0, 0);

            // End time based on movie duration (assuming duration is in minutes)
            const endTime = addHours(startTime, Math.ceil(movie.duration / 60));

            // Price based on time of day
            const price = getPriceForTime(hour);

            showtimes.push({
              movieId: movie._id,
              theaterId: theater._id,
              startTime,
              endTime,
              price,
              availableSeats: THEATER_CAPACITY // Use the fixed capacity
            });
          }
        }
      }
    }

    // Insert all showtimes
    await Showtime.insertMany(showtimes);
    console.log(`Successfully added ${showtimes.length} showtimes`);

  } catch (error) {
    console.error('Error seeding showtimes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedShowtimes(); 