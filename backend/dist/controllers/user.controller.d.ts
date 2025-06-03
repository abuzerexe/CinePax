import { Request, Response } from 'express';
interface SearchQuery {
    title?: string;
    genre?: string;
    startDate?: string;
    endDate?: string;
    time?: string;
}
export declare const getAllMoviesWithShowtimes: (req: Request, res: Response) => Promise<void>;
export declare const getMovieDetails: (req: Request<{
    movieId: string;
}>, res: Response) => Promise<void>;
export declare const getShowtimeDetails: (req: Request<{
    showtimeId: string;
}>, res: Response) => Promise<void>;
export declare const bookTicket: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserTickets: (req: Request, res: Response) => Promise<void>;
export declare const searchMovies: (req: Request<{}, {}, {}, SearchQuery>, res: Response) => Promise<void>;
export declare const filterShowtimes: (req: Request<{}, {}, {}, SearchQuery>, res: Response) => Promise<void>;
export declare const getBookingHistory: (req: Request, res: Response) => Promise<void>;
export declare const cancelBooking: (req: Request<{
    ticketId: string;
}>, res: Response) => Promise<void>;
export {};
