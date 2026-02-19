"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    image: null,
    content: "Lucy has completely transformed our content strategy. We've increased our social media engagement by 300% while spending a fraction of the time we used to on content creation.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Founder & CEO",
    company: "GrowthLabs",
    image: null,
    content: "As a startup founder, I don't have time to manage social media. Lucy handles everything automatically, and the quality of content is consistently impressive. It's like having a full-time marketing team.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Social Media Manager",
    company: "BrandCraft Agency",
    image: null,
    content: "I was skeptical at first, but Lucy's AI understands brand voice remarkably well. My clients are thrilled with the consistent, high-quality content. I can now focus on strategy instead of content creation.",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Marketers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about how Lucy has transformed their marketing workflow.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary/10">
                <Quote className="w-10 h-10" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Trusted by marketing teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <div className="text-2xl font-bold text-foreground">TechStart</div>
            <div className="text-2xl font-bold text-foreground">GrowthLabs</div>
            <div className="text-2xl font-bold text-foreground">BrandCraft</div>
            <div className="text-2xl font-bold text-foreground">ScaleUp</div>
            <div className="text-2xl font-bold text-foreground">InnovateCo</div>
          </div>
        </div>
      </div>
    </section>
  );
}
