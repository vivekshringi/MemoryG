
const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');
const closeMessage = document.getElementById('closeMessage');
const registerBtn = document.getElementById('register');
const suggestBtn = document.getElementById('suggest');


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

// Hide message function
function hideMessage() {
  messageContainer.style.display = 'none';
}

// Close button event
closeMessage.addEventListener('click', hideMessage);

async function suggestUser() {
  try {
    const response = await fetch('/randomUser');
    if (!response.ok) throw new Error('Failed to fetch cat suggestion');
    
    const user = await response.json();
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const email = document.querySelector('#email');
    const role = document.querySelector('#role');
    username.value = user.username;
    password.value = user.password;
    email.value = user.email;
    role.value = user.role;
    showMessage('User suggestion is successfully generated!', 'success');
  } catch (error) {
    console.error('Error loading cats:', error);
    showMessage('Failed to generate suggestion: ' + error.message, 'error');
  }
}

suggestBtn.addEventListener('click', suggestUser);

// Handle form submission
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = {
    username: formData.get('username'),
    password: formData.get('password'),
    email: formData.get('email'),
    role:formData.get('role')
  };
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register User');
    }
    
    const result = await response.json();
    console.log(result);
    showMessage(`User "${data.username}" is registered successfully!`, 'success');
    form.reset(); // clear form
  } catch (error) {
    console.error('Error registering user:', error);
    showMessage('Failed to register user: ' + error.message, 'error');
  }
});

