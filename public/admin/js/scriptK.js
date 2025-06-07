document.addEventListener('DOMContentLoaded', function () {
  const imageUpload = document.getElementById('image-upload');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const uploadBox = document.getElementById('imageUploadBox');
  const currentImageInput = document.querySelector(
    'input[name="currentImage"]'
  );

  // Detect if this is edit page or create page
  const isEditPage = document
    .querySelector('.create-post-form')
    .action.includes('/edit/');

  if (imageUpload && previewContainer) {
    imageUpload.addEventListener('change', function (e) {
      const file = e.target.files[0]; // Chỉ lấy file đầu tiên

      if (isEditPage) {
        // Edit page logic
        if (file && file.type.startsWith('image/')) {
          // Xóa ảnh hiện tại
          const currentImage = previewContainer.querySelector('.current-image');
          if (currentImage) {
            currentImage.remove();
          }

          // Clear hidden input
          if (currentImageInput) {
            currentImageInput.value = '';
          }

          // Tạo preview mới
          createNewImagePreview(file);

          // Ẩn upload box
          if (uploadBox) {
            uploadBox.style.display = 'none';
          }
        }
      } else {
        // Create page logic
        // Clear previous preview
        previewContainer.innerHTML = '';

        if (file && file.type.startsWith('image/')) {
          createImagePreview(file);
        }
      }
    });
  }

  // Create page image preview
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

  // Edit page new image preview
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

  // Function để remove ảnh (create page)
  window.removeImage = function () {
    previewContainer.innerHTML = '';
    imageUpload.value = ''; // Clear input
  };

  // Function để thay đổi ảnh (edit page)
  window.changeImage = function () {
    const currentImage = previewContainer.querySelector('.current-image');
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

  // Function để xóa ảnh mới (edit page)
  window.removeNewImage = function () {
    const newImage = previewContainer.querySelector('.new-image');
    if (newImage) {
      newImage.remove();
    }
    imageUpload.value = '';
    if (uploadBox) {
      uploadBox.style.display = 'flex';
    }

    // Restore current image if exists
    const currentImageUrl = currentImageInput
      ? currentImageInput.getAttribute('value')
      : null;
    if (currentImageUrl) {
      restoreCurrentImage(currentImageUrl);
    }
  };

  // Function để khôi phục ảnh hiện tại (edit page)
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

  // Function để xóa bài viết (edit page)
  window.deletePost = function (postId) {
    if (
      confirm(
        '⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA BÀI VIẾT NÀY?\n\nHành động này không thể hoàn tác!'
      )
    ) {
      // Show loading
      const deleteBtn = document.querySelector('.btn-delete');
      if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'ĐANG XÓA...';
      }

      fetch(`/admin/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            alert('✅ Xóa bài viết thành công!');
            window.location.href = '/admin/posts?success=deleted';
          } else {
            alert('❌ Có lỗi xảy ra khi xóa bài viết!');
            if (deleteBtn) {
              deleteBtn.disabled = false;
              deleteBtn.textContent = 'XÓA BÀI VIẾT';
            }
          }
        })
        .catch((error) => {
          console.error('Delete error:', error);
          alert('❌ Có lỗi xảy ra khi xóa bài viết!');
          if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'XÓA BÀI VIẾT';
          }
        });
    }
  };

  // Form validation (both create and edit)
  const form = document.querySelector('.create-post-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      const title = document.getElementById('title').value.trim();
      const content = document.getElementById('content').value.trim();
      const selectedCategories = Array.from(
        document.getElementById('category').selectedOptions
      );

      // ✅ FIX: Xóa validation author vì đã không có field này
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

      // Show loading với text khác nhau cho create/edit
      const submitBtn = document.querySelector('.btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        if (isEditPage) {
          submitBtn.textContent = 'ĐANG CẬP NHẬT...';
        } else {
          submitBtn.textContent = 'ĐANG XỬ LÝ...';
        }
      }
    });
  }
});
