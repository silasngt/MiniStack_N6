// File: public/admin/js/scriptK.js
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔍 ScriptK.js loaded');

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
    console.log('👁️ View post:', postId);
    // TODO: Implement view post detail modal or page
    alert(`📖 Xem chi tiết bài viết #${postId}\n\n(Chức năng đang phát triển)`);
  };

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
            console.log('✅ Delete success:', data);

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

  console.log('✅ ScriptK.js initialization complete');
});
