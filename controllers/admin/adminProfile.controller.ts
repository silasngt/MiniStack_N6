import { Request, Response } from 'express';
import User from '../../models/user.model';

// Mock current user ID - sẽ thay bằng req.session.userId sau khi có login
const CURRENT_USER_ID = 2;

// [GET] /admin/profile
export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy thông tin user hiện tại
    const currentUser = await User.findByPk(CURRENT_USER_ID);

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
    const currentUser = await User.findByPk(CURRENT_USER_ID);
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
