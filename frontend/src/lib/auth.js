export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('auth_token');
}

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Decode JWT without verification (for client-side check only)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getUser() {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function setUser(user) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('auth_user');
}

export function logout() {
  removeAuthToken();
  removeUser();
  window.location.href = '/login';
}