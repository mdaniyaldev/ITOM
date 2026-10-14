'use client';

import { Button } from "@/components/ui/button";

export default function HeroButtons() {
  const handleIdeaClick = () => {
    // TODO: Implement idea submission flow
    alert("Idea submission feature coming soon!");
  };

  const handleInvestorClick = () => {
    // TODO: Implement investor exploration
    alert("Investor feature coming soon!");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        variant="default"
        className="px-8 py-3"
        onClick={handleIdeaClick}
      >
        I have an idea
      </Button>
      <Button
        variant="outline"
        className="px-8 py-3"
        onClick={handleInvestorClick}
      >
        I want to invest
      </Button>
    </div>
  );
}