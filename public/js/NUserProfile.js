document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("edit-info");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  editBtn.addEventListener("click", () => {
    const isReadOnly = nameInput.hasAttribute("readonly");

    if (isReadOnly) {
      nameInput.removeAttribute("readonly");
      phoneInput.removeAttribute("readonly");
      nameInput.focus();
      editBtn.textContent = "Lưu";
    } else {
      nameInput.setAttribute("readonly", true);
      phoneInput.setAttribute("readonly", true);
      editBtn.textContent = "Chỉnh sửa";
      alert("Đã lưu thông tin cá nhân!");
    }
  });
});
