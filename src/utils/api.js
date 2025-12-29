const API_ENDPOINT = '/chat';
const API_BASE_URL = window.location.origin;

/**
 * Send message to API and get response
 */
export async function sendMessage(userMessage, conversationId = null) {
    const requestBody = {
        disease: userMessage.trim(),
    };
    
    // Include conversation ID if available
    if (conversationId) {
        requestBody.conversation_id = conversationId;
    }
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.response) {
        throw new Error('Invalid API response: missing response field');
    }
    
    return {
        response: data.response,
        conversationId: data.conversation_id,
    };
}

