import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { UserMessage, AssistantMessage, ErrorMessage } from './Message';
import TypingIndicator from './TypingIndicator';
import { sendMessage as apiSendMessage } from '../utils/api';

const Chat = forwardRef(function Chat(_props, ref) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [showTyping, setShowTyping] = useState(false);
    const chatContainerRef = useRef(null);
    
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, showTyping]);
    
    const handleSend = async (userMessage) => {
        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsLoading(true);
        setShowTyping(true);
        
        try {
            const result = await apiSendMessage(userMessage, conversationId);
            
            // Update conversation ID
            if (result.conversationId) {
                setConversationId(result.conversationId);
            }
            
            // Add assistant message
            setMessages(prev => [...prev, { type: 'assistant', data: result.response }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { 
                type: 'error', 
                errorText: error.message || 'Failed to get response. Please try again later.' 
            }]);
        } finally {
            setIsLoading(false);
            setShowTyping(false);
        }
    };
    
    useImperativeHandle(ref, () => ({
        handleSend
    }));
    
    const hasMessages = messages.length > 0 || showTyping;
    
    return (
        <main className="chat-container" ref={chatContainerRef}>
            <div className="chat-messages">
                {!hasMessages && (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <p className="empty-text">Ask about any disease to get started</p>
                        <p className="empty-subtext">Example: "What is diabetes?" or "Tell me about hypertension"</p>
                    </div>
                )}
                
                {messages.map((message, index) => {
                    // Generate stable key: type + index + content hash
                    const contentHash = message.text?.slice(0, 10) || 
                                       message.errorText?.slice(0, 10) || 
                                       JSON.stringify(message.data).slice(0, 20);
                    const key = `${message.type}-${index}-${contentHash}`;
                    
                    switch (message.type) {
                        case 'user':
                            return <UserMessage key={key} text={message.text} />;
                        case 'error':
                            return <ErrorMessage key={key} errorText={message.errorText} />;
                        case 'assistant':
                            return <AssistantMessage key={key} data={message.data} />;
                        default:
                            return null;
                    }
                })}
                
                {showTyping && <TypingIndicator />}
            </div>
        </main>
    );
});

Chat.displayName = 'Chat';

export default Chat;

