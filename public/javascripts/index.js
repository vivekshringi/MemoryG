const viewAllBtn = document.getElementById('viewAllBtn');
const deleteBtn = document.getElementById('deleteBtn');
const catsTable = document.getElementById('catsTable');
const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');
const closeMessage = document.getElementById('closeMessage');

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
async function loadCats() {
  try {
    const response = await fetch('/users');
    if (!response.ok) throw new Error('Failed to fetch cats');
    
    const cats = await response.json();
    const tbody = catsTable.querySelector('tbody');
    tbody.innerHTML = ''; // clear existing rows
    
    if (cats.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4" style="text-align: center; color: #999;">No cats found</td>';
      tbody.appendChild(row);
      showMessage('No cats in the database', 'info');
      return;
    }
    
    cats.forEach(cat => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="radio" id="${cat.id}" value="${cat.id}"></td>
        <td>${cat.id}</td>
        <td>${cat.name}</td>
        <td>${cat.owner}</td>
        <td>${cat.birth}</td>
      `;
      tbody.appendChild(row);
    });
    
    //showMessage(`Successfully loaded ${cats.length} cat(s)`, 'success');
  } catch (error) {
    console.error('Error loading cats:', error);
    showMessage('Failed to load cats: ' + error.message, 'error');
  }
}

async function suggestCat() {
  try {
    const response = await fetch('/randomCat');
    if (!response.ok) throw new Error('Failed to fetch cat suggestion');
    
    const cats = await response.json();
    const name = document.querySelector('#name');
    const owner = document.querySelector('#owner');
    const birth = document.querySelector('#birth');
    name.value = cats.name;
    owner.value = cats.owner;
    birth.value = cats.birth;
    
    showMessage('Cat suggestion is successfully generated!', 'success');
  } catch (error) {
    console.error('Error loading cats:', error);
    showMessage('Failed to generate suggestion: ' + error.message, 'error');
  }
}

// View All button click handler
viewAllBtn.addEventListener('click', loadCats);

suggest.addEventListener('click', suggestCat);

// Delete button click handler
deleteBtn.addEventListener('click', async () => {
  const selectedItems = document.querySelectorAll('input[type="radio"]:checked');
  selectedItems.forEach(async (elem)=>{
  catId = elem.value;
  if (!catId) return;
  try {
    const response = await fetch(`/users/${catId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete cat');
    }
    showMessage(`Cat with ID ${catId} deleted successfully`, 'success');
  } catch (error) {
    console.error('Error deleting cat:', error);
    showMessage('Failed to delete cat: ' + error.message, 'error');
  }
  })
loadCats(); // refresh table
});

// Handle form submission
const form = document.querySelector('form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const data = {
    name: formData.get('name'),
    owner: formData.get('owner'),
    birth: formData.get('birth')
  };
  
  try {
    const response = await fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add cat');
    }
    
    const result = await response.json();
    showMessage(`Cat "${data.name}" added successfully! (ID: ${result.insertId})`, 'success');
    form.reset(); // clear form
    loadCats(); // refresh table
  } catch (error) {
    console.error('Error adding cat:', error);
    showMessage('Failed to add cat: ' + error.message, 'error');
  }
});