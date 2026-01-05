import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton({ disabled }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            className="send-button"
            disabled={pending || disabled}
            aria-label="Send message"
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 2.5L8.75 11.25M17.5 2.5L12.5 17.5L8.75 11.25M17.5 2.5L2.5 7.5L8.75 11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}

export default function ChatInput({ isPending = false }) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);
    
    const { pending } = useFormStatus();
    const isLoading = pending || isPending;
    
    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };
    
    const handleChange = (e) => {
        setMessage(e.target.value);
        requestAnimationFrame(autoResizeTextarea);
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && message.trim()) {
                e.target.form?.requestSubmit();
                setMessage('');
            }
        }
    };
    
    const handleSubmit = () => {
        if (message.trim()) {
            setMessage(''); 
        }
    };
    
    const handlePaste = () => {
        requestAnimationFrame(autoResizeTextarea);
    };
    
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <textarea
                    ref={textareaRef}
                    name="message"
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
                <div className='pb-xs' onClick={handleSubmit}>
                    <SubmitButton disabled={!message.trim()} />
                </div>
            </div>
        </div>
    );
}
