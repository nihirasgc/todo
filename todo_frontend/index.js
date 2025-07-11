// const Cookies = require('js-cookie');
const Cookies = window.Cookies;

const apiBase = 'http://localhost:5000/api';

// Global Variables
let token = '';
let selectedListId = '';
let allItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const authForm = document.getElementById('auth-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const authMsg = document.getElementById('auth-message');
  const authSection = document.getElementById('auth-section');
  const appSection = document.getElementById('app-section');
  const logoutBtn = document.getElementById('logout-btn');
  const listsContainer = document.getElementById('lists-container');
  const itemsContainer = document.getElementById('items-container');
  const selectedListTitle = document.getElementById('selected-list-title');
  const newListForm = document.getElementById('new-list-form');
  const newListName = document.getElementById('new-list-name');
  const newListDesc = document.getElementById('new-list-desc');
  const newItemForm = document.getElementById('new-item-form');
  const newItemContent = document.getElementById('new-item-content');
  const searchBar = document.getElementById('search-bar');
  const itemSearchInput = document.getElementById('item-search');

  // Token Verification
  async function verifyToken() {
    const storedToken = Cookies.get('token');
    authSection.style.display = 'none';
    appSection.style.display = 'none';

    if (!storedToken) {
      console.log('No token found. Redirecting to login/register.');
      authSection.style.display = 'block';
      return false;
    }

    try {
      const res = await fetch(`${apiBase}/users/auth/verifyToken`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invalid token');
      }

      token = storedToken; // Update the global token variable
      console.log('Token is valid.');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      Cookies.remove('token');
      authSection.style.display = 'block';
      return false;
    }
  }

  // Improved Initialization Logic
  async function initialize() {
    const isTokenValid = await verifyToken();
    if (isTokenValid) {
      authSection.style.display = 'none';
      appSection.style.display = 'block';
      await loadLists();

      // Check for saved selected list ID
      const savedListId = localStorage.getItem('selectedListId');
      if (savedListId) {
        selectedListId = savedListId;

        // Fetch all lists to find the saved list's name
        const res = await fetch(`${apiBase}/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lists = await res.json();

        const selectedList = lists.find((list) => list._id === savedListId);
        if (selectedList) {
          selectedListTitle.textContent = selectedList.name;
          newItemForm.style.display = 'block';
          await loadItems(savedListId);
        }
      }
    } else {
      authSection.style.display = 'block';
    }
  }

  // Authentication (Login/Register)
  async function auth(type) {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const res = await fetch(`${apiBase}/users/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      if (type === 'login') {
        token = data.token;
        Cookies.set('token', token, { expires: 1 });
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        await loadLists();
      } else {
        authMsg.textContent = 'Registered successfully. Now login.';
      }
    } else {
      authMsg.textContent = data.error || 'Something went wrong.';
    }
  }

  // Event Listeners
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await auth('login');
  });

  registerBtn.addEventListener('click', async () => {
    await auth('register');
  });

  logoutBtn.addEventListener('click', () => {
    Cookies.remove('token');
    token = '';
    selectedListId = '';
    localStorage.removeItem('selectedListId'); // Clear local storage
    listsContainer.innerHTML = '';
    itemsContainer.innerHTML = '';
    newItemForm.style.display = 'none';
    searchBar.value = '';
    selectedListTitle.textContent = 'Select a list';
    appSection.style.display = 'none';
    authSection.style.display = 'block';
  });

  // Load Lists
  async function loadLists() {
    const res = await fetch(`${apiBase}/lists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const lists = await res.json();
    displayLists(lists);
  }

  function displayLists(lists) {
    listsContainer.innerHTML = '';
    lists
      .filter((list) =>
        list.name.toLowerCase().includes(searchBar.value.toLowerCase())
      )
      .forEach((list) => {
        const li = document.createElement('li');
        li.textContent = list.name;

        li.addEventListener('click', () => {
          selectedListId = list._id;
          localStorage.setItem('selectedListId', selectedListId); // Save to local storage
          selectedListTitle.textContent = list.name;
          newItemForm.style.display = 'block';
          loadItems(list._id);
        });

        const actions = document.createElement('span');
        actions.className = 'actions';

        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.onclick = () => deleteList(list._id);

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.onclick = () => {
          const name = prompt('New list name:', list.name);
          const desc = prompt('New description:', list.description);
          if (name) updateList(list._id, name, desc);
        };

        actions.append(editBtn, delBtn);
        li.appendChild(actions);
        listsContainer.appendChild(li);
      });
  }

  // New List
  newListForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = newListName.value;
    const description = newListDesc.value;
    const res = await fetch(`${apiBase}/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      newListForm.reset();
      loadLists();
    }
  });

  async function updateList(id, name, description) {
    await fetch(`${apiBase}/lists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    loadLists();
  }

  async function deleteList(id) {
    await fetch(`${apiBase}/lists/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (id === selectedListId) {
      selectedListTitle.textContent = '';
      itemsContainer.innerHTML = '';
      newItemForm.style.display = 'none';
    }
    loadLists();
  }

  // Load Items
  async function loadItems(listId) {
    const res = await fetch(`${apiBase}/items/list/${listId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = await res.json();
    allItems = items;
    renderFilteredItems();
  }

  function renderFilteredItems() {
    const term = itemSearchInput.value.toLowerCase();
    const filtered = allItems.filter((item) =>
      item.content.toLowerCase().includes(term)
    );
    displayItems(filtered);
  }

  function displayItems(items) {
    itemsContainer.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';

      const span = document.createElement('span');
      span.textContent = item.content;

      const actions = document.createElement('span');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent checkbox click
        const content = prompt('New content:', item.content);
        if (content) updateItem(item._id, content);
      };

      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent checkbox click
        deleteItem(item._id);
      };

      actions.append(editBtn, delBtn);
      li.append(checkbox, span, actions);
      itemsContainer.appendChild(li);
    });
  }

  // New Item
  newItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = newItemContent.value;
    await fetch(`${apiBase}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, listId: selectedListId }),
    });
    newItemForm.reset();
    loadItems(selectedListId);
  });

  async function updateItem(id, content) {
    await fetch(`${apiBase}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    loadItems(selectedListId);
  }

  async function deleteItem(itemId) {
    try {
      const res = await fetch(`${apiBase}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error deleting item');
      }

      loadItems(selectedListId); // Reload items after deletion
    } catch (err) {
      console.error('Delete item error:', err.message);
      alert('Failed to delete item: ' + err.message);
    }
  }

  // Search
  searchBar.addEventListener('input', loadLists);
  itemSearchInput.addEventListener('input', renderFilteredItems);

  // Initialize Page
  initialize();
});
