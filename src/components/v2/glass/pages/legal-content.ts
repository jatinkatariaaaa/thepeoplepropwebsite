/**
 * The legal pages' text, moved verbatim from the current site's page files
 * (src/app/{terms,privacy,cookie,aml-policy,risk-disclosure}/page.tsx) so the
 * glass versions render the same words. **bold** marks the original <strong>.
 */
export type LegalBlock = { type: "p"; text: string } | { type: "list"; items: string[] };
export type LegalDoc = { title: string; updated: string; intro: LegalBlock[]; sections: { heading: string; blocks: LegalBlock[] }[] };
export type LegalKey = "terms" | "privacy" | "cookie" | "aml-policy" | "risk-disclosure";

export const LEGAL: Record<LegalKey, LegalDoc> = {
  "terms": {
    "title": "Terms of Service",
    "updated": "Last Updated: June 2026",
    "intro": [
      {
        "type": "p",
        "text": "Welcome to The People Prop. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully."
      }
    ],
    "sections": [
      {
        "heading": "1. Acceptance of Terms",
        "blocks": [
          {
            "type": "p",
            "text": "By registering for an account, purchasing a challenge, or participating in our trading evaluation programs, you confirm that you are at least 18 years old and possess the legal authority to enter into these Terms of Service."
          }
        ]
      },
      {
        "heading": "2. Services Provided",
        "blocks": [
          {
            "type": "p",
            "text": "The People Prop provides proprietary trading evaluation services. We offer demo accounts for users to prove their trading skills based on specific rules and objectives. Successful completion of an evaluation may lead to an offer to trade a funded account, subject to an independent contractor agreement."
          },
          {
            "type": "p",
            "text": "**Important Notice:** We do not provide financial advice, investment services, or act as a broker. All trading during the evaluation phase occurs in a simulated environment."
          }
        ]
      },
      {
        "heading": "3. Evaluation Rules and Conduct",
        "blocks": [
          {
            "type": "p",
            "text": "Participants must adhere strictly to the trading rules outlined for their specific challenge. These rules include, but are not limited to:"
          },
          {
            "type": "list",
            "items": [
              "Adhering to daily and maximum drawdown limits.",
              "Meeting the specified profit targets.",
              "Refraining from prohibited trading strategies (e.g., latency arbitrage, malicious hedging, exploiting demo environments)."
            ]
          },
          {
            "type": "p",
            "text": "Violation of any rules will result in immediate termination of the evaluation account without a refund."
          }
        ]
      },
      {
        "heading": "4. Fees and Refunds",
        "blocks": [
          {
            "type": "p",
            "text": "All fees paid for evaluations and add-ons are strictly non-refundable once the evaluation account has been actively traded. Refunds may only be granted if requested prior to executing the first trade on the account."
          }
        ]
      },
      {
        "heading": "5. Intellectual Property",
        "blocks": [
          {
            "type": "p",
            "text": "All content on this website, including logos, texts, graphics, and software, is the property of The People Prop and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission."
          }
        ]
      },
      {
        "heading": "6. Limitation of Liability",
        "blocks": [
          {
            "type": "p",
            "text": "The People Prop is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of our services. Trading carries a high level of risk, and you assume full responsibility for any outcomes related to your trading activities."
          }
        ]
      },
      {
        "heading": "7. Termination",
        "blocks": [
          {
            "type": "p",
            "text": "We reserve the right to suspend or terminate your account at any time if we suspect you have violated these Terms of Service, engaged in fraudulent activity, or abused our systems."
          }
        ]
      },
      {
        "heading": "8. Governing Law",
        "blocks": [
          {
            "type": "p",
            "text": "These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which The People Prop operates, without regard to its conflict of law principles."
          }
        ]
      }
    ]
  },
  "privacy": {
    "title": "Privacy Policy",
    "updated": "Last Updated: June 2026",
    "intro": [
      {
        "type": "p",
        "text": "At The People Prop, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services."
      }
    ],
    "sections": [
      {
        "heading": "1. Information We Collect",
        "blocks": [
          {
            "type": "p",
            "text": "We may collect the following types of information:"
          },
          {
            "type": "list",
            "items": [
              "**Personal Identification Information:** Name, email address, phone number, and physical address when you register for an account or participate in challenges.",
              "**Financial Information:** Payment details, billing address, and crypto wallet addresses used for payouts. Payments are processed securely via third-party gateways; we do not store full card details.",
              "**Usage Data:** Information on how you interact with our platform, including IP addresses, browser types, and trading performance metrics."
            ]
          }
        ]
      },
      {
        "heading": "2. How We Use Your Information",
        "blocks": [
          {
            "type": "p",
            "text": "We use the collected data for various purposes, including:"
          },
          {
            "type": "list",
            "items": [
              "To provide, maintain, and improve our proprietary trading services.",
              "To process your payments and distribute payouts accurately.",
              "To verify your identity and ensure compliance with our AML and KYC policies.",
              "To communicate with you regarding your account, updates, and promotional offers."
            ]
          }
        ]
      },
      {
        "heading": "3. Data Sharing and Disclosure",
        "blocks": [
          {
            "type": "p",
            "text": "We do not sell or rent your personal information to third parties. We may share your information with trusted third-party service providers (e.g., payment processors, trading platforms, identity verification services) solely to facilitate our services. All third parties are obligated to maintain the confidentiality and security of your data."
          }
        ]
      },
      {
        "heading": "4. Data Security",
        "blocks": [
          {
            "type": "p",
            "text": "We implement industry-standard security measures, including encryption and secure server hosting, to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
          }
        ]
      },
      {
        "heading": "5. Your Data Rights",
        "blocks": [
          {
            "type": "p",
            "text": "Depending on your location, you may have the right to access, correct, update, or request deletion of your personal data. You can manage your account information through your dashboard or contact our support team for assistance."
          }
        ]
      },
      {
        "heading": "6. Changes to This Policy",
        "blocks": [
          {
            "type": "p",
            "text": "We reserve the right to update this Privacy Policy at any time. We will notify you of any significant changes by posting the new policy on this page and updating the \"Last Updated\" date."
          }
        ]
      },
      {
        "heading": "7. Contact Us",
        "blocks": [
          {
            "type": "p",
            "text": "If you have any questions or concerns about this Privacy Policy, please contact us at support@thepeopleprop.com."
          }
        ]
      }
    ]
  },
  "cookie": {
    "title": "Cookie Policy",
    "updated": "Last Updated: June 2026",
    "intro": [
      {
        "type": "p",
        "text": "This Cookie Policy explains how The People Prop uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them."
      }
    ],
    "sections": [
      {
        "heading": "What are cookies?",
        "blocks": [
          {
            "type": "p",
            "text": "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information."
          }
        ]
      },
      {
        "heading": "Why do we use cookies?",
        "blocks": [
          {
            "type": "p",
            "text": "We use first-party and third-party cookies for several reasons:"
          },
          {
            "type": "list",
            "items": [
              "**Essential Cookies:** Some cookies are required for technical reasons in order for our website to operate, such as enabling secure user logins and managing sessions.",
              "**Performance and Analytics Cookies:** These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously (e.g., Google Analytics).",
              "**Functional Cookies:** These cookies enable the website to provide enhanced functionality and personalization, such as remembering your language or region preferences.",
              "**Targeting/Advertising Cookies:** These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement."
            ]
          }
        ]
      },
      {
        "heading": "How can I control cookies?",
        "blocks": [
          {
            "type": "p",
            "text": "You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer."
          },
          {
            "type": "p",
            "text": "Please note that if you choose to reject cookies, doing so may impair some of our website's functionality and prevent you from accessing certain features, such as the dashboard or checkout processes."
          }
        ]
      },
      {
        "heading": "Updates to this policy",
        "blocks": [
          {
            "type": "p",
            "text": "We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies."
          }
        ]
      }
    ]
  },
  "aml-policy": {
    "title": "Anti-Money Laundering (AML) Policy",
    "updated": "Last Updated: June 2026",
    "intro": [
      {
        "type": "p",
        "text": "The People Prop is committed to the highest standards of Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) compliance. This policy outlines our procedures to prevent our services from being used for illicit purposes."
      }
    ],
    "sections": [
      {
        "heading": "1. Know Your Customer (KYC)",
        "blocks": [
          {
            "type": "p",
            "text": "Before we issue any payouts or establish a funded contractor relationship with a trader, we require mandatory KYC verification. You will be required to provide:"
          },
          {
            "type": "list",
            "items": [
              "A valid, government-issued photographic identification (e.g., Passport, National ID, or Driver's License).",
              "Proof of residential address issued within the last 3 months (e.g., utility bill or bank statement).",
              "A live selfie or biometric verification through our third-party verification partners."
            ]
          }
        ]
      },
      {
        "heading": "2. Prohibited Jurisdictions",
        "blocks": [
          {
            "type": "p",
            "text": "The People Prop does not offer services to residents of certain sanctioned countries and jurisdictions, as determined by major global regulatory bodies (e.g., OFAC, UN, EU). If you reside in a restricted region, your account will be suspended, and any fees paid will not be refunded."
          }
        ]
      },
      {
        "heading": "3. Payment and Payout Source Verification",
        "blocks": [
          {
            "type": "p",
            "text": "We strictly enforce a \"closed-loop\" payment system wherever possible. This means that:"
          },
          {
            "type": "list",
            "items": [
              "Payments for evaluation accounts must come from an account or crypto wallet in your own name.",
              "Payouts of your profit split will only be sent to bank accounts or crypto wallets that have been verified to belong to you.",
              "Third-party payments are strictly prohibited and will be rejected."
            ]
          }
        ]
      },
      {
        "heading": "4. Monitoring and Reporting",
        "blocks": [
          {
            "type": "p",
            "text": "Our compliance team actively monitors all transactions, including challenge purchases and profit payouts, for suspicious activity. Any transactions that raise red flags will be investigated. We reserve the right to report suspicious activities to the relevant financial intelligence units or law enforcement agencies without prior notice to the user."
          }
        ]
      },
      {
        "heading": "5. Account Suspension",
        "blocks": [
          {
            "type": "p",
            "text": "Failure to comply with our KYC requirements or any suspicion of involvement in money laundering, terrorist financing, or fraud will result in the immediate and permanent suspension of your account and forfeiture of any simulated profits."
          }
        ]
      }
    ]
  },
  "risk-disclosure": {
    "title": "Risk Disclosure",
    "updated": "Last Updated: June 2026",
    "intro": [
      {
        "type": "p",
        "text": "Trading foreign exchange (Forex), contracts for difference (CFDs), cryptocurrencies, and other financial instruments carries a high level of risk and may not be suitable for all individuals. Before participating in our evaluation programs, you should carefully consider this Risk Disclosure."
      }
    ],
    "sections": [
      {
        "heading": "1. Simulated Trading Environment",
        "blocks": [
          {
            "type": "p",
            "text": "**All accounts provided during the evaluation phase are simulated (demo) accounts.** You are trading with virtual funds in a simulated environment. Your performance in this simulated environment does not guarantee future success in live trading."
          },
          {
            "type": "p",
            "text": "Even after passing an evaluation and being offered a \"Funded Account\", your trades may still be executed in a simulated environment, and your compensation will be based on the simulated performance according to your contractor agreement. We do not act as a broker, and you are not risking your own capital beyond the initial evaluation fee."
          }
        ]
      },
      {
        "heading": "2. No Financial Advice",
        "blocks": [
          {
            "type": "p",
            "text": "Information provided on The People Prop website, social media, discord community, or any educational materials does not constitute financial, investment, or trading advice. All information is provided for educational and informational purposes only. You must make your own trading decisions based on your own judgment."
          }
        ]
      },
      {
        "heading": "3. High Risk of Loss",
        "blocks": [
          {
            "type": "p",
            "text": "The high degree of leverage that is often obtainable in forex and CFD trading can work against you as well as for you. The use of leverage can lead to large losses as well as gains. You could lose some or all of your initial evaluation fee if you fail to meet the challenge objectives or violate the trading rules."
          }
        ]
      },
      {
        "heading": "4. Hypothetical Performance Results",
        "blocks": [
          {
            "type": "p",
            "text": "Hypothetical or simulated performance results have certain inherent limitations. Unlike an actual performance record, simulated results do not represent actual live trading. Since the trades have not actually been executed in a live market, the results may have under-or-over compensated for the impact, if any, of certain market factors, such as lack of liquidity."
          }
        ]
      },
      {
        "heading": "5. Technological Risks",
        "blocks": [
          {
            "type": "p",
            "text": "Trading on an electronic platform carries inherent risks. These include, but are not limited to, hardware failures, software malfunctions, internet connectivity issues, and platform downtime. The People Prop is not responsible for any losses or failed evaluations resulting from such technological failures."
          }
        ]
      },
      {
        "heading": "Acknowledgment",
        "blocks": [
          {
            "type": "p",
            "text": "By purchasing an evaluation challenge, you acknowledge that you have read, understood, and accept all the risks detailed in this disclosure."
          }
        ]
      }
    ]
  }
};
