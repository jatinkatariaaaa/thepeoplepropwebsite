"use client";

import { useEffect, useRef } from "react";

export function EconomicCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we don't inject the script multiple times (React StrictMode issue)
    if (containerRef.current && containerRef.current.querySelector("script")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "light",
        "isTransparent": false,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "countryFilter": "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu"
      }
    `;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm overflow-hidden w-full h-[800px] p-2 relative">
      <div className="tradingview-widget-container w-full h-full" ref={containerRef}>
        <div className="tradingview-widget-container__widget w-full h-[calc(100%-32px)]"></div>
        <div className="tradingview-widget-copyright text-center text-[11px] mt-2">
          <a href="https://www.tradingview.com/economic-calendar/" rel="noopener nofollow" target="_blank" className="text-[var(--accent)] hover:underline">
            Economic Calendar
          </a>
          <span className="text-[var(--ink-500)] ml-1">by TradingView</span>
        </div>
      </div>
    </div>
  );
}
