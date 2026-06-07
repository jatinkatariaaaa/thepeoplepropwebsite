'use client';

import React, { useState } from 'react';

// Gallery data defined here
const galleryData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1633885274964-d5a5d914bcb3?q=80&w=687&auto=format&fit=crop",
    title: "Abstract Art",
    description: "Explore vibrant colors and modern geometric designs"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1589194837807-30a2f9540ad9?q=80&w=687&auto=format&fit=crop",
    title: "Nature Photography",
    description: "Breathtaking landscapes and natural wonders"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1582644826651-f71401f0f3f6?q=80&w=687&auto=format&fit=crop",
    title: "Urban Design",
    description: "Modern architecture and city life captured beautifully"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1614679967638-fe153775eff6?q=80&w=765&auto=format&fit=crop",
    title: "Creative Workspace",
    description: "Inspiring workspaces for creative professionals"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1617195737496-bc30194e3a19?q=80&w=735&auto=format&fit=crop",
    title: "Digital Innovation",
    description: "The future of technology and creative tools"
  }
];

export default function ExpandingGallery() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleItemClick = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-20 relative z-10 w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-3 md:h-[450px] w-full">
          {galleryData.map((item) => {
            let sizeClasses = "md:flex-1 h-[120px] md:h-full";

            if (expandedId === item.id) {
              sizeClasses = "md:flex-[3] h-[350px] md:h-full";
            } else if (expandedId !== null) {
              sizeClasses = "md:flex-[0.5] h-[100px] md:h-full";
            } else if (hoveredId === item.id) {
              sizeClasses = "md:flex-[3] h-[120px] md:h-full";
            } else if (hoveredId !== null) {
              sizeClasses = "md:flex-[0.5] h-[120px] md:h-full";
            }

            const isVisible = expandedId === item.id || (expandedId === null && hoveredId === item.id);

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] ${sizeClasses}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handleItemClick(item.id, e)}
              >
                <a href="#" className="block w-full h-full relative group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover object-center transition-transform duration-[800ms] ease-out ${
                      isVisible ? 'scale-105' : 'scale-100'
                    }`}
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/40 to-transparent p-6 md:p-8 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                  >
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-lg">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-slate-300 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}