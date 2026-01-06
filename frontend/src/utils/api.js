// Direct backend API URL
const BACKEND_URL = typeof window !== 'undefined' 
  ? (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001')
  : (process.env.BACKEND_URL || 'http://localhost:3001');

/**
 * Send message to API and get response
 */
export async function sendMessage(userMessage, conversationId = null, location = null) {
    const requestBody = {
        disease: userMessage.trim(),
    };
    
    if (conversationId) {
        requestBody.conversation_id = conversationId;
    }
    // Include location if available
    if(location){
        requestBody.location = location;
    }
    
    const response = await fetch(`${BACKEND_URL}/chat`, {
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
    
    if (!data.response) {
        throw new Error('Invalid API response: missing response field');
    }
    
    return {
        response: data.response,
        conversationId: data.conversation_id,
    };
}

/**
 * Get all conversations for history sidebar
 * @param {number} limit - Maximum number of conversations to fetch
 * @returns {Promise<Array<{id: string, title: string, created_at: string}>>}
 */
export async function getConversations(limit = 50) {
    const response = await fetch(`${BACKEND_URL}/chat/conversations?limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.conversations || [];
}

/**
 * Get a specific conversation with all messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<{id: string, messages: Array, created_at: string}>}
 */
export async function getConversationById(conversationId) {
    const response = await fetch(`${BACKEND_URL}/chat/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.conversation;
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>}
 */
export async function deleteConversation(conversationId) {
    const response = await fetch(`${BACKEND_URL}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return true;
}

