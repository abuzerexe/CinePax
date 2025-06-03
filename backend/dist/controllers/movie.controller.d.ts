import { Request, Response } from 'express';
interface MovieRequest {
    title: string;
    duration: number;
    genre: string;
    releaseDate: Date;
    image?: string;
    description: string;
    rating: number;
    year: number;
}
export declare const addMovie: (req: Request<{}, {}, MovieRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllMovies: (req: Request, res: Response) => Promise<void>;
export declare const deleteMovie: (req: Request<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMovieById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTheaterShowtimes: (req: Request, res: Response) => Promise<void>;
export declare const getFeaturedMovies: (req: Request, res: Response) => Promise<void>;
export declare const updateMovie: (req: Request<{
    id: string;
}, {}, MovieRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
