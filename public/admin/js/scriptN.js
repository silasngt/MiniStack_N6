

// Utility functions
const createFormData = (form) => {
  const formData = new FormData();
  
  // Add basic fields
  formData.append('title', form.querySelector('#title').value);
  formData.append('link', form.querySelector('#link').value);

  // Xử lý categories an toàn
  const categorySelect = form.querySelector('select[name="category[]"]');
  if (categorySelect) {
    const selectedCategories = Array.from(categorySelect.options)
      .filter(option => option.selected)
      .map(option => option.value);
      
    selectedCategories.forEach(cat => {
      formData.append('category[]', cat);
    });
  }

      

  // Handle image
  const imageInput = form.querySelector('#image-upload');
  if (imageInput && imageInput.files && imageInput.files[0]) {
    formData.append('thumbnail', imageInput.files[0]);
  }

  // Handle current thumbnail if exists
  const currentImage = form.querySelector('.preview-image');
  if (currentImage && currentImage.src) {
    formData.append('currentThumbnail', currentImage.getAttribute('src'));
  }

  return formData;
};

// Main document ready handler



   // Xử lý preview ảnh khi upload
  const handleImagePreview = () => {
  const fileInput = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-container');
    
    if (!fileInput || !previewContainer) return;

    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Kiểm tra file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        fileInput.value = '';
        return;
      }

      // Kiểm tra file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        fileInput.value = '';
        return;
      }

      // Tạo preview item
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';

      // Thêm loading
      const loading = document.createElement('div');
      loading.className = 'preview-loading';
      loading.innerHTML = '<span>Loading...</span>';
      previewItem.appendChild(loading);

      // Clear và thêm preview mới
      previewContainer.innerHTML = '';
      previewContainer.appendChild(previewItem);

      // Đọc và hiển thị ảnh
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.className = 'preview-image';
        img.src = event.target.result;
        
        img.onload = function() {
          // Xóa loading
          previewItem.removeChild(loading);
          
          // Thêm ảnh và nút xóa
          previewItem.appendChild(img);
          
          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-preview';
          removeBtn.innerHTML = '×';
          removeBtn.onclick = function(e) {
            e.preventDefault();
            previewContainer.removeChild(previewItem);
            fileInput.value = '';
          };
          previewItem.appendChild(removeBtn);
        };
      };

      reader.readAsDataURL(file);
    });
  };

  // Xử lý drag & drop
  const handleDragAndDrop = () => {
    const dropArea = document.querySelector('.upload-area');
    if (!dropArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('highlight');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('highlight');
      });
    });

    dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
  const fileInput = document.getElementById('image-upload');
      
      if (files.length > 0) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  };

// Xử lý sửa tài liệu
// Tìm hàm handleEdit và thay thế bằng code sau
// const handleEdit = () => {
//   const form = document.querySelector('.document-form');
//   if (!form) return;

//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     const id = form.getAttribute('action').split('/').pop().split('?')[0];

//     // Lấy dữ liệu form
//     formData.append('title', document.getElementById('title').value);
//     formData.append('link', document.getElementById('link').value);

//     // Xử lý categories an toàn
//     const categorySelect = document.querySelector('select[name="category[]"]');
//     if (categorySelect) {
//       const selectedCategories = [];
//       Array.from(categorySelect.options).forEach(option => {
//         if (option.selected) {
//           selectedCategories.push(option.value);
//         }
//       });
//       selectedCategories.forEach(cat => {
//         formData.append('category[]', cat);
//       });
//     }

//     // Xử lý file ảnh
//     const imageInput = document.getElementById('image-upload');
//     if (imageInput && imageInput.files[0]) {
//       formData.append('thumbnail', imageInput.files[0]);
//     }

//     // Thêm thumbnail hiện tại nếu có
//     const currentImage = document.querySelector('.preview-image');
//     if (currentImage) {
//       formData.append('currentThumbnail', currentImage.src);
//     }

//     try {
//       const response = await fetch(`/admin/document/edit/${id}`, {
//         method: 'PATCH',
//         body: formData // Gửi form data thay vì JSON
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const result = await response.json();
//       if (result.success) {
//         alert('Cập nhật thành công!');
//         window.location.href = '/admin/document';
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Có lỗi xảy ra: ' + error.message);
//     }
//   });
// };

// Xử lý cập nhật trạng thái
const handleStatusUpdate = () => {
  const statusButtons = document.querySelectorAll('.btn-status');
  
  statusButtons.forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = this.dataset.id;
      const newStatus = this.dataset.status === 'active' ? 'inactive' : 'active';

      try {
        const response = await fetch(`/admin/document/status/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();
        if (result.success) {
          this.dataset.status = newStatus;
          this.textContent = newStatus === 'active' ? 'Hoạt động' : 'Tạm dừng';
          alert(result.message);
        }
      } catch (error) {
        alert('Có lỗi xảy ra');
      }
    });
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // ...existing code...
  handleEdit();
  handleStatusUpdate();
});
const handleStatusToggle = () => {
  const toggleButtons = document.querySelectorAll('.btn-toggle-status');
  
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = this.dataset.id;
      const currentStatus = this.dataset.status;
      const icon = this.querySelector('.fas');

      try {
        const response = await fetch(`/admin/document/status/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: currentStatus
          })
        });

        const result = await response.json();

        if (result.success) {
          // Cập nhật UI
          const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
          
          // Cập nhật data-status
          this.dataset.status = newStatus;
          
          // Cập nhật icon
          icon.className = `fas ${newStatus === 'active' ? 'fa-eye' : 'fa-eye-slash'}`;
          
          // Cập nhật tooltip
          this.title = newStatus === 'active' ? 'Click để ẩn tài liệu' : 'Click để hiện tài liệu';

          // Thông báo thành công
          toastr.success(result.message);
        }
      } catch (error) {
        console.error('Error:', error);
        toastr.error('Có lỗi xảy ra khi cập nhật trạng thái');
      }
    });
  });
};

// Thêm vào DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
     handleImagePreview();
   handleDragAndDrop()
  handleStatusToggle();
  handleEdit();
  // ...existing code...

});