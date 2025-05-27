// JavaScript để xử lý hiển thị form thêm danh mục
// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing category management...');

  // Lấy các elements
  const showAddFormBtn = document.getElementById('showAddCategoryForm');
  const closeFormBtn = document.getElementById('closeCategoryForm');
  const cancelBtn = document.getElementById('cancelCategory');
  const categoryForm = document.getElementById('categoryForm');
  const mainContent = document.querySelector('.user-management-content');
  const addCategoryPage = document.getElementById('addCategoryPage');

  // Kiểm tra elements có tồn tại không
  if (!showAddFormBtn) {
    console.error('Không tìm thấy nút "Thêm danh mục mới"');
    return;
  }

  // Hàm hiển thị form thêm danh mục
  function showAddCategoryForm() {
    console.log('Hiển thị form thêm danh mục');
    if (mainContent) mainContent.style.display = 'none';
    if (addCategoryPage) addCategoryPage.style.display = 'block';

    // Reset form khi mở
    if (categoryForm) categoryForm.reset();

    // Focus vào input đầu tiên
    const firstInput = document.getElementById('categoryTitle');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  // Hàm ẩn form thêm danh mục
  function hideAddCategoryForm() {
    console.log('Ẩn form thêm danh mục');
    if (addCategoryPage) addCategoryPage.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    // Reset form khi đóng
    if (categoryForm) categoryForm.reset();
  }

  // Event listeners

  // 1. Nút "Thêm danh mục mới"
  showAddFormBtn.addEventListener('click', function (e) {
    e.preventDefault();
    console.log('Clicked: Thêm danh mục mới');
    showAddCategoryForm();
  });

  // 2. Nút đóng form (X)
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Clicked: Đóng form');
      hideAddCategoryForm();
    });
  }

  // 3. Nút hủy
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Clicked: Hủy');

      // Xác nhận trước khi hủy nếu có dữ liệu
      const titleInput = document.getElementById('categoryTitle');
      const typeSelect = document.getElementById('categoryType');

      let hasData = false;
      if (titleInput && titleInput.value.trim()) hasData = true;
      if (typeSelect && typeSelect.value) hasData = true;

      if (hasData) {
        if (confirm('Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
          hideAddCategoryForm();
        }
      } else {
        hideAddCategoryForm();
      }
    });
  }

  // 4. Xử lý submit form
  if (categoryForm) {
    categoryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('Form submitted');

      // Lấy dữ liệu form
      const title = document.getElementById('categoryTitle').value.trim();
      const type = document.getElementById('categoryType').value;

      // Validation
      if (!title) {
        alert('Vui lòng nhập tiêu đề danh mục');
        document.getElementById('categoryTitle').focus();
        return;
      }

      if (!type) {
        alert('Vui lòng chọn loại danh mục');
        document.getElementById('categoryType').focus();
        return;
      }

      // Hiển thị loading (có thể thêm spinner)
      const submitBtn = categoryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'ĐANG THÊM...';
      submitBtn.disabled = true;

      // Giả lập API call
      console.log('Thêm danh mục:', { title, type });

      // Simulate API call
      setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Thông báo thành công
        alert('Thêm danh mục thành công!');

        // Ẩn form và quay về trang chính
        hideAddCategoryForm();

        // TODO: Reload danh sách hoặc thêm vào bảng
        // location.reload(); // Hoặc cập nhật bảng dynamically
      }, 1000);
    });
  }

  // 5. Xử lý phím ESC để đóng form
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const isFormVisible =
        addCategoryPage && addCategoryPage.style.display !== 'none';
      if (isFormVisible) {
        console.log('ESC pressed, closing form');
        hideAddCategoryForm();
      }
    }
  });

  // 6. Validation real-time cho form
  const titleInput = document.getElementById('categoryTitle');
  if (titleInput) {
    titleInput.addEventListener('input', function () {
      const value = this.value.trim();
      if (value.length > 0 && value.length < 3) {
        this.style.borderColor = '#ef4444';
      } else if (value.length >= 3) {
        this.style.borderColor = '#10b981';
      } else {
        this.style.borderColor = '#e5e7eb';
      }
    });
  }

  // 7. Action buttons trong bảng (View, Edit, Delete)
  const actionButtons = document.querySelectorAll('.btn-action');
  actionButtons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const action = this.classList.contains('btn-view')
        ? 'view'
        : this.classList.contains('btn-edit')
        ? 'edit'
        : 'delete';

      // Lấy ID từ row
      const row = this.closest('tr');
      const id = row ? row.cells[0].textContent : 'unknown';

      console.log(`Action: ${action}, ID: ${id}`);

      switch (action) {
        case 'view':
          alert(`Xem chi tiết danh mục ID: ${id}`);
          // TODO: Implement view functionality
          break;
        case 'edit':
          alert(`Chỉnh sửa danh mục ID: ${id}`);
          // TODO: Implement edit functionality
          break;
        case 'delete':
          if (confirm(`Bạn có chắc chắn muốn xóa danh mục ID: ${id}?`)) {
            alert(`Đã xóa danh mục ID: ${id}`);
            // TODO: Implement delete functionality
          }
          break;
      }
    });
  });

  // 8. Pagination buttons
  const paginationBtns = document.querySelectorAll('.btn-page');
  paginationBtns.forEach((btn) => {
    if (
      !btn.disabled &&
      !btn.classList.contains('btn-prev') &&
      !btn.classList.contains('btn-next')
    ) {
      btn.addEventListener('click', function () {
        // Remove active class from all buttons
        paginationBtns.forEach((b) => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');

        const page = this.textContent;
        console.log(`Navigate to page: ${page}`);
        // TODO: Implement pagination
      });
    }
  });

  console.log('Category management initialized successfully');
});
//JS for login admin
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const loginAlert = document.getElementById('loginAlert');
  const alertMessage = document.getElementById('alertMessage');
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  // Toggle hiển thị mật khẩu
  togglePassword.addEventListener('click', function () {
    const type =
      passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });

  // Xử lý form đăng nhập
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validation cơ bản
    if (!username || !password) {
      showAlert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // Giả lập đăng nhập (thay thế bằng API call thực tế)
    if (username === 'admin' && password === 'admin123') {
      // Thành công
      showSuccess('Đăng nhập thành công! Đang chuyển hướng...');

      setTimeout(() => {
        // Chuyển hướng đến trang dashboard
        window.location.href = '/admin/dashboard';
      }, 1500);
    } else {
      showAlert('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  });

  function showAlert(message) {
    alertMessage.textContent = message;
    loginAlert.className = 'alert alert-danger';
    loginAlert.style.display = 'block';

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      loginAlert.style.display = 'none';
    }, 5000);
  }

  function showSuccess(message) {
    alertMessage.textContent = message;
    loginAlert.className = 'alert alert-success';
    loginAlert.style.display = 'block';
  }

  // Ẩn alert khi người dùng bắt đầu nhập
  document.getElementById('username').addEventListener('input', hideAlert);
  document.getElementById('password').addEventListener('input', hideAlert);

  function hideAlert() {
    loginAlert.style.display = 'none';
  }
});
