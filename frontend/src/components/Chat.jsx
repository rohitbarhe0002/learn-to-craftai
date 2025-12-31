import { useState, useOptimistic, useRef, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';
import { UserMessage, AssistantMessage, ErrorMessage } from './Message';
import TypingIndicator from './TypingIndicator';

const Chat = forwardRef(function Chat({ isPending = false }, ref) {
    const [messages, setMessages] = useState([]);
    const chatContainerRef = useRef(null);
    
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        (currentMessages, optimisticMessage) => [...currentMessages, optimisticMessage]
    );
    
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            setTimeout(() => {
                chatContainerRef.current?.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        }
    };
    
    // Auto-scroll when messages or loading state changes
    useLayoutEffect(() => {
        scrollToBottom();
    }, [optimisticMessages, isPending]);
    
    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        addOptimisticMessage: (text) => {
            addOptimisticMessage({ type: 'user', text });
        },
        
        addAssistantMessage: (userText, data) => {
            setMessages(prev => [
                ...prev, 
                { type: 'user', text: userText },
                { type: 'assistant', data }
            ]);
        },
        
        addErrorMessage: (userText, errorText) => {
            setMessages(prev => [
                ...prev,
                { type: 'user', text: userText },
                { type: 'error', errorText }
            ]);
        }
    }));
    
    const hasMessages = optimisticMessages.length > 0 || isPending;
    
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
                
                {optimisticMessages.map((message, index) => {
                    const contentHash = message.text?.slice(0, 10) || 
                                       message.errorText?.slice(0, 10) || 
                                       JSON.stringify(message.data || {}).slice(0, 20);
                    const key = `${message.type}-${index}-${contentHash}`;
                    
                    switch (message.type) {
                        case 'user':
                            return <UserMessage key={key} text={message.text} />;
                        case 'error':
                            return <ErrorMessage key={key} errorText={message.errorText} />;
                        case 'assistant':
                            return <AssistantMessage key={key} data={message.data} allMessages={optimisticMessages} />;
                        default:
                            return null;
                    }
                })}
                
                {/* Show typing indicator when API call is pending */}
                {isPending && <TypingIndicator />}
            </div>
        </main>
    );
});

Chat.displayName = 'Chat';

export default Chat;
