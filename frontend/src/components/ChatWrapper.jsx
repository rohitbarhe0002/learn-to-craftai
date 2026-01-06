// import { useActionState, useRef, useState } from 'react';
// import Chat from './Chat';
// import ChatInput from './ChatInput';
// import { sendMessage as apiSendMessage, getConversationById } from '../utils/api';

// const conversationCache = new Map();
// export default function ChatWrapper() {
//     const chatRef = useRef(null);
//     const lastMessageRef = useRef('');
//     const [isLocationPending, setIsLocationPending] = useState(false);
// }
// function getConversationPromise(conversationId) {
//     if (!conversationId) return null;
//     if (!conversationCache.has(conversationId)) {
//         conversationCache.set(conversationId, getConversationById(conversationId));
//     }
//     return conversationCache.get(conversationId);
// }

// function formatMessages(messages) {
//     if (!messages) return [];
//     return messages.map(msg => {
//         if (msg.role === 'user') {
//             return { type: 'user', text: msg.content };
//         } else {
//             try {
//                 const data = JSON.parse(msg.content);
//                 return { type: 'assistant', data };
//             } catch {
//                 return { type: 'assistant', data: { response: msg.content } };
//             }
//         }
//     });
// }

// function ChatContent({ chatRef, conversationPromise, conversationId }) {
//     const conversation = conversationPromise ? use(conversationPromise) : null;
//     const initialMessages = useMemo(
//         () => formatMessages(conversation?.messages),
//         [conversation?.messages]
//     );
    
//     const [state, formAction, isPending] = useActionState(
//         async (previousState, formData) => {
//             const message = formData.get('message');
//             if (!message?.trim()) return previousState;

//             const trimmedMessage = message.trim();
//             lastMessageRef.current = trimmedMessage;

//             try {
//                 chatRef.current?.addOptimisticMessage(trimmedMessage);
//                 const result = await apiSendMessage(
//                     trimmedMessage,
//                     previousState.conversationId
//                 );
//                 chatRef.current?.addAssistantMessage(trimmedMessage, result.response);

//                 return {
//                     conversationId: result.conversationId || previousState.conversationId,
//                 };
//             } catch (error) {
//                 chatRef.current?.addErrorMessage(
//                     trimmedMessage,
//                     error.message || 'Failed to send message'
//                 );
//                 return previousState;
//             }
//         },
//         { conversationId }
//     );

//     //  NEW: handler for location resend
//     const handleLocationAllowed = async (location) => {
//         setIsLocationPending(true);
//         try {
//             const result = await apiSendMessage(
//                 lastMessageRef.current,   // reuse original message
//                 state.conversationId,
//                 location                  // 👈 new data
//             );

//             chatRef.current?.addAssistantMessage(
//                 lastMessageRef.current,
//                 result.response
//             );
//             setIsLocationPending(false);
//         } catch (error) {
//             chatRef.current?.addErrorMessage(
//                 lastMessageRef.current,
//                 error.message || 'Failed to send location'
//             );
//             setIsLocationPending(false);
//         }
//     };

//     return (
//         <form action={formAction} className="chat-form">
//             <Chat 
//                 initialMessages={initialMessages}
//                 loadingHistory={false}
//                 ref={chatRef}
//                 isPending={isPending || isLocationPending }
//                 onLocationAllowed={handleLocationAllowed}  
//             />
//             <ChatInput isPending={isPending} />
//         </form>
//     );
// }

// // Loading fallback for chat
// function ChatLoading() {
//     return (
//         <div className="chat-form">
//             <main className="chat-container">
//                 <div className="chat-messages">
//                     <div className="loading-history">
//                         <div className="loading-spinner"></div>
//                         <p>Loading conversation...</p>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

// export default function ChatWrapper({ initialConversationId = null }) {
//     const chatRef = useRef(null);
//     const conversationPromise = getConversationPromise(initialConversationId);
    
//     return (
//         <Suspense fallback={<ChatLoading />}>
//             <ChatContent 
//                 chatRef={chatRef}
//                 conversationPromise={conversationPromise}
//                 conversationId={initialConversationId}
//             />
//         </Suspense>
//     );
// }

import {
  useActionState,
  useRef,
  useState,
  useMemo,
  Suspense,
  use
} from 'react';

import Chat from './Chat';
import ChatInput from './ChatInput';
import { sendMessage as apiSendMessage, getConversationById } from '../utils/api';

const conversationCache = new Map();

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function getConversationPromise(conversationId) {
  if (!conversationId) return null;

  if (!conversationCache.has(conversationId)) {
    conversationCache.set(
      conversationId,
      getConversationById(conversationId)
    );
  }

  return conversationCache.get(conversationId);
}

function formatMessages(messages = []) {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return { type: 'user', text: msg.content };
    }

    try {
      return { type: 'assistant', data: JSON.parse(msg.content) };
    } catch {
      return { type: 'assistant', data: { response: msg.content } };
    }
  });
}

/* ---------------------------------- */
/* Chat Content                       */
/* ---------------------------------- */

function ChatContent({
  chatRef,
  conversationPromise,
  conversationId,
  lastMessageRef,
  isLocationPending,
  setIsLocationPending,
}) {
  const conversation = conversationPromise ? use(conversationPromise) : null;

  const initialMessages = useMemo(
    () => formatMessages(conversation?.messages),
    [conversation?.messages]
  );

  const [state, formAction, isPending] = useActionState(
    async (prev, formData) => {
      const message = formData.get('message');
      if (!message?.trim()) return prev;

      const trimmed = message.trim();
      lastMessageRef.current = trimmed;

      try {
        chatRef.current?.addOptimisticMessage(trimmed);

        const result = await apiSendMessage(
          trimmed,
          prev.conversationId
        );

        chatRef.current?.addAssistantMessage(
          trimmed,
          result.response
        );

        return {
          conversationId: result.conversationId ?? prev.conversationId,
        };
      } catch (err) {
        chatRef.current?.addErrorMessage(
          trimmed,
          err.message || 'Failed to send message'
        );
        return prev;
      }
    },
    { conversationId }
  );

  /* Location resend */
  const handleLocationAllowed = async (location) => {
    setIsLocationPending(true);

    try {
      const result = await apiSendMessage(
        lastMessageRef.current,
        state.conversationId,
        location
      );

      chatRef.current?.addAssistantMessage(
        lastMessageRef.current,
        result.response
      );
    } catch (err) {
      chatRef.current?.addErrorMessage(
        lastMessageRef.current,
        err.message || 'Failed to send location'
      );
    } finally {
      setIsLocationPending(false); // 🔴 IMPORTANT
    }
  };

  return (
    <form action={formAction} className="chat-form">
      <Chat
        ref={chatRef}
        initialMessages={initialMessages}
        loadingHistory={false}
        isPending={isPending || isLocationPending}
        onLocationAllowed={handleLocationAllowed}
      />
      <ChatInput isPending={isPending || isLocationPending} />
    </form>
  );
}

/* ---------------------------------- */
/* Loading                            */
/* ---------------------------------- */

function ChatLoading() {
  return (
    <div className="chat-form">
      <main className="chat-container">
        <div className="chat-messages">
          <div className="loading-history">
            <div className="loading-spinner" />
            <p>Loading conversation...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------- */
/* FINAL ChatWrapper (ONLY ONE)       */
/* ---------------------------------- */

export default function ChatWrapper({ initialConversationId = null }) {
  const chatRef = useRef(null);
  const lastMessageRef = useRef('');
  const [isLocationPending, setIsLocationPending] = useState(false);

  const conversationPromise =
    getConversationPromise(initialConversationId);

  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatContent
        chatRef={chatRef}
        conversationPromise={conversationPromise}
        conversationId={initialConversationId}
        lastMessageRef={lastMessageRef}
        isLocationPending={isLocationPending}
        setIsLocationPending={setIsLocationPending}
      />
    </Suspense>
  );
}
