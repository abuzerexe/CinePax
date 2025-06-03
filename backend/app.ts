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
app.use(cors());

const __dirname = path.resolve();


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

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Dev mode root route message
  app.get('/', (req: Request, res: Response) => {
    res.send('Backend server is running!');
  });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
