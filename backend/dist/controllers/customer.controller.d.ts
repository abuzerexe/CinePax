import { Request, Response } from 'express';
interface SignupRequest {
    email: string;
    password: string;
    fullName: string;
    phone: string;
}
interface LoginRequest {
    email: string;
    password: string;
}
export declare const signupUser: (req: Request<{}, {}, SignupRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginUser: (req: Request<{}, {}, LoginRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logoutUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
