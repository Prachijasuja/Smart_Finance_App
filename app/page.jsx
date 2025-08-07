import HeroSection from "@/components/hero";
import "./section.css";
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData } from "@/data/featuredata";

import {

  statsData,
  howItWorksData,
  testimonialsData,
} from "@/data/landing";

export default function Home() {
  return (
    <div style={{ marginTop: "100px" }}>
      <HeroSection />

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {statsData.map((statsData, index) => (
              <div key={index} className="stats-card">
                <div className="stats-value">{statsData.value}</div>
                <div className="stats-label">{statsData.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
       <section className="features-section py-10">
      <div className="features-container max-w-6xl mx-auto px-4">
        <h2 className="features-title text-3xl font-bold text-center mb-10">
          Everything you need to manage your finances
        </h2>
        <div className="features-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuresData.map((feature, index) => {
            const Icon = feature.icon; // extract the icon component
            return (
              <Card key={index} className="feature-card">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {Icon && <Icon className="mx-auto text-indigo-600" size={40} />}
                  </div>
                  <h3 className="feature-title text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="feature-description text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>

  <section className="features-section bg">
  <div className="features-container">
    <h2 className="features-title">How it works</h2>
    <div className="features-grid">
      {howItWorksData?.map((feature, index) => (
        <div key={index} className="feature-step">
          <div className="feature-icon">{feature.icon}</div>
          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
 <section className="user-testimonials">
  <div className="testimonials-container">
    <h2 className="testimonials-title">What Our Users Say</h2>

    <div className="testimonials-grid">
      {testimonialsData.map((user, index) => (
        <div key={index} className="testimonial-card">
          <div className="testimonial-content">
            <img
              src={user.image}
              alt={user.name}
              className="testimonial-avatar"
            />
            <h3 className="testimonial-name">{user.name}</h3>
            <p className="testimonial-role">{user.role}</p>
            <p className="testimonial-quote">{user.quote}</p>
          </div>
        </div>
      ))}
    </div>
</div>
</section>
<section className="cta-section">
  <div className="cta-container">
    <h2 className="cta-heading">
      Ready to take control of your finances?
    </h2>
    <p className="cta-subtext">
      Join thousands of users who are already managing their 
      finances smarter with Wealth.
    </p>
    <a href="/dashboard">
      <button className="cta-button">
        Start Free Trial
      </button>
    </a>
  </div>
</section>


    </div>
  );
}
