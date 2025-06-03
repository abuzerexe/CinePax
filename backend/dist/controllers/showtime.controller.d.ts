import { Request, Response } from 'express';
interface ShowtimeRequest {
    movieId: string;
    theaterId: string;
    startTime: string;
    endTime: string;
    price: number;
}
export declare const addShowtime: (req: Request<{}, {}, ShowtimeRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllShowtimes: (req: Request, res: Response) => Promise<void>;
export declare const deleteShowtime: (req: Request<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
