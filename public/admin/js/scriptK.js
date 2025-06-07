document.addEventListener('DOMContentLoaded', function () {
  const imageUpload = document.getElementById('image-upload');
  const previewContainer = document.getElementById('imagePreviewContainer');
  if (imageUpload && previewContainer) {
    imageUpload.addEventListener('change', function (e) {
      const file = e.target.files[0]; // Chỉ lấy file đầu tiên

      // Clear previous preview
      previewContainer.innerHTML = '';

      if (file && file.type.startsWith('image/')) {
        createImagePreview(file);
      }
    });
  }

  function createImagePreview(file, index) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const previewDiv = document.createElement('div');
      previewDiv.className = 'image-preview single-image';
      previewDiv.dataset.index = index;

      previewDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-name">${file.name}</div>
            `;

      previewContainer.appendChild(previewDiv);
    };

    reader.readAsDataURL(file);
  }

  // Function để remove ảnh
  window.removeImage = function () {
    previewContainer.innerHTML = '';
    imageUpload.value = ''; // Clear input
  };

  // Form validation
  const form = document.querySelector('.create-post-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      const title = document.getElementById('title').value.trim();
      const content = document.getElementById('content').value.trim();
      const author = document.getElementById('author').value.trim();
      const selectedCategories = Array.from(
        document.getElementById('category').selectedOptions
      );

      if (!title || !content || !author) {
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
        submitBtn.textContent = 'ĐANG XỬ LÝ...';
      }
    });
  }
});
