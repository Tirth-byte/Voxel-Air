// Authentication utility functions

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function hashPassword(password) {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  return btoa(password + '_secret_salt')
}

function generateToken(userId, role) {
  const payload = {
    userId: userId,
    role: role,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
  }
  return btoa(JSON.stringify(payload))
}

function verifyToken(token) {
  try {
    const decoded = JSON.parse(atob(token))
    if (decoded.expiresAt < Date.now()) {
      return { valid: false, reason: 'Token expired' }
    }
    return { valid: true, userId: decoded.userId, role: decoded.role }
  } catch (e) {
    return { valid: false, reason: 'Invalid token' }
  }
}

module.exports = { 
  validateEmail, 
  hashPassword, 
  generateToken, 
  verifyToken 
}
