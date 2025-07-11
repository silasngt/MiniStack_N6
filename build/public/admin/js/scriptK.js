// File: public/admin/js/scriptK.js
document.addEventListener('DOMContentLoaded', function () {
  // ===== ELEMENTS =====
  const imageUpload = document.getElementById('image-upload');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const uploadBox = document.getElementById('imageUploadBox');
  const currentImageInput = document.querySelector(
    'input[name="currentImage"]'
  );

  // ===== PAGE DETECTION =====
  const form = document.querySelector('.create-post-form');
  const isEditPage = form ? form.action.includes('/edit/') : false;
  const isIndexPage =
    window.location.pathname.includes('/admin/posts') && !isEditPage;
  const isProfilePage = window.location.pathname.includes('/admin/profile');

  // ===== PROFILE PAGE LOGIC =====
  if (isProfilePage) {
    // Profile page elements
    const basicInfoForm = document.getElementById('basicInfoForm');
    const passwordForm = document.getElementById('passwordForm');
    const avatarUpload = document.getElementById('avatar-upload');
    const currentAvatar = document.getElementById('current-avatar');
    const notificationArea = document.getElementById('notificationArea');

    // ===== PROFILE NOTIFICATION FUNCTION =====
    function showProfileNotification(message, type = 'info') {
      if (!notificationArea) {
        console.warn('⚠️ Notification area not found');
        return;
      }

      const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
      const icon =
        type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';

      notificationArea.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
          <i class="${icon}"></i>
          ${message}
          <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
          </button>
        </div>
      `;

      // Auto hide after 5 seconds
      setTimeout(() => {
        const alert = notificationArea.querySelector('.alert');
        if (alert) {
          alert.classList.remove('show');
          setTimeout(() => {
            alert.remove();
          }, 150);
        }
      }, 5000);
    }

    // ===== BASIC INFO FORM HANDLER =====
    if (basicInfoForm) {
      basicInfoForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.btn-save');
        const originalContent = submitBtn.innerHTML;

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

        try {
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);

          const response = await fetch('/admin/profile/update-basic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (result.success) {
            showProfileNotification(result.message, 'success');
            // Update displayed name in sidebar
            const nameTitle = document.querySelector('.admin-name-title');
            if (nameTitle) {
              nameTitle.textContent = data.fullName;
            }
          } else {
            showProfileNotification(result.message, 'error');
          }
        } catch (error) {
          console.error('❌ Basic info update error:', error);
          showProfileNotification(
            'Có lỗi xảy ra khi cập nhật thông tin!',
            'error'
          );
        } finally {
          // Restore button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }
      });
    }

    // ===== PASSWORD FORM HANDLER =====
    if (passwordForm) {
      // ✅ THÊM: Password strength checker
      const newPasswordInput = document.getElementById('newPassword');
      const strengthIndicator = document.getElementById(
        'passwordStrengthIndicator'
      );

      if (newPasswordInput && strengthIndicator) {
        newPasswordInput.addEventListener('input', function () {
          const password = this.value;
          const strength = checkPasswordStrength(password);

          if (password.length > 0) {
            strengthIndicator.style.display = 'block';
            updatePasswordStrengthUI(strength);
          } else {
            strengthIndicator.style.display = 'none';
          }
        });
      }

      // ✅ THÊM: Real-time password match validation
      const confirmPasswordInput = document.getElementById('confirmPassword');
      if (newPasswordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
          const newPassword = newPasswordInput.value;
          const confirmPassword = this.value;

          if (confirmPassword.length > 0) {
            if (newPassword === confirmPassword) {
              this.style.borderColor = '#28a745';
              this.style.backgroundColor = '#f8fff9';
            } else {
              this.style.borderColor = '#dc3545';
              this.style.backgroundColor = '#fff8f8';
            }
          } else {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
          }
        });
      }

      passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.btn-save');
        const originalContent = submitBtn.innerHTML;

        // Validate password match
        const currentPassword =
          document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword =
          document.getElementById('confirmPassword').value;

        if (!currentPassword) {
          showProfileNotification('Vui lòng nhập mật khẩu hiện tại!', 'error');
          document.getElementById('currentPassword').focus();
          return;
        }

        if (newPassword !== confirmPassword) {
          showProfileNotification(
            'Mật khẩu mới và xác nhận mật khẩu không khớp!',
            'error'
          );
          return;
        }

        if (newPassword.length < 6) {
          showProfileNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
          return;
        }

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Đang đổi...';

        try {
          const response = await fetch('/admin/profile/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currentPassword: currentPassword,
              newPassword: newPassword,
              confirmPassword: confirmPassword,
            }),
          });

          const result = await response.json();

          if (result.success) {
            showProfileNotification(result.message, 'success');
            // Clear password fields
            this.reset();
          } else {
            showProfileNotification(result.message, 'error');
          }
        } catch (error) {
          console.error('❌ Password change error:', error);
          showProfileNotification('Có lỗi xảy ra khi đổi mật khẩu!', 'error');
        } finally {
          // Restore button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }
      });
    }

    // ===== AVATAR UPLOAD HANDLER =====
    if (avatarUpload && currentAvatar) {
      avatarUpload.addEventListener('change', async function (e) {
        const file = e.target.files[0];

        if (file && file.type.startsWith('image/')) {
          const formData = new FormData();
          formData.append('avatar', file);

          // ✅ Prevent multiple simultaneous uploads
          if (avatarUpload.hasAttribute('data-uploading')) {
            console.log('⚠️ Upload already in progress...');
            return;
          }

          try {
            avatarUpload.setAttribute('data-uploading', 'true');
            // Show loading state
            const avatarEditIcon = document.querySelector('.avatar-edit i');
            if (avatarEditIcon) {
              avatarEditIcon.setAttribute(
                'data-original-class',
                avatarEditIcon.className
              );
              avatarEditIcon.className = 'fas fa-spinner fa-spin';
            }

            const response = await fetch('/admin/profile/upload-avatar', {
              method: 'POST',
              body: formData,
            });

            const result = await response.json();

            if (result.success) {
              const timestamp = new Date().getTime();
              currentAvatar.src = `${result.data.avatarUrl}?t=${timestamp}`;
              showProfileNotification(result.message, 'success');
            } else {
              showProfileNotification(result.message, 'error');
            }
          } catch (error) {
            console.error('❌ Avatar upload error:', error);
            showProfileNotification('Có lỗi xảy ra khi tải ảnh lên!', 'error');
          } finally {
            avatarUpload.removeAttribute('data-uploading');

            const avatarEditIcon = document.querySelector('.avatar-edit i');
            if (avatarEditIcon) {
              const originalClass =
                avatarEditIcon.getAttribute('data-original-class') ||
                'fas fa-pencil-alt';
              avatarEditIcon.className = originalClass;
              avatarEditIcon.removeAttribute('data-original-class');
            }
          }

          // Reset file input
          this.value = '';
        } else {
          showProfileNotification('Vui lòng chọn file ảnh hợp lệ!', 'error');
        }
      });
    }
  }
  // ===== IMAGE UPLOAD LOGIC (CREATE & EDIT PAGES) =====
  if (imageUpload && previewContainer) {
    imageUpload.addEventListener('change', function (e) {
      const file = e.target.files[0];

      if (isEditPage) {
        // Edit page logic
        if (file && file.type.startsWith('image/')) {
          const currentImage = previewContainer.querySelector('.current-image');
          if (currentImage) {
            currentImage.remove();
          }

          if (currentImageInput) {
            currentImageInput.value = '';
          }

          createNewImagePreview(file);

          if (uploadBox) {
            uploadBox.style.display = 'none';
          }
        }
      } else {
        // Create page logic
        previewContainer.innerHTML = '';

        if (file && file.type.startsWith('image/')) {
          createImagePreview(file);
        }
      }
    });
  }

  // ===== IMAGE PREVIEW FUNCTIONS =====
  function createImagePreview(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const previewDiv = document.createElement('div');
      previewDiv.className = 'image-preview single-image';
      previewDiv.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button type="button" class="remove-image" onclick="removeImage()">
          <i class="fas fa-times"></i>
        </button>
        <div class="image-name">${file.name}</div>
      `;

      previewContainer.appendChild(previewDiv);
    };

    reader.readAsDataURL(file);
  }

  function createNewImagePreview(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const previewDiv = document.createElement('div');
      previewDiv.className = 'image-preview single-image new-image';

      previewDiv.innerHTML = `
        <img src="${e.target.result}" alt="New image preview">
        <button type="button" class="remove-image" onclick="removeNewImage()">
          <i class="fas fa-times"></i>
        </button>
        <div class="image-name">${file.name}</div>
        <div class="image-status">Ảnh mới</div>
      `;

      previewContainer.appendChild(previewDiv);
    };

    reader.readAsDataURL(file);
  }

  function restoreCurrentImage(imageUrl) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview single-image current-image';

    previewDiv.innerHTML = `
      <img src="${imageUrl}" alt="Current image">
      <button type="button" class="btn-change-image" onclick="changeImage()">
        <i class="fas fa-edit"></i>
      </button>
      <div class="image-name">Ảnh hiện tại</div>
    `;

    previewContainer.appendChild(previewDiv);
    if (currentImageInput) {
      currentImageInput.value = imageUrl;
    }
    if (uploadBox) {
      uploadBox.style.display = 'none';
    }
  }

  // ===== GLOBAL FUNCTIONS (EXPOSED TO WINDOW) =====

  // Remove image (create page)
  window.removeImage = function () {
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
    if (imageUpload) {
      imageUpload.value = '';
    }
  };

  // Change image (edit page)
  window.changeImage = function () {
    const currentImage = previewContainer?.querySelector('.current-image');
    if (currentImage) {
      currentImage.remove();
    }
    if (currentImageInput) {
      currentImageInput.value = '';
    }
    if (uploadBox) {
      uploadBox.style.display = 'flex';
    }
  };

  // Remove new image (edit page)
  window.removeNewImage = function () {
    const newImage = previewContainer?.querySelector('.new-image');
    if (newImage) {
      newImage.remove();
    }
    if (imageUpload) {
      imageUpload.value = '';
    }
    if (uploadBox) {
      uploadBox.style.display = 'flex';
    }

    // Restore current image if exists
    const currentImageUrl = currentImageInput?.getAttribute('value');
    if (currentImageUrl) {
      restoreCurrentImage(currentImageUrl);
    }
  };

  // ===== POST MANAGEMENT FUNCTIONS =====

  // View post (index page)
  window.viewPost = function (postId) {
    // TODO: Implement view post detail modal or page
    alert(`📖 Xem chi tiết bài viết #${postId}\n\n(Chức năng đang phát triển)`);
  };

  // ✅ TOGGLE POST STATUS FUNCTION
  window.togglePostStatus = async function (postId) {
    // Find toggle button
    const toggleBtn = document.querySelector(`[data-post-id="${postId}"]`);
    const currentStatus = toggleBtn?.getAttribute('data-status');
    const isActive = currentStatus === 'active';

    // Confirm dialog
    const action = isActive ? 'tạm dừng' : 'kích hoạt';
    const confirmMessage = `🔄 XÁC NHẬN ${action.toUpperCase()} BÀI VIẾT

📝 Bạn có chắc chắn muốn ${action} bài viết #${postId}?

${
  isActive
    ? '⚠️ Bài viết sẽ bị ẩn khỏi website và không thể truy cập được.'
    : '✅ Bài viết sẽ được hiển thị trở lại trên website.'
}

Nhấn OK để xác nhận.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const originalContent = toggleBtn.innerHTML;
    const originalClass = toggleBtn.className;

    try {
      // Show loading state
      if (toggleBtn) {
        toggleBtn.disabled = true;
        toggleBtn.className = originalClass + ' btn-status-loading';
        toggleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }

      // Call toggle API
      const response = await fetch(`/admin/posts/toggle-status/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success notification
        showNotification(data.message, 'success');

        // Update UI
        updatePostStatusUI(postId, data.data.status, data.data.isActive);
      } else {
        // Server error
        console.error('❌ Toggle failed:', data);
        showNotification(
          data.message || '❌ Có lỗi xảy ra khi thay đổi trạng thái!',
          'error'
        );
        restoreToggleButton(
          toggleBtn,
          originalContent,
          originalClass,
          originalTitle
        );
      }
    } catch (error) {
      // Network error
      console.error('❌ Toggle error:', error);
      showNotification('❌ Lỗi kết nối! Vui lòng thử lại.', 'error');
      restoreToggleButton(
        toggleBtn,
        originalContent,
        originalClass,
        originalTitle
      );
    }
  };
  // ✅ HELPER: Restore toggle button to original state
  function restoreToggleButton(
    toggleBtn,
    originalContent,
    originalClass,
    originalTitle
  ) {
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.className = originalClass;
      toggleBtn.innerHTML = originalContent;
      toggleBtn.title = originalTitle;
      toggleBtn.style.opacity = '1';
      toggleBtn.style.pointerEvents = 'auto';
    }
  }

  // ✅ UPDATE POST STATUS UI
  function updatePostStatusUI(postId, newStatus, isActive) {
    const postRow = document.getElementById(`post-row-${postId}`);
    const toggleBtn = document.querySelector(`[data-post-id="${postId}"]`);
    const statusBadge = postRow?.querySelector('.post-status .badge');

    if (!postRow || !toggleBtn) {
      console.warn('⚠️ Could not find post row or toggle button');
      return;
    }

    // Update row styling
    if (isActive) {
      postRow.classList.remove('post-inactive');
      // Remove text-muted from all cells
      postRow.querySelectorAll('.text-muted').forEach((el) => {
        el.classList.remove('text-muted');
      });
    } else {
      postRow.classList.add('post-inactive');
      // Add text-muted to specific cells
      const cellsToMute = [
        '.post-title',
        '.post-content',
        '.post-author',
        '.post-category',
        '.post-date',
      ];
      cellsToMute.forEach((selector) => {
        const cell = postRow.querySelector(selector);
        if (cell) cell.classList.add('text-muted');
      });
    }

    // Update toggle button
    toggleBtn.setAttribute('data-status', newStatus);
    toggleBtn.title = isActive ? 'Tạm dừng bài viết' : 'Kích hoạt bài viết';

    // Update button classes
    toggleBtn.classList.remove(
      'btn-status-active',
      'btn-status-inactive',
      'btn-status-loading'
    );
    toggleBtn.classList.add(
      isActive ? 'btn-status-active' : 'btn-status-inactive'
    );

    // Update button icon
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = '';
      icon.className = isActive ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    // ✅ FORCE: Re-enable button (remove any loading state)
    toggleBtn.disabled = false;
    toggleBtn.style.opacity = '1';
    toggleBtn.style.pointerEvents = 'auto';

    // ✅ SMOOTH: Transition effect
    postRow.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      postRow.style.transition = '';
    }, 300);
  }

  // Edit post (index page)
  window.editPost = function (postId) {
    window.location.href = `/admin/posts/edit/${postId}`;
  };

  // ✅ DELETE POST FUNCTION - FIXED
  window.deletePost = function (postId) {
    // Enhanced confirm dialog
    const confirmMessage = `⚠️ XÁC NHẬN XÓA BÀI VIẾT #${postId}

🗑️ Bạn có chắc chắn muốn xóa bài viết này?
Nhấn OK để xác nhận xóa.`;

    if (confirm(confirmMessage)) {
      // Find delete button
      const deleteBtn = document.querySelector(
        `[onclick*="deletePost(${postId})"]`
      );
      const originalContent = deleteBtn?.innerHTML || '';

      // Show loading state
      if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Đang xóa...';
        deleteBtn.style.opacity = '0.6';
        deleteBtn.style.pointerEvents = 'none';
      }

      // Call delete API
      fetch(`/admin/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (response) => {
          const data = await response.json();

          if (response.ok && data.success) {
            // Show success notification
            showNotification('✅ Xóa bài viết thành công!', 'success');

            // Handle different pages
            if (isEditPage) {
              // Edit page - redirect to index
              setTimeout(() => {
                window.location.href = '/admin/posts?success=deleted';
              }, 1000);
            } else if (isIndexPage) {
              // Index page - remove row with animation
              const postRow = document.getElementById(`post-row-${postId}`);
              if (postRow) {
                postRow.style.transition = 'all 0.3s ease';
                postRow.style.opacity = '0';
                postRow.style.transform = 'translateX(-20px)';

                setTimeout(() => {
                  postRow.remove();

                  // Check if no posts left
                  const remainingRows = document.querySelectorAll('.post-row');
                  if (remainingRows.length === 0) {
                    setTimeout(() => {
                      location.reload(); // Show empty state
                    }, 500);
                  }
                }, 300);
              } else {
                // Fallback: reload page
                setTimeout(() => {
                  location.reload();
                }, 1000);
              }
            }
          } else {
            // Server error
            console.error('❌ Delete failed:', data);
            showNotification(
              data.message || '❌ Có lỗi xảy ra khi xóa bài viết!',
              'error'
            );

            // Restore button
            restoreDeleteButton(deleteBtn, originalContent);
          }
        })
        .catch((error) => {
          // Network error
          console.error('❌ Delete error:', error);
          showNotification('❌ Lỗi kết nối! Vui lòng thử lại.', 'error');

          // Restore button
          restoreDeleteButton(deleteBtn, originalContent);
        });
    }
  };

  // Helper function to restore delete button
  function restoreDeleteButton(deleteBtn, originalContent) {
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = originalContent;
      deleteBtn.style.opacity = '1';
      deleteBtn.style.pointerEvents = 'auto';
    }
  }

  // ===== NOTIFICATION SYSTEM =====
  function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-popup');
    if (existing) {
      existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification-popup notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 3000);
  }

  // Expose notification function
  window.showNotification = showNotification;

  // ===== FORM VALIDATION (CREATE & EDIT) =====
  if (form) {
    form.addEventListener('submit', function (e) {
      const title = document.getElementById('title')?.value.trim();
      const content = document.getElementById('content')?.value.trim();
      const selectedCategories = Array.from(
        document.getElementById('category')?.selectedOptions || []
      );

      if (!title || !content) {
        e.preventDefault();
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }

      if (selectedCategories.length === 0) {
        e.preventDefault();
        alert('Vui lòng chọn ít nhất một danh mục!');
        return;
      }

      // Show loading
      const submitBtn = document.querySelector('.btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditPage
          ? 'ĐANG CẬP NHẬT...'
          : 'ĐANG XỬ LÝ...';
      }
    });
  }

  // ===== SUCCESS MESSAGE AUTO HIDE (INDEX PAGE) =====
  if (isIndexPage) {
    const successAlert = document.querySelector('.alert-success');
    if (successAlert) {
      setTimeout(() => {
        successAlert.style.transition = 'opacity 0.3s ease';
        successAlert.style.opacity = '0';
        setTimeout(() => {
          successAlert.remove();
        }, 300);
      }, 3000);
    }
  }
});

// ✅ HELPER: Password strength checker
function checkPasswordStrength(password) {
  let score = 0;
  let suggestions = [];

  // Length check
  if (password.length >= 8) score += 1;
  else suggestions.push('• Sử dụng ít nhất 8 ký tự');

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('• Thêm chữ cái thường (a-z)');

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('• Thêm chữ cái hoa (A-Z)');

  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('• Thêm số (0-9)');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('• Thêm ký tự đặc biệt (!@#$%^&*)');

  // Determine level
  const levels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];

  return {
    score: score,
    level: levels[score] || 'Rất yếu',
    color: colors[score] || '#dc3545',
    suggestions: suggestions,
    percentage: (score / 5) * 100,
  };
}

// ✅ HELPER: Update password strength UI
function updatePasswordStrengthUI(strength) {
  const strengthFill = document.querySelector('.strength-fill');
  const strengthLevel = document.querySelector('.strength-level');

  if (strengthFill) {
    strengthFill.style.width = strength.percentage + '%';
    strengthFill.style.backgroundColor = strength.color;
    strengthFill.style.transition = 'all 0.3s ease';
  }

  if (strengthLevel) {
    strengthLevel.textContent = strength.level;
    strengthLevel.style.color = strength.color;
    strengthLevel.style.fontWeight = 'bold';
  }

  // THÊM: Xử lý phân trang
  if (isIndexPage) {
    // Lắng nghe click trên tất cả button phân trang
    document.addEventListener('click', function (e) {
      const target = e.target.closest('[button-pagination]');
      if (target) {
        e.preventDefault();

        const page = target.getAttribute('button-pagination');
        const currentUrl = new URL(window.location);

        // Cập nhật parameter page
        currentUrl.searchParams.set('page', page);

        // Chuyển hướng với parameter mới
        window.location.href = currentUrl.toString();
      }
    });
  }
}
