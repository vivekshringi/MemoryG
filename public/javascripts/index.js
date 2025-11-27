const viewAllBtn = document.getElementById('viewAllBtn');
const deleteBtn = document.getElementById('deleteBtn');
const catsTable = document.getElementById('catsTable');

// Fetch and display all cats
async function loadCats() {
  try {
    const response = await fetch('/users');
    if (!response.ok) throw new Error('Failed to fetch cats');
    
    const cats = await response.json();
    const tbody = catsTable.querySelector('tbody');
    tbody.innerHTML = ''; // clear existing rows
    
    cats.forEach(cat => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cat.id}</td>
        <td>${cat.name}</td>
        <td>${cat.owner}</td>
        <td>${cat.birth}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading cats:', error);
    alert('Failed to load cats');
  }
}

async function suggestCat() {
  try {
    const response = await fetch('/randomCat');
    if (!response.ok) throw new Error('Failed to fetch cats');
    
    const cats = await response.json();
    const name = document.querySelector('#name');
    const owner = document.querySelector('#owner');
    const birth = document.querySelector('#birth');
    name.value = cats.name;
    owner.value = cats.owner;
    birth.value = cats.birth;
  } catch (error) {
    console.error('Error loading cats:', error);
    alert('Failed to load cats');
  }
}

// View All button click handler
viewAllBtn.addEventListener('click', loadCats);

suggest.addEventListener('click', suggestCat);

// Delete button click handler (example: delete first selected cat)
deleteBtn.addEventListener('click', async () => {
  const catId = prompt('Enter cat ID to delete:');
  if (!catId) return;

  try {
    const response = await fetch(`/users/${catId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete cat');
    
    alert('Cat deleted successfully');
    loadCats(); // refresh table
  } catch (error) {
    console.error('Error deleting cat:', error);
    alert('Failed to delete cat');
  }
});