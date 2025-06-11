import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ForumTopic from '../../models/forum-topic.model';
import Comment from '../../models/comment.model';

// ✅ HELPER: Truncate content
const truncateContent = (content: string, maxLength: number): string => {
  if (!content) return '';

  // Remove HTML tags nếu có
  const cleanContent = content.replace(/<[^>]*>/g, '');

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  return cleanContent.substring(0, maxLength).trim() + '...';
};

// Xử lý tìm kiếm
const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchQuery = (req.query.q as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = 10; // số item mỗi trang
    const offset = (page - 1) * limit;

    if (!searchQuery.trim()) {
      res.render('client/pages/search/index', {
        pageTitle: 'Tìm kiếm',
        searchQuery: '',
        searchResults: [],
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
      });
      return;
    }

    // ✅ TÌM KIẾM: ForumTopics dựa trên Title và Content
    const whereCondition = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              Title: {
                [Op.like]: `%${searchQuery}%`,
              },
            },
            {
              Content: {
                [Op.like]: `%${searchQuery}%`,
              },
            },
          ],
        },
        {
          deleted: false,
        },
        {
          status: 'active',
        },
      ],
    };

    // ✅ QUERY: Tìm kiếm với pagination - chỉ lấy fields cần thiết
    const { count, rows: forumTopics } = await ForumTopic.findAndCountAll({
      where: whereCondition,
      attributes: ['TopicID', 'Title', 'Content'], // ✅ CHỈ LẤY: ID, Title, Content
      order: [['CreatedAt', 'DESC']],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    // ✅ FORMAT: Data cho view - đơn giản hóa
    const searchResults = await Promise.all(
      forumTopics.map(async (topic: any) => {
        const topicData = topic.toJSON();

        // ✅ ĐẾM: Số comments cho topic này
        const commentCount = await Comment.count({
          where: {
            TopicID: topicData.TopicID,
            deleted: false,
            status: 'active',
          },
        });

        return {
          id: topicData.TopicID,
          title: topicData.Title,
          content: truncateContent(topicData.Content, 150), // Cắt ngắn content
          answers: commentCount, // Số lượng comment thật
        };
      })
    );

    const totalResults = count;
    const totalPages = Math.ceil(totalResults / limit);

    res.render('client/pages/search/index', {
      pageTitle: `Kết quả tìm kiếm: ${searchQuery}`,
      searchQuery,
      searchResults,
      currentPage: page,
      totalPages,
      totalResults,
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).render('client/pages/error/500', {
      pageTitle: 'Lỗi máy chủ',
      error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.',
    });
  }
};

// ✅ API: Search suggestions cho autocomplete
const searchSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';

    console.log('🔍 Search suggestions request:', { query });

    if (!query.trim() || query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    // ✅ CHỈ LẤY: ID và Title cho suggestions
    const suggestions = await ForumTopic.findAll({
      where: {
        Title: {
          [Op.like]: `%${query}%`,
        },
        deleted: false,
        status: 'active',
      },
      attributes: ['TopicID', 'Title'], // ✅ CHỈ LẤY: ID và Title
      limit: 5,
      order: [['CreatedAt', 'DESC']],
    });

    const formattedSuggestions = suggestions.map((topic: any) => ({
      id: topic.TopicID,
      title: topic.Title,
    }));

    console.log(`✅ Found ${formattedSuggestions.length} suggestions`);

    res.json({ suggestions: formattedSuggestions });
  } catch (error) {
    console.error('❌ Error getting search suggestions:', error);
    res.json({ suggestions: [] });
  }
};

export { search, searchSuggestions };

export default { search, searchSuggestions };
