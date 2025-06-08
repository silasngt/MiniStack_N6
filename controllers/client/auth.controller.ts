import { Request, Response } from 'express';
import md5 from 'md5';
import * as jwt from 'jsonwebtoken';

import { generateRandomString } from '../../helpers/generate.helper';
import User from '../../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', {
    pageTitle: 'Đăng nhập',
  });
};
export const register = async (req: Request, res: Response) => {
  res.render('client/pages/auth/register.pug', {
    pageTitle: 'Đăng ký',
  });
};

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length === 10;
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Xử lý đăng ký POST
export const registerPost = async (req: Request, res: Response) => {
  try {
    // Kiểm tra nếu req.body là undefined hoặc rỗng
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Request body is empty or undefined');
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không được gửi từ form. Vui lòng kiểm tra lại.',
        debug: {
          bodyExists: !!req.body,
          bodyType: typeof req.body,
          contentType: req.headers['content-type'],
        },
      });
    }

    const { email, fullname, phone, gender, password, confirmPassword } =
      req.body;

    // Debug từng field
    console.log('Extracted fields:', {
      email: email || 'MISSING',
      fullname: fullname || 'MISSING',
      phone: phone || 'MISSING',
      gender: gender || 'MISSING',
      password: password ? 'PROVIDED' : 'MISSING',
      confirmPassword: confirmPassword ? 'PROVIDED' : 'MISSING',
    });

    // Kiểm tra các trường bắt buộc
    const requiredFields = {
      email,
      fullname,
      phone,
      gender,
      password,
      confirmPassword,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) =>
          !value || (typeof value === 'string' && value.trim() === '')
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
        missingFields: missingFields,
      });
    }

    // Validation chi tiết
    const validationErrors: string[] = [];

    if (!validateEmail(email)) {
      validationErrors.push('Email không hợp lệ');
    }

    if (fullname.trim().length < 2) {
      validationErrors.push('Tên phải có ít nhất 2 ký tự');
    }

    if (!validatePhone(phone)) {
      validationErrors.push('Số điện thoại không hợp lệ');
    }

    if (!['Nam', 'Nữ', 'Khác'].includes(gender)) {
      validationErrors.push('Giới tính không hợp lệ');
    }

    if (!validatePassword(password)) {
      validationErrors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (password !== confirmPassword) {
      validationErrors.push('Mật khẩu xác nhận không khớp');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', '),
        validationErrors,
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({
      where: {
        Email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Mã hóa mật khẩu bằng MD5
    const hashedPassword = md5(password);
    console.log('Password hashed successfully with MD5');

    // Format số điện thoại
    const phoneDigits = phone.replace(/\D/g, '');

    console.log('Creating new user with data:', {
      FullName: fullname.trim(),
      Email: email.toLowerCase().trim(),
      Phone: phoneDigits,
      Gender: gender,
    });

    // Tạo user mới
    const newUserInstance = await User.create({
      FullName: fullname.trim(),
      Email: email.toLowerCase().trim(),
      Phone: phoneDigits,
      Password: hashedPassword,
      Gender: gender,
      Role: 'User',
      deleted: false,
      status: 'active',
    });

    console.log('User created successfully:', newUserInstance.get('UserID'));

    const newUser = newUserInstance.get({ plain: true });

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: newUser.UserID,
        email: newUser.Email,
        role: newUser.Role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('JWT token generated');

    const userResponse = {
      UserID: newUser.UserID,
      FullName: newUser.FullName,
      Email: newUser.Email,
      Phone: newUser.Phone,
      Gender: newUser.Gender,
      Role: newUser.Role,
      status: newUser.status,
      token: token,
    };

    console.log('Registration successful for user:', newUser.Email);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Signup error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Xử lý lỗi Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message:
          'Dữ liệu không hợp lệ: ' +
          error.errors.map((e: any) => e.message).join(', '),
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc số điện thoại đã được sử dụng',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra trong quá trình đăng ký',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Xử lý đăng nhập POST
export const loginPost = async (req: Request, res: Response) => {
  try {
    const { username, password, rememberMe } = req.body;

    // Kiểm tra validation cơ bản
    if (!username || !password) {
      return res.render('client/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập',
        error: 'Vui lòng nhập tên người dùng và mật khẩu',
      });
    }

    // Validate email format
    if (!validateEmail(username)) {
      return res.render('client/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập',
        error: 'Email không hợp lệ',
      });
    }

    // Tìm user theo email
    const userInstance = await User.findOne({
      where: {
        Email: username.toLowerCase().trim(),
      },
    });

    if (!userInstance) {
      return res.render('client/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập',
        error: 'Tên người dùng hoặc mật khẩu không đúng',
      });
    }

    const user = userInstance.get({ plain: true });

    // Kiểm tra user có bị xóa hay không active
    if (user.deleted || user.status !== 'active') {
      return res.render('client/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập',
        error: 'Tài khoản không khả dụng',
      });
    }

    // Kiểm tra mật khẩu (sử dụng MD5)
    const hashedInputPassword = md5(password);
    if (hashedInputPassword !== user.Password) {
      return res.render('client/pages/auth/login.pug', {
        pageTitle: 'Đăng nhập',
        error: 'Tên người dùng hoặc mật khẩu không đúng',
      });
    }

    // === ĐÃ XÁC THỰC THÀNH CÔNG ===
    console.log('User authenticated successfully:', user.Email);

    // Tạo JWT token
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      {
        userId: user.UserID,
        email: user.Email,
        role: user.Role,
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    console.log('JWT token created successfully');

    // Set cookie với các options phù hợp
    const cookieMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    res.cookie('auth_token', token, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    console.log('Cookie set successfully, redirecting to home');

    return res.redirect('/');
  } catch (error: any) {
    console.error('Login error:', error);
    return res.render('client/pages/auth/login.pug', {
      pageTitle: 'Đăng nhập',
      error: 'Có lỗi xảy ra khi đăng nhập',
    });
  }
};

// Đăng xuất
export const logout = async (req: Request, res: Response) => {
  try {
    // Xóa cookies
    res.clearCookie('auth_token');
    res.clearCookie('remember_token');

    // Redirect về trang chủ
    res.redirect('/');
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đăng xuất',
    });
  }
};

// Lấy thông tin user hiện tại
export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ',
      });
    }

    const user = await User.findOne({
      where: {
        UserID: id,
        deleted: false,
      },
      attributes: { exclude: ['Password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin người dùng',
    });
  }
};

// Cập nhật thông tin user
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullname, gender, avatar } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ',
      });
    }

    const user = await User.findOne({
      where: {
        UserID: id,
        deleted: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Validation
    const updateData: any = {};

    if (fullname !== undefined) {
      if (fullname.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Tên phải có ít nhất 2 ký tự',
        });
      }
      updateData.FullName = fullname.trim();
    }

    if (gender !== undefined) {
      if (!['Nam', 'Nữ', 'Khác'].includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'Giới tính không hợp lệ',
        });
      }
      updateData.Gender = gender;
    }

    if (avatar !== undefined) {
      updateData.Avatar = avatar;
    }

    // Cập nhật thông tin
    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['Password'] },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật thông tin',
    });
  }
};

// Đổi mật khẩu
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ',
      });
    }

    // Kiểm tra validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    // Tìm user
    const user = await User.findOne({
      where: {
        UserID: id,
        deleted: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const userPlain = user.get({ plain: true });

    // Kiểm tra mật khẩu hiện tại (sử dụng MD5)
    const hashedCurrentPassword = md5(currentPassword);
    if (hashedCurrentPassword !== userPlain.Password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    // Cập nhật mật khẩu mới
    const hashedNewPassword = md5(newPassword);
    await user.update({
      Password: hashedNewPassword,
    });

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đổi mật khẩu',
    });
  }
};

export default {
  login,
  register,
  registerPost,
  loginPost,
  logout,
  getProfile,
  updateProfile,
  changePassword,
};
