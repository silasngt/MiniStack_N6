//JS for login

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
  field.setAttribute('type', type);
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    e.preventDefault();
    alert('Vui lòng nhập đầy đủ thông tin!');
    return false;
  }
});

//JS for register
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
  field.setAttribute('type', type);
}

document.getElementById('signupForm').addEventListener('submit', function (e) {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    e.preventDefault();
    alert('Mật khẩu xác nhận không khớp!');
    return false;
  }
});
