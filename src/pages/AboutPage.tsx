
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  useAboutContent, 
  useCompanyValues, 
  useHistoryMilestones, 
  useTeamMembers, 
  useCompanyStatistics 
} from '@/hooks/useAboutContent';

const AboutPage: React.FC = () => {
  const { data: aboutContent = [], isLoading: contentLoading } = useAboutContent();
  const { data: companyValues = [], isLoading: valuesLoading } = useCompanyValues();
  const { data: historyMilestones = [], isLoading: milestonesLoading } = useHistoryMilestones();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers();
  const { data: companyStatistics = [], isLoading: statsLoading } = useCompanyStatistics();

  const isLoading = contentLoading || valuesLoading || milestonesLoading || teamLoading || statsLoading;

  // Helper function to get content by section key
  const getContent = (sectionKey: string) => {
    return aboutContent.find(content => content.section_key === sectionKey);
  };

  const heroContent = getContent('hero_title');
  const storyTitle = getContent('story_title');
  const storyContent1 = getContent('story_content_1');
  const storyContent2 = getContent('story_content_2');
  const missionTitle = getContent('mission_title');
  const ctaTitle = getContent('cta_title');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="bg-brand-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display animate-fade-in">
              {heroContent?.title || 'About TravelBus'}
            </h1>
            <p className="text-xl mb-6 animate-fade-in">
              {heroContent?.content || 'Connecting cities and people with comfortable, reliable bus transportation since 2005'}
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-display text-foreground">
                {storyTitle?.title || 'Our Story'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {storyTitle?.content || 'TravelBus began with a simple mission: to provide affordable, comfortable transportation that connects people and places. Founded in 2005, we started with just 5 buses serving the eastern corridor.'}
              </p>
              <p className="text-lg text-muted-foreground">
                {storyContent1?.content || 'Today, we\'ve grown to become one of the nation\'s premier bus transportation companies, with a modern fleet of over 200 vehicles serving routes across the entire United States.'}
              </p>
              <p className="text-lg text-muted-foreground">
                {storyContent2?.content || 'Throughout our journey, we\'ve remained committed to our core values of reliability, comfort, and customer satisfaction. We continue to innovate and improve our services to provide the best possible travel experience.'}
              </p>
              <div>
                <Button className="bg-brand-600 hover:bg-brand-700">
                  Learn More About Our History
                </Button>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img 
                src={storyTitle?.image_url || "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
                alt="TravelBus History" 
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-medium">Our first fleet in 2005</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission & Values Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              {missionTitle?.title || 'Our Mission & Values'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {missionTitle?.content || 'We\'re driven by our commitment to providing exceptional bus travel experiences while maintaining high standards in every aspect of our business.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companyValues.map((value) => (
              <Card key={value.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{value.title}</CardTitle>
                  <CardDescription>{value.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Company Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              From humble beginnings to nationwide service, explore the key milestones in the TravelBus story.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Timeline events */}
            {historyMilestones.map((milestone, index) => (
              <div 
                key={milestone.id} 
                className={`mb-12 md:mb-0 md:pb-12 relative animate-fade-in ${
                  index % 2 === 0 ? 'md:text-right' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-brand-600 border-4 border-background"></div>
                
                {/* Content */}
                <div className={`md:w-1/2 ${
                  index % 2 === 0 
                    ? 'md:pr-12 md:mr-auto' 
                    : 'md:pl-12 md:ml-auto'
                }`}>
                  <div className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="inline-block px-4 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-bold mb-3">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">Our Leadership Team</h2>
            <p className="text-lg text-muted-foreground">
              Meet the experienced professionals guiding TravelBus toward excellence in bus transportation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <img 
                  src={member.image_url || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-brand-600 dark:text-brand-400 font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {companyStatistics.map((stat) => (
              <div key={stat.id} className="p-6">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display text-foreground mb-4">
            {ctaTitle?.title || 'Ready to Experience TravelBus?'}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {ctaTitle?.content || 'Join the millions of satisfied travelers who choose TravelBus for reliable, comfortable journeys.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-brand-600 hover:bg-brand-700 px-8 py-6 text-lg">
              Book Your Journey
            </Button>
            <Button variant="outline" className="border-brand-500 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30 px-8 py-6 text-lg">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
