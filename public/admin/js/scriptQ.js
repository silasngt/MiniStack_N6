// JavaScript để xử lý hiển thị form thêm danh mục
document.addEventListener('DOMContentLoaded', function () {
  const addCategoryBtn = document.querySelector(
    '[data-bs-target="#addCategoryModal"]'
  );
  const addCategoryPage = document.getElementById('addCategoryPage');
  const mainContent = document.querySelector('.container-fluid');
  const closeCategoryForm = document.getElementById('closeCategoryForm');
  const cancelCategory = document.getElementById('cancelCategory');

  // Thay đổi nút để không mở modal mà hiển thị trang mới
  if (addCategoryBtn) {
    addCategoryBtn.removeAttribute('data-bs-toggle');
    addCategoryBtn.removeAttribute('data-bs-target');

    addCategoryBtn.addEventListener('click', function (e) {
      e.preventDefault();
      mainContent.style.display = 'none';
      addCategoryPage.style.display = 'block';
    });
  }

  // Xử lý đóng form
  function closeForm() {
    addCategoryPage.style.display = 'none';
    mainContent.style.display = 'block';
    // Reset form
    document.getElementById('categoryForm').reset();
  }

  if (closeCategoryForm) {
    closeCategoryForm.addEventListener('click', closeForm);
  }

  if (cancelCategory) {
    cancelCategory.addEventListener('click', closeForm);
  }

  // Xử lý submit form
  const categoryForm = document.getElementById('categoryForm');
  if (categoryForm) {
    categoryForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const title = document.getElementById('categoryTitle').value;
      const type = document.getElementById('categoryType').value;

      if (!title.trim()) {
        alert('Vui lòng nhập tiêu đề danh mục');
        return;
      }

      if (!type) {
        alert('Vui lòng chọn loại danh mục');
        return;
      }

      // Ở đây bạn có thể gửi dữ liệu lên server
      alert('Thêm danh mục thành công!');
      closeForm();
    });
  }
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
