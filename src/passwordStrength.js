export function evaluatePasswordStrength(password) {
  if (!password || password.length === 0) {
    return {
      strength: 'none',
      score: 0,
      message: ''
    };
  }

  const length = password.length;

  if (length < 8) {
    return {
      strength: 'weak',
      score: 1,
      message: 'Weak: Use at least 8 characters'
    };
  } else if (length < 12) {
    return {
      strength: 'moderate',
      score: 2,
      message: 'Moderate: 12+ characters recommended'
    };
  } else if (length < 16) {
    return {
      strength: 'good',
      score: 3,
      message: 'Good: Consider 16+ characters for sensitive data'
    };
  } else {
    return {
      strength: 'strong',
      score: 4,
      message: 'Strong password length'
    };
  }
}
