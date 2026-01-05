import { useState, useCallback, Suspense } from 'react';
import Header from './components/Header';
import ChatWrapper from './components/ChatWrapper';
import Sidebar from './components/Sidebar';
import { getConversations } from './utils/api';

let conversationsPromise = null;
function getConversationsPromise() {
  if (!conversationsPromise) {
    conversationsPromise = getConversations();
  }
  return conversationsPromise;
}

function SidebarLoading({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-button" disabled>
            <span className="new-chat-icon">+</span>
            <span>New Chat</span>
          </button>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-loading">
            <span>Loading...</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/**
 * Main App Component
 */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [chatKey, setChatKey] = useState(0);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback((conversationId) => {
    setSelectedConversationId(conversationId);
    setChatKey(prev => prev + 1);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null);
    setChatKey(prev => prev + 1); 
    conversationsPromise = null;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Suspense fallback={<SidebarLoading isOpen={sidebarOpen} onClose={handleCloseSidebar} />}>
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          currentConversationId={selectedConversationId}
          conversationsPromise={getConversationsPromise()}
        />
      </Suspense>
      <div className="main-content">
        <Header onToggleSidebar={handleToggleSidebar} />
        <ChatWrapper 
          key={chatKey}
          initialConversationId={selectedConversationId}
        />
      </div>
    </div>
  );
}

