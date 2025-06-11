import { Request, Response } from 'express';
import Document from '../../models/document.model';
import Category from '../../models/category.model';
import User from '../../models/user.model';
import { Op } from 'sequelize';
export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Lấy tổng số documents
    const totalDocs = await Document.count({
      where: { deleted: false }
    });

    // Lấy documents với phân trang
    const documents = await Document.findAll({
      where: { deleted: false },
      order: [['DocumentID', 'DESC']],
      limit,
      offset
    });

    // Xử lý data để hiển thị categories và user
    const formattedDocs = await Promise.all(
      documents.map(async (doc) => {
        const document = doc.get({ plain: true });

        // Parse categories từ JSON và lấy tên categories
        const categoryIds = document.Categories || [];
        let categoryNames = [];
        let categoryList = [];
    
        
        if (categoryIds.length > 0) {
          const categories = await Category.findAll({
            where: {
              CategoryID: categoryIds,
              deleted: false,
              status: 'active'
            },
            attributes: ['CategoryID', 'Name', 'Type'] // Lấy thêm thông tin cần thiết
          });
          
          categoryNames = categories.map(cat => cat.get('Name'));
          categoryList = categories.map(cat => ({
            id: cat.get('CategoryID'),
            name: cat.get('Name')
          }));
          console.log(categoryList);
        }
        // Lấy thông tin người upload
        let uploaderName = 'N/A';
        if (document.UploadBy) {
          const uploader = await User.findByPk(document.UploadBy);
          if (uploader) {
            uploaderName = uploader.get('FullName') as string;
          }
        }

        return {
          id: document.DocumentID,
          title: document.Title,
          categories: categoryList,// Trả về mảng categories đầy đủ
          categoryNames: categoryNames.join(', '),
          author: uploaderName,
          createdAt: new Date(document.UploadDate).toLocaleDateString('vi-VN'),
          filePath: document.FilePath,
          status: document.status || 'active'
        };
      })
    );
    

    res.render('admin/pages/document/index', {
      pageTitle: 'Danh sách tài liệu',
      documents: formattedDocs,
      pagination: {
        page,
        totalPages: Math.ceil(totalDocs / limit),
        totalItems: totalDocs,
        limit
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.render('admin/pages/document/index', {
      pageTitle: 'Danh sách tài liệu', 
      documents: [],
      error: 'Có lỗi xảy ra khi tải dữ liệu'
    });
  }
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
    
    // Log data nhận được
    console.log('Create document data:', {
      title,
      description,
      category,
      file: req.file
    });
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
    console.log('Created document:', document);

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
// Chức năng sửa tài liệu
export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({
      where: { DocumentID: id, deleted: false }
    });

    if (!document) {
      res.render('admin/error', {
        message: 'Không tìm thấy tài liệu'
      });
      return;
    }

    const categories = await Category.findAll({
      where: { status: 'active' }
    });

    res.render('admin/pages/document/edit', {
      pageTitle: 'Sửa tài liệu',
      document,
      categories
    });

  } catch (error) {
    console.error('Error:', error);
    res.render('admin/error', {
      message: 'Có lỗi xảy ra'
    });
  }
};

// Cập nhật tài liệu
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, category, link } = req.body;
    const file = req.file;

    const document = await Document.findOne({
      where: { DocumentID: id, deleted: false }
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
      return;
    }

    // Cập nhật thông tin cơ bản
    const updateData: any = {
      Title: title,
      Description: description,
      Categories: category
    };

    // Cập nhật link nếu có
    if (link) {
      updateData.FilePath = link;
    }

    // Cập nhật thumbnail nếu có file upload mới
    if (file) {
      // Xử lý upload file và lấy đường dẫn
      const thumbnailPath = file.path; // Hoặc xử lý upload của bạn
      updateData.Thumbnail = thumbnailPath;
    }

    await document.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật tài liệu thành công'
      
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật'
    });
  }
};

// Cập nhật trạng thái
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Document.update(
      { status },
      { where: { DocumentID: id, deleted: false }}
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra'
    });
  }
};
// Thêm chức năng xóa tài liệu
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminUser = (req.session as any).adminUser;

    if (!adminUser) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Vui lòng đăng nhập'
      });
      return;
    }

    // Soft delete - cập nhật trường deleted thành true
    await Document.update(
      { deleted: true },
      { where: { DocumentID: id }}
    );

    res.json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa tài liệu'
    });
  }
};
