"use client";

import { 
  Clock, 
  Zap, 
  BarChart3,
  Calendar,
  Target,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Stop spending hours brainstorming content ideas. Lucy automatically generates engaging posts tailored to your brand voice.",
    before: "Hours spent manually creating content",
    after: "Automated daily content generation"
  },
  {
    icon: Target,
    title: "Consistent Brand Voice",
    description: "Lucy learns your brand's unique voice and maintains consistency across all your marketing channels.",
    before: "Inconsistent messaging across platforms",
    after: "Unified brand voice everywhere"
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description: "Get weekly analytics and recommendations to optimize your content strategy and grow your audience.",
    before: "Guessing what content works",
    after: "Data-backed content decisions"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Before & After Lucy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Lucy transforms your marketing workflow and helps you achieve better results with less effort.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {feature.description}
              </p>

              {/* Before/After */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-destructive text-xs">✕</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{feature.before}</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{feature.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Content Calendar</h4>
              <p className="text-sm text-muted-foreground">Plan and schedule weeks ahead</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Instant Generation</h4>
              <p className="text-sm text-muted-foreground">Create content in seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Multi-Platform</h4>
              <p className="text-sm text-muted-foreground">Twitter, LinkedIn, Instagram & more</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
