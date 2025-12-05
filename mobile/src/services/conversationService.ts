import api from './api';

export const conversationService = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/api/conversations');
    return response.data.conversations;
  },

  // Create or get existing conversation with a user
  createConversation: async (otherUserId: string) => {
    const response = await api.post('/api/conversations', { otherUserId });
    return response.data.conversation;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string) => {
    const response = await api.get(`/api/conversations/${conversationId}/messages`);
    return response.data.messages;
  },

  // Send a message
  sendMessage: async (conversationId: string, content: string) => {
    const response = await api.post(`/api/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data.message;
  },
};
