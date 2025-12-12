const viewAllBtn = document.getElementById('viewAllBtn');
const deleteBtn = document.getElementById('deleteBtn');
const usersTable = document.getElementById('usersTable');
const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');
const closeMessage = document.getElementById('closeMessage');
// const loginBtn = document.getElementById('login');
// const registerBtn = document.getElementById('register');
const editBtn = document.getElementById('editBtn');

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

// Fetch and display all cats
async function loadUsers() {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) throw new Error('Failed to fetch user');

    const users = await response.json();
    const tbody = usersTable.querySelector('tbody');
    tbody.innerHTML = ''; // clear existing rows

    if (users.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4" style="text-align: center; color: #999;">No cats found</td>';
      tbody.appendChild(row);
      showMessage('No user in the database', 'info');
      return;
    }

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="radio" id="${user.id}" value="${user.id}"></td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.birthdate}</td>
        <td>${user.gender}</td>
        <td>${user.maritalstatus}</td>
        <td>${user.jobtitle}</td>
        <td>${user.phone}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading users:', error);
    showMessage('Failed to load users: ' + error.message, 'error');
  }
}

async function suggestUser() {
  try {
    const response = await fetch('/api/randomUser');
    if (!response.ok) throw new Error('Failed to fetch user suggestion');

    const user = await response.json();
    const password = document.querySelector('#password');
    const prefix = document.querySelector('#prefix');
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const lastname = document.querySelector('#lastname');
    const gender = document.querySelector('#gender');
    const middle = document.querySelector('#middlename');
    const dob = document.querySelector('#dob');
    const maritalstatus = document.querySelector('#maritalstatus');
    const jobtitle = document.querySelector('#jobtitle');
    const phonenumber = document.querySelector('#phonenumber');
    const streetaddress = document.querySelector('#streetaddress');
    const city = document.querySelector('#city');
    const state = document.querySelector('#state');
    const zipcode = document.querySelector('#zipcode');
    const country = document.querySelector('#country');
    const latitude = document.querySelector('#latitude');
    const longitude = document.querySelector('#longitude');
    const timezone = document.querySelector('#timezone');
    const image = document.querySelector('div>img');
    prefix.value = user.person.prefix;
    username.value = user.username;
    password.value = user.password;
    email.value = user.email;
    lastname.value = user.person.lastname;
    middle.value = user.person.middlename;
    dob.value = user.person.birthdate;
    gender.value = user.person.gender;
    maritalstatus.value = user.person.maritalstatus;
    jobtitle.value = user.person.jobtitle;
    phonenumber.value = user.person.phonenumber;
    streetaddress.value = user.location.streetaddress;
    city.value = user.location.city;
    state.value = user.location.state;
    zipcode.value = user.location.zipcode;
    country.value = user.location.country;
    latitude.value = user.location.latitude.toString();
    longitude.value = user.location.longitude.toString();
    maritalstatus.value = user.person.maritalstatus;
    timezone.value = user.location.timezone;
    image.setAttribute('src', user.person.avatar);
    showMessage('user suggestion is successfully generated!', 'success');
  } catch (error) {
    console.error('Error loading users:', error);
    showMessage('Failed to generate suggestion: ' + error.message, 'error');
  }
}

// View All button click handler
viewAllBtn.addEventListener('click', loadUsers);

editBtn.addEventListener('click', loadUser);

async function loadUser() {
  const selectedItem = document.querySelector('input[type="radio"]:checked');
  if (!selectedItem) {
    showMessage('Please select a user to edit', 'error');
    return;
  }
  const userId = selectedItem.value;
  try {
    const response = await fetch(`/api/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user details');

    const user = await response.json();
    // Populate form fields with user data
    document.querySelector('#userID').textContent = userId;
    document.querySelector('#prefix').value = user.prefix;
    document.querySelector('#role').value = user.role;
     document.querySelector('#password').value = user.password;
    document.querySelector('#username').value = user.username;
    document.querySelector('#email').value = user.email;
    document.querySelector('#lastname').value = user.lastname;
    document.querySelector('#middlename').value = user.middlename;
    document.querySelector('#dob').value = user.birthdate;
    document.querySelector('#gender').value = user.gender;
    document.querySelector('#maritalstatus').value = user.maritalstatus;
    document.querySelector('#jobtitle').value = user.jobtitle;
    document.querySelector('#phonenumber').value = user.phone;
    document.querySelector('#streetaddress').value = user.streetAddress;
    document.querySelector('#city').value = user.city;
    document.querySelector('#state').value = user.state;
    document.querySelector('#zipcode').value = user.zipcode;
    document.querySelector('#country').value = user.country;
    document.querySelector('#latitude').value = user.latitude;
    document.querySelector('#longitude').value = user.longitude;
    document.querySelector('#timezone').value = user.timezone;
    document.querySelector('div.image>img').setAttribute('src', user.image_url);

    showMessage(`User "${user.username}" loaded for editing`, 'success');
  } catch (error) {
    console.error('Error loading user details:', error);
    showMessage('Failed to load user details: ' + error.message, 'error');
  }
}

suggest.addEventListener('click', suggestUser);

// loginBtn.addEventListener('click', () => {
//   window.location.href = '/login';
// });

// registerBtn.addEventListener('click', () => {
//   window.location.href = '/register';
// });

// Delete button click handler
deleteBtn.addEventListener('click', async () => {
  const selectedItems = document.querySelectorAll('input[type="radio"]:checked');
  selectedItems.forEach(async elem => {
    userId = elem.value;
    if (!userId) return;
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      showMessage(`User with ID ${userId} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('Failed to delete user: ' + error.message, 'error');
    }
  });
  loadUsers(); // refresh table
});

// Handle form submission
const form = document.querySelector('form');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const formimage = document.querySelector('div>img').getAttribute('src');
  const formData = new FormData(form);
  const data = {
    id: parseInt(document.querySelector('#userID').textContent),
    prefix: formData.get('prefix'),
    username: formData.get('username'),
    password: formData.get('password'),
    email: formData.get('email'),
    role: formData.get('role'),
    lastname: formData.get('lastname'),
    middlename: formData.get('middlename'),
    dob: formData.get('dob'),
    gender: formData.get('gender'),
    maritalstatus: formData.get('maritalstatus'),
    jobtitle: formData.get('jobtitle'),
    phonenumber: formData.get('phonenumber'),
    streetaddress: formData.get('streetaddress'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipcode: formData.get('zipcode'),
    country: formData.get('country'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    timezone: formData.get('timezone'),
    image: formimage,
  };

  try {
    if ((data.id!==null) && !isNaN(data.id)) {
      // Edit existing user
      const response = await fetch(`/api/user/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        showMessage('Failed to update user: ' + (errorData.error || 'Unknown error'), 'error');
        throw new Error(errorData.error || 'Failed to update user');
      }

      const result = await response.json();
      showMessage(`User "${data.username}" updated successfully!`, 'success');
      form.reset(); // clear form
      loadUsers(); // refresh table
    } else {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log(data);
      if (!response.ok) {
        const errorData = await response.json();
        showMessage('Failed to add user: ' + (errorData.error || 'Unknown error'), 'error');
        throw new Error(errorData.error || 'Failed to add user');
      }

      const result = await response.json();
      showMessage(`User "${data.username}" added successfully! (ID: ${result.insertId})`, 'success');
      form.reset(); // clear form
      loadUsers(); // refresh table}
      // Add new user
    }
  } catch (error) {
    console.error('Error adding user:', error);
    showMessage('Failed to add user: ' + error.message, 'error');
  }
});
