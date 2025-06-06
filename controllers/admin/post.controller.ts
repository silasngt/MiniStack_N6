import { Request, Response } from 'express';
import Category from '../../models/category.model';
import Post from '../../models/post.model';

// [GET] /admin/posts
export const index = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      where: { deleted: false },
      order: [['CreatedAt', 'DESC']],
    });

    res.render('admin/pages/post/index.pug', {
      pageTitle: 'Quản lý bài viết',
      posts: posts,
    });
    return;
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.render('admin/pages/post/index.pug', {
      pageTitle: 'Quản lý bài viết',
      posts: [],
    });
    return;
  }
};

// [GET] /admin/posts/create
export const create = async (req: Request, res: Response) => {
  try {
    // Lấy categories có Type chứa 'Post' (vì Type là JSON array)
    const categories = await Category.findAll({
      where: {
        deleted: false,
        status: 'active',
      },
    });

    // Filter categories có chứa 'Post' trong Type array
    const postCategories = categories.filter((category) => {
      const types = category.get('Type') as string[];
      return types && types.includes('Bài viết');
    });

    res.render('admin/pages/post/create', {
      pageTitle: 'Thêm bài viết mới',
      categories: postCategories,
    });
    return;
  } catch (error) {
    console.error('Error loading create page:', error);
    res.redirect('/admin/posts');
    return;
  }
};

// [POST] /admin/posts/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, author, category } = req.body;

    // Validate required fields
    if (!title || !content || !author) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
      });
      return;
    }

    // Xử lý multiple categories
    let categoryIds: number[] = [];
    if (Array.isArray(category)) {
      categoryIds = category.map((id) => parseInt(id));
    } else if (category) {
      categoryIds = [parseInt(category)];
    }

    // Validate categories exist và thuộc type 'Post'
    if (categoryIds.length > 0) {
      const validCategories = await Category.findAll({
        where: {
          CategoryID: categoryIds,
          deleted: false,
          status: 'active',
        },
      });

      // Check if categories are valid for Posts
      const invalidCategories = validCategories.filter((cat) => {
        const types = cat.get('Type') as string[];
        return !types || !types.includes('Bài viết');
      });

      if (invalidCategories.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Một số danh mục không hợp lệ cho bài viết!',
        });
        return;
      }

      if (validCategories.length !== categoryIds.length) {
        res.status(400).json({
          success: false,
          message: 'Một số danh mục không tồn tại!',
        });
        return;
      }
    }

    // Xử lý images từ Cloudinary (đã được upload qua middleware)
    let imageUrls: string[] = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      imageUrls = req.body.images;
    }

    // Tạo post với multiple categories và images
    const newPost = await Post.create({
      Title: title,
      Content: content,
      AuthorID: 1, // TODO: Lấy từ session user thực tế
      Categories: categoryIds, // Sequelize sẽ tự động stringify thành JSON
      Images: imageUrls, // Sequelize sẽ tự động stringify thành JSON
      CreatedAt: new Date(),
      deleted: false,
      status: 'active',
    });

    console.log('✅ Post created successfully:', {
      postId: newPost.get('PostID'),
      title: title,
      author: author,
      categories: categoryIds,
      imagesCount: imageUrls.length,
    });

    // Redirect với success message
    res.redirect('/admin/posts?success=created');
    return;
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo bài viết!',
    });
    return;
  }
};
