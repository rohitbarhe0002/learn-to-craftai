import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, isLoading = false }) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);
    
    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };
    
    useEffect(() => {
        autoResizeTextarea();
    }, [message]);
    
    const handleChange = (e) => {
        setMessage(e.target.value);
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && message.trim()) {
                handleSend();
            }
        }
    };
    
    const handleSend = () => {
        if (message.trim() && !isLoading) {
            onSend(message.trim());
            setMessage('');
        }
    };
    
    const handlePaste = () => {
        setTimeout(autoResizeTextarea, 0);
    };
    
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="message-input"
                    placeholder="Message AI Health Assistant..."
                    rows={1}
                    disabled={isLoading}
                    aria-label="Message input"
                    style={{ opacity: isLoading ? 0.6 : 1 }}
                />
                <button
                    onClick={handleSend}
                    className="send-button"
                    disabled={isLoading || !message.trim()}
                    aria-label="Send message"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 2.5L8.75 11.25M17.5 2.5L12.5 17.5L8.75 11.25M17.5 2.5L2.5 7.5L8.75 11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            <p className="input-disclaimer">AI Health Assistant can make mistakes. Check important info.</p>
        </div>
    );
}

