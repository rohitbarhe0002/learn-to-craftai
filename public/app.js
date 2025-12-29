/**
 * AI Health Assistant - ChatGPT-Style Chat Interface
 * Handles chat interactions, message rendering, and API communication
 */

// ============================================
// DOM Elements
// ============================================
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const emptyState = document.getElementById('emptyState');
const chatContainer = document.getElementById('chatContainer');

// ============================================
// Configuration
// ============================================
const API_ENDPOINT = '/chat';
const API_BASE_URL = window.location.origin;

// ============================================
// State Management
// ============================================
let isLoading = false;
let currentConversationId = null;

// ============================================
// Utility Functions
// ============================================

/**
 * Auto-resize textarea based on content
 */
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Show empty state
 */
function showEmptyState() {
    if (emptyState) {
        emptyState.style.display = 'flex';
    }
}

/**
 * Hide empty state
 */
function hideEmptyState() {
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    isLoading = loading;
    sendButton.disabled = loading || !messageInput.value.trim();
    messageInput.disabled = loading;
    
    if (loading) {
        messageInput.style.opacity = '0.6';
    } else {
        messageInput.style.opacity = '1';
    }
}

/**
 * Create typing indicator
 */
function createTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    content.appendChild(typingDiv);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Create user message element
 */
function createUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'You';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    content.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

/**
 * Create error message element
 */
function createErrorMessage(errorText) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = errorText;
    
    bubble.appendChild(errorDiv);
    content.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

/**
 * Render assistant message
 * Handles both structured disease information and conversational responses
 */
function createAssistantMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const assistantContent = document.createElement('div');
    assistantContent.className = 'assistant-content';
    
    // Check if this is a fallback response (has 'message' field)
    if (data.message) {
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'disease-description';
        fallbackMessage.textContent = data.message;
        assistantContent.appendChild(fallbackMessage);
        
        if (data.guidance) {
            const guidance = document.createElement('div');
            guidance.className = 'disease-description';
            guidance.style.marginTop = 'var(--spacing-md)';
            guidance.textContent = data.guidance;
            assistantContent.appendChild(guidance);
        }
        
        if (data.note) {
            const note = document.createElement('div');
            note.className = 'medicine-note';
            note.style.marginTop = 'var(--spacing-sm)';
            note.textContent = data.note;
            assistantContent.appendChild(note);
        }
    }
    // Check if this is a conversational response (has 'response' field)
    else if (data.response && typeof data.response === 'string') {
        // Render conversational response as plain text
        const conversationalText = document.createElement('div');
        conversationalText.className = 'disease-description';
        conversationalText.textContent = data.response;
        assistantContent.appendChild(conversationalText);
        
        // Optionally show sources if available
        if (data.sources_Link && Array.isArray(data.sources_Link) && data.sources_Link.length > 0) {
            const sourcesSection = document.createElement('div');
            sourcesSection.className = 'section';
            sourcesSection.style.marginTop = 'var(--spacing-md)';
            
            const sourcesTitle = document.createElement('div');
            sourcesTitle.className = 'section-title';
            sourcesTitle.textContent = 'Sources';
            sourcesSection.appendChild(sourcesTitle);
            
            const sourcesList = document.createElement('div');
            sourcesList.style.display = 'flex';
            sourcesList.style.flexDirection = 'column';
            sourcesList.style.gap = 'var(--spacing-xs)';
            
            data.sources_Link.forEach(source => {
                const sourceLink = document.createElement('a');
                sourceLink.href = source;
                sourceLink.target = '_blank';
                sourceLink.rel = 'noopener noreferrer';
                sourceLink.textContent = source;
                sourceLink.style.color = 'var(--accent-primary)';
                sourceLink.style.fontSize = 'var(--font-size-sm)';
                sourceLink.style.textDecoration = 'none';
                sourceLink.style.wordBreak = 'break-all';
                sourceLink.addEventListener('mouseenter', () => {
                    sourceLink.style.textDecoration = 'underline';
                });
                sourceLink.addEventListener('mouseleave', () => {
                    sourceLink.style.textDecoration = 'none';
                });
                sourcesList.appendChild(sourceLink);
            });
            
            sourcesSection.appendChild(sourcesList);
            assistantContent.appendChild(sourcesSection);
        }
    } else {
        // Render structured disease information
        // Disease name (heading)
        if (data.disease) {
            const diseaseHeading = document.createElement('div');
            diseaseHeading.className = 'disease-heading';
            diseaseHeading.textContent = data.disease;
            assistantContent.appendChild(diseaseHeading);
        }
        
        // Description
        if (data.description) {
            const description = document.createElement('div');
            description.className = 'disease-description';
            description.textContent = data.description;
            assistantContent.appendChild(description);
        }
        
        // Causes section
        if (data.causes && Array.isArray(data.causes) && data.causes.length > 0) {
            const causesSection = document.createElement('div');
            causesSection.className = 'section';
            
            const causesTitle = document.createElement('div');
            causesTitle.className = 'section-title';
            causesTitle.textContent = 'Causes';
            causesSection.appendChild(causesTitle);
            
            const causesList = document.createElement('ul');
            causesList.className = 'causes-list';
            
            data.causes.forEach(cause => {
                const li = document.createElement('li');
                li.textContent = cause;
                causesList.appendChild(li);
            });
            
            causesSection.appendChild(causesList);
            assistantContent.appendChild(causesSection);
        }
        
        // Medicines section
        if (data.commonly_used_medicines && Array.isArray(data.commonly_used_medicines) && data.commonly_used_medicines.length > 0) {
            const medicinesSection = document.createElement('div');
            medicinesSection.className = 'section';
            
            const medicinesTitle = document.createElement('div');
            medicinesTitle.className = 'section-title';
            medicinesTitle.textContent = 'Commonly Used Medicines';
            medicinesSection.appendChild(medicinesTitle);
            
            const medicinesList = document.createElement('div');
            medicinesList.className = 'medicines-list';
            
            data.commonly_used_medicines.forEach(medicine => {
                const medicineItem = document.createElement('div');
                medicineItem.className = 'medicine-item';
                
                const medicineName = document.createElement('div');
                medicineName.className = 'medicine-name';
                medicineName.textContent = medicine.name || 'Unknown medicine';
                
                const medicineNote = document.createElement('div');
                medicineNote.className = 'medicine-note';
                medicineNote.textContent = medicine.note || 'Consult a doctor before use';
                
                medicineItem.appendChild(medicineName);
                medicineItem.appendChild(medicineNote);
                medicinesList.appendChild(medicineItem);
            });
            
            medicinesSection.appendChild(medicinesList);
            assistantContent.appendChild(medicinesSection);
        }
        
        // If no structured data found, show fallback
        const hasStructuredData = data.disease || data.description || 
            (data.causes && data.causes.length > 0) || 
            (data.commonly_used_medicines && data.commonly_used_medicines.length > 0);
        
        if (!hasStructuredData) {
            const fallback = document.createElement('div');
            fallback.className = 'disease-description';
            fallback.textContent = 'I apologize, but I couldn\'t find specific information about that. Please try asking about a specific disease.';
            assistantContent.appendChild(fallback);
        }
    }
    
    bubble.appendChild(assistantContent);
    content.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

/**
 * Add message to chat
 */
function addMessage(messageElement) {
    hideEmptyState();
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// ============================================
// API Functions
// ============================================

/**
 * Send message to API and get response
 */
async function sendMessage(userMessage) {
    const requestBody = {
        disease: userMessage.trim(),
    };
    
    // Include conversation ID if available
    if (currentConversationId) {
        requestBody.conversation_id = currentConversationId;
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
    
    // Store conversation ID for future requests
    if (data.conversation_id) {
        currentConversationId = data.conversation_id;
    }
    
    // Validate response structure
    if (!data.response) {
        throw new Error('Invalid API response: missing response field');
    }
    
    return data.response;
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle send message
 */
async function handleSendMessage() {
    const userMessage = messageInput.value.trim();
    
    if (!userMessage || isLoading) {
        return;
    }
    
    try {
        // Add user message to chat
        const userMessageElement = createUserMessage(userMessage);
        addMessage(userMessageElement);
        
        // Clear input
        messageInput.value = '';
        autoResizeTextarea(messageInput);
        setLoadingState(true);
        
        // Show typing indicator
        const typingIndicator = createTypingIndicator();
        addMessage(typingIndicator);
        
        // Fetch response
        const response = await sendMessage(userMessage);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add assistant message
        const assistantMessage = createAssistantMessage(response);
        addMessage(assistantMessage);
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        const errorMessage = createErrorMessage(
            error.message || 'Failed to get response. Please try again later.'
        );
        addMessage(errorMessage);
    } finally {
        setLoadingState(false);
        messageInput.focus();
    }
}

/**
 * Handle input change
 */
function handleInputChange() {
    const hasText = messageInput.value.trim().length > 0;
    sendButton.disabled = isLoading || !hasText;
    
    autoResizeTextarea(messageInput);
}

/**
 * Handle Enter key (Shift+Enter for new line)
 */
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!isLoading && messageInput.value.trim()) {
            handleSendMessage();
        }
    }
}

// ============================================
// Event Listeners
// ============================================

// Send button click
sendButton.addEventListener('click', handleSendMessage);

// Input change
messageInput.addEventListener('input', handleInputChange);

// Enter key
messageInput.addEventListener('keydown', handleKeyDown);

// Auto-resize on paste
messageInput.addEventListener('paste', () => {
    setTimeout(() => autoResizeTextarea(messageInput), 0);
});

// Focus input on load
window.addEventListener('load', () => {
    messageInput.focus();
    showEmptyState();
});

// ============================================
// Error Handling
// ============================================

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (!isLoading) {
        const errorMessage = createErrorMessage('An unexpected error occurred. Please try again.');
        addMessage(errorMessage);
    }
});

// ============================================
// Initialization
// ============================================

// Initialize empty state
showEmptyState();
