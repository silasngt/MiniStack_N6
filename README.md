<div align="center">

# ĐỒ ÁN MÔN CHUYÊN ĐỀ THỰC TẾ 2 - PRACTICAL THEMATIC

</div>

# MiniStack - Diễn đàn hỏi đáp và chia sẻ tài liệu học tập

Một nền tảng web tương tự Stack Overflow được xây dựng để phục vụ cộng đồng sinh viên và lập trình viên Việt Nam trong việc trao đổi kiến thức, hỏi đáp và chia sẻ tài liệu học tập.

## 🚀 Công nghệ sử dụng

- **Backend**: Express.js + Node.js
- **Template Engine**: Pug
- **Database**: MySQL
- **ORM**: Sequelize
- **Frontend**: HTML, CSS, JavaScript

## ✨ Tính năng chính

### Dành cho người dùng
- **Diễn đàn Q&A**: Đặt câu hỏi và trả lời các thắc mắc lập trình (yêu cầu đăng nhập)
- **AI hỗ trợ**: Chatbot AI giải đáp thắc mắc nhanh chóng (không lưu lịch sử)
- **Tìm kiếm**: Tìm kiếm bài viết, câu hỏi và tài liệu (không cần đăng nhập)
- **Tài liệu học tập**: Truy cập miễn phí các tài liệu học tập
- **Biên dịch code**: Chạy thử code trực tuyến với nhiều ngôn ngữ (C++, Python, JavaScript...)
- **Quản lý Profile**: Cập nhật thông tin cá nhân

### Dành cho Admin
- **Quản lý bài viết**: Thêm, sửa, xóa bài viết
- **Quản lý người dùng**: Quản trị tài khoản người dùng
- **Quản lý diễn đàn**: Kiểm duyệt câu hỏi và bình luận
- **Quản lý danh mục**: Tổ chức phân loại nội dung
- **Quản lý tài liệu**: Upload và quản lý tài liệu học tập

## 🔧 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 14.0.0
- MySQL >= 8.0
- npm

### Hướng dẫn cài đặt

1. **Clone repository**
```bash
git clone https://github.com/silasngt/MiniStack_N6.git
cd MiniStack_N6
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình database**
- Tạo database MySQL mới
- Cập nhật thông tin kết nối trong file `config/database.js`

4. **Chạy migration**
```bash
npx sequelize-cli db:migrate
```

5. **Chạy ứng dụng**
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc dự án

```
MiniStack_N6/
├── config/           # Cấu hình database và app
├── controllers/      # Logic xử lý requests
├── models/           # Models Sequelize
├── node_modules/     # Dependencies
├── public/           # Static files (CSS, JS, images)
├── routes/           # Route definitions
├── views/            # Templates Pug
├── .env              # Biến môi trường
├── .gitignore        # Git ignore file
├── index.js          # Entry point
├── package-lock.json # Lock file dependencies
├── package.json      # Package configuration
└── tsconfig.json     # TypeScript configuration
```

## 👥 Thành viên nhóm

| MSSV | Họ và tên |
|------|-----------|
| 2251120049 | Nguyễn Giang Thành Tài |
| 2251120182 | Nguyễn Ngọc Quân |
| 2251120165 | Nguyễn Khao |
| 2251120098 | Trịnh Thị Nghĩa |
| 2251120186 | Phùng Thuận |

## 📝 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng. Vui lòng tạo pull request hoặc báo cáo issues nếu phát hiện lỗi.

---

*Phát triển bởi các thành viên NHÓM 6 Trường Đại học Giao thông vận tải TPHCM - University Of Transport HCM*
