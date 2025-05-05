/**
 * Get the base URL for the application
 * @returns {string} The base URL
 */
export function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Get the current port from the environment or default to 3000
  const port = process.env.PORT || 3000
  return `http://localhost:${port}`
}

/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { ...defaultOptions, ...options })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(number) {
  try {
    return number?.toLocaleString() || '0'
  } catch (error) {
    console.error('Number formatting error:', error)
    return '0'
  }
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, length = 100) {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether the email is valid
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
} 