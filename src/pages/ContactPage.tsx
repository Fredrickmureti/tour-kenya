import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupportDialog } from '@/components/support/SupportDialog';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Fetch dynamic offices from database
  const { data: offices, isLoading: officesLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_offices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const [activeOffice, setActiveOffice] = useState<any>(null);

  // Set first office as active when data loads
  React.useEffect(() => {
    if (offices && offices.length > 0 && !activeOffice) {
      setActiveOffice(offices[0]);
    }
  }, [offices, activeOffice]);

  // Submit contact form mutation
  const submitContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const { error } = await supabase
        .from('contact_submissions')
        .insert(contactData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Your message has been sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    },
    onError: (error: any) => {
      toast.error(`Error sending message: ${error.message}`);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    submitContactMutation.mutate(formData);
  };

  const faqs = [
    {
      question: 'How early should I arrive before my bus departs?',
      answer: 'We recommend arriving at least 30 minutes before your scheduled departure time to allow for check-in and boarding procedures.'
    },
    {
      question: 'Can I change or cancel my ticket?',
      answer: 'Yes, you can change or cancel your ticket up to 24 hours before departure. Changes are subject to a small fee, and cancellations may be eligible for partial or full refunds depending on your ticket type.'
    },
    {
      question: 'How much luggage can I bring?',
      answer: 'Each passenger is allowed two pieces of luggage to be stored in the luggage compartment (up to 50lbs each) and one small carry-on bag that can fit in the overhead compartment or under your seat.'
    },
    {
      question: 'Do your buses have WiFi and power outlets?',
      answer: 'Yes, all our buses are equipped with free WiFi. Our Premium and Luxury buses have power outlets at every seat, while Standard buses have shared power outlets.'
    },
    {
      question: 'Are food and drinks allowed on the bus?',
      answer: 'Yes, you may bring food and non-alcoholic beverages on board. We ask that you choose items that are not overly aromatic and that you clean up after yourself.'
    },
    {
      question: 'Can I track my bus in real-time?',
      answer: 'Yes, our mobile app provides real-time tracking of all our buses, allowing you to see exactly where your bus is and when it will arrive.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display animate-fade-in">
              Contact Us
            </h1>
            <p className="text-xl mb-6 animate-fade-in text-blue-100">
              We're here to help! Get in touch with our team for assistance with bookings, inquiries, or feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12">
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-white dark:bg-gray-800 shadow-lg">
                <TabsTrigger value="form" className="text-base py-3">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Form
                </TabsTrigger>
                <TabsTrigger value="offices" className="text-base py-3">
                  <MapPin className="mr-2 h-5 w-5" />
                  Our Offices
                </TabsTrigger>
                <TabsTrigger value="faq" className="text-base py-3">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  FAQs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="form">
                <Card className="shadow-xl animate-fade-in">
                  <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">Booking Inquiry</SelectItem>
                            <SelectItem value="support">Customer Support</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="business">Business Inquiry</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          placeholder="How can we help you?"
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all"
                        disabled={submitContactMutation.isPending}
                      >
                        {submitContactMutation.isPending ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="offices">
                <Card className="shadow-xl animate-fade-in">
                  <CardHeader>
                    <CardTitle>Our Offices</CardTitle>
                    <CardDescription>
                      Visit us at one of our main offices or terminal locations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {officesLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : offices && offices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Office List */}
                        <div className="md:col-span-1 space-y-3">
                          {offices.map((office: any) => (
                            <div
                              key={office.id}
                              className={`p-3 rounded-md cursor-pointer transition-all hover:shadow-md ${
                                activeOffice?.id === office.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              onClick={() => setActiveOffice(office)}
                            >
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{office.city}</h3>
                            </div>
                          ))}
                        </div>
                        
                        {/* Office Details */}
                        {activeOffice && (
                          <div className="md:col-span-3">
                            <div className="h-64 rounded-lg overflow-hidden mb-6 shadow-lg">
                              <iframe
                                src={activeOffice.map_url}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                title={`${activeOffice.city} Office Map`}
                              ></iframe>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{activeOffice.city} Office</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start">
                                <MapPin className="mr-3 mt-1 text-blue-600 dark:text-blue-400" size={18} />
                                <span className="text-gray-700 dark:text-gray-300">{activeOffice.address}</span>
                              </div>
                              
                              <div className="flex items-start">
                                <Phone className="mr-3 mt-1 text-blue-600 dark:text-blue-400" size={18} />
                                <span className="text-gray-700 dark:text-gray-300">{activeOffice.phone}</span>
                              </div>
                              
                              <div className="flex items-start">
                                <Mail className="mr-3 mt-1 text-blue-600 dark:text-blue-400" size={18} />
                                <span className="text-gray-700 dark:text-gray-300">{activeOffice.email}</span>
                              </div>
                              
                              <div className="flex items-start">
                                <Clock className="mr-3 mt-1 text-blue-600 dark:text-blue-400" size={18} />
                                <span className="text-gray-700 dark:text-gray-300">{activeOffice.hours}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">No offices available at the moment</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="faq">
                <Card className="shadow-xl animate-fade-in">
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Find quick answers to our most common questions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-5 last:border-0">
                          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{faq.question}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                        </div>
                      ))}
                      
                      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-center text-gray-700 dark:text-gray-300">
                          Still have questions? Contact our support team directly.
                        </p>
                        <div className="mt-3 flex justify-center">
                          <SupportDialog>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                              Contact Support
                            </Button>
                          </SupportDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Customer Support Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100 mb-4">
              Customer Support
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Our dedicated customer service team is available to assist you with any questions, concerns, or assistance you may need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                  <Phone className="h-8 w-8" />
                </div>
                <CardTitle>Call Us</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-3 text-gray-600 dark:text-gray-400">For immediate assistance:</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">1-800-ROUTEAURA</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">24/7 Customer Support</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                  <Mail className="h-8 w-8" />
                </div>
                <CardTitle>Email Us</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-3 text-gray-600 dark:text-gray-400">For general inquiries:</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">support@routeaura.com</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Response within 24 hours</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow transform hover:scale-105 duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-3 text-gray-600 dark:text-gray-400">Chat with a representative:</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Available 8:00 AM - 10:00 PM EAT</p>
                <SupportDialog>
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                    Start Chat
                  </Button>
                </SupportDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Subscribe to our newsletter for travel tips, special offers, and the latest Route Aura news.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <Input placeholder="Enter your email address" className="sm:flex-1 bg-white dark:bg-gray-800" />
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">Subscribe</Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              By subscribing, you agree to receive marketing emails from Route Aura. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
