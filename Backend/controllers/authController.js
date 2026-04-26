import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';
import { generateOTP, getOTPExpiry } from '../utils/otp.js';
import { sendEmail } from '../utils/email.js';
import logger from '../utils/logger.js';

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    let user;
    let finalRole = role;
    
    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else if (role === 'student') {
      user = await Student.findOne({ email });
    } else {
      // Unified check
      user = await Admin.findOne({ email });
      if (user) {
        finalRole = 'admin';
      } else {
        user = await Student.findOne({ email });
        finalRole = 'student';
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = getOTPExpiry();
    user.otpRetries = 0;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Login OTP - College Smart Account',
        text: `Your OTP for login is ${otp}. It expires in 5 minutes.`,
        html: `<h3>Your OTP for login is: <b>${otp}</b></h3><p>It expires in 5 minutes.</p>`
      });
      // Email sent successfully — do NOT expose OTP in response
      res.json({ success: true, message: 'OTP sent to your email', requiresOTP: true, email, role: finalRole });
    } catch (emailError) {
      // Email not configured — log OTP to server console and return it in response
      logger.warn(`Email not configured. OTP for ${email}: ${otp}`);
      console.warn(`\n⚠️  EMAIL NOT CONFIGURED — OTP for ${email}: ${otp}\n`);
      res.json({ success: true, message: 'OTP generated (check server console or UI)', otp, requiresOTP: true, email, role: finalRole });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, role } = req.body;
    let user;
    let finalRole = role;

    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else if (role === 'student') {
      user = await Student.findOne({ email });
    } else {
      user = await Admin.findOne({ email });
      if (user) {
        finalRole = 'admin';
      } else {
        user = await Student.findOne({ email });
        finalRole = 'student';
      }
    }

    if (!user || user.otp !== otp) {
      if (user) {
        user.otpRetries += 1;
        await user.save();
        if (user.otpRetries >= 3) {
           user.otp = null;
           user.otpExpires = null;
           await user.save();
           return res.status(401).json({ success: false, message: 'Too many failed attempts.' });
        }
      }
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) return res.status(401).json({ success: false, message: 'OTP expired' });

    user.otp = null;
    user.otpExpires = null;
    user.otpRetries = 0;
    user.isVerified = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    
    logger.info(`DEBUG: Sending user data: ${JSON.stringify(userObj)}`);
    
    res.json({ success: true, user: { ...userObj, role: finalRole }, token: generateToken(user._id, finalRole) });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const {
      email, password, name, studentId, phone, department, year, address,
      dateOfBirth, gender, rollNumber, admissionYear, category
    } = req.body;

    const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existing) return res.status(400).json({ success: false, message: 'Student already exists with this email or Student ID' });

    logger.info(`DEBUG: Registering student with department: ${department}`);
    let baseFee = 50000;
    if (department) {
      const deptStr = department.toLowerCase();
      if (deptStr.includes('diploma')) {
        baseFee = 35000;
      } else if (deptStr.includes('master') || deptStr.includes('mtech')) {
        baseFee = 90000;
      } else if (deptStr.includes('engineering')) {
        baseFee = 75000;
      }
    }
    logger.info(`DEBUG: Calculated baseFee: ${baseFee}`);

    const otp = generateOTP();
    const student = new Student({
      email, 
      password, 
      name, 
      studentId: studentId || `STU${Math.floor(1000 + Math.random() * 9000)}`, 
      phone, 
      department,
      year: year ? parseInt(year) : undefined,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      rollNumber: rollNumber || studentId,
      admissionYear: admissionYear ? parseInt(admissionYear) : undefined,
      category,
      fees: { 
        total: baseFee, 
        paid: 0, 
        pending: baseFee,
        paymentHistory: []
      },
      scholarship: {
        eligible: true,
        applied: false,
        status: 'Not Applied',
        amount: 0,
        documents: []
      },
      otp,
      otpExpires: getOTPExpiry(),
      isVerified: false
    });

    await student.save();
    
    try {
      await sendEmail({
        to: student.email,
        subject: 'Verify Your Academic Account – College Smart Account',
        text: `Welcome ${name}! Your verification code is ${otp}. It expires in 5 minutes.`,
        html: `<h2>Welcome to College Smart Account, ${name}!</h2><p>Your email verification code is: <b style="font-size:1.5em">${otp}</b></p><p>This code expires in <b>5 minutes</b>.</p>`
      });
      res.status(201).json({ success: true, message: 'Account created! OTP sent to your email.', requiresOTP: true });
    } catch (emailErr) {
       // Dev mode — return OTP in response
       logger.warn(`Email not configured. Registration OTP for ${email}: ${otp}`);
       res.status(201).json({ success: true, message: 'Account created (Email failed — dev mode)', requiresOTP: true, otp });
    }
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    let user;
    if (role === 'admin') user = await Admin.findOne({ email });
    else user = await Student.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Password Recovery',
      text: `Your temporary password is ${tempPassword}. Please change it after logging in.`,
    });

    res.json({ success: true, message: 'Recovery password sent to email' });
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req, res, next) => {
  try {
    const { email, name, provider } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for social login' });
    }

    // Check if user exists as admin or student
    let user = await Admin.findOne({ email });
    let role = 'admin';
    
    if (!user) {
      user = await Student.findOne({ email });
      role = 'student';
    }
    
    if (!user) {
      // Create a mock student if not found (Demo purpose)
      role = 'student';
      user = new Student({
        email,
        name: name || email.split('@')[0],
        password: Math.random().toString(36).slice(-10),
        studentId: `SOCIAL-${Math.random().toString(36).substring(7).toUpperCase()}`,
        phone: '0000000000',
        department: 'Science',
        year: 1,
        address: 'Social Login Account',
        fees: { total: 50000, paid: 0, pending: 50000 },
        isVerified: true
      });
      await user.save();
      logger.info(`New student created via ${provider} login: ${email}`);
    }

    const token = generateToken(user._id, role);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    
    res.json({
      success: true,
      user: { ...userObj, role },
      token
    });
  } catch (error) {
    next(error);
  }
};
