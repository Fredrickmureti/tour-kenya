
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 bg-brand-700 dark:bg-brand-800 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 font-display">
          Ready to Experience Premium Bus Travel?
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Book your journey today and enjoy comfortable, reliable transportation to your destination.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/routes">
            <Button className="bg-white text-brand-700 hover:bg-gray-100 px-8 py-6 text-lg">
              Book Now
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
