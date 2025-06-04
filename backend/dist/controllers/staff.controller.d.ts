import { Request, Response } from 'express';
export declare const addStaff: (req: Request, res: Response) => Promise<void>;
export declare const getAllStaff: (req: Request, res: Response) => Promise<void>;
export declare const deleteStaff: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
