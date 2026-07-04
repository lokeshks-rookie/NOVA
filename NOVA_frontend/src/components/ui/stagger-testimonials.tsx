"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const unsplashIds = [
  "1534528741775-53994a69daeb",
  "1506794778202-cad84cf45f1d",
  "1494790108377-be9c29b29330",
  "1507003211169-0a1dd7228f2d",
  "1438761681033-6461ffad8d80",
  "1544005313-94ddf0286df2",
  "1517841905240-472988babdf9",
  "1500648767791-00dcc994a43e",
  "1531427186611-ecfd6d936c79",
  "1519085360753-af0119f7cbe7",
  "1463453091185-61582044d556",
  "1527980965255-d3b416303d12",
  "1508214751196-bcfd4ca60f91",
  "1535713875002-d1d0cf377fde",
  "1487412720507-e7ab37603c6f",
  "1521119989259-8246bc527e28",
  "1506277886164-e25aa3f4ef7f",
  "1520813792240-56fc4a3765a7",
  "1489424731084-a5d8b219a5bb",
  "1507114845806-0347f6150324",
];

const testimonials = [
  {
    tempId: 0,
    testimonial: "My favorite solution in the market. We work 5x faster with COMPANY.",
    by: "Alex, CEO at TechCorp",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[0]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 1,
    testimonial: "I'm confident my data is safe with COMPANY. I can't say that about other providers.",
    by: "Dan, CTO at SecureNet",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[1]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 2,
    testimonial: "I know it's cliche, but we were lost before we found COMPANY. Can't thank you guys enough!",
    by: "Stephanie, COO at InnovateCo",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[2]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 3,
    testimonial: "COMPANY's products make planning for the future seamless. Can't recommend them enough!",
    by: "Marie, CFO at FuturePlanning",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[3]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 4,
    testimonial: "If I could give 11 stars, I'd give 12.",
    by: "Andre, Head of Design at CreativeSolutions",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[4]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 5,
    testimonial: "SO SO SO HAPPY WE FOUND YOU GUYS!!!! I'd bet you've saved me 100 hours so far.",
    by: "Jeremy, Product Manager at TimeWise",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[5]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 6,
    testimonial: "Took some convincing, but now that we're on COMPANY, we're never going back.",
    by: "Pam, Marketing Director at BrandBuilders",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[6]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 7,
    testimonial: "I would be lost without COMPANY's in-depth analytics. The ROI is EASILY 100X for us.",
    by: "Daniel, Data Scientist at AnalyticsPro",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[7]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 8,
    testimonial: "It's just the best. Period.",
    by: "Fernando, UX Designer at UserFirst",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[8]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 9,
    testimonial: "I switched 5 years ago and never looked back.",
    by: "Andy, DevOps Engineer at CloudMasters",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[9]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 10,
    testimonial: "I've been searching for a solution like COMPANY for YEARS. So glad I finally found one!",
    by: "Pete, Sales Director at RevenueRockets",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[10]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 11,
    testimonial: "It's so simple and intuitive, we got the team up to speed in 10 minutes.",
    by: "Marina, HR Manager at TalentForge",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[11]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 12,
    testimonial: "COMPANY's customer support is unparalleled. They're always there when we need them.",
    by: "Olivia, Customer Success Manager at ClientCare",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[12]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 13,
    testimonial: "The efficiency gains we've seen since implementing COMPANY are off the charts!",
    by: "Raj, Operations Manager at StreamlineSolutions",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[13]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 14,
    testimonial: "COMPANY has revolutionized how we handle our workflow. It's a game-changer!",
    by: "Lila, Workflow Specialist at ProcessPro",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[14]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 15,
    testimonial: "The scalability of COMPANY's solution is impressive. It grows with our business seamlessly.",
    by: "Trevor, Scaling Officer at GrowthGurus",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[15]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 16,
    testimonial: "I appreciate how COMPANY continually innovates. They're always one step ahead.",
    by: "Naomi, Innovation Lead at FutureTech",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[16]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 17,
    testimonial: "The ROI we've seen with COMPANY is incredible. It's paid for itself many times over.",
    by: "Victor, Finance Analyst at ProfitPeak",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[17]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 18,
    testimonial: "COMPANY's platform is so robust, yet easy to use. It's the perfect balance.",
    by: "Yuki, Tech Lead at BalancedTech",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[18]}?auto=format&fit=crop&q=80&w=150&h=150`
  },
  {
    tempId: 19,
    testimonial: "We've tried many solutions, but COMPANY stands out in terms of reliability and performance.",
    by: "Zoe, Performance Manager at ReliableSystems",
    imgSrc: `https://images.unsplash.com/photo-${unsplashIds[19]}?auto=format&fit=crop&q=80&w=150&h=150`
  }
];

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter 
          ? "z-10 bg-cf-yellow text-cf-black border-cf-black" 
          : "z-0 bg-cf-white/[0.04] text-cf-white border-cf-white/10 hover:border-cf-white/30"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px #000000" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className={cn(
          "absolute block origin-top-right rotate-45",
          isCenter ? "bg-cf-black" : "bg-cf-white/10"
        )}
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(',')[0]}`}
        className={cn(
          "mb-4 h-14 w-12 object-cover object-top",
          isCenter ? "bg-cf-black" : "bg-cf-white/10"
        )}
        style={{
          boxShadow: "3px 3px 0px #ffffff"
        }}
      />
      <h3 className={cn(
        "text-base sm:text-xl font-medium",
        isCenter ? "text-cf-black" : "text-cf-white"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className={cn(
        "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
        isCenter ? "text-cf-black/80" : "text-cf-white/50"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-cf-black"
      style={{ height: 600 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-[#ffffff]/[0.04] border-2 border-[#ffffff]/10 text-[#ffffff] hover:bg-cf-yellow hover:border-cf-yellow hover:text-[#ffffff]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-[#ffffff]/[0.04] border-2 border-[#ffffff]/10 text-[#ffffff] hover:bg-cf-yellow hover:border-cf-yellow hover:text-[#ffffff]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
