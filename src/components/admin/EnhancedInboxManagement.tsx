import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Trash2, MessageSquare, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EnhancedMessage {
  id: string;
  subject: string;
  content: string;
  sender_id: string | null;
  sender_type: string;
  receiver_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_email?: string;
  sender_name?: string;
  sender_phone?: string;
}

const EnhancedInboxManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<EnhancedMessage | null>(null);
  
  // Fetch all messages with sender details
  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['admin-messages-enhanced'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error(`Error loading messages: ${error.message}`);
        throw error;
      }
      
      // Enhance messages with sender details
      const enhancedMessages = await Promise.all(
        (data || []).map(async (message: any) => {
          let senderEmail = '';
          let senderName = message.profiles?.full_name || '';
          let senderPhone = message.profiles?.phone || '';
          
          // Get sender email from auth.users if sender_id exists
          if (message.sender_id) {
            try {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', message.sender_id)
                .single();
              
              if (userData) {
                senderName = userData.full_name || senderName;
                senderPhone = userData.phone || senderPhone;
              }

              // Get email using the RPC function with proper typing
              const { data: authData } = await supabase.rpc('get_user_contact_info', {
                user_uuid: message.sender_id
              });
              
              if (authData && typeof authData === 'object' && authData !== null) {
                const contactInfo = authData as { email?: string; full_name?: string; phone?: string };
                senderEmail = contactInfo.email || '';
                senderName = contactInfo.full_name || senderName;
                senderPhone = contactInfo.phone || senderPhone;
              }
            } catch (error) {
              console.error('Error fetching sender details:', error);
            }
          }
          
          return {
            ...message,
            sender_email: senderEmail,
            sender_name: senderName || 'Unknown User',
            sender_phone: senderPhone || 'N/A'
          };
        })
      );
      
      return enhancedMessages;
    }
  });
  
  // Set up real-time listener for messages
  useEffect(() => {
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, payload => {
        console.log('Message changed:', payload);
        refetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [refetch]);
  
  // Filter messages
  const filteredMessages = messages?.filter(message => {
    const matchesSearch = !searchTerm || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
      (statusFilter === 'read' && message.is_read) ||
      (statusFilter === 'unread' && !message.is_read);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast.success('Message deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(`Error deleting message: ${error.message}`);
    }
  };

  // Mark as read/unread
  const toggleReadStatus = async (messageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: !currentStatus })
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast.success(`Message marked as ${!currentStatus ? 'read' : 'unread'}`);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating message: ${error.message}`);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Enhanced Message Management
          </CardTitle>
          <CardDescription>Manage user messages and communications with detailed sender information</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages, sender email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Messages Table */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">No messages found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message: EnhancedMessage) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => setSelectedMessage(message)}
                            >
                              {message.subject}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-sm text-muted-foreground">
                                <div>From: {selectedMessage?.sender_name} ({selectedMessage?.sender_email})</div>
                                <div>Phone: {selectedMessage?.sender_phone}</div>
                                <div>Date: {formatDate(selectedMessage?.created_at || '')}</div>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.sender_name}</div>
                          <div className="text-sm text-gray-500">{message.sender_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {message.sender_phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{message.sender_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={message.is_read ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {message.is_read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleReadStatus(message.id, message.is_read)}
                          >
                            {message.is_read ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInboxManagement;
