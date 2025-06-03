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

if (process.env.NODE_ENV === 'development') {
  // Dev mode root route message
  app.get('/', (req: Request, res: Response) => {
    res.send('Backend server is running!');
  });
} else {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  console.log('Production mode - Frontend path:', frontendPath);
  
  // Check if the frontend build exists
  if (!require('fs').existsSync(frontendPath)) {
    console.error('Frontend build not found at:', frontendPath);
  }

  // Serve static files from the frontend build directory
  app.use(express.static(frontendPath));
  console.log('Static files being served from:', frontendPath);
}

// API Routes - these should take precedence over the catch-all route
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all route for frontend - this should be last
if (process.env.NODE_ENV !== 'development') {
  app.get('*', (req: Request, res: Response) => {
    const indexPath = path.join(__dirname, '../../frontend/dist', 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
