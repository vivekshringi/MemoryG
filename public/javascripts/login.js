
const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');
const closeMessage = document.getElementById('closeMessage');
const loginBtn = document.getElementById('login');
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

function successLogin(user) {
  loginBtn.textContent="Logout";
  document.getElementById('emailForm').style.display ='none';
  document.getElementById('passwordForm').style.display ='none';
  registerBtn.textContent = user;
  registerBtn.disabled='true';
}

// Hide message function
function hideMessage() {
  messageContainer.style.display = 'none';
}

registerBtn.addEventListener('click', ()=>{
  window.location.href = "/register"
});

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
    successLogin(data.email);
  } catch (error) {
    console.error('Error perform login:', error);
    showMessage('Failed to perform login: ' + error.message, 'error');
  }
});