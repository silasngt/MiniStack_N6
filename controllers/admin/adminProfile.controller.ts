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

    console.log('👤 Loading profile for user ID:', currentUserId);

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
    console.error('❌ Error loading profile:', error);
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

    console.log('📝 Updating basic info for user:', currentUserId);

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
    console.error('❌ Error updating basic info:', error);
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
    const { newPassword, confirmPassword } = req.body;

    console.log('🔑 Change password request for user:', currentUserId);

    // Validation
    if (!newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin!',
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

    // Tìm user hiện tại
    const currentUser = await User.findByPk(currentUserId);
    if (!currentUser || currentUser.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng!',
      });
      return;
    }

    // Hash mật khẩu mới với MD5
    const newPasswordMD5 = md5(newPassword);

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
    console.error('❌ Error changing password:', error);
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

    console.log('📸 Uploading avatar for user:', currentUserId);

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
    console.error('❌ Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tải ảnh lên!',
    });
    return;
  }
};
