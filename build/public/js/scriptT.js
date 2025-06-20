console.log('Script loaded successfully');

// Khởi tạo khi DOM đã tải
document.addEventListener('DOMContentLoaded', () => {
  // -----------------------
  // Phần 1: Logic cho Chat
  // -----------------------
  const chatForm = document.querySelector('.chat-ui__form');
  const chatInput = document.querySelector('.chat-ui__input');
  const chatBox = document.querySelector('.chat-ui__chatbox');
  const messageGroup = document.querySelector('.chat-ui__chatbox .chat-ui__message-group');

  if (chatForm && chatInput && chatBox && messageGroup) {
    let isFirstMessage = true;
    let userMessageCount = 0;

    // Cuộn xuống tin nhắn cuối cùng
    function scrollToBottom() {
      requestAnimationFrame(() => {
        const lastMessage = messageGroup.querySelector('.chat-ui__message:last-child');
        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
    }

    // Xử lý submit form chat
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      // Ẩn tin nhắn mặc định khi gửi tin đầu tiên
      if (isFirstMessage) {
        const defaultMessages = messageGroup.querySelectorAll('.chat-ui__message');
        defaultMessages.forEach((msg) => (msg.style.display = 'none'));
        isFirstMessage = false;
      }

      userMessageCount++;

      // Thêm tin nhắn người dùng
      messageGroup.classList.add('has-user-message');
      const userMsg = document.createElement('div');
      userMsg.className = `chat-ui__message chat-ui__message--right ${userMessageCount >= 2 ? 'extra-margin' : ''}`;
      userMsg.textContent = message;
      messageGroup.appendChild(userMsg);
      scrollToBottom();

      chatInput.value = '';

      // Hiển thị tin nhắn "AI đang trả lời..."
      const typingMsg = document.createElement('div');
      typingMsg.className = 'chat-ui__message chat-ui__message--left typing';
      typingMsg.textContent = 'AI đang trả lời...';
      messageGroup.appendChild(typingMsg);
      scrollToBottom();

      try {
        const res = await fetch('/chatBox/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });

        // Xóa tin nhắn "typing" sau khi nhận phản hồi
        if (messageGroup.contains(typingMsg)) {
          messageGroup.removeChild(typingMsg);
        }

        if (!res.ok) {
          let errorMessage = `Lỗi server: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.reply || errorMessage;
          } catch (parseError) {
            console.error('Không thể phân tích lỗi:', parseError);
          }

          const lastUserMsg = messageGroup.querySelector('.chat-ui__message--right.extra-margin:last-of-type');
          if (lastUserMsg) lastUserMsg.classList.remove('extra-margin');

          const errMsg = document.createElement('div');
          errMsg.className = 'chat-ui__message chat-ui__message--left error-message';
          errMsg.textContent = errorMessage;
          messageGroup.appendChild(errMsg);
          scrollToBottom();
          return;
        }

        const data = await res.json();
        const lastUserMsg = messageGroup.querySelector('.chat-ui__message--right.extra-margin:last-of-type');
        if (lastUserMsg) lastUserMsg.classList.remove('extra-margin');

        // Thêm tin nhắn bot
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-ui__message chat-ui__message--left';
        botMsg.textContent = data.reply || 'Không có phản hồi từ AI';
        messageGroup.appendChild(botMsg);
        scrollToBottom();
      } catch (err) {
        console.error('Lỗi frontend:', err);

        if (messageGroup.contains(typingMsg)) {
          messageGroup.removeChild(typingMsg);
        }

        const lastUserMsg = messageGroup.querySelector('.chat-ui__message--right.extra-margin:last-of-type');
        if (lastUserMsg) lastUserMsg.classList.remove('extra-margin');

        const errMsg = document.createElement('div');
        errMsg.className = 'chat-ui__message chat-ui__message--left error-message';
        errMsg.textContent = `Lỗi: ${err.message}`;
        messageGroup.appendChild(errMsg);
        scrollToBottom();
      }
    });
  } else {
    console.error('Không tìm thấy các phần tử DOM cho chat');
  }

  // -----------------------
  // Phần 2: Logic cho Code Compiler
  // -----------------------
  const compileForm = document.querySelector('.code-compile__form');
  const outputBox = document.querySelector('.code-compile__output');

  if (compileForm && outputBox) {
    // Xử lý submit form compiler
    compileForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Ngăn reload trang

      const formData = new FormData(compileForm);
      const language = formData.get('language');
      const code = formData.get('code');

      try {
        const response = await fetch('/compile/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, code }),
        });

        const html = await response.text();

        // Tạo DOM tạm để lấy nội dung output
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const result = doc.querySelector('.code-compile__output')?.innerHTML || '// No output';

        // Cập nhật kết quả
        outputBox.innerHTML = result;
      } catch (error) {
        outputBox.innerHTML = '// Đã xảy ra lỗi khi gửi yêu cầu.';
        console.error('Lỗi compiler:', error);
      }
    });
  } else {
    console.error('Không tìm thấy các phần tử DOM cho compiler');
  }
});