import { Request, Response } from 'express';
import User from '../../models/user.model';
import md5 from 'md5';

interface UserAttributes {
  UserID: number;
  FullName: string;
  Email: string;
  Password: string;
  Phone: string;
  Gender: 'Nam' | 'Nữ' | 'Khác';
  Avatar: string;
  Role: 'User' | 'Admin';
  deleted: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Phân trang
    let limit = 4;
    let page = 1;

    if (req.query.limit) {
      limit = parseInt(`${req.query.limit}`);
    }
    if (req.query.page) {
      page = parseInt(`${req.query.page}`);
    }

    const skip = (page - 1) * limit;

    const totalUsers = await User.count({
      where: {
        deleted: false,
      },
    });
    const totalPages = Math.ceil(totalUsers / limit);

    // Hết Phân trang

    // Lấy user theo trang
    const usersFromDB = await User.findAll({
      where: { deleted: false },
      order: [['UserID', 'ASC']],
      attributes: { exclude: ['Password'] },
      limit: limit,
      offset: skip,
    });

    const users = usersFromDB.map((user, index) => {
      const userData = user.get({ plain: true }) as UserAttributes;
      return {
        stt: skip + index + 1,
        id: userData.UserID,
        name: userData.FullName,
        email: userData.Email,
        phone: userData.Phone || '',
        date: userData.createdAt
          ? new Date(userData.createdAt).toLocaleDateString('vi-VN')
          : 'N/A',
        role: userData.Role ? userData.Role.toLowerCase() : 'user',
        status: userData.status || 'active',
      };
    });

    res.render('admin/pages/user/index.pug', {
      pageTitle: 'Quản lý người dùng',
      users,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.render('admin/pages/user/index.pug', {
      pageTitle: 'Quản lý người dùng',
      users: [],
      currentPage: 1,
      totalPages: 1,
    });
  }
};

// Form thêm user mới
export const add = async (req: Request, res: Response): Promise<void> => {
  try {
    res.render('admin/pages/user/add.pug', {
      pageTitle: 'Thêm người dùng mới',
    });
  } catch (error) {
    console.error('Error rendering add user form:', error);
    res.status(500).send('Lỗi khi hiển thị form thêm người dùng');
  }
};

// Function để xử lý việc tạo user mới
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      phone,
      gender,
      role,
      status,
    } = req.body;

    // Validation cơ bản
    if (!fullName || !email || !password || !confirmPassword) {
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: 'Vui lòng điền đầy đủ các trường bắt buộc',
        formData: { fullName, email, phone, gender, role, status },
      });
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: 'Mật khẩu xác nhận không khớp',
        formData: { fullName, email, phone, gender, role, status },
      });
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự',
        formData: { fullName, email, phone, gender, role, status },
      });
      return;
    }

    // Validation số điện thoại (nếu có)
    if (phone && phone.trim() !== '') {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        res.render('admin/pages/user/add.pug', {
          pageTitle: 'Thêm người dùng mới',
          errorMessage: 'Số điện thoại phải có đúng 10 chữ số',
          formData: { fullName, email, phone, gender, role, status },
        });
        return;
      }
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({
      where: { Email: email.trim().toLowerCase(), deleted: false },
    });

    if (existingUser) {
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: 'Email này đã được sử dụng',
        formData: { fullName, email, phone, gender, role, status },
      });
      return;
    }

    const hashedPassword = md5(password);

    // Chuẩn bị dữ liệu để tạo user
    const userData: any = {
      FullName: fullName.trim(),
      Email: email.trim().toLowerCase(),
      Password: hashedPassword,
      Role: role === 'admin' ? 'Admin' : 'User',
      status: status || 'active',
      deleted: false,
      createdAt: new Date(),
    };

    // Thêm phone nếu có
    if (phone && phone.trim() !== '') {
      userData.Phone = phone.trim();
    }

    // Thêm gender nếu có
    if (gender && ['Nam', 'Nữ', 'Khác'].includes(gender)) {
      userData.Gender = gender;
    }

    // Tạo user mới
    const newUser = await User.create(userData);

    // Redirect về trang danh sách user với thông báo thành công
    res.redirect('/admin/user?success=Thêm người dùng thành công');
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', error.message); // Debug log
    console.error('Error stack:', error.stack); // Debug log

    // Kiểm tra lỗi unique constraint từ database
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: 'Email này đã được sử dụng',
        formData: req.body,
      });
      return;
    }

    // Lỗi validation từ Sequelize
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors
        .map((err) => err.message)
        .join(', ');
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: `Lỗi validation: ${validationErrors}`,
        formData: req.body,
      });
      return;
    }

    // Lỗi database connection
    if (error.name === 'SequelizeConnectionError') {
      res.render('admin/pages/user/add.pug', {
        pageTitle: 'Thêm người dùng mới',
        errorMessage: 'Lỗi kết nối database. Vui lòng thử lại.',
        formData: req.body,
      });
      return;
    }

    // Lỗi chung
    res.render('admin/pages/user/add.pug', {
      pageTitle: 'Thêm người dùng mới',
      errorMessage: 'Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.',
      formData: req.body,
    });
  }
};

export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const userFromDB = await User.findByPk(userId);

    if (!userFromDB) {
      res.status(404).send('User not found');
      return;
    }

    const userData = userFromDB.get({ plain: true }) as UserAttributes;

    const user = {
      id: userData.UserID,
      name: userData.FullName,
      email: userData.Email,
      phone: userData.Phone || '',
      gender: userData.Gender,
      role: userData.Role ? userData.Role.toLowerCase() : 'user',
      status: userData.status,
    };

    res.render('admin/pages/user/edit.pug', { user });
  } catch (error) {
    res.status(500).send('Lỗi khi lấy thông tin người dùng');
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, email, phone, gender, role, status, newPassword } =
      req.body;
    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // Chuẩn bị dữ liệu update
    const updateData: any = {
      FullName: name,
      Email: email,
      Role: role === 'admin' ? 'Admin' : 'User',
      status: status,
    };

    // Thêm phone nếu có
    if (phone && phone.trim() !== '') {
      // Validate phone
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        res.status(400).send('Số điện thoại phải có đúng 10 chữ số');
        return;
      }
      updateData.Phone = phone.trim();
    } else {
      updateData.Phone = null;
    }

    // Thêm gender nếu có
    if (gender && ['Nam', 'Nữ', 'Khác'].includes(gender)) {
      updateData.Gender = gender;
    }

    // Hash mật khẩu mới nếu có - SỬA LỖI TẠI ĐÂY
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        res.status(400).send('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      const hashedPassword = md5(newPassword); // Bỏ saltRounds
      updateData.Password = hashedPassword;
    }

    await user.update(updateData);

    res.redirect('/admin/user');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Lỗi khi cập nhật người dùng');
  }
};

// Xóa người dùng
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: 'ID người dùng không hợp lệ' });
      return;
    }

    const user = await User.findOne({
      where: {
        UserID: id,
        deleted: false,
      },
    });

    if (!user) {
      res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    // Soft delete
    await user.update({
      deleted: true,
      deletedAt: new Date(),
    });

    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
export const toggleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { UserID: id, deleted: false },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy user' });
      return;
    }

    const currentStatus = user.get('status');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await user.update({ status: newStatus });

    res.json({
      success: true,
      newStatus,
      message: `Đã ${
        newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'
      } user`,
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
