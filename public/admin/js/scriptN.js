// Xử lý form submit
document.addEventListener('DOMContentLoaded', function() {
  const documentForm = document.querySelector('.document-form');
  if (documentForm) {
    documentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const formData = new FormData(this);
        
        // Lấy các category được chọn và thêm vào formData
        const categorySelect = document.getElementById('category');
        const selectedCategories = Array.from(categorySelect.selectedOptions)
          .map(option => option.value);
        
        // Xóa categories cũ và thêm mảng mới
        formData.delete('category');
        selectedCategories.forEach(cat => {
          formData.append('category', cat);
        });

        const response = await fetch('/admin/document/create', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          alert(result.message);
          window.location.href = '/admin/document';
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
      }
    });
  }

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

  // Khởi tạo các handlers
  handleImagePreview();
  handleDragAndDrop();

  // Xử lý multiple select
  const categorySelect = document.getElementById('category');
  if (categorySelect) {
    // Thêm tooltip khi hover
    categorySelect.title = "Giữ Ctrl + Click để chọn nhiều danh mục";
    
    // Thêm style cho selected options
    categorySelect.addEventListener('change', function() {
      Array.from(this.options).forEach(option => {
        if (option.selected) {
          option.classList.add('selected');
        } else {
          option.classList.remove('selected');
        }
      });
    });
  }

  // Xử lý các nút pagination
  const handlePagination = () => {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.addEventListener('click', async (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const currentPage = parseInt(document.querySelector('.btn-page.active')?.textContent || '1');
      let newPage = currentPage;

      if (target.classList.contains('btn-prev')) {
        newPage = currentPage - 1;
      } else if (target.classList.contains('btn-next')) {
        newPage = currentPage + 1;
      } else if (target.classList.contains('btn-page')) {
        newPage = parseInt(target.textContent);
      }

      if (newPage !== currentPage) {
        window.location.href = `/admin/document?page=${newPage}`;
      }
    });
  };

  // Xử lý xóa tài liệu
  const handleDelete = () => {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

        const id = this.dataset.id;
        try {
          const response = await fetch(`/admin/document/${id}`, {
            method: 'DELETE'
          });

          const result = await response.json();

          if (result.success) {
            alert(result.message);
            window.location.reload();
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          alert('Có lỗi xảy ra: ' + error.message);
        }
      });
    });
  };

  // Xử lý hover hiển thị tooltip cho categories dài
  const handleCategoryTooltips = () => {
    const categorysCells = document.querySelectorAll('.categories-cell');
    categorysCells.forEach(cell => {
      if (cell.scrollWidth > cell.clientWidth) {
        cell.title = cell.textContent;
      }
    });
  };

  // Initialize
  handlePagination();
  handleDelete();
  handleCategoryTooltips();
});
// Xử lý sửa tài liệu
const handleEdit = () => {
  const editForm = document.querySelector('#edit-document-form');
  if (!editForm) return;

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(editForm);
    const id = editForm.dataset.id;

    try {
      const response = await fetch(`/admin/document/edit/${id}`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        window.location.href = '/admin/document';
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  });
};

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