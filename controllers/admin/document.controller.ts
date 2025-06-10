import { Request, Response } from 'express';
import Document from '../../models/document.model';
import Category from '../../models/category.model';

export const index = async (req: Request, res: Response) => {
  res.render('admin/pages/document/index.pug', {
    pageTitle: 'Quản lý tài liệu',
  });
  
};
export const addDocument = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả categories có status active
    const categories = await Category.findAll({
      where: {
        Status: 'active'
      },
      attributes: ['CategoryID', 'Name']
    });

    res.render('admin/pages/document/create.pug', {
      pageTitle: 'Thêm tài liệu',
      categories: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh mục',
      error: error.message  
    });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { title, description, category } = req.body;
    
        // Lấy user từ session
    const adminUser = (req.session as any).adminUser;
    if (!adminUser) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Vui lòng đăng nhập'
      });
      return;
    }

    // Lấy file path từ middleware upload
    const filePath = req.body.document || '';
    
    const document = await Document.create({
      Title: title,
      Description: description,
      FilePath: filePath,
      UploadDate: new Date(),
      UploadBy: adminUser.id,// Thay đổi tùy vào cách lưu user của bạn
      Categories: category, // Categories sẽ tự động được xử lý bởi setter trong model
      status: 'active'
    });

    res.json({
      success: true,
      message: 'Thêm tài liệu thành công',
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra',
      error: error.message
    });
  }
};