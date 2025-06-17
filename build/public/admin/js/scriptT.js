document.addEventListener('DOMContentLoaded', () => {
  // 👁 Toggle status (active/inactive)
  document.querySelectorAll('.forum-btn-view').forEach(btn => {
    btn.addEventListener('click', async () => {
      const topicId = btn.dataset.id;
      const icon = btn.querySelector('i');
      const currentStatus = btn.dataset.status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const res = await fetch(`/admin/forumManager/update-status/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        btn.dataset.status = newStatus;
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  });

  // ✏️ Edit title - FIXED VERSION
  document.querySelectorAll('.forum-btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const tr = btn.closest('tr');
      const tdContent = tr.querySelector('.forum-td-content');
      const topicId = btn.dataset.id;

      // Kiểm tra xem đã đang trong chế độ chỉnh sửa chưa
      if (tdContent.querySelector('.forum-input-edit')) {
        return; // Đã đang chỉnh sửa, không làm gì cả
      }

      // Lấy nội dung hiện tại (chỉ text, không có thẻ HTML)
      const currentText = tdContent.textContent.trim();

      // Tạo input và nút lưu
      tdContent.innerHTML = `
        <input type="text" value="${currentText}" class="forum-input-edit" />
        <button class="forum-btn-save">Lưu</button>
      `;

      // Xử lý nút Lưu
      tdContent.querySelector('.forum-btn-save').addEventListener('click', async () => {
        const newText = tdContent.querySelector('.forum-input-edit').value.trim();

        const res = await fetch(`/admin/forumManager/update-title/${topicId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Title: newText }),
        });

        if (res.ok) {
          // Cập nhật nội dung hiển thị
          tdContent.textContent = newText;
        } else {
          alert("Cập nhật thất bại. Vui lòng thử lại.");
          // Khôi phục nội dung gốc
          tdContent.textContent = currentText;
        }
      });

      // Focus vào input
      tdContent.querySelector('.forum-input-edit').focus();
    });
  });

  // 🗑 Xóa bài
  document.querySelectorAll('.forum-btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const topicId = btn.dataset.id;
      if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

      const res = await fetch(`/admin/forumManager/delete/${topicId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const tr = btn.closest('tr');
        tr.remove(); // Xóa khỏi giao diện
      }
    });
  });
});