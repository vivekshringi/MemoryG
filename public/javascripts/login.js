const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');
const closeMessage = document.getElementById('closeMessage');
const loginBtn = document.getElementById('loginUser');
const registerBtn = document.getElementById('register');
// Message display function
function showMessage(message, type = 'info') {
  messageText.textContent = message;
  messageContainer.className = `message-container ${type}`;
  messageContainer.style.display = 'flex';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideMessage();
  }, 5000);
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Hide message function
function hideMessage() {
  messageContainer.style.display = 'none';
}

// Close button event
closeMessage.addEventListener('click', hideMessage);

const form = document.querySelector('form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform login');
    }
    const result = await response.json();
    console.log(result);
    showMessage(result.message, 'success');
    window.location.href = '/memorygame';
  } catch (error) {
    console.error('Error perform login:', error);
    showMessage('Failed to perform login: ' + error.message, 'error');
  }
});