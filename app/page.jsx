"use client";

import HeroSection from "../components/Hero";
import { Card, CardContent, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { featuresData, howItWorksData, testimonialsData } from "../data/landing";
import Image from "next/image";
import Link from "next/link";

const statsData = [
  { value: '10K+', label: 'Active Users' },
  { value: '$5M+', label: 'Transactions' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stats, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.value}</div>
                <div className="text-gray-600">{stats.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to manage your finances</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {featuresData.map((feature, index) => (
              <Card key={index}>
                <CardContent className="space-y-4 pt-4" >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {howItWorksData.map((feature, index) => (
               <div key={index}>
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">{feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p>{feature.description}</p>

              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-6">
                
                <CardContent className="pt-4" >
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"/>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>

                  </div>
                  <p className="text-gray-600">{testimonial.quote}</p>
                  
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your Finances</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Welth to manage their finances effectively 
            and achieve their 
            financial goals with ease.
          </p>
          <Link href="/dashboard">
          <Button size="lg" className="px-8 bg-white text-blue-600 hover:bg-blue-animate-bounce">
            Start Free trial
          </Button>
          </Link>
            
          
        </div>
      </section>
    </div>
  );
}




