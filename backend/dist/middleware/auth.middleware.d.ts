import { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    id: string;
    email: string;
    fullName?: string;
    role?: 'customer' | 'admin' | 'staff';
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export {};
