console.log('Script loaded successfully');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  console.log('Form element:', document.querySelector('.chat-ui__form'));
  console.log('Input element:', document.querySelector('.chat-ui__input'));
  console.log('Chat box element:', document.querySelector('.chat-ui__chatbox'));
  console.log('Message group element:', document.querySelector('.chat-ui__chatbox .chat-ui__message-group'));
});

const form = document.querySelector('.chat-ui__form');
const input = document.querySelector('.chat-ui__input');
const chatBox = document.querySelector('.chat-ui__chatbox');
const messageGroup = document.querySelector('.chat-ui__chatbox .chat-ui__message-group');

let isFirstMessage = true;
let userMessageCount = 0;

function scrollToBottom() {
  requestAnimationFrame(() => {
    const lastMessage = messageGroup.querySelector('.chat-ui__message:last-child');
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      console.log('Scrolled to last message:', lastMessage);
    } else {
      console.log('No messages found to scroll to');
    }
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  
  console.log('Sending message:', message);
  
  if (!message) return;

  if (isFirstMessage) {
    const defaultMessages = messageGroup.querySelectorAll('.chat-ui__message');
    defaultMessages.forEach(msg => {
      msg.style.display = 'none';
    });
    isFirstMessage = false;
  }

  userMessageCount++;

  messageGroup.classList.add('has-user-message');

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-ui__message chat-ui__message--right';
  if (userMessageCount >= 2) {
    userMsg.classList.add('extra-margin');
  }
  userMsg.textContent = message;
  messageGroup.appendChild(userMsg);

  scrollToBottom();

  input.value = '';

  const typingMsg = document.createElement('div');
  typingMsg.className = 'chat-ui__message chat-ui__message--left typing';
  typingMsg.textContent = 'AI đang trả lời...';
  messageGroup.appendChild(typingMsg);
  scrollToBottom();

  try {
    console.log('Making request to /chatBox/ask');
    
    const res = await fetch('/chatBox/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);

    if (messageGroup.contains(typingMsg)) {
      messageGroup.removeChild(typingMsg);
    }

    if (!res.ok) {
      let errorMessage = `Server error: ${res.status}`;
      try {
        const errorData = await res.json();
        console.log('Full Error data:', errorData);
        errorMessage = errorData.reply || errorData.error || errorMessage;
      } catch (parseError) {
        console.log('Could not parse error response');
      }
      
      const lastUserMsg = messageGroup.querySelector('.chat-ui__message--right.extra-margin:last-of-type');
      if (lastUserMsg) {
        lastUserMsg.classList.remove('extra-margin');
      }

      const errMsg = document.createElement('div');
      errMsg.className = 'chat-ui__message chat-ui__message--left error-message';
      errMsg.textContent = errorMessage;
      messageGroup.appendChild(errMsg);
      scrollToBottom();
      return;
    }

    const data = await res.json();
    console.log('Response data:', data);
    
    const lastUserMsg = messageGroup.querySelector('.chat-ui__message--right.extra-margin:last-of-type');
    if (lastUserMsg) {
      lastUserMsg.classList.remove('extra-margin');
    }

    const botMsg = document.createElement('div');
    botMsg.className = 'chat-ui__message chat-ui__message--left';
    botMsg.textContent = data.reply || 'Không có phản hồi từ AI';
    messageGroup.appendChild(botMsg);
    
    scrollToBottom();
    
  } catch (err) {
    console.error('Frontend error:', err);
    
    if (messageGroup.contains(typingMsg)) {
      messageGroup.removeChild(typingMsg);
    }
    
    const lastUserMsg = messageGroup.querySelector('.chat-ui__message--right.extra-margin:last-of-type');
    if (lastUserMsg) {
      lastUserMsg.classList.remove('extra-margin');
    }

    const errMsg = document.createElement('div');
    errMsg.className = 'chat-ui__message chat-ui__message--left error-message';
    errMsg.textContent = 'Có lỗi xảy ra: ' + err.message;
    messageGroup.appendChild(errMsg);
    scrollToBottom();
  }
});




  document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.code-compile__form');
  const outputBox = document.querySelector('.code-compile__output');
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn reload trang

    const formData = new FormData(form);
    const language = formData.get('language');
    const code = formData.get('code');

    // Gửi yêu cầu POST đến server
    try {
      const response = await fetch('/compile/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language, code })
      });

      const html = await response.text();

      // Tạo 1 DOM tạm để lấy nội dung output
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const result = doc.querySelector('.code-compile__output')?.innerHTML || '// No output';

      // Cập nhật kết quả phía client
      outputBox.innerHTML = result;
    } catch (error) {
      outputBox.innerHTML = '// Đã xảy ra lỗi khi gửi yêu cầu.';
      console.error(error);
    }
  });
});
