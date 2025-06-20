// Helper: Xóa entity (user, category, document)
function deleteEntity(
  url,
  btn,
  successMsg = 'Xóa thành công',
  failMsg = 'Xóa không thành công'
) {
  if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const row = btn.closest('tr');
          if (row) row.remove();
          alert(successMsg);
        } else {
          alert(data.message || failMsg);
        }
      })
      .catch(() => alert('Có lỗi xảy ra khi xóa!'));
  }
}

function deleteCategory(id, btn) {
  deleteEntity(`/admin/categories/delete/${id}`, btn);
}
function deleteUser(id, btn) {
  deleteEntity(`/admin/user/delete/${id}`, btn);
}
function deleteDocument(id, btn) {
  deleteEntity(`/admin/document/delete/${id}`, btn);
}

// Toggle status (user, category, document)
function toggleStatus(type, id, btn) {
  fetch(`/admin/${type}/toggle-status/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const msg = `Bạn có muốn chuyển trạng thái thành: ${
          data.newStatus === 'active' ? 'Hoạt động' : 'Không hoạt động'
        }`;
        if (confirm(msg)) {
          const icon = btn.querySelector('i');
          if (icon) {
            icon.className =
              data.newStatus === 'active' ? 'fas fa-eye' : 'fas fa-eye-slash';
          }
          btn.style.color = data.newStatus === 'active' ? '#28a745' : '#dc3545';
          btn.title =
            data.newStatus === 'active' ? 'Tắt hoạt động' : 'Bật hoạt động';
          btn
            .closest('tr')
            .classList.toggle('inactive-row', data.newStatus !== 'active');
        }
      } else {
        alert(data.message || 'Chuyển trạng thái thất bại');
      }
    })
    .catch(() => alert('Có lỗi xảy ra!'));
}

// Toggle password visibility
document.addEventListener('DOMContentLoaded', function () {
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');
  if (togglePassword && passwordField) {
    togglePassword.addEventListener('click', function () {
      const type = passwordField.type === 'password' ? 'text' : 'password';
      passwordField.type = type;
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }
});

// Validation helpers
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return /^\d{10}$/.test(phone);
}
function validateField(field, errorElement, validator) {
  const value = field.value.trim();
  let isValid = true,
    errorMessage = '';
  if (field.required && !value) {
    isValid = false;
    errorMessage = 'Trường này là bắt buộc';
  } else if (value && validator) {
    const result = validator(value);
    if (result !== true) {
      isValid = false;
      errorMessage = result;
    }
  }
  field.classList.toggle('error', !isValid);
  errorElement.textContent = isValid ? '' : errorMessage;
  return isValid;
}

// Add user form validation
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('addUserForm');
  if (!form) return;
  const submitBtn = form.querySelector('.btn-submit');
  const fullName = form.querySelector('#fullName');
  const email = form.querySelector('#email');
  const phone = form.querySelector('#phone');
  const password = form.querySelector('#password');
  const confirmPassword = form.querySelector('#confirmPassword');

  fullName?.addEventListener('blur', () =>
    validateField(fullName, form.querySelector('#fullNameError'), (v) =>
      v.length < 2
        ? 'Họ tên phải có ít nhất 2 ký tự'
        : v.length > 100
        ? 'Họ tên không được vượt quá 100 ký tự'
        : true
    )
  );
  email?.addEventListener('blur', () =>
    validateField(email, form.querySelector('#emailError'), (v) =>
      !validateEmail(v) ? 'Định dạng email không hợp lệ' : true
    )
  );
  phone?.addEventListener('blur', function () {
    if (phone.value.trim()) {
      validateField(phone, form.querySelector('#phoneError'), (v) =>
        !validatePhone(v) ? 'Số điện thoại phải có đúng 10 chữ số' : true
      );
    } else {
      phone.classList.remove('error');
      form.querySelector('#phoneError').textContent = '';
    }
  });
  phone?.addEventListener('input', function () {
    phone.value = phone.value.replace(/[^0-9]/g, '');
  });
  password?.addEventListener('blur', () =>
    validateField(password, form.querySelector('#passwordError'), (v) =>
      v.length < 6
        ? 'Mật khẩu phải có ít nhất 6 ký tự'
        : v.length > 50
        ? 'Mật khẩu không được vượt quá 50 ký tự'
        : true
    )
  );
  confirmPassword?.addEventListener('blur', function () {
    validateField(
      confirmPassword,
      form.querySelector('#confirmPasswordError'),
      (v) => (v !== password.value ? 'Mật khẩu xác nhận không khớp' : true)
    );
  });

  form.addEventListener('submit', function (e) {
    let isValid = true;
    isValid &= validateField(
      fullName,
      form.querySelector('#fullNameError'),
      (v) =>
        v.length < 2
          ? 'Họ tên phải có ít nhất 2 ký tự'
          : v.length > 100
          ? 'Họ tên không được vượt quá 100 ký tự'
          : true
    );
    isValid &= validateField(email, form.querySelector('#emailError'), (v) =>
      !validateEmail(v) ? 'Định dạng email không hợp lệ' : true
    );
    if (phone.value.trim()) {
      isValid &= validateField(phone, form.querySelector('#phoneError'), (v) =>
        !validatePhone(v) ? 'Số điện thoại phải có đúng 10 chữ số' : true
      );
    }
    isValid &= validateField(
      password,
      form.querySelector('#passwordError'),
      (v) =>
        v.length < 6
          ? 'Mật khẩu phải có ít nhất 6 ký tự'
          : v.length > 50
          ? 'Mật khẩu không được vượt quá 50 ký tự'
          : true
    );
    isValid &= validateField(
      confirmPassword,
      form.querySelector('#confirmPasswordError'),
      (v) => (v !== password.value ? 'Mật khẩu xác nhận không khớp' : true)
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

// Edit user password confirm
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('editUserForm');
  if (!form) return;
  const newPassword = form.querySelector('#newPassword');
  const confirmPassword = form.querySelector('#confirmPassword');
  if (newPassword && confirmPassword) {
    confirmPassword.addEventListener('input', function () {
      confirmPassword.setCustomValidity(
        newPassword.value !== confirmPassword.value
          ? 'Mật khẩu xác nhận không khớp'
          : ''
      );
    });
  }
});
