import { Request, Response } from 'express';
import Document from '../../models/document.model';
import Category from '../../models/category.model';

export const index = async (req: Request, res: Response) => {
  try {
    // Lấy tham số phân trang
    const page = parseInt(req.query.page as string) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Chỉ lấy tài liệu có trạng thái active và chưa bị xóa
    const documents = await Document.findAll({
      where: {
        status: 'active',
        deleted: false
      },
      order: [['UploadDate', 'DESC']],
      limit,
      offset
    });
    // console.log(documents);
    // Xử lý dữ liệu trước khi gửi đến view
     const formattedDocs = await Promise.all(
      documents.map(async (doc) => {
        const document = doc.get({ plain: true });

        
        
        // Lấy tất cả danh mục của tài liệu
        const categoryIds = document.Categories || [];
        const categories = await Category.findAll({
          where: {
            CategoryID: categoryIds,
            status: 'active'
          },
          attributes: ['CategoryID', 'Name']
        });
        // console.log(document);
        return {
          id: document.DocumentID,
          title: document.Title,
          thumbnail: document.Thumbnail ,
          filePath: document.FilePath,
          categories: categories
        };
      })
    );

    // Debug log để kiểm tra đường dẫn ảnh
    // console.log('Formatted Docs:', formattedDocs);
    // Đếm tổng số tài liệu để phân trang
    const totalDocs = await Document.count({
      where: {
        status: 'active',
        deleted: false
      }
    });

    res.render('client/pages/document/index', {
      pageTitle: 'Thư viện tài liệu',
      documents: formattedDocs,
      pagination: {
        page,
        totalPages: Math.ceil(totalDocs / limit),
        hasNext: page * limit < totalDocs,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.render('client/pages/document/index', {
      pageTitle: 'Thư viện tài liệu',
      error: 'Có lỗi xảy ra khi tải dữ liệu'
    });
  }
};
