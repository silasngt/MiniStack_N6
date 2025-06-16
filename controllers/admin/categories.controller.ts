import { Request, Response } from 'express';
import Category from '../../models/category.model';

// hiển thị danh sách
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

    const totalCategories = await Category.count({
      where: {
        deleted: false,
      },
    });
    const totalPages = Math.ceil(totalCategories / limit);

    // Lấy categories theo trang với limit và offset
    const categories = await Category.findAll({
      where: { deleted: false },
      order: [['CategoryID', 'ASC']],
      limit: limit,
      offset: skip,
    });

    res.render('admin/pages/categories/index.pug', {
      pageTitle: 'Quản lý danh mục',
      categories,
      currentPage: page,
      totalPages: totalPages,
      skip,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách categories:', error);
    res.status(500).send('Lỗi server');
  }
};

// hiển thị form thêm mới
export const addForm = async (req: Request, res: Response): Promise<void> => {
  res.render('admin/pages/categories/add.pug', {
    pageTitle: 'Thêm danh mục mới',
  });
};

//thêm danh mục
export const add = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, status } = req.body;

    const types = Array.isArray(type) ? type : [type];

    if (!name || !types.length) {
      res.status(400).send('Tên và loại danh mục là bắt buộc');
      return;
    }

    await Category.create({
      Name: name.trim(),
      Type: types,
      status: status || 'active',
      deleted: false,
    });

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Lỗi khi thêm danh mục:', error);
    res.status(500).send('Lỗi khi thêm danh mục: ' + (error as Error).message);
  }
};

// hiển thị form chỉnh sửa
export const editForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).send('ID danh mục không hợp lệ');
      return;
    }

    const category = await Category.findOne({
      where: {
        CategoryID: id,
        deleted: false,
      },
    });

    if (!category) {
      res.status(404).send('Không tìm thấy danh mục');
      return;
    }

    // Lấy object thuần từ instance Sequelize
    const cat = category.get({ plain: true });

    const categoryData = {
      _id: cat.CategoryID,
      name: cat.Name,
      type: cat.Type,
      status: cat.status || 'active',
    };

    res.render('admin/pages/categories/edit.pug', {
      pageTitle: 'Chỉnh sửa danh mục',
      category: categoryData,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin danh mục:', error);
    res.status(500).send('Lỗi server');
  }
};

// cập nhật danh mục
export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, status } = req.body;

    if (!id) {
      res.status(400).send('ID danh mục không hợp lệ');
      return;
    }

    const types = Array.isArray(type) ? type : [type];

    if (!name || !types.length) {
      res.status(400).send('Tên và loại danh mục là bắt buộc');
      return;
    }

    // Tìm danh mục cần cập nhật
    const category = await Category.findOne({
      where: {
        CategoryID: id,
        deleted: false,
      },
    });

    if (!category) {
      res.status(404).send('Không tìm thấy danh mục');
      return;
    }

    // Cập nhật thông tin
    await category.update({
      Name: name.trim(),
      Type: types,
      status: status || 'active',
    });

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    res
      .status(500)
      .send('Lỗi khi cập nhật danh mục: ' + (error as Error).message);
  }
};

// xóa danh mục
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: 'ID danh mục không hợp lệ' });
      return;
    }

    const category = await Category.findOne({
      where: {
        CategoryID: id,
        deleted: false,
      },
    });

    if (!category) {
      res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy danh mục' });
      return;
    }

    // Soft delete
    await category.update({
      deleted: true,
      deletedAt: new Date(),
    });

    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

//thay đổi trạng thái
export const toggleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: 'ID danh mục không hợp lệ' });
      return;
    }

    const category = await Category.findOne({
      where: {
        CategoryID: id,
        deleted: false,
      },
    });

    if (!category) {
      res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy danh mục' });
      return;
    }

    // Chuyển đổi trạng thái
    const currentStatus = category.get('status');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await category.update({ status: newStatus });

    res.json({
      success: true,
      newStatus: newStatus,
      message: `Đã ${
        newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'
      } danh mục`,
    });
  } catch (error) {
    console.error('Lỗi khi chuyển đổi trạng thái danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
