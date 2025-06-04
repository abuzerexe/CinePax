import { Request, Response } from 'express';
export declare const addSeat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllSeats: (req: Request, res: Response) => Promise<void>;
export declare const getSeatsByShowtime: (req: Request, res: Response) => Promise<void>;
export declare const deleteSeat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
