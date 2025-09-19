import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import Section from '../components/Section';
import Icon from '../components/Icon';
import { typography } from '../lib/typography';
import { ROUTE_PATHS } from '../lib/routes';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate(ROUTE_PATHS.CURRENT_EVENTS);
  };

  const features = [
    {
      icon: 'lightning',
      title: 'Effortless Event Setup',
      description: 'Create and manage skill-swap events, workshops, or fairs with simple, intuitive tools.',
      iconBgColor: 'bg-primary-100',
      iconColor: 'text-primary-600'
    },
    {
      icon: 'lock',
      title: 'Smart Venue Mapping',
      description: 'Design room layouts, booths, and stations so everyone knows where to go.',
      iconBgColor: 'bg-secondary-100',
      iconColor: 'text-secondary-600'
    },
    {
      icon: 'heart',
      title: 'Built-In Analytics',
      description: 'Track attendance, gather feedback, and measure outcomes to improve future events.',
      iconBgColor: 'bg-primary-100',
      iconColor: 'text-primary-600'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section background="gradient" padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left">
          <h1 className={`${typography.h1} text-gray-900 mb-6`}>
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                SonderSwap
              </span>
            </h1>
            <p className={`${typography.bodyLarge} text-gray-600 mb-8 max-w-2xl`}>
              Empowering communities to share skills, host workshops, and organize maker fairs all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCtaClick}
                className="px-8 py-4"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  // Scroll to the features section
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl shadow-2xl flex items-center justify-center">
                <Icon name="lightning" size="xl" className="w-48 h-48 text-primary-600" strokeWidth={1.5} />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary-300 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-300 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </Section>

      {/* Features Preview */}
      <Section background="white" padding="xl" id="features">
        <div className="text-center mb-16">
          <h2 className={`${typography.h2} text-gray-900 mb-4`}>
            Why Choose SonderSwap?
          </h2>
          <p className={`${typography.body} text-gray-600 max-w-3xl mx-auto`}>
            Give your community the tools to connect, teach, and learn while you stay in control as the organizer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconBgColor={feature.iconBgColor}
              iconColor={feature.iconColor}
            />
          ))}
        </div>
      </Section>
    </>
  );
};

export default Home;

