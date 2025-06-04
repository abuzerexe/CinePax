import { Request, Response } from 'express';
import Customer, { ICustomer } from '../models/customer.model';
import Admin, { IAdmin } from '../models/admin.model';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const customers = await Customer.find().select('-password');
        const admins = await Admin.find().select('-password');
        
        const users = [
            ...customers.map((c: ICustomer) => ({ ...c.toObject(), role: 'customer' })),
            ...admins.map((a: IAdmin) => ({ ...a.toObject(), role: 'admin' }))
        ];

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: errorMessage
        });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const customer = await Customer.findById(id).select('-password');
        if (customer) {
            const customerObj = customer.toObject();
            return res.status(200).json({
                success: true,
                data: { ...customerObj, role: 'customer' }
            });
        }

        const admin = await Admin.findById(id).select('-password');
        if (admin) {
            const adminObj = admin.toObject();
            return res.status(200).json({
                success: true,
                data: { ...adminObj, role: 'admin' }
            });
        }

        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: errorMessage
        });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, role, phone } = req.body;

        const existingCustomer = await Customer.findOne({ email });
        const existingAdmin = await Admin.findOne({ email });
        
        if (existingCustomer || existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        let user;
        if (role === 'admin') {
            user = await Admin.create({
                email,
                password,
                fullName,
                phone
            });
        } else {
            user = await Customer.create({
                email,
                password,
                fullName,
                phone
            });
        }

        const userObj = user.toObject();
        const { password: _, ...userResponse } = userObj;

        res.status(201).json({
            success: true,
            data: { ...userResponse, role }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: errorMessage
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, role } = req.body;

        const customer = await Customer.findById(id);
        if (customer) {
            customer.fullName = fullName || customer.fullName;
            customer.email = email || customer.email;
            customer.phone = phone || customer.phone;
            await customer.save();

            const customerObj = customer.toObject();
            const { password: _, ...customerResponse } = customerObj;

            return res.status(200).json({
                success: true,
                data: { ...customerResponse, role: 'customer' }
            });
        }

        const admin = await Admin.findById(id);
        if (admin) {
            admin.fullName = fullName || admin.fullName;
            admin.email = email || admin.email;
            admin.phone = phone || admin.phone;
            await admin.save();

            const adminObj = admin.toObject();
            const { password: _, ...adminResponse } = adminObj;

            return res.status(200).json({
                success: true,
                data: { ...adminResponse, role: 'admin' }
            });
        }

        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: errorMessage
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedCustomer = await Customer.findByIdAndDelete(id);
        if (deletedCustomer) {
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }

        const deletedAdmin = await Admin.findByIdAndDelete(id);
        if (deletedAdmin) {
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }

        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: errorMessage
        });
    }
}; 