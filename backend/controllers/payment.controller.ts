import { Request, Response } from 'express';
import Payment, { IPayment } from '../model/payment.model';
import Ticket, { ITicket } from '../model/ticket.model';
import { Document } from 'mongoose';

type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

interface PaymentStats {
  total: number;
  totalAmount: number;
  byPaymentMethod: Record<PaymentMethod, { count: number; amount: number }>;
  byStatus: Record<PaymentStatus, { count: number; amount: number }>;
}

interface PopulatedPayment extends Document {
  ticket: ITicket;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

// Get all payments (admin only)
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'ticket',
        populate: [
          {
            path: 'showtime',
            populate: [
              { path: 'movie', select: 'title' },
              { path: 'theater', select: 'name location' }
            ]
          },
          { path: 'customer', select: 'fullName email phone' },
          { path: 'seat', select: 'seatNumber row' }
        ]
      }) as PopulatedPayment[];

    // Calculate payment statistics
    const stats: PaymentStats = {
      total: payments.length,
      totalAmount: 0,
      byPaymentMethod: {
        CASH: { count: 0, amount: 0 },
        CARD: { count: 0, amount: 0 },
        ONLINE: { count: 0, amount: 0 }
      },
      byStatus: {
        PENDING: { count: 0, amount: 0 },
        COMPLETED: { count: 0, amount: 0 },
        FAILED: { count: 0, amount: 0 }
      }
    };

    // Process each payment
    payments.forEach((payment) => {
      const amount = payment.ticket.price;
      stats.totalAmount += amount;
      
      stats.byPaymentMethod[payment.paymentMethod].count++;
      stats.byPaymentMethod[payment.paymentMethod].amount += amount;
      
      stats.byStatus[payment.paymentStatus].count++;
      stats.byStatus[payment.paymentStatus].amount += amount;
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      stats,
      data: payments
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get payments by date range (admin only)
export const getPaymentsByDateRange = async (req: Request<{}, {}, {}, { startDate: string; endDate: string }>, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Start date and end date are required' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    const payments = await Payment.find({
      paymentDate: {
        $gte: start,
        $lte: end
      }
    }).populate({
      path: 'ticket',
      populate: [
        {
          path: 'showtime',
          populate: [
            { path: 'movie', select: 'title' },
            { path: 'theater', select: 'name location' }
          ]
        },
        { path: 'customer', select: 'fullName email phone' },
        { path: 'seat', select: 'seatNumber row' }
      ]
    }) as PopulatedPayment[];

    // Calculate statistics for the date range
    const stats: PaymentStats = {
      total: payments.length,
      totalAmount: 0,
      byPaymentMethod: {
        CASH: { count: 0, amount: 0 },
        CARD: { count: 0, amount: 0 },
        ONLINE: { count: 0, amount: 0 }
      },
      byStatus: {
        PENDING: { count: 0, amount: 0 },
        COMPLETED: { count: 0, amount: 0 },
        FAILED: { count: 0, amount: 0 }
      }
    };

    payments.forEach((payment) => {
      const amount = payment.ticket.price;
      stats.totalAmount += amount;
      
      stats.byPaymentMethod[payment.paymentMethod].count++;
      stats.byPaymentMethod[payment.paymentMethod].amount += amount;
      
      stats.byStatus[payment.paymentStatus].count++;
      stats.byStatus[payment.paymentStatus].amount += amount;
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      dateRange: {
        start: start,
        end: end
      },
      stats,
      data: payments
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 