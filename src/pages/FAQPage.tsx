import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Fetch FAQs from database
  const { data: faqs = [], isLoading, error: queryError } = useQuery<FAQ[], Error>({
    queryKey: ['public-faqs'],
    queryFn: async () => {
      console.log("Attempting to fetch FAQs...");
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error("Error fetching FAQs:", error);
        throw new Error(error.message || "Failed to fetch FAQs");
      }
      console.log("Fetched FAQs successfully:", data);
      return data as FAQ[];
    },
  });
  
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = activeCategory === null || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const groupedFaqs = categories.map(category => ({
    category,
    faqs: filteredFaqs.filter(faq => faq.category === category)
  })).filter(group => group.faqs.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-2">Loading FAQs...</p> {/* Added loading text for clarity */}
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="min-h-screen bg-background pt-20 flex flex-col items-center justify-center">
        <p className="text-red-500">Error loading FAQs: {queryError.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="bg-brand-600 dark:bg-brand-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display animate-fade-in text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-xl mb-6 animate-fade-in text-white/90">
              Find answers to common questions about TravelBus services and policies
            </p>
            
            <div className="max-w-xl mx-auto mt-8 relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search for questions..." 
                className="pl-10 bg-white/90 border-0 focus-visible:ring-white text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-background dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-gray-100">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === null 
                        ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-medium' 
                        : 'hover:bg-muted dark:hover:bg-gray-700 text-foreground dark:text-gray-300'
                    }`}
                  >
                    All Categories
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeCategory === category 
                          ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-medium' 
                          : 'hover:bg-muted dark:hover:bg-gray-700 text-foreground dark:text-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* FAQ Accordions */}
            <div className="lg:w-3/4">
              {searchTerm && (
                <div className="mb-6">
                  <p className="text-muted-foreground dark:text-gray-400">
                    {filteredFaqs.length} results for "{searchTerm}"
                  </p>
                </div>
              )}
              
              {groupedFaqs.length > 0 ? (
                groupedFaqs.map((group) => (
                  <div key={group.category} className="mb-8 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-gray-100">{group.category}</h2>
                    <Accordion type="single" collapsible className="space-y-4">
                      {group.faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="bg-card dark:bg-gray-800 rounded-lg shadow-sm border border-border dark:border-gray-700">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 dark:hover:bg-gray-700/50 text-foreground dark:text-gray-100">
                            <span className="text-left font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4 pt-0 text-muted-foreground dark:text-gray-300">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-card dark:bg-gray-800 rounded-lg shadow-sm border border-border dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-gray-100">No results found</h3>
                  <p className="text-muted-foreground dark:text-gray-400 mb-6">
                    We couldn't find any FAQs matching your search. Please try different keywords or browse by category.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory(null);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Still Have Questions */}
      <section className="py-12 bg-muted dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-gray-100">Still Have Questions?</h2>
            <p className="text-lg text-muted-foreground dark:text-gray-400 mb-6">
              If you couldn't find the answer you were looking for, our customer service team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.href = 'tel:1-800-TRAVELBUS'}>
                Call 1-800-TRAVELBUS
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
