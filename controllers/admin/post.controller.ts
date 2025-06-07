import { Request, Response } from 'express';
import Category from '../../models/category.model';
import Post from '../../models/post.model';
import User from '../../models/user.model';

// [GET] /admin/posts
export const index = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      where: { deleted: false },
      order: [['CreatedAt', 'DESC']],
    });

    // Xử lý data để hiển thị categories
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        const postData = post.toJSON();

        // Parse categories từ JSON
        const categoryIds = postData.Categories || [];
        let categoryNames = [];

        if (categoryIds.length > 0) {
          const categories = await Category.findAll({
            where: {
              CategoryID: categoryIds,
              deleted: false,
            },
          });
          categoryNames = categories.map((cat) => cat.get('Name'));
        }

        let authorName = 'Chưa xác định';
        if (postData.AuthorID) {
          const author = await User.findByPk(postData.AuthorID);
          if (author) {
            authorName = author.get('FullName') as string;
          }
        }

        return {
          ...postData,
          categoryNames: categoryNames.join(', '),
          authorName: authorName,
          formattedDate: new Date(postData.CreatedAt).toLocaleDateString(
            'vi-VN'
          ),
          hasImage: !!postData.Image,
        };
      })
    );

    res.render('admin/pages/post/index.pug', {
      pageTitle: 'Quản lý bài viết',
      posts: postsWithCategories,
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
    const { title, content, category } = req.body;

    // Validate required fields
    if (!title || !content) {
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
    // Xử lý single image từ Cloudinary - lưu trực tiếp URL string
    const imageUrl: string | null = req.body.image || null;

    // ✅ LẤY UserID từ session (tạm thời dùng mẫu)
    // TODO: Thay thế bằng req.session.userId sau khi implement login
    const currentUserId = 1; // MOCK DATA - user đang đăng nhập

    // Validate user exists
    const currentUser = await User.findByPk(currentUserId);
    if (!currentUser) {
      res.status(400).json({
        success: false,
        message: 'Người dùng không tồn tại!',
      });
      return;
    }

    // Tạo post với multiple categories và images
    const newPost = await Post.create({
      Title: title,
      Content: content,
      AuthorID: currentUserId,
      Categories: categoryIds, // Sequelize sẽ tự động stringify thành JSON
      Image: imageUrl, // Sequelize sẽ tự động stringify thành JSON
      CreatedAt: new Date(),
      deleted: false,
      status: 'active',
    });

    console.log('✅ Post created successfully:', {
      postId: newPost.get('PostID'),
      title: title,
      authorId: currentUserId,
      authorName: currentUser.get('FullName'),
      categories: categoryIds,
      hasImage: !!imageUrl,
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

// [GET] /admin/posts/edit/:id
export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);

    // Lấy thông tin bài viết
    const post = await Post.findByPk(postId);

    if (!post || post.get('deleted')) {
      res.status(404).render('admin/pages/404', {
        pageTitle: 'Không tìm thấy bài viết',
      });
      return;
    }

    // Lấy danh sách categories
    const categories = await Category.findAll({
      where: {
        deleted: false,
        status: 'active',
      },
    });

    const postCategories = categories.filter((category) => {
      const types = category.get('Type') as string[];
      return types && types.includes('Bài viết');
    });

    res.render('admin/pages/post/edit', {
      pageTitle: 'Chỉnh sửa bài viết',
      post: post.toJSON(),
      categories: postCategories,
    });
    return;
  } catch (error) {
    console.error('Error loading edit page:', error);
    res.redirect('/admin/posts');
    return;
  }
};
