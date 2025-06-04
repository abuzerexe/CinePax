import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Customer, { ICustomer } from '../model/customer.model';
import Admin, { IAdmin } from '../model/admin.model';
import Blacklist from '../model/blacklist.model';

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

interface JwtPayload {
  id: string;
  email: string;
  isAdmin?: boolean;
  exp?: number;
}

export const signupUser = async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName || !phone) {
      console.log('Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName, phone: !!phone });
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required',
        missingFields: {
          email: !email,
          password: !password,
          fullName: !fullName,
          phone: !phone
        }
      });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      console.log('Email already registered:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      email,
      password: hashedPassword,
      fullName,
      phone
    });

    console.log('Attempting to save new customer:', { email, fullName, phone });
    await newCustomer.save();
    console.log('Customer saved successfully');

    const token = jwt.sign(
      {
        id: newCustomer._id,
        email: newCustomer.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newCustomer._id,
          email: newCustomer.email,
          fullName: newCustomer.fullName,
          phone: newCustomer.phone
        }
      }
    });
  } catch (err: any) {
    console.error('Signup error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: err.message
    });
  }
};

export const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isValid = await admin.isPasswordCorrect(password);
      if (!isValid) return res.status(401).json({ message: 'Invalid admin credentials' });

      const token = jwt.sign(
        {
          id: admin._id,
          email: admin.email,
          role: 'admin'
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      return res.status(200).json({ token, role: 'admin', message: 'Admin login successful' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: 'customer', message: 'Login successful' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(400).json({ message: 'Authorization token missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const expiresAt = new Date(decoded.exp * 1000);
    await new Blacklist({ token, expiresAt }).save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.user?.id).select('-password');
    if (customer) {
      return res.status(200).json(customer);
    }
    
    const admin = await Admin.findById(req.user?.id).select('-password');
    if (admin) {
      return res.status(200).json(admin);
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone } = req.body;
    
    const customer = await Customer.findById(req.user?.id);
    if (customer) {
      if (fullName) customer.fullName = fullName;
      if (email) customer.email = email;
      if (phone) customer.phone = phone;
      await customer.save();

      const customerObj = customer.toObject();
      const { password, ...customerResponse } = customerObj;
      return res.status(200).json(customerResponse);
    }
    
    const admin = await Admin.findById(req.user?.id);
    if (admin) {
      if (fullName) admin.fullName = fullName;
      if (email) admin.email = email;
      if (phone) admin.phone = phone;
      await admin.save();

      const adminObj = admin.toObject();
      const { password, ...adminResponse } = adminObj;
      return res.status(200).json(adminResponse);
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 