// Authentication functionality for separate login/register pages

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      alert('Login successful!');
      window.location.href = 'store.html';
    } else {
      alert('Invalid username or password');
    }
  });
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      alert('Username already taken');
      return;
    }
    
    const user = { id: Date.now(), name, username, password };
    saveUser(user);
    setCurrentUser(user);
    alert('Registration successful!');
    window.location.href = 'store.html';
  });
}