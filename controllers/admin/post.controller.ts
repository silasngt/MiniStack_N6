// File: controllers/admin/post.controller.ts
import { Request, Response } from 'express';
import Category from '../../models/category.model';
import Post from '../../models/post.model';
import User from '../../models/user.model';

// ✅ HELPER: Get current user from session
const getCurrentUser = (req: Request): { id: number; role: string } | null => {
  const adminUser = (req.session as any)?.adminUser;
  return adminUser
    ? { id: adminUser.id, role: adminUser.role || 'User' }
    : null;
};

// [GET] /admin/posts
export const index = async (req: Request, res: Response) => {
  try {
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.redirect('/admin/auth/login');
      return;
    }

    console.log('📋 Loading posts for user:', currentUser.id);

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
          status: postData.status || 'active', // ✅ Include status
        };
      })
    );

    res.render('admin/pages/post/index.pug', {
      pageTitle: 'Quản lý bài viết',
      posts: postsWithCategories,
      success: req.query.success,
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

// [PATCH] /admin/posts/toggle-status/:id
export const toggleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    const postId = parseInt(req.params.id);

    console.log('🔄 Toggle status request:', {
      postId,
      userId: currentUser.id,
    });

    // Tìm post cần toggle
    const existingPost = await Post.findByPk(postId);
    if (!existingPost || existingPost.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết!',
      });
      return;
    }

    // ✅ CHECK: Quyền toggle - chỉ Author hoặc Admin
    const authorId = existingPost.get('AuthorID');
    if (authorId !== currentUser.id && currentUser.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi trạng thái bài viết này!',
      });
      return;
    }

    // Toggle status: active <-> inactive
    const currentStatus = existingPost.get('status') as string;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    await existingPost.update({
      status: newStatus,
    });

    console.log('✅ Post status toggled:', {
      postId,
      oldStatus: currentStatus,
      newStatus,
      byUser: currentUser.id,
    });

    res.status(200).json({
      success: true,
      message: `Bài viết đã được ${
        newStatus === 'active' ? 'kích hoạt' : 'tạm dừng'
      }!`,
      data: {
        postId: postId,
        status: newStatus,
        isActive: newStatus === 'active',
      },
    });
    return;
  } catch (error) {
    console.error('❌ Error toggling post status:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi thay đổi trạng thái bài viết!',
    });
    return;
  }
};

// [GET] /admin/posts/create
export const create = async (req: Request, res: Response) => {
  try {
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.redirect('/admin/auth/login');
      return;
    }

    // Lấy categories có Type chứa 'Post'
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
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    const { title, content, category } = req.body;

    console.log('📝 Creating post by user:', currentUser.id);

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

    // Xử lý single image từ Cloudinary
    const imageUrl: string | null = req.body.image || null;

    // ✅ FIX: Sử dụng currentUser.id thay vì hardcode
    const newPost = await Post.create({
      Title: title,
      Content: content,
      AuthorID: currentUser.id, // ✅ Từ session
      Categories: categoryIds,
      Image: imageUrl,
      CreatedAt: new Date(),
      deleted: false,
      status: 'active',
    });

    console.log('✅ Post created successfully:', {
      postId: newPost.get('PostID'),
      title: title,
      authorId: currentUser.id,
      categories: categoryIds,
      hasImage: !!imageUrl,
    });

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
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.redirect('/admin/auth/login');
      return;
    }

    const postId = parseInt(req.params.id);

    // Lấy thông tin bài viết
    const post = await Post.findByPk(postId);

    if (!post || post.get('deleted')) {
      res.status(404).render('admin/pages/404', {
        pageTitle: 'Không tìm thấy bài viết',
      });
      return;
    }

    // ✅ CHECK: Quyền edit - chỉ Author hoặc Admin
    const authorId = post.get('AuthorID');
    if (authorId !== currentUser.id && currentUser.role !== 'Admin') {
      res.status(403).render('admin/pages/403', {
        pageTitle: 'Không có quyền truy cập',
        message: 'Bạn không có quyền chỉnh sửa bài viết này!',
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

// [POST] /admin/posts/edit/:id
export const editPost = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    const postId = parseInt(req.params.id);
    const { title, content, category, currentImage } = req.body;

    console.log('✏️ Editing post:', { postId, userId: currentUser.id });

    // Validate required fields
    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
      });
      return;
    }

    // Tìm post cần edit
    const existingPost = await Post.findByPk(postId);
    if (!existingPost || existingPost.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết!',
      });
      return;
    }

    // ✅ CHECK: Quyền edit
    const authorId = existingPost.get('AuthorID');
    if (authorId !== currentUser.id && currentUser.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài viết này!',
      });
      return;
    }

    // ... rest of the edit logic remains the same ...

    // Xử lý multiple categories
    let categoryIds: number[] = [];
    if (Array.isArray(category)) {
      categoryIds = category.map((id) => parseInt(id));
    } else if (category) {
      categoryIds = [parseInt(category)];
    }

    // Validate categories
    if (categoryIds.length > 0) {
      const validCategories = await Category.findAll({
        where: {
          CategoryID: categoryIds,
          deleted: false,
          status: 'active',
        },
      });

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

    // Xử lý image
    let finalImageUrl: string | null = null;
    if (req.body.image) {
      finalImageUrl = req.body.image;
    } else if (currentImage) {
      finalImageUrl = currentImage;
    }

    // Cập nhật post
    await existingPost.update({
      Title: title,
      Content: content,
      Categories: categoryIds,
      Image: finalImageUrl,
    });

    res.redirect(`/admin/posts?success=updated&id=${postId}`);
    return;
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật bài viết!',
    });
    return;
  }
};

// [DELETE] /admin/posts/delete/:id
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ✅ CHECK: Authentication
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập lại!',
      });
      return;
    }

    const postId = parseInt(req.params.id);

    console.log('🗑️ Delete Post Request:', { postId, userId: currentUser.id });

    // Tìm post cần xóa
    const existingPost = await Post.findByPk(postId);
    if (!existingPost || existingPost.get('deleted')) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết!',
      });
      return;
    }

    // ✅ CHECK: Quyền xóa - chỉ Author hoặc Admin
    const authorId = existingPost.get('AuthorID');
    if (authorId !== currentUser.id && currentUser.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này!',
      });
      return;
    }

    // Soft delete
    await existingPost.update({
      deleted: true,
    });

    console.log('✅ Post deleted successfully:', {
      postId: postId,
      title: existingPost.get('Title'),
      byUser: currentUser.id,
    });

    res.status(200).json({
      success: true,
      message: 'Xóa bài viết thành công!',
    });
    return;
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa bài viết!',
    });
    return;
  }
};
