// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation (US format)
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1]?[\s\-\.]?[\(]?[\d{3}][\)]?[\s\-\.]?[\d{3}][\s\-\.]?[\d{4}]$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Credit card validation (basic Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '')
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false
  }

  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Password strength validation
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }
  
  const score = Object.values(checks).filter(Boolean).length
  
  let strength = 'Weak'
  if (score >= 4) strength = 'Strong'
  else if (score >= 3) strength = 'Medium'
  
  return {
    score,
    strength,
    checks,
    isValid: score >= 3
  }
}

// ZIP code validation (US format)
export const isValidZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Date validation
export const isValidDate = (dateString) => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// Future date validation
export const isFutureDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

// Age validation (minimum age)
export const isValidAge = (birthDate, minimumAge = 13) => {
  const birth = new Date(birthDate)
  const now = new Date()
  const age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    return age - 1 >= minimumAge
  }
  
  return age >= minimumAge
}

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined && value !== ''
}

// Minimum length validation
export const hasMinLength = (value, minLength) => {
  if (typeof value !== 'string') return false
  return value.length >= minLength
}

// Maximum length validation
export const hasMaxLength = (value, maxLength) => {
  if (typeof value !== 'string') return false
  return value.length <= maxLength
}

// Numeric validation
export const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value))
}

// Price validation (positive number with up to 2 decimal places)
export const isValidPrice = (price) => {
  const priceRegex = /^\d+(\.\d{1,2})?$/
  return priceRegex.test(price) && parseFloat(price) > 0
}

// Quantity validation (positive integer)
export const isValidQuantity = (quantity) => {
  const num = parseInt(quantity)
  return Number.isInteger(num) && num > 0
}

// Name validation (letters, spaces, hyphens, apostrophes)
export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s\-']+$/
  return nameRegex.test(name) && name.trim().length >= 2
}

// Username validation (alphanumeric, underscore, hyphen)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  return usernameRegex.test(username) && username.length >= 3 && username.length <= 20
}

// Product SKU validation
export const isValidSKU = (sku) => {
  const skuRegex = /^[A-Z0-9\-]+$/
  return skuRegex.test(sku) && sku.length >= 3
}

// Color hex code validation
export const isValidHexColor = (color) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}

// File type validation
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

// File size validation (in bytes)
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize
}

// Image dimensions validation
export const validateImageDimensions = (file, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        isValid: img.width <= maxWidth && img.height <= maxHeight,
        width: img.width,
        height: img.height
      })
    }
    img.onerror = () => {
      resolve({ isValid: false, width: 0, height: 0 })
    }
    img.src = URL.createObjectURL(file)
  })
}