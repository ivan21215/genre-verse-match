import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatRequestsList from '@/components/ChatRequestsList';
import ChatInterface from '@/components/ChatInterface';

const Chats = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          
          {selectedChatId ? (
            <ChatInterface
              requestId={selectedChatId}
              onBack={() => setSelectedChatId(null)}
            />
          ) : (
            <ChatRequestsList onChatSelect={setSelectedChatId} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chats;
