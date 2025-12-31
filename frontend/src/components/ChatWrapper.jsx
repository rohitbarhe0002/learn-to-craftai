import { useActionState, useRef } from 'react';
import Chat from './Chat';
import ChatInput from './ChatInput';
import { sendMessage as apiSendMessage } from '../utils/api';

/**
 * ChatWrapper - Uses React 19 useActionState for form handling
 * No useState needed for loading state - useActionState handles it!
 */
export default function ChatWrapper() {
    const chatRef = useRef(null);
    const lastMessageRef = useRef('');

    const [state, formAction, isPending] = useActionState(
        async (previousState, formData) => {
            const message = formData.get('message');
            if (!message?.trim()) return previousState;
            
            const trimmedMessage = message.trim();
            lastMessageRef.current = trimmedMessage;
            
            try {
                chatRef.current?.addOptimisticMessage(trimmedMessage);
                const result = await apiSendMessage(trimmedMessage, previousState.conversationId);
                chatRef.current?.addAssistantMessage(trimmedMessage, result.response);
                
                return {
                    conversationId: result.conversationId || previousState.conversationId,
                };
            } catch (error) {
                // Add error message
                chatRef.current?.addErrorMessage(
                    trimmedMessage,
                    error.message || 'Failed to send message'
                );
                return previousState;
            }
        },
        { conversationId: null }
    );
    
    return (
        <form action={formAction} className="chat-form">
            <Chat ref={chatRef} isPending={isPending} />
            <ChatInput isPending={isPending} />
        </form>
    );
}
