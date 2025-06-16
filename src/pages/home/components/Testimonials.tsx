
import React from 'react';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewForm from '@/components/reviews/ReviewForm';

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Read genuine reviews from people who have traveled with us
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <ReviewsList />
        </div>
        
        <div className="max-w-lg mx-auto mt-16">
          <ReviewForm />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
