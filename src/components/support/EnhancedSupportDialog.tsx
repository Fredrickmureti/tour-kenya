
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedSupportDialogProps {
  children?: React.ReactNode;
}

export const EnhancedSupportDialog: React.FC<EnhancedSupportDialogProps> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    contact_method: 'email'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id || null,
          sender_type: user ? 'user' : 'anonymous',
          receiver_type: 'admin',
          subject: formData.subject,
          content: `${formData.message}\n\nPreferred contact method: ${formData.contact_method}`,
          is_read: false
        });

      if (error) throw error;

      toast.success('Support request submitted successfully! We\'ll get back to you soon.');
      setFormData({ subject: '', message: '', contact_method: 'email' });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(`Failed to submit support request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Contact Support</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Contact Support</span>
          </DialogTitle>
          <DialogDescription>
            Need help? Send us a message and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please describe your issue in detail..."
              rows={4}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="contact_method">Preferred Contact Method</Label>
            <select
              id="contact_method"
              value={formData.contact_method}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_method: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </Button>
          </div>
        </form>
        
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground mb-2">Other ways to reach us:</p>
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>+254 700 000 000</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>support@company.com</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSupportDialog;
