import { Request, Response } from 'express';
export declare const getAllBookedTickets: (req: Request, res: Response) => Promise<void>;
export declare const getBookedTicketsByShowtime: (req: Request<{
    showtimeId: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTicketStatus: (req: Request<{
    ticketId: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    getAllBookedTickets: (req: Request, res: Response) => Promise<void>;
    getBookedTicketsByShowtime: (req: Request<{
        showtimeId: string;
    }>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateTicketStatus: (req: Request<{
        ticketId: string;
    }>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
