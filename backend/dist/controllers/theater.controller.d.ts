import { Request, Response } from 'express';
interface TheaterRequest {
    name: string;
    location: string;
    capacity: number;
    screens?: number;
    amenities?: string[];
}
export declare const addTheater: (req: Request<{}, {}, TheaterRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllTheaters: (req: Request, res: Response) => Promise<void>;
export declare const getTheaterById: (req: Request<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTheaterShowtimes: (req: Request<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTheater: (req: Request<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTheater: (req: Request<{
    id: string;
}, {}, TheaterRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
