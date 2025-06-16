
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare, Plus, Building2, ArrowLeft } from 'lucide-react';

const InboxPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    branch_id: ''
  });

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_type.eq.user`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          sender_type: 'user',
          receiver_type: 'admin',
          subject: messageData.subject,
          content: messageData.content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message sent successfully to the selected branch');
      setNewMessage({ subject: '', content: '', branch_id: '' });
      setIsComposing(false);
    },
    onError: (error: any) => {
      toast.error(`Error sending message: ${error.message}`);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!newMessage.branch_id) {
      toast.error('Please select a branch to send your message to');
      return;
    }
    sendMessageMutation.mutate(newMessage);
  };

  const handleSelectMessage = (message: any) => {
    setSelectedMessage(message);
    if (!message.is_read && message.sender_type === 'admin') {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages?.filter(m => !m.is_read && m.sender_type === 'admin').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Communicate with our support team at different branches
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse shadow-lg">
                  {unreadCount} unread
                </Badge>
              )}
              <Button 
                onClick={() => setIsComposing(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card className="h-[700px] overflow-hidden shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-100 dark:border-gray-700">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                    Your Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-1 p-2">
                        {messages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg mx-2 border ${
                              selectedMessage?.id === message.id 
                                ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 shadow-md' 
                                : 'border-transparent hover:border-blue-200 dark:hover:border-gray-600'
                            } ${!message.is_read && message.sender_type === 'admin' ? 'bg-blue-25 dark:bg-blue-950 border-blue-200' : ''}`}
                            onClick={() => handleSelectMessage(message)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  message.sender_type === 'admin' 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                                }`}>
                                  {message.sender_type === 'admin' ? 'S' : 'You'}
                                </div>
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {message.sender_type === 'admin' ? 'Support Team' : 'You'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!message.is_read && message.sender_type === 'admin' && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-1">
                              {message.subject}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No messages yet</p>
                        <p className="text-gray-400 text-sm mt-1">Start a conversation with our support team</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail or Compose */}
            <div className="lg:col-span-2">
              <Card className="h-[700px] shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                {isComposing ? (
                  <>
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                            <Send className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-gray-900 dark:text-white">Compose New Message</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsComposing(false)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="branch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Branch *
                          </Label>
                          <Select value={newMessage.branch_id} onValueChange={(value) => setNewMessage(prev => ({ ...prev, branch_id: value }))}>
                            <SelectTrigger className="mt-1 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="Choose a branch" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {branches?.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{branch.name}</span>
                                    <span className="text-xs text-gray-500">{branch.city}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">Your message will be sent to this branch's support team</p>
                        </div>
                        <div>
                          <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Subject *
                          </Label>
                          <Input
                            id="subject"
                            value={newMessage.subject}
                            onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="What's your message about?"
                            className="mt-1 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Message *
                        </Label>
                        <Textarea
                          id="content"
                          rows={14}
                          value={newMessage.content}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Type your message here... Be as detailed as possible to help us assist you better."
                          className="mt-1 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button 
                          variant="outline"
                          onClick={() => setIsComposing(false)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : selectedMessage ? (
                  <>
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            selectedMessage.sender_type === 'admin' 
                              ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                          }`}>
                            {selectedMessage.sender_type === 'admin' ? 'S' : 'You'}
                          </div>
                          <div>
                            <CardTitle className="text-gray-900 dark:text-white">{selectedMessage.subject}</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              {new Date(selectedMessage.created_at).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={selectedMessage.sender_type === 'admin' ? 'default' : 'secondary'} className="shadow-sm">
                          {selectedMessage.sender_type === 'admin' ? 'Support Team' : 'You'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                          {selectedMessage.content}
                        </p>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                        <Mail className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Message Selected</h3>
                      <p className="text-gray-500 mb-4">Select a message to read or compose a new one</p>
                      <Button 
                        onClick={() => setIsComposing(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Start New Conversation
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
