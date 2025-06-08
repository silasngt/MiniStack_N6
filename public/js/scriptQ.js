const showMessage = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;

  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  } else {
    notification.style.backgroundColor = '#2196F3';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
};

const addNotificationStyles = () => {
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length >= 10 && phoneDigits.length <= 11;
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateFormField = (field, value, fieldName) => {
  const errors = [];

  switch (field) {
    case 'email':
      if (!value || !value.trim()) {
        errors.push(`${fieldName} là bắt buộc`);
      } else if (!validateEmail(value)) {
        errors.push(`${fieldName} không hợp lệ`);
      }
      break;

    case 'fullname':
      if (!value || !value.trim()) {
        errors.push(`${fieldName} là bắt buộc`);
      } else if (value.trim().length < 2) {
        errors.push(`${fieldName} phải có ít nhất 2 ký tự`);
      }
      break;

    case 'phone':
      if (!value || !value.trim()) {
        errors.push(`${fieldName} là bắt buộc`);
      } else if (!validatePhone(value)) {
        errors.push(`${fieldName} không hợp lệ`);
      }
      break;

    case 'password':
      if (!value) {
        errors.push(`${fieldName} là bắt buộc`);
      } else if (!validatePassword(value)) {
        errors.push(`${fieldName} phải có ít nhất 6 ký tự`);
      }
      break;

    case 'gender':
      if (!value || !['Nam', 'Nữ', 'Khác'].includes(value)) {
        errors.push(`${fieldName} không hợp lệ`);
      }
      break;

    default:
      if (!value || !value.trim()) {
        errors.push(`${fieldName} là bắt buộc`);
      }
  }

  return errors;
};

// Real-time
const addRealTimeValidation = (formId, fieldConfigs) => {
  const form = document.getElementById(formId);
  if (!form) return;

  fieldConfigs.forEach((config) => {
    const field = document.getElementById(config.id);
    if (!field) return;

    const errorContainer = document.createElement('div');
    errorContainer.className = 'field-error';
    errorContainer.style.cssText =
      'color: #f44336; font-size: 12px; margin-top: 5px; display: none;';
    field.parentNode.appendChild(errorContainer);

    field.addEventListener('blur', () => {
      const errors = validateFormField(config.type, field.value, config.name);

      if (errors.length > 0) {
        errorContainer.textContent = errors[0];
        errorContainer.style.display = 'block';
        field.style.borderColor = '#f44336';
      } else {
        errorContainer.style.display = 'none';
        field.style.borderColor = '#4CAF50';
      }
    });

    field.addEventListener('input', () => {
      if (errorContainer.style.display === 'block') {
        const errors = validateFormField(config.type, field.value, config.name);
        if (errors.length === 0) {
          errorContainer.style.display = 'none';
          field.style.borderColor = '#4CAF50';
        }
      }
    });
  });
};

const setLoadingState = (formId, isLoading) => {
  const form = document.getElementById(formId);
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input, select, textarea');

  if (isLoading) {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang xử lý...';
    }
    inputs.forEach((input) => (input.disabled = true));
  } else {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || 'Gửi';
    }
    inputs.forEach((input) => (input.disabled = false));
  }
};

document.addEventListener('DOMContentLoaded', function () {
  addNotificationStyles();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.dataset.originalText = submitBtn.textContent;
    }

    addRealTimeValidation('loginForm', [
      { id: 'username', type: 'email', name: 'Email' },
      { id: 'password', type: 'password', name: 'Mật khẩu' },
    ]);
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.dataset.originalText = submitBtn.textContent;
    }

    addRealTimeValidation('signupForm', [
      { id: 'email', type: 'email', name: 'Email' },
      { id: 'fullname', type: 'fullname', name: 'Họ và tên' },
      { id: 'phone', type: 'phone', name: 'Số điện thoại' },
      { id: 'gender', type: 'gender', name: 'Giới tính' },
      { id: 'password', type: 'password', name: 'Mật khẩu' },
      { id: 'confirmPassword', type: 'password', name: 'Xác nhận mật khẩu' },
    ]);

    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');

    if (passwordField && confirmPasswordField) {
      const validatePasswordMatch = () => {
        if (
          confirmPasswordField.value &&
          passwordField.value !== confirmPasswordField.value
        ) {
          const errorContainer =
            confirmPasswordField.parentNode.querySelector('.field-error');
          if (errorContainer) {
            errorContainer.textContent = 'Mật khẩu xác nhận không khớp';
            errorContainer.style.display = 'block';
            confirmPasswordField.style.borderColor = '#f44336';
          }
        } else if (confirmPasswordField.value) {
          const errorContainer =
            confirmPasswordField.parentNode.querySelector('.field-error');
          if (errorContainer) {
            errorContainer.style.display = 'none';
            confirmPasswordField.style.borderColor = '#4CAF50';
          }
        }
      };

      passwordField.addEventListener('input', validatePasswordMatch);
      confirmPasswordField.addEventListener('input', validatePasswordMatch);
    }

    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      console.log('Form data being submitted:', data);

      const errors = [];
      errors.push(...validateFormField('email', data.email, 'Email'));
      errors.push(...validateFormField('fullname', data.fullname, 'Họ và tên'));
      errors.push(...validateFormField('phone', data.phone, 'Số điện thoại'));
      errors.push(...validateFormField('gender', data.gender, 'Giới tính'));
      errors.push(...validateFormField('password', data.password, 'Mật khẩu'));
      errors.push(
        ...validateFormField(
          'password',
          data.confirmPassword,
          'Xác nhận mật khẩu'
        )
      );

      // Kiểm tra mật khẩu
      if (
        data.password &&
        data.confirmPassword &&
        data.password !== data.confirmPassword
      ) {
        errors.push('Mật khẩu xác nhận không khớp');
      }

      if (errors.length > 0) {
        showMessage(errors[0], 'error');
        return;
      }

      setLoadingState('signupForm', true);

      try {
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          showMessage('Đăng ký thành công! Đang chuyển hướng...', 'success');

          if (result.user) {
            sessionStorage.setItem('user', JSON.stringify(result.user));
          }

          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        } else {
          showMessage(result.message || 'Đăng ký thất bại', 'error');

          if (
            result.validationErrors &&
            Array.isArray(result.validationErrors)
          ) {
            result.validationErrors.forEach((error) => {
              console.log('Validation error:', error);
            });
          }

          if (result.missingFields && Array.isArray(result.missingFields)) {
            result.missingFields.forEach((field) => {
              const fieldElement = document.getElementById(field);
              if (fieldElement) {
                fieldElement.style.borderColor = '#f44336';
                fieldElement.focus();
              }
            });
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        showMessage('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.', 'error');
      } finally {
        setLoadingState('signupForm', false);
      }
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const userId = this.dataset.userId;
      if (!userId) {
        showMessage('Không tìm thấy thông tin người dùng', 'error');
        return;
      }

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      setLoadingState('profileForm', true);

      try {
        const response = await fetch(`/auth/profile/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          showMessage('Cập nhật thông tin thành công!', 'success');

          if (result.user) {
            const currentUser = JSON.parse(
              sessionStorage.getItem('user') || '{}'
            );
            const updatedUser = { ...currentUser, ...result.user };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } else {
          showMessage(result.message || 'Cập nhật thất bại', 'error');
        }
      } catch (error) {
        console.error('Profile update error:', error);
        showMessage('Có lỗi xảy ra khi cập nhật thông tin', 'error');
      } finally {
        setLoadingState('profileForm', false);
      }
    });
  }

  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    addRealTimeValidation('changePasswordForm', [
      { id: 'currentPassword', type: 'password', name: 'Mật khẩu hiện tại' },
      { id: 'newPassword', type: 'password', name: 'Mật khẩu mới' },
      {
        id: 'confirmNewPassword',
        type: 'password',
        name: 'Xác nhận mật khẩu mới',
      },
    ]);

    const newPasswordField = document.getElementById('newPassword');
    const confirmNewPasswordField =
      document.getElementById('confirmNewPassword');

    if (newPasswordField && confirmNewPasswordField) {
      const validateNewPasswordMatch = () => {
        if (
          confirmNewPasswordField.value &&
          newPasswordField.value !== confirmNewPasswordField.value
        ) {
          const errorContainer =
            confirmNewPasswordField.parentNode.querySelector('.field-error');
          if (errorContainer) {
            errorContainer.textContent = 'Xác nhận mật khẩu mới không khớp';
            errorContainer.style.display = 'block';
            confirmNewPasswordField.style.borderColor = '#f44336';
          }
        } else if (confirmNewPasswordField.value) {
          const errorContainer =
            confirmNewPasswordField.parentNode.querySelector('.field-error');
          if (errorContainer) {
            errorContainer.style.display = 'none';
            confirmNewPasswordField.style.borderColor = '#4CAF50';
          }
        }
      };

      newPasswordField.addEventListener('input', validateNewPasswordMatch);
      confirmNewPasswordField.addEventListener(
        'input',
        validateNewPasswordMatch
      );
    }

    changePasswordForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const userId = this.dataset.userId;
      if (!userId) {
        showMessage('Không tìm thấy thông tin người dùng', 'error');
        return;
      }

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      const errors = [];
      errors.push(
        ...validateFormField(
          'password',
          data.currentPassword,
          'Mật khẩu hiện tại'
        )
      );
      errors.push(
        ...validateFormField('password', data.newPassword, 'Mật khẩu mới')
      );
      errors.push(
        ...validateFormField(
          'password',
          data.confirmNewPassword,
          'Xác nhận mật khẩu mới'
        )
      );

      if (
        data.newPassword &&
        data.confirmNewPassword &&
        data.newPassword !== data.confirmNewPassword
      ) {
        errors.push('Xác nhận mật khẩu mới không khớp');
      }

      if (
        data.currentPassword &&
        data.newPassword &&
        data.currentPassword === data.newPassword
      ) {
        errors.push('Mật khẩu mới phải khác mật khẩu hiện tại');
      }

      if (errors.length > 0) {
        showMessage(errors[0], 'error');
        return;
      }

      setLoadingState('changePasswordForm', true);

      try {
        const response = await fetch(`/auth/change-password/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          showMessage('Đổi mật khẩu thành công!', 'success');

          this.reset();

          setTimeout(() => {
            if (
              confirm(
                'Mật khẩu đã được thay đổi. Bạn có muốn đăng nhập lại không?'
              )
            ) {
              logout();
            }
          }, 2000);
        } else {
          showMessage(result.message || 'Đổi mật khẩu thất bại', 'error');
        }
      } catch (error) {
        console.error('Change password error:', error);
        showMessage('Có lỗi xảy ra khi đổi mật khẩu', 'error');
      } finally {
        setLoadingState('changePasswordForm', false);
      }
    });
  }
});

const checkAuthStatus = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const requireAuth = () => {
  const user = checkAuthStatus();
  if (!user) {
    showMessage('Vui lòng đăng nhập để tiếp tục', 'error');
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
    return false;
  }
  return true;
};

const updateAuthUI = () => {
  const user = checkAuthStatus();
  const authElements = document.querySelectorAll('[data-auth]');

  authElements.forEach((element) => {
    const authType = element.getAttribute('data-auth');

    if (authType === 'required' && !user) {
      element.style.display = 'none';
    } else if (authType === 'guest-only' && user) {
      element.style.display = 'none';
    } else {
      element.style.display = '';
    }
  });

  if (user) {
    const userNameElements = document.querySelectorAll('[data-user-name]');
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    const userAvatarElements = document.querySelectorAll('[data-user-avatar]');

    userNameElements.forEach((el) => (el.textContent = user.FullName || ''));
    userEmailElements.forEach((el) => (el.textContent = user.Email || ''));
    userAvatarElements.forEach((el) => {
      if (user.Avatar) {
        el.src = user.Avatar;
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', updateAuthUI);
window.logout = logout;
window.checkAuthStatus = checkAuthStatus;
window.requireAuth = requireAuth;
window.updateAuthUI = updateAuthUI;

//js for logout in sidebar
document
  .getElementById('sidebar-logout')
  ?.addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('sidebar-logout-form').submit();
  });
