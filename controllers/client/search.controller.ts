import { Request, Response } from 'express';

class SearchController {
  // Xử lý tìm kiếm
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchQuery = (req.query.q as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = 10; // số item mỗi trang

      const searchResults = [
        {
          id: 1,
          title: 'org.hibernate.query.QueryArgumentException: Argument [44]',
          content:
            'I have 2 tables in database "Courses" and "Instructor" with "Instructor" table having one to many relation with "Courses" table and "Courses" table having many to one relation with same....',
          answers: 0,
          views: 3,
          tags: ['hibernate', 'java', 'spring-boot'],
        },
        {
          id: 2,
          title: 'org.hibernate.query.QueryArgumentException: Argument [44]',
          content:
            'I have 2 tables in database "Courses" and "Instructor" with "Instructor" table having one to many relation with "Courses" table and "Courses" table having many to one relation with same....',
          answers: 0,
          views: 3,
          tags: ['database', 'orm', 'java'],
        },
        {
          id: 3,
          title: 'org.hibernate.query.QueryArgumentException: Argument [44]',
          content:
            'I have 2 tables in database "Courses" and "Instructor" with "Instructor" table having one to many relation with "Courses" table and "Courses" table having many to one relation with same....',
          answers: 0,
          views: 3,
          tags: ['jpa', 'hibernate', 'database'],
        },
        {
          id: 4,
          title: 'org.hibernate.query.QueryArgumentException: Argument [44]',
          content:
            'I have 2 tables in database "Courses" and "Instructor" with "Instructor" table having one to many relation with "Courses" table and "Courses" table having many to one relation with same....',
          answers: 0,
          views: 3,
          tags: ['java', 'error-handling', 'spring'],
        },
        {
          id: 5,
          title: 'org.hibernate.query.QueryArgumentException: Argument [44]',
          content:
            'I have 2 tables in database "Courses" and "Instructor" with "Instructor" table having one to many relation with "Courses" table and "Courses" table having many to one relation with same....',
          answers: 0,
          views: 3,
          tags: ['jpa', 'hibernate', 'database-relationships'],
        },
      ];

      const totalResults = searchResults.length;
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
}

export default new SearchController();
