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
