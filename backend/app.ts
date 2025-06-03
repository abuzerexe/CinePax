import express, { Request, Response, NextFunction } from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import connectDB from './connect';

// Routes
import authRoutes from './routes/auth.route';
import customerRoutes from './routes/customer.route';
import movieRoutes from './routes/movie.route';
import theaterRoutes from './routes/theater.route';
import staffRoutes from './routes/staff.route';
import seatRoutes from './routes/seat.route';
import showtimeRoutes from './routes/showtime.route';
import ticketRoutes from './routes/ticket.route';
import paymentRoutes from './routes/payment.route';
import userRoutes from './routes/user.route';
import adminRoutes from './routes/admin.route';

dotenv.config();
connectDB(process.env.MONGO_URI as string);


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://cors-test.codehappy.dev', // your allowed origin
  credentials: true // enable if using cookies or auth headers
}));


app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/customer', customerRoutes);
app.use('/user', userRoutes);
app.use('/movies', movieRoutes);
app.use('/theaters', theaterRoutes);
app.use('/staff', staffRoutes);
app.use('/seats', seatRoutes);
app.use('/showtimes', showtimeRoutes);
app.use('/tickets', ticketRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);

if (process.env.NODE_ENV === 'development') {
  // Dev mode root route message
  app.get('/', (req: Request, res: Response) => {
    res.send('Backend server is running!');
  });
  
} else {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  console.log('Production mode - Frontend path:', frontendPath);
  
  // Check if the frontend build exists
  if (!require('fs').existsSync(frontendPath)) {
    console.error('Frontend build not found at:', frontendPath);
  }

  // Serve static files from the frontend build directory
  app.use(express.static(frontendPath));
  console.log('Static files being served from:', frontendPath);

  // Handle all other routes by serving the frontend
  app.get('*', (req: Request, res: Response) => {
    const indexPath = path.join(frontendPath, 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  });

}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
