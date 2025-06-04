import { Request, Response } from 'express';
export declare const getAllPayments: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentsByDateRange: (req: Request<{}, {}, {}, {
    startDate: string;
    endDate: string;
}>, res: Response) => Promise<void>;
