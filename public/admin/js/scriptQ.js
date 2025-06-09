// JS for categories
function deleteCategory(id, btn) {
  if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
    fetch(`/admin/categories/delete/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Ẩn dòng vừa xóa khỏi bảng
          const row = btn.closest('tr');
          if (row) row.remove();
        } else {
          alert(data.message || 'Xóa không thành công');
        }
      })
      .catch(() => alert('Có lỗi xảy ra khi xóa!'));
  }
}

function toggleStatus(type, id, btn) {
  fetch(`/admin/${type}/toggle-status/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const icon = btn.querySelector('i');
        if (data.newStatus === 'active') {
          icon.className = 'fas fa-eye';
          btn.style.color = '#28a745';
          btn.title = 'Tắt hoạt động';
        } else {
          icon.className = 'fas fa-eye-slash';
          btn.style.color = '#dc3545';
          btn.title = 'Bật hoạt động';
        }
        alert(
          'Đã chuyển trạng thái thành: ' +
            (data.newStatus === 'active' ? 'Hoạt động' : 'Không hoạt động')
        );
      } else {
        alert(data.message || 'Chuyển trạng thái thất bại');
      }
    })
    .catch(() => alert('Có lỗi xảy ra!'));
}

//JS for login admin
document.addEventListener('DOMContentLoaded', function () {
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  // Toggle hiển thị mật khẩu
  if (togglePassword && passwordField) {
    togglePassword.addEventListener('click', function () {
      const type =
        passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);

      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }
});

//add user
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('addUserForm');
  const submitBtn = form.querySelector('.btn-submit');

  // Validation functions
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  function validateField(field, errorElement, validator) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'Trường này là bắt buộc';
    } else if (value && validator) {
      const result = validator(value);
      if (result !== true) {
        isValid = false;
        errorMessage = result;
      }
    }

    if (isValid) {
      field.classList.remove('error');
      errorElement.textContent = '';
    } else {
      field.classList.add('error');
      errorElement.textContent = errorMessage;
    }

    return isValid;
  }

  // Real-time validation
  document.getElementById('fullName').addEventListener('blur', function () {
    validateField(
      this,
      document.getElementById('fullNameError'),
      function (value) {
        if (value.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
        if (value.length > 100) return 'Họ tên không được vượt quá 100 ký tự';
        return true;
      }
    );
  });

  document.getElementById('email').addEventListener('blur', function () {
    validateField(
      this,
      document.getElementById('emailError'),
      function (value) {
        if (!validateEmail(value)) return 'Định dạng email không hợp lệ';
        return true;
      }
    );
  });

  document.getElementById('phone').addEventListener('blur', function () {
    const value = this.value.trim();
    if (value) {
      // Chỉ validate khi có nhập
      validateField(
        this,
        document.getElementById('phoneError'),
        function (value) {
          if (!validatePhone(value))
            return 'Số điện thoại phải có đúng 10 chữ số';
          return true;
        }
      );
    } else {
      // Clear error nếu không nhập (vì không bắt buộc)
      this.classList.remove('error');
      document.getElementById('phoneError').textContent = '';
    }
  });

  // Chỉ cho phép nhập số cho phone
  document.getElementById('phone').addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  document.getElementById('password').addEventListener('blur', function () {
    validateField(
      this,
      document.getElementById('passwordError'),
      function (value) {
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        if (value.length > 50) return 'Mật khẩu không được vượt quá 50 ký tự';
        return true;
      }
    );

    // Revalidate confirm password if it has value
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword.value) {
      confirmPassword.dispatchEvent(new Event('blur'));
    }
  });

  document
    .getElementById('confirmPassword')
    .addEventListener('blur', function () {
      const password = document.getElementById('password').value;
      validateField(
        this,
        document.getElementById('confirmPasswordError'),
        function (value) {
          if (value !== password) return 'Mật khẩu xác nhận không khớp';
          return true;
        }
      );
    });

  form.addEventListener('submit', function (e) {
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    let isValid = true;

    isValid &= validateField(
      fullName,
      document.getElementById('fullNameError'),
      function (value) {
        if (value.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
        if (value.length > 100) return 'Họ tên không được vượt quá 100 ký tự';
        return true;
      }
    );

    isValid &= validateField(
      email,
      document.getElementById('emailError'),
      function (value) {
        if (!validateEmail(value)) return 'Định dạng email không hợp lệ';
        return true;
      }
    );

    // Validate phone nếu có nhập
    if (phone.value.trim()) {
      isValid &= validateField(
        phone,
        document.getElementById('phoneError'),
        function (value) {
          if (!validatePhone(value))
            return 'Số điện thoại phải có đúng 10 chữ số';
          return true;
        }
      );
    }

    isValid &= validateField(
      password,
      document.getElementById('passwordError'),
      function (value) {
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        if (value.length > 50) return 'Mật khẩu không được vượt quá 50 ký tự';
        return true;
      }
    );

    isValid &= validateField(
      confirmPassword,
      document.getElementById('confirmPasswordError'),
      function (value) {
        if (value !== password.value) return 'Mật khẩu xác nhận không khớp';
        return true;
      }
    );

    if (!isValid) {
      e.preventDefault();
      return false;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  });
});
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('editUserForm');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  confirmPassword.addEventListener('input', function () {
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Mật khẩu xác nhận không khớp');
    } else {
      confirmPassword.setCustomValidity('');
    }
  });
});
