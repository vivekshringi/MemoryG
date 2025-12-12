const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');
const navbarLinks = document.querySelectorAll('.navbar-link');
const logoutBtn = document.getElementById('logoutBtn');
const navLoginBtn = document.getElementById('login');

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function showMessage(message, type = 'info') {
  messageText.textContent = message;
  messageContainer.className = `message-container ${type}`;
  messageContainer.style.display = 'flex';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideMessage();
  }, 500);
}


onload = () => {
  console.log(getCookie('Authorization'));
  if (getCookie('Authorization')) {
    navLoginBtn.style.display = 'none';
    const usernameDisplay = document.getElementById('usernameDisplay');
    const userRole = document.getElementById('userRole');
    // Assuming the username and role are stored in cookies for simplicity
    usernameDisplay.textContent = `Welcome, ${getCookie('username') || 'User'}`;
    usernameDisplay.className = 'username-display';
    userRole.textContent = `Role: ${getCookie('role') || 'N/A'}`;
    userRole.className = 'role-display';
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'navbar-link';
    navbarMenu.appendChild(logoutBtn);
    logoutBtn.addEventListener('click', async () => {
    // Remove cookies
    document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Show logout message
    showMessage('Logged out successfully', 'success');
    // Redirect to login
    window.location.href = '/login';
  });
  } else {
    // User is not logged in
    console.log('User is not logged in');
  }
};
// Toggle mobile menu
navbarToggle.addEventListener('click', () => {
  navbarToggle.classList.toggle('active');
  navbarMenu.classList.toggle('active');
});

// Close menu when a link is clicked
navbarLinks.forEach(link => {
  link.addEventListener('click', () => {
    navbarToggle.classList.remove('active');
    navbarMenu.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar')) {
    navbarToggle.classList.remove('active');
    navbarMenu.classList.remove('active');
  }
});