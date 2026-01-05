import { useActionState, useRef, use, Suspense, useMemo } from 'react';
import Chat from './Chat';
import ChatInput from './ChatInput';
import { sendMessage as apiSendMessage, getConversationById } from '../utils/api';

const conversationCache = new Map();

function getConversationPromise(conversationId) {
    if (!conversationId) return null;
    if (!conversationCache.has(conversationId)) {
        conversationCache.set(conversationId, getConversationById(conversationId));
    }
    return conversationCache.get(conversationId);
}

function formatMessages(messages) {
    if (!messages) return [];
    return messages.map(msg => {
        if (msg.role === 'user') {
            return { type: 'user', text: msg.content };
        } else {
            try {
                const data = JSON.parse(msg.content);
                return { type: 'assistant', data };
            } catch {
                return { type: 'assistant', data: { response: msg.content } };
            }
        }
    });
}

function ChatContent({ chatRef, conversationPromise, conversationId }) {
    const conversation = conversationPromise ? use(conversationPromise) : null;
    const initialMessages = useMemo(
        () => formatMessages(conversation?.messages),
        [conversation?.messages]
    );
    
    const [state, formAction, isPending] = useActionState(
        async (previousState, formData) => {
            const message = formData.get('message');
            if (!message?.trim()) return previousState;
            
            const trimmedMessage = message.trim();
            
            try {
                chatRef.current?.addOptimisticMessage(trimmedMessage);
                const result = await apiSendMessage(trimmedMessage, previousState.conversationId);
                chatRef.current?.addAssistantMessage(trimmedMessage, result.response);
                
                return {
                    conversationId: result.conversationId || previousState.conversationId,
                };
            } catch (error) {
                chatRef.current?.addErrorMessage(
                    trimmedMessage,
                    error.message || 'Failed to send message'
                );
                return previousState;
            }
        },
        { conversationId }
    );
    
    return (
        <form action={formAction} className="chat-form">
            <Chat 
                ref={chatRef} 
                isPending={isPending} 
                initialMessages={initialMessages}
                loadingHistory={false}
            />
            <ChatInput isPending={isPending} />
        </form>
    );
}

// Loading fallback for chat
function ChatLoading() {
    return (
        <div className="chat-form">
            <main className="chat-container">
                <div className="chat-messages">
                    <div className="loading-history">
                        <div className="loading-spinner"></div>
                        <p>Loading conversation...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ChatWrapper({ initialConversationId = null }) {
    const chatRef = useRef(null);
    const conversationPromise = getConversationPromise(initialConversationId);
    
    return (
        <Suspense fallback={<ChatLoading />}>
            <ChatContent 
                chatRef={chatRef}
                conversationPromise={conversationPromise}
                conversationId={initialConversationId}
            />
        </Suspense>
    );
}
