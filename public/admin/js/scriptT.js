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

  // ✏️ Edit title
document.querySelectorAll('.forum-btn-edit').forEach(btn => {
  btn.addEventListener('click', () => {
    const tr = btn.closest('tr');
    const tdContent = tr.querySelector('.forum-td-content');
    const topicId = btn.dataset.id;

    const currentText = tdContent.textContent.trim();

    tdContent.innerHTML = `
      <input type="text" value="${currentText}" class="forum-input-edit" />
      <button class="forum-btn-save">Lưu</button>
    `;

    tdContent.querySelector('.forum-btn-save').addEventListener('click', async () => {
      const newText = tdContent.querySelector('.forum-input-edit').value.trim();

      const res = await fetch(`/admin/forumManager/update-title/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Title: newText }),
      });

      if (res.ok) {
        tdContent.textContent = newText;
      } else {
        alert("Cập nhật thất bại. Vui lòng thử lại.");
      }
    });
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
