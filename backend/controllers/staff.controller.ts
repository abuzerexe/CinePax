import { Request, Response } from 'express';
import Staff from '../model/staff.model';
import Theater from '../model/theater.model';

export const addStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { theater, firstName, lastName, role } = req.body;

    if (!theater || !firstName || !lastName || !role) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const theaterExists = await Theater.findById(theater);
    if (!theaterExists) {
      res.status(404).json({ message: 'Theater not found' });
      return;
    }

    const staff = await Staff.create({
      theater,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await Staff.find().lean();
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteStaff = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 