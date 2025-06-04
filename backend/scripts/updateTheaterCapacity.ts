import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theater from '../model/theater.model';

dotenv.config();

const updateTheaterCapacity = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cinepax');
    console.log('Connected to MongoDB');

    // Update all theaters to have 80 seats (8 rows x 10 seats)
    const result = await Theater.updateMany({}, { capacity: 80 });
    console.log(`Updated ${result.modifiedCount} theaters`);

    // Verify the update
    const theaters = await Theater.find({});
    console.log('Updated theater capacities:');
    theaters.forEach(theater => {
      console.log(`${theater.name}: ${theater.capacity} seats`);
    });

  } catch (error) {
    console.error('Error updating theater capacities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateTheaterCapacity(); 