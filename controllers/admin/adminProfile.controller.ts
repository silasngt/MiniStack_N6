// File: controllers/admin/adminProfile.controller.ts
import { Request, Response } from 'express';
import User from '../../models/user.model';
import md5 from 'md5';

// ✅ HELPER: Get current user ID from session
const getCurrentUserId = (req: Request): number | null => {
  const adminUser = (req.session as any)?.adminUser;
  return adminUser?.id || null;
};

// [GET] /admin/profile
export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ FIX: Lấy user ID từ session thay vì hardcode
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      res.redirect('/admin/auth/login');
      return;
    }

    // Lấy thông tin user hiện tại
    const currentUser = await User.findByPk(currentUserId);

    if (!currentUser || currentUser.get('deleted')) {
      res.status(404).render('admin/pages/404', {
        pageTitle: 'Không tìm thấy thông tin người dùng',
      });
      return;
    }

    const userData = currentUser.toJSON();

    // Format data để hiển thị
    const profileData = {
      userID: userData.UserID,
      fullName: userData.FullName || 'Chưa cập nhật',
      email: userData.Email || '',
      avatar:
        userData.Avatar ||
        'https://e7.pngegg.com/pngimages/349/288/png-clipart-teacher-education-student-course-school-avatar-child-face.png',
      gender: userData.Gender || 'Chưa cập nhật',
      role: userData.Role || 'User',
      status: userData.status || 'active',
      phone: userData.Phone || '',
    };

    res.render('admin/pages/profile/index.pug', {
      pageTitle: 'Thông tin cá nhân',
      profile: profileData,
    });
    return;
  } catch (error) {
    res.status(500).render('admin/pages/500', {
      pageTitle: 'Lỗi hệ thống',
    });
    return;
  }
};

// [POST] /admin/profile/update-basic
export const updateBasicInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ✅ FIX: Lấy user ID từ session
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    const { fullName, gender, phone } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Họ và tên không được để trống!',
      });
      return;
    }

    // Validate phone format (optional)
    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[0-9\-\s\(\)]{8,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        res.status(400).json({
          success: false,
          message: 'Số điện thoại không hợp lệ!',
        });
        return;
      }
    }

    // Tìm user hiện tại
    const currentUser = await User.findByPk(currentUserId);
    if (!currentUser || currentUser.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng!',
      });
      return;
    }

    await currentUser.update({
      FullName: fullName.trim(),
      Gender: gender || null,
      Phone: phone ? phone.trim() : null,
    });

    // ✅ UPDATE: Session data với thông tin mới
    const adminUser = (req.session as any).adminUser;
    if (adminUser) {
      adminUser.name = fullName.trim();
      (req.session as any).adminUser = adminUser;
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      data: {
        fullName: fullName.trim(),
        gender: gender,
        phone: phone?.trim() || '',
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật thông tin!',
    });
    return;
  }
};

// [POST] /admin/profile/change-password
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ✅ FIX: Lấy user ID từ session
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    // Chỉ nhận newPassword và confirmPassword
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // ✅ VALIDATION: Check all required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin!',
        missingFields: {
          currentPassword: !currentPassword,
          newPassword: !newPassword,
          confirmPassword: !confirmPassword,
        },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp!',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự!',
      });
      return;
    }

    const currentPasswordMD5 = md5(currentPassword);
    const newPasswordMD5 = md5(newPassword);

    if (currentPasswordMD5 === newPasswordMD5) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại!',
      });
      return;
    }

    // Tìm user hiện tại
    const currentUser = await User.findByPk(currentUserId);
    if (!currentUser || currentUser.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng!',
      });
      return;
    }

    // ✅ VERIFY: Current password
    const storedPassword = currentUser.get('Password') as string;

    if (storedPassword !== currentPasswordMD5) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác!',
        code: 'INVALID_CURRENT_PASSWORD',
      });
      return;
    }

    // Cập nhật mật khẩu mới
    await currentUser.update({
      Password: newPasswordMD5,
    });

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đổi mật khẩu!',
    });
    return;
  }
};

// [POST] /admin/profile/upload-avatar
export const uploadAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ✅ FIX: Lấy user ID từ session
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    // Avatar URL sẽ được xử lý bởi uploadCloud middleware
    const avatarUrl = req.body.avatar;

    if (!avatarUrl) {
      res.status(400).json({
        success: false,
        message: 'Không tìm thấy file ảnh!',
      });
      return;
    }

    // Tìm user hiện tại
    const currentUser = await User.findByPk(currentUserId);
    if (!currentUser || currentUser.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng!',
      });
      return;
    }

    // Cập nhật avatar
    await currentUser.update({
      Avatar: avatarUrl,
    });

    // ✅ UPDATE: Session data với avatar mới
    const adminUser = (req.session as any).adminUser;
    if (adminUser) {
      adminUser.Avatar = avatarUrl;
      (req.session as any).adminUser = adminUser;
    }

    res.json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công!',
      data: {
        avatarUrl: avatarUrl,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tải ảnh lên!',
    });
    return;
  }
};
