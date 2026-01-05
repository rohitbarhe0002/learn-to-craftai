/**
 * Input validation utilities
 * Centralizes all validation logic
 */

/**
 * Validates chat request input
 * @param {Object} body - Request body
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateChatRequest(body) {
  const { disease, conversation_id, name, age, gender } = body;

  if (!disease || typeof disease !== 'string' || disease.trim().length === 0) {
    return {
      valid: false,
      error: 'Missing or invalid required field: disease'
    };
  }

  if (conversation_id !== undefined && conversation_id !== null && typeof conversation_id !== 'string') {
    return {
      valid: false,
      error: 'conversation_id must be a string'
    };
  }

  if (name !== undefined && name !== null && typeof name !== 'string') {
    return {
      valid: false,
      error: 'name must be a string'
    };
  }

  if (age !== undefined && age !== null) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) {
      return {
        valid: false,
        error: 'age must be a valid positive number'
      };
    }
  }

  if (gender !== undefined && gender !== null && typeof gender !== 'string') {
    return {
      valid: false,
      error: 'gender must be a string'
    };
  }

  return { valid: true };
}

/**
 * Normalizes user input for processing
 * @param {Object} body - Request body
 * @returns {Object} Normalized user input
 */
export function normalizeUserInput(body) {
  const result = {
    message: body.disease.trim(),
    conversation_id: body.conversation_id || null
  };

  if (!result.conversation_id && (body.name || body.age || body.gender)) {
    result.userDetails = {
      name: body.name ? body.name.trim() : null,
      age: body.age ? parseInt(body.age) : null,
      gender: body.gender ? body.gender.trim() : null
    };
  }

  return result;
}

