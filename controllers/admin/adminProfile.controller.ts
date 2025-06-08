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
    console.log(userData);

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

    console.log('👤 Profile data loaded:', {
      userID: profileData.userID,
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      role: profileData.role,
    });

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
