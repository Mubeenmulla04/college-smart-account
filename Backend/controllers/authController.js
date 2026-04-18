import Admin from '../../Database/Models/Admin.js';
import Student from '../../Database/Models/Student.js';
import generateToken from '../utils/generateToken.js';

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else {
      user = await Student.findOne({ email });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json({ 
      success: true, 
      user: { ...userObj, role },
      token: generateToken(user._id, role)
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
