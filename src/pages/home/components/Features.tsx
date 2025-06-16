
import React from 'react';
import { MapPin, Clock, Users, CreditCard } from 'lucide-react';

// Features
const features = [
  {
    icon: <MapPin className="h-12 w-12 text-white" />,
    title: "Extensive Route Network",
    description: "Connect to hundreds of destinations across the country with our comprehensive route network.",
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    icon: <Clock className="h-12 w-12 text-white" />,
    title: "Punctual Departures",
    description: "We pride ourselves on our timely departures and arrivals, respecting your schedule.",
    gradient: "from-green-500 to-green-600",
    bgColor: "bg-gradient-to-br from-green-500 to-green-600"
  },
  {
    icon: <Users className="h-12 w-12 text-white" />,
    title: "Comfortable Travel",
    description: "Spacious seating, climate control, and amenities designed for your comfort.",
    gradient: "from-purple-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
  },
  {
    icon: <CreditCard className="h-12 w-12 text-white" />,
    title: "Easy Booking & Payment",
    description: "Simple online booking system with secure payment options and instant confirmation.",
    gradient: "from-orange-500 to-orange-600",
    bgColor: "bg-gradient-to-br from-orange-500 to-orange-600"
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-display">
            Why Choose <span className="text-gradient">TravelBus</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're committed to providing an exceptional travel experience with premium amenities and reliable service
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 reveal-delay-${index + 1}`}
            >
              {/* Gradient background for icon */}
              <div className={`${feature.bgColor} p-8 relative`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative flex justify-center mb-4">
                  {feature.icon}
                </div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
              </div>
              
              {/* Content section */}
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4 text-card-foreground group-hover:text-brand-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
