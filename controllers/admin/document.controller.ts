import { Request, Response } from 'express';
import Document from '../../models/document.model';
import Category from '../../models/category.model';
import User from '../../models/user.model';
import { Op } from 'sequelize';
// Thêm interface cho Request với file
interface RequestWithFile extends Request {
  file?: {
    path: string;
    filename: string;
  };
}

export const index = async (req: Request, res: Response): Promise<void> => {
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

    const totalDocuments = await Document.count({
      where: {
        deleted: false,
        status: 'active',
      },
    });
    const totalPages = Math.ceil(totalDocuments / limit);

    // Lấy tổng số documents
    const totalDocs = await Document.count({
      where: { deleted: false },
    });

    // Lấy documents với phân trang
    const documents = await Document.findAll({
      where: { deleted: false },
      order: [['DocumentID', 'DESC']],
      offset: skip,
      limit: limit,
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
              status: 'active',
            },
            attributes: ['CategoryID', 'Name', 'Type'], // Lấy thêm thông tin cần thiết
          });

          categoryNames = categories.map((cat) => cat.get('Name'));
          categoryList = categories.map((cat) => ({
            id: cat.get('CategoryID'),
            name: cat.get('Name'),
          }));
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
          categories: categoryList, // Trả về mảng categories đầy đủ
          categoryNames: categoryNames.join(', '),
          author: uploaderName,
          createdAt: new Date(document.UploadDate).toLocaleDateString('vi-VN'),
          filePath: document.FilePath,
          status: document.status || 'active',
        };
      })
    );

    res.render('admin/pages/document/index', {
      pageTitle: 'Danh sách tài liệu',
      documents: formattedDocs,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('admin/pages/document/index', {
      pageTitle: 'Danh sách tài liệu',
      documents: [],
      error: 'Có lỗi xảy ra khi tải dữ liệu',
    });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả categories có status active
    const categories = await Category.findAll({
      where: {
        status: 'active',
        deleted: false,
      },
      attributes: ['CategoryID', 'Name'],
    });

    res.render('admin/pages/document/create.pug', {
      pageTitle: 'Thêm tài liệu',
      categories: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh mục',
      error: error.message,
    });
  }
};
export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Lấy dữ liệu từ form
    const { title, category, link, description } = req.body;

    const categories = Array.isArray(category) ? category : [category];

    // Validate dữ liệu
    if (!title || !category) {
      res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
      });
      return;
    }

    // Tạo document mới
    const newDocument = await Document.create({
      Title: title,
      Description: description || '',
      FilePath: link || '',
      UploadDate: new Date(),
      UploadBy: (req.session as any).adminUser.id,
      Categories: categories,
      status: 'active',
      Thumbnail: req.body.thumbnail || null,
    });

    res.redirect('/admin/document');
    // res.status(200).json({
    //   success: true,
    //   message: 'Thêm tài liệu thành công',
    //   document: newDocument
    // });
    // res.redirect('/admin/document');
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi thêm tài liệu',
    });
  }
};
// Chức năng sửa tài liệu
export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      where: { DocumentID: id, deleted: false },
    });

    if (!document) {
      res.render('admin/error', {
        message: 'Không tìm thấy tài liệu',
      });
      return;
    }

    const categories = await Category.findAll({
      where: { deleted: false, status: 'active' },
    });
    // Convert to plain object to make sure all properties are accessible
    const documentData = document.get({ plain: true });

    res.render('admin/pages/document/edit', {
      pageTitle: 'Sửa tài liệu',
      document: documentData,
      categories,
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('admin/error', {
      message: 'Có lỗi xảy ra',
    });
  }
};

// Cập nhật tài liệu
export const update = async (
  req: RequestWithFile,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, link, currentThumbnail } = req.body;

    const document = await Document.findOne({
      where: {
        DocumentID: id,
        deleted: false,
      },
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu',
      });
      return;
    }

    const currentDoc = document.get({ plain: true });

    // Xử lý categories an toàn
    let categories = [];
    if (Array.isArray(category)) {
      categories = category;
    } else if (category) {
      categories = [category];
    } else {
      categories = currentDoc.Categories || [];
    }

    // Xử lý thumbnail
    let thumbnailPath = currentDoc.Thumbnail; // Giữ ảnh cũ làm default

    if (req.file) {
      // Nếu có file upload mới
      thumbnailPath = req.file.path;
    } else if (currentThumbnail && currentThumbnail !== currentDoc.Thumbnail) {
      // Nếu có currentThumbnail mới khác với ảnh cũ
      thumbnailPath = currentThumbnail;
    }

    // Tạo object update với thumbnail đã xử lý
    const updateData = {
      Title: title || currentDoc.Title,
      Categories: categories,
      FilePath: link || currentDoc.FilePath,
      Thumbnail: req.body.thumbnail,
    };

    await document.update(updateData);
    res.redirect('/admin/document');
    // res.status(200).json({
    //   success: true,
    //   message: 'Cập nhật tài liệu thành công',
    //   document: {
    //     ...updateData,
    //     DocumentID: id
    //   }
    // });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật tài liệu',
      error: error.message,
    });
  }
};

// Cập nhật trạng thái
// export const updateStatus = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const document = await Document.findByPk(id);

//     if (!document) {
//       res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy tài liệu',
//       });
//       return;
//     }

//     // Toggle status
//     const newStatus = status === 'active' ? 'inactive' : 'active';

//     await document.update({
//       status: newStatus,
//     });

//     res.json({
//       success: true,
//       message: `${newStatus === 'active' ? 'Hiện' : 'Ẩn'} tài liệu thành công`,
//     });
//   } catch (error) {
//     console.error('Update status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Có lỗi xảy ra khi cập nhật trạng thái',
//     });
//   }
// };

export const toggleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await Document.findOne({
      where: { DocumentID: id, deleted: false },
    });

    if (!document) {
      res.status(404).json({ success: false, message: 'Không tìm thấy user' });
      return;
    }

    const currentStatus = document.get('status');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await document.update({ status: newStatus });

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

// Thêm chức năng xóa tài liệu
// export const deleteDocument = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const adminUser = (req.session as any).adminUser;

//     if (!adminUser) {
//       res.status(401).json({
//         success: false,
//         message: 'Unauthorized - Vui lòng đăng nhập',
//       });
//       return;
//     }

//     // Soft delete - cập nhật trường deleted thành true
//     await Document.update({ deleted: true }, { where: { DocumentID: id } });

//     res.json({
//       success: true,
//       message: 'Xóa tài liệu thành công',
//     });
//   } catch (error) {
//     console.error('Delete document error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Có lỗi xảy ra khi xóa tài liệu',
//     });
//   }
// };

// Xóa người dùng
export const deleteDocument = async (
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

    const document = await Document.findOne({
      where: {
        DocumentID: id,
        deleted: false,
      },
    });

    if (!document) {
      res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    // Soft delete
    await document.update({
      deleted: true,
      deletedAt: new Date(),
    });

    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
