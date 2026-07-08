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
    <div className="dash-card relative h-[800px] w-full overflow-hidden p-2">
      <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
        <div className="tradingview-widget-container__widget h-[calc(100%-32px)] w-full"></div>
        <div className="tradingview-widget-copyright mt-2 text-center text-[11px]">
          <a href="https://www.tradingview.com/economic-calendar/" rel="noopener nofollow" target="_blank" className="text-ink-600 hover:underline">
            Economic Calendar
          </a>
          <span className="ml-1 text-ink-400">by TradingView</span>
        </div>
      </div>
    </div>
  );
}
