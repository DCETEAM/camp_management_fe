export const validate = {
  name: (v) => {
    if (!v || !v.trim()) return 'This field is required.'
    if (v.trim().length < 2) return 'Must be at least 2 characters.'
    return null
  },

  email: (v) => {
    if (!v || !v.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.'
    return null
  },

  phone: (v) => {
    if (!v || !v.trim()) return null
    const digits = v.replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number (7–15 digits).'
    if (!/^[+\d\s\-().]+$/.test(v.trim())) return 'Only digits, spaces, +, -, (, ) are allowed.'
    return null
  },

  required: (v, label = 'This field') => {
    if (!v || !v.trim()) return `${label} is required.`
    if (v.trim().length < 2) return `${label} must be at least 2 characters.`
    return null
  },

  minLength: (v, min = 2, label = 'This field') => {
    if (!v || !v.trim()) return `${label} is required.`
    if (v.trim().length < min) return `${label} must be at least ${min} characters.`
    return null
  },
}

export const validateOrgForm = (formData) => {
  return {
    name: validate.name(formData.name),
    type: validate.required(formData.type, 'Type'),
    email: validate.email(formData.email),
    phone: validate.phone(formData.phone),
  }
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean)
