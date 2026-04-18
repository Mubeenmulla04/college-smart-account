export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

export const validateStudentId = (studentId) => {
  // Student ID should be alphanumeric and 6-10 characters
  const studentIdRegex = /^[A-Za-z0-9]{6,10}$/;
  return studentIdRegex.test(studentId);
};

export const validateAmount = (amount) => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return amountRegex.test(amount) && parseFloat(amount) > 0;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
};

export const getFieldError = (fieldName, value, validators = []) => {
  for (const validator of validators) {
    if (!validator(value)) {
      return `${fieldName} is invalid`;
    }
  }
  return '';
}; 