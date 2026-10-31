"use client";

import { useEffect, useRef, memo } from "react";

function ForexHeatmapWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent duplicate script injection in Strict Mode
    if (container.current && container.current.children.length === 1) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "width": "100%",
          "height": "100%",
          "currencies": [
            "EUR",
            "USD",
            "JPY",
            "GBP",
            "CHF",
            "AUD",
            "CAD",
            "NZD",
            "CNY"
          ],
          "isTransparent": true,
          "colorTheme": "dark",
          "locale": "en",
          "backgroundColor": "#0F0F0F"
        }`;
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container w-full h-full" ref={container}>
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
}

export default memo(ForexHeatmapWidget);
