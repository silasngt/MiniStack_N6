// alert-messageAdd commentMore actions
const alertMessage = document.querySelector('[alert-message]');
if (alertMessage) {
  setTimeout(() => {
    alertMessage.style.display = 'none';
  }, 3000);
}
// End alert-message
// Phân trang
const listButtonPagination = document.querySelectorAll('[button-pagination]');
if (listButtonPagination.length > 0) {
  let url = new URL(location.href);
  listButtonPagination.forEach((button) => {
    button.addEventListener('click', () => {
      const page = button.getAttribute('button-pagination');

      if (page) {
        url.searchParams.set('page', page);
      } else {
        url.searchParams.set('page');
      }
      location.href = url;
    });
  });
  // Hiển thị mặc định
  const pageCurrent = url.searchParams.get('page') || 1;
  const buttonCurrent = document.querySelector(
    `[button-pagination="${pageCurrent}"]`
  );
  if (buttonCurrent) {
    buttonCurrent.parentNode.classList.add('active');
  }
}
// Hết Phân trang

//Chuyển Menu đến đúng trang đang đứng
document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-item').forEach(function (item) {
    // Xóa active cũ
    item.classList.remove('active');
    // Nếu href trùng path hoặc path bắt đầu bằng href (cho các trang con)
    if (
      item.getAttribute('href') === path ||
      (item.getAttribute('href') !== '/' && path.startsWith(item.getAttribute('href')))
    ) {
      item.classList.add('active');
    }
  });
});
//Hết Chuyển Menu đến đúng trang đang đứng