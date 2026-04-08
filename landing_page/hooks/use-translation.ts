"use client"

import { useState, useEffect, useCallback } from "react"

// Translation hook
export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  // Persist language preference - optimized for faster loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('biobloom-language')
      if (savedLanguage && savedLanguage !== currentLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [])

  const saveLanguagePreference = (language: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('biobloom-language', language)
    }
  }

const translations = {
  en: {
      navigation: {
        home: "Home",
        products: "Products",
        about: "About",
        support: "Support",
        getStarted: "Get Started",
      },
      hero: {
        badge: "Revolutionary AI Platform",
        title: "Transform Your",
        titleHighlight: "Farming Future",
        subtitle: "Harness the power of artificial intelligence to optimize crop yields, predict weather patterns, and revolutionize your agricultural practices with BioBloom's cutting-edge solutions designed specifically for Indian farmers.",
        cta: {
          primary: "Start Your AI Journey",
          secondary: "Watch Demo",
        },
        stats: {
          farmers: "Active Farmers",
          yield: "Yield Increase",
          organic: "Organic Certified",
        },
      },
      products: {
        title: "AI-Powered Solutions",
        subtitle: "Discover our comprehensive suite of intelligent farming tools designed to maximize your agricultural productivity and sustainability.",
        exploreAll: "Explore All Products",
      },
      product: {
        cropRotation: {
          title: "Smart Crop Rotation",
          description: "AI-driven crop rotation recommendations based on soil health and climate data.",
        },
        wasteConverter: {
          title: "Waste Converter",
          description: "Transform agricultural waste into valuable compost and organic fertilizers.",
        },
        pestPredictor: {
          title: "Pest Predictor",
          description: "Predict and prevent pest infestations with advanced AI algorithms.",
        },
        vetHelper: {
          title: "Vet Helper",
          description: "AI-powered livestock health monitoring and disease prevention.",
        },
        blockchain: {
          title: "Blockchain Supply Chain",
          description: "Transparent and secure supply chain management for agricultural products.",
        },
        aiHub: {
          title: "AI Hub Dashboard",
          description: "Unified platform for all your AI-powered farming needs.",
        },
      },
      features: {
        title: "Why Choose BioBloom?",
        subtitle: "Our platform is built with Indian farmers in mind, offering features that truly matter for your success.",
        multilingual: {
          title: "Multi-Language Support",
          description: "Available in Hindi and Kannada with more languages coming soon. Get support in your native language.",
        },
        organic: {
          title: "100% Organic Focus",
          description: "All our recommendations and solutions promote organic farming practices, ensuring sustainable and healthy agricultural production.",
        },
        farmerCentric: {
          title: "Farmer-Centric Design",
          description: "Built by farmers, for farmers. Every feature is designed based on real feedback from Indian agricultural communities.",
        },
      },
      cta: {
        title: "Ready to Transform Your Farming?",
        subtitle: "Join thousands of farmers who are already experiencing the benefits of AI-powered agriculture. Start your journey today with a free trial.",
        primary: "Get Started Free",
        secondary: "Contact Sales",
      },
      about: {
        title: "Empowering Indian Agriculture with AI Innovation",
        subtitle: "Founded by agricultural experts and AI pioneers, BioBloom is on a mission to transform Indian farming through intelligent, accessible, and sustainable technology solutions.",
        mission: "Our Mission",
        vision: "Our Vision",
        impact: "Our Impact",
        founders: "Meet Our Founders",
        journey: "Our Journey",
        values: "Our Core Values",
        recognition: "Recognition & Awards",
        joinMission: "Join Our Mission",
        partnerWithUs: "Partner With Us",
        startJourney: "Start Your Journey",
      },
      productsPage: {
        heroTitle: "Revolutionary AI Tools for Modern Indian Farming",
        heroSubtitle: "Discover our comprehensive suite of AI-powered agricultural tools designed specifically for Indian farmers. From crop management to livestock care, we've got every aspect of your farm covered.",
        detailedInfo: "Detailed Product Information",
        affordablePricing: "Affordable Pricing for Every Farm Size",
        completeSuite: "Complete Suite",
        individualTools: "Individual Tools",
        enterprise: "Enterprise",
        transformFarm: "Ready to Transform Your Farm with AI?",
        joinFarmers: "Join thousands of Indian farmers who are already using BioBloom to increase yields, reduce costs, and build sustainable agricultural practices.",
      },
      support: {
        title: "24/7 Support in Your Language",
        subtitle: "Get help when you need it, in the language you're comfortable with",
        contactUs: "Contact Us",
        documentation: "Documentation",
        tutorials: "Video Tutorials",
        community: "Community Forum",
      },
      footer: {
        company: "Company",
        products: "Products",
        support: "Support",
        legal: "Legal",
        followUs: "Follow Us",
        newsletter: "Newsletter",
        subscribe: "Subscribe",
        allRightsReserved: "All rights reserved",
      },
      common: {
        learnMore: "Learn More",
        startFreeTrial: "Use FREE Now",
        startUsingFree: "Start Using FREE",
        useFreeNow: "Use FREE Now",
        scheduleDemo: "Schedule Demo",
        watchDemo: "Watch Demo",
        contactSales: "Contact Sales",
        pricing: "Pricing",
        features: "Features",
        benefits: "Benefits",
        getStarted: "Get Started",
        readMore: "Read More",
        viewAll: "View All",
        backToHome: "Back to Home",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        cancel: "Cancel",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        share: "Share",
        download: "Download",
        upload: "Upload",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        next: "Next",
        previous: "Previous",
        close: "Close",
        open: "Open",
        yes: "Yes",
        no: "No",
        free: "FREE",
        freeForFarmers: "FREE for Farmers",
        completelyFree: "Completely FREE",
        noSignupRequired: "No Registration Required",
      },
  },
  hi: {
      navigation: {
        home: "होम",
        products: "उत्पाद",
        about: "हमारे बारे में",
        support: "सहायता",
        getStarted: "शुरू करें",
      },
      hero: {
        badge: "क्रांतिकारी AI प्लेटफॉर्म",
        title: "अपनी खेती का",
        titleHighlight: "भविष्य बदलें",
        subtitle: "कृत्रिम बुद्धिमत्ता की शक्ति का उपयोग करके फसल की पैदावार को अनुकूलित करें, मौसम के पैटर्न की भविष्यवाणी करें और BioBloom के अत्याधुनिक समाधानों के साथ अपने कृषि अभ्यास में क्रांति लाएं जो विशेष रूप से भारतीय किसानों के लिए डिज़ाइन किए गए हैं।",
        cta: {
          primary: "अपनी AI यात्रा शुरू करें",
          secondary: "डेमो देखें",
        },
        stats: {
          farmers: "सक्रिय किसान",
          yield: "उपज में वृद्धि",
          organic: "जैविक प्रमाणित",
        },
      },
      products: {
        title: "AI-संचालित समाधान",
        subtitle: "अपनी कृषि उत्पादकता और स्थिरता को अधिकतम करने के लिए डिज़ाइन किए गए बुद्धिमान खेती उपकरणों के हमारे व्यापक सूट की खोज करें।",
        exploreAll: "सभी उत्पादों का अन्वेषण करें",
      },
      product: {
        cropRotation: {
          title: "स्मार्ट फसल चक्र",
          description: "मिट्टी के स्वास्थ्य और जलवायु डेटा के आधार पर AI-संचालित फसल चक्र सिफारिशें।",
        },
        wasteConverter: {
          title: "कचरा परिवर्तक",
          description: "कृषि अपशिष्ट को मूल्यवान खाद और जैविक उर्वरकों में बदलें।",
        },
        pestPredictor: {
          title: "कीट भविष्यवक्ता",
          description: "उन्नत AI एल्गोरिदम के साथ कीट संक्रमण की भविष्यवाणी और रोकथाम।",
        },
        vetHelper: {
          title: "पशु चिकित्सा सहायक",
          description: "AI-संचालित पशुधन स्वास्थ्य निगरानी और रोग रोकथाम।",
        },
        blockchain: {
          title: "ब्लॉकचेन आपूर्ति श्रृंखला",
          description: "कृषि उत्पादों के लिए पारदर्शी और सुरक्षित आपूर्ति श्रृंखला प्रबंधन।",
        },
        aiHub: {
          title: "AI हब डैशबोर्ड",
          description: "आपकी सभी AI-संचालित खेती की जरूरतों के लिए एकीकृत प्लेटफॉर्म।",
        },
      },
      features: {
        title: "BioBloom को क्यों चुनें?",
        subtitle: "हमारा प्लेटफॉर्म भारतीय किसानों को ध्यान में रखकर बनाया गया है, जो आपकी सफलता के लिए वास्तव में महत्वपूर्ण सुविधाएं प्रदान करता है।",
        multilingual: {
          title: "बहु-भाषा समर्थन",
          description: "हिंदी और कन्नड़ में उपलब्ध है, और अधिक भाषाएं जल्द ही आ रही हैं। अपनी मातृभाषा में समर्थन प्राप्त करें।",
        },
        organic: {
          title: "100% जैविक फोकस",
          description: "हमारी सभी सिफारिशें और समाधान जैविक खेती प्रथाओं को बढ़ावा देते हैं, टिकाऊ और स्वस्थ कृषि उत्पादन सुनिश्चित करते हैं।",
        },
        farmerCentric: {
          title: "किसान-केंद्रित डिज़ाइन",
          description: "किसानों द्वारा, किसानों के लिए बनाया गया। हर सुविधा वास्तविक भारतीय कृषि समुदायों के फीडबैक के आधार पर डिज़ाइन की गई है।",
        },
      },
      cta: {
        title: "अपनी खेती को बदलने के लिए तैयार हैं?",
        subtitle: "हजारों किसानों में शामिल हों जो पहले से ही AI-संचालित कृषि के लाभों का अनुभव कर रहे हैं। मुफ्त परीक्षण के साथ आज ही अपनी यात्रा शुरू करें।",
        primary: "मुफ्त में शुरू करें",
        secondary: "बिक्री से संपर्क करें",
      },
      about: {
        title: "AI नवाचार के साथ भारतीय कृषि को सशक्त बनाना",
        subtitle: "कृषि विशेषज्ञों और AI अग्रणियों द्वारा स्थापित, BioBloom बुद्धिमान, सुलभ और टिकाऊ प्रौद्योगिकी समाधानों के माध्यम से भारतीय कृषि को बदलने के मिशन पर है।",
        mission: "हमारा मिशन",
        vision: "हमारी दृष्टि",
        impact: "हमारा प्रभाव",
        founders: "हमारे संस्थापकों से मिलें",
        journey: "हमारी यात्रा",
        values: "हमारे मूल मूल्य",
        recognition: "पहचान और पुरस्कार",
        joinMission: "हमारे मिशन में शामिल हों",
        partnerWithUs: "हमारे साथ भागीदारी करें",
        startJourney: "अपनी यात्रा शुरू करें",
      },
      productsPage: {
        heroTitle: "आधुनिक भारतीय कृषि के लिए क्रांतिकारी AI उपकरण",
        heroSubtitle: "विशेष रूप से भारतीय किसानों के लिए डिज़ाइन किए गए AI-संचालित कृषि उपकरणों के हमारे व्यापक सूट की खोज करें। फसल प्रबंधन से लेकर पशुधन देखभाल तक, हमारे पास आपके खेत के हर पहलू का समाधान है।",
        detailedInfo: "विस्तृत उत्पाद जानकारी",
        affordablePricing: "हर खेत के आकार के लिए किफायती मूल्य निर्धारण",
        completeSuite: "पूरा सूट",
        individualTools: "व्यक्तिगत उपकरण",
        enterprise: "एंटरप्राइज़",
        transformFarm: "AI के साथ अपने खेत को बदलने के लिए तैयार हैं?",
        joinFarmers: "हजारों भारतीय किसानों से जुड़ें जो पहले से ही BioBloom का उपयोग करके उपज बढ़ाने, लागत कम करने और टिकाऊ कृषि प्रथाओं का निर्माण कर रहे हैं।",
      },
      support: {
        title: "आपकी भाषा में 24/7 सहायता",
        subtitle: "जब आपको जरूरत हो तो सहायता प्राप्त करें, उस भाषा में जिसमें आप सहज हैं",
        contactUs: "हमसे संपर्क करें",
        documentation: "प्रलेखन",
        tutorials: "वीडियो ट्यूटोरियल",
        community: "कम्युनिटी फोरम",
      },
      footer: {
        company: "कंपनी",
        products: "उत्पाद",
        support: "सहायता",
        legal: "कानूनी",
        followUs: "हमें फॉलो करें",
        newsletter: "न्यूज़लेटर",
        subscribe: "सब्सक्राइब करें",
        allRightsReserved: "सभी अधिकार सुरक्षित",
      },
      common: {
        learnMore: "और जानें",
        startFreeTrial: "अभी मुफ़्त उपयोग करें",
        startUsingFree: "मुफ़्त शुरू करें",
        useFreeNow: "अभी मुफ़्त उपयोग करें",
        scheduleDemo: "डेमो का समय निर्धारित करें",
        watchDemo: "डेमो देखें",
        contactSales: "बिक्री से संपर्क करें",
        pricing: "मूल्य निर्धारण",
        features: "विशेषताएं",
        benefits: "लाभ",
        getStarted: "शुरू करें",
        readMore: "और पढ़ें",
        viewAll: "सभी देखें",
        backToHome: "होम पर वापस",
        loading: "लोड हो रहा है...",
        error: "त्रुटि",
        success: "सफलता",
        cancel: "रद्द करें",
        save: "सेव करें",
        edit: "संपादित करें",
        delete: "हटाएं",
        share: "साझा करें",
        download: "डाउनलोड",
        upload: "अपलोड",
        search: "खोजें",
        filter: "फिल्टर",
        sort: "क्रमबद्ध करें",
        next: "अगला",
        previous: "पिछला",
        close: "बंद करें",
        open: "खोलें",
        yes: "हाँ",
        no: "नहीं",
        free: "मुफ़्त",
        freeForFarmers: "किसानों के लिए मुफ़्त",
        completelyFree: "पूर्णतः मुफ़्त",
        noSignupRequired: "पंजीकरण की आवश्यकता नहीं",
      },
    },
    kn: {
      navigation: {
        home: "ಮುಖ್ಯಪುಟ",
        products: "ಉತ್ಪನ್ನಗಳು",
        about: "ನಮ್ಮ ಬಗ್ಗೆ",
        support: "ಬೆಂಬಲ",
        getStarted: "ಪ್ರಾರಂಭಿಸಿ",
      },
      hero: {
        badge: "ಕ್ರಾಂತಿಕಾರಿ AI ವೇದಿಕೆ",
        title: "ನಿಮ್ಮ ಕೃಷಿಯ",
        titleHighlight: "ಭವಿಷ್ಯವನ್ನು ಬದಲಾಯಿಸಿ",
        subtitle: "ಕೃತ್ರಿಮ ಬುದ್ಧಿಮತ್ತೆಯ ಶಕ್ತಿಯನ್ನು ಬಳಸಿಕೊಂಡು ಬೆಳೆ ಇಳುವರಿಯನ್ನು ಅತ್ಯುತ್ತಮಗೊಳಿಸಿ, ಹವಾಮಾನ ಮಾದರಿಗಳನ್ನು ಊಹಿಸಿ ಮತ್ತು ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ BioBloom ನ ಅತ್ಯಾಧುನಿಕ ಪರಿಹಾರಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಕೃಷಿ ಅಭ್ಯಾಸಗಳಲ್ಲಿ ಕ್ರಾಂತಿ ತನ್ನಿ।",
        cta: {
          primary: "ನಿಮ್ಮ AI ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
          secondary: "ಡೆಮೋ ನೋಡಿ",
        },
        stats: {
          farmers: "ಸಕ್ರಿಯ ರೈತರು",
          yield: "ಇಳುವರಿ ಹೆಚ್ಚಳ",
          organic: "ಸಾವಯವ ಪ್ರಮಾಣೀಕೃತ",
        },
      },
      products: {
        title: "AI-ಚಾಲಿತ ಪರಿಹಾರಗಳು",
        subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಉತ್ಪಾದಕತೆ ಮತ್ತು ಸಮರ್ಥನೀಯತೆಯನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಬುದ್ಧಿವಂತ ಕೃಷಿ ಸಾಧನಗಳ ನಮ್ಮ ವ್ಯಾಪಕ ಸೂಟ್ ಅನ್ನು ಅನ್ವೇಷಿಸಿ।",
        exploreAll: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      },
      product: {
        cropRotation: {
          title: "ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸರದಿ",
          description: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ಹವಾಮಾನ ಡೇಟಾದ ಆಧಾರದ ಮೇಲೆ AI-ಚಾಲಿತ ಬೆಳೆ ಸರದಿ ಶಿಫಾರಸುಗಳು।",
        },
        wasteConverter: {
          title: "ತ್ಯಾಜ್ಯ ಪರಿವರ್ತಕ",
          description: "ಕೃಷಿ ತ್ಯಾಜ್ಯವನ್ನು ಮೌಲ್ಯಯುತ ಕಂಪೋಸ್ಟ್ ಮತ್ತು ಸಾವಯವ ರಸಗೊಬ್ಬರಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ।",
        },
        pestPredictor: {
          title: "ಕೀಟ ಭವಿಷ್ಯಗಾರ",
          description: "ಸುಧಾರಿತ AI ಅಲ್ಗಾರಿದಮ್‌ಗಳೊಂದಿಗೆ ಕೀಟ ಸೋಂಕುಗಳನ್ನು ಊಹಿಸಿ ಮತ್ತು ತಡೆಯಿರಿ।",
        },
        vetHelper: {
          title: "ಪಶು ವೈದ್ಯ ಸಹಾಯಕ",
          description: "AI-ಚಾಲಿತ ಪಶುಧನ ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ।",
        },
        blockchain: {
          title: "ಬ್ಲಾಕ್‌ಚೈನ್ ಪೂರೈಕೆ ಸರಪಳಿ",
          description: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳಿಗಾಗಿ ಪಾರದರ್ಶಕ ಮತ್ತು ಸುರಕ್ಷಿತ ಪೂರೈಕೆ ಸರಪಳಿ ನಿರ್ವಹಣೆ।",
        },
        aiHub: {
          title: "AI ಹಬ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
          description: "ನಿಮ್ಮ ಎಲ್ಲಾ AI-ಚಾಲಿತ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗಾಗಿ ಏಕೀಕೃತ ವೇದಿಕೆ।",
        },
      },
      features: {
        title: "BioBloom ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?",
        subtitle: "ನಮ್ಮ ವೇದಿಕೆಯನ್ನು ಭಾರತೀಯ ರೈತರನ್ನು ಮನಸ್ಸಿನಲ್ಲಿಟ್ಟುಕೊಂಡು ನಿರ್ಮಿಸಲಾಗಿದೆ, ನಿಮ್ಮ ಯಶಸ್ಸಿಗಾಗಿ ನಿಜವಾಗಿಯೂ ಮುಖ್ಯವಾದ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ನೀಡುತ್ತದೆ।",
        multilingual: {
          title: "ಬಹು-ಭಾಷಾ ಬೆಂಬಲ",
          description: "ಹಿಂದಿ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಲಭ್ಯವಿದೆ, ಹೆಚ್ಚು ಭಾಷೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ। ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಬೆಂಬಲ ಪಡೆಯಿರಿ।",
        },
        organic: {
          title: "100% ಸಾವಯವ ಗಮನ",
          description: "ನಮ್ಮ ಎಲ್ಲಾ ಶಿಫಾರಸುಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು ಸಾವಯವ ಕೃಷಿ ಪದ್ಧತಿಗಳನ್ನು ಉತ್ತೇಜಿಸುತ್ತವೆ, ಸಮರ್ಥನೀಯ ಮತ್ತು ಆರೋಗ್ಯಕರ ಕೃಷಿ ಉತ್ಪಾದನೆಯನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತವೆ।",
        },
        farmerCentric: {
          title: "ರೈತ-ಕೇಂದ್ರಿತ ವಿನ್ಯಾಸ",
          description: "ರೈತರಿಂದ, ರೈತರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ। ಪ್ರತಿ ವೈಶಿಷ್ಟ್ಯವನ್ನು ನೈಜ ಭಾರತೀಯ ಕೃಷಿ ಸಮುದಾಯಗಳ ಪ್ರತಿಕ್ರಿಯೆಯ ಆಧಾರದ ಮೇಲೆ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ।",
        },
      },
      cta: {
        title: "ನಿಮ್ಮ ಕೃಷಿಯನ್ನು ಪರಿವರ್ತಿಸಲು ಸಿದ್ಧರೇ?",
        subtitle: "AI-ಚಾಲಿತ ಕೃಷಿಯ ಪ್ರಯೋಜನಗಳನ್ನು ಈಗಾಗಲೇ ಅನುಭವಿಸುತ್ತಿರುವ ಸಾವಿರಾರು ರೈತರೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ। ಉಚಿತ ಪ್ರಯೋಗದೊಂದಿಗೆ ಇಂದೇ ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ।",
        primary: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
        secondary: "ಮಾರಾಟವನ್ನು ಸಂಪರ್ಕಿಸಿ",
      },
      about: {
        title: "AI ನಾವೀನ್ಯತೆಯೊಂದಿಗೆ ಭಾರತೀಯ ಕೃಷಿಯನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು",
        subtitle: "ಕೃಷಿ ತಜ್ಞರು ಮತ್ತು AI ಪ್ರವರ್ತಕರಿಂದ ಸ್ಥಾಪಿತವಾದ, BioBloom ಬುದ್ಧಿವಂತ, ಪ್ರವೇಶಿಸಬಹುದಾದ ಮತ್ತು ಸಮರ್ಥನೀಯ ತಂತ್ರಜ್ಞಾನ ಪರಿಹಾರಗಳ ಮೂಲಕ ಭಾರತೀಯ ಕೃಷಿಯನ್ನು ಪರಿವರ್ತಿಸುವ ಧ್ಯೇಯದಲ್ಲಿದೆ।",
        mission: "ನಮ್ಮ ಧ್ಯೇಯ",
        vision: "ನಮ್ಮ ದೃಷ್ಟಿ",
        impact: "ನಮ್ಮ ಪರಿಣಾಮ",
        founders: "ನಮ್ಮ ಸಂಸ್ಥಾಪಕರನ್ನು ಭೇಟಿ ಮಾಡಿ",
        journey: "ನಮ್ಮ ಪ್ರಯಾಣ",
        values: "ನಮ್ಮ ಮೂಲ ಮೌಲ್ಯಗಳು",
        recognition: "ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ಪ್ರಶಸ್ತಿಗಳು",
        joinMission: "ನಮ್ಮ ಧ್ಯೇಯದಲ್ಲಿ ಸೇರಿ",
        partnerWithUs: "ನಮ್ಮೊಂದಿಗೆ ಪಾಲುದಾರಿಕೆ",
        startJourney: "ನಿಮ್ಮ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
      },
      productsPage: {
        heroTitle: "ಆಧುನಿಕ ಭಾರತೀಯ ಕೃಷಿಗಾಗಿ ಕ್ರಾಂತಿಕಾರಿ AI ಸಾಧನಗಳು",
        heroSubtitle: "ವಿಶೇಷವಾಗಿ ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ AI-ಚಾಲಿತ ಕೃಷಿ ಸಾಧನಗಳ ನಮ್ಮ ವ್ಯಾಪಕ ಸೂಟ್ ಅನ್ನು ಅನ್ವೇಷಿಸಿ। ಬೆಳೆ ನಿರ್ವಹಣೆಯಿಂದ ಪಶುಪಾಲನೆಯವರೆಗೆ, ನಿಮ್ಮ ತೋಟದ ಪ್ರತಿಯೊಂದು ಅಂಶವನ್ನು ನಾವು ಒಳಗೊಂಡಿದ್ದೇವೆ।",
        detailedInfo: "ವಿವರವಾದ ಉತ್ಪನ್ನ ಮಾಹಿತಿ",
        affordablePricing: "ಪ್ರತಿ ತೋಟದ ಗಾತ್ರಕ್ಕೆ ಕೈಗೆಟುಕುವ ಬೆಲೆ",
        completeSuite: "ಸಂಪೂರ್ಣ ಸೂಟ್",
        individualTools: "ವೈಯಕ್ತಿಕ ಸಾಧನಗಳು",
        enterprise: "ಎಂಟರ್‌ಪ್ರೈಸ್",
        transformFarm: "AI ಯೊಂದಿಗೆ ನಿಮ್ಮ ತೋಟವನ್ನು ಪರಿವರ್ತಿಸಲು ಸಿದ್ಧರೇ?",
        joinFarmers: "ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು, ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಸಮರ್ಥನೀಯ ಕೃಷಿ ಅಭ್ಯಾಸಗಳನ್ನು ನಿರ್ಮಿಸಲು BioBloom ಅನ್ನು ಈಗಾಗಲೇ ಬಳಸುತ್ತಿರುವ ಸಾವಿರಾರು ಭಾರತೀಯ ರೈತರೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ।",
      },
      support: {
        title: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ 24/7 ಬೆಂಬಲ",
        subtitle: "ನಿಮಗೆ ಅಗತ್ಯವಿದ್ದಾಗ ಸಹಾಯ ಪಡೆಯಿರಿ, ನೀವು ಆರಾಮದಾಯಕವಾಗಿರುವ ಭಾಷೆಯಲ್ಲಿ",
        contactUs: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
        documentation: "ದಾಖಲಾತಿ",
        tutorials: "ವೀಡಿಯೋ ಟ್ಯುಟೋರಿಯಲ್‌ಗಳು",
        community: "ಸಮುದಾಯ ವೇದಿಕೆ",
      },
      footer: {
        company: "ಕಂಪನಿ",
        products: "ಉತ್ಪನ್ನಗಳು",
        support: "ಬೆಂಬಲ",
        legal: "ಕಾನೂನು",
        followUs: "ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ",
        newsletter: "ಸುದ್ದಿಪತ್ರ",
        subscribe: "ಚಂದಾದಾರರಾಗಿ",
        allRightsReserved: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ",
      },
      common: {
        learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
        startFreeTrial: "ಈಗ ಉಚಿತವಾಗಿ ಬಳಸಿ",
        startUsingFree: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
        useFreeNow: "ಈಗ ಉಚಿತವಾಗಿ ಬಳಸಿ",
        scheduleDemo: "ಡೆಮೋ ನಿಗದಿ ಮಾಡಿ",
        watchDemo: "ಡೆಮೋ ನೋಡಿ",
        contactSales: "ಮಾರಾಟವನ್ನು ಸಂಪರ್ಕಿಸಿ",
        pricing: "ಬೆಲೆ",
        features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
        benefits: "ಪ್ರಯೋಜನಗಳು",
        getStarted: "ಪ್ರಾರಂಭಿಸಿ",
        readMore: "ಇನ್ನಷ್ಟು ಓದಿ",
        viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
        backToHome: "ಮುಖ್ಯಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        error: "ದೋಷ",
        success: "ಯಶಸ್ಸು",
        cancel: "ರದ್ದುಮಾಡಿ",
        save: "ಉಳಿಸಿ",
        edit: "ಸಂಪಾದಿಸಿ",
        delete: "ಅಳಿಸಿ",
        share: "ಹಂಚಿಕೊಳ್ಳಿ",
        download: "ಡೌನ್‌ಲೋಡ್",
        upload: "ಅಪ್‌ಲೋಡ್",
        search: "ಹುಡುಕಿ",
        filter: "ಫಿಲ್ಟರ್",
        sort: "ವಿಂಗಡಿಸಿ",
        next: "ಮುಂದೆ",
        previous: "ಹಿಂದೆ",
        close: "ಮುಚ್ಚಿ",
        open: "ತೆರೆಯಿರಿ",
        yes: "ಹೌದು",
        no: "ಇಲ್ಲ",
        free: "ಉಚಿತ",
        freeForFarmers: "ರೈತರಿಗೆ ಉಚಿತ",
        completelyFree: "ಸಂಪೂರ್ಣವಾಗಿ ಉಚಿತ",
        noSignupRequired: "ನೋಂದಣಿ ಅಗತ್ಯವಿಲ್ಲ",
      },
    },
  }

  // Memoized translation function for better performance
  const t = useCallback((key: string) => {
    const langData = translations[currentLanguage as keyof typeof translations]
    if (!langData) return key
    
    const keys = key.split(".")
    let value: any = langData
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback to English if translation not found
        const englishData = translations.en
        let fallbackValue: any = englishData
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk]
          } else {
            return key
          }
        }
        return fallbackValue
      }
    }
    
    return typeof value === "string" ? value : key
  }, [currentLanguage])

  const changeLanguage = useCallback((language: string) => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language)
      saveLanguagePreference(language)
      // Force immediate re-render by triggering a custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }))
      }
    }
  }, [currentLanguage])

  const availableLanguages = Object.keys(translations)
  
  const getLanguageName = (code: string) => {
    const languageNames: { [key: string]: string } = {
      en: "English",
      hi: "हिंदी",
      kn: "ಕನ್ನಡ"
    }
    return languageNames[code] || code
  }

  const hasTranslation = (key: string, language?: string) => {
    const lang = language || currentLanguage
    const keys = key.split(".")
    let value: any = translations[lang as keyof typeof translations]
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return false
      }
    }
    
    return typeof value === "string"
  }

  // Listen for global language changes for immediate updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLanguageChange = (event: CustomEvent) => {
        if (event.detail !== currentLanguage) {
          setCurrentLanguage(event.detail)
        }
      }
      
      window.addEventListener('languageChanged', handleLanguageChange as EventListener)
      return () => {
        window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
      }
    }
  }, [currentLanguage])

  return { 
    t, 
    currentLanguage, 
    changeLanguage, 
    availableLanguages, 
    getLanguageName, 
    hasTranslation 
  }
}

// Intersection Observer hook for animations
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    })

    observer.observe(ref)

    return () => {
      if (ref) {
        observer.unobserve(ref)
      }
    }
  }, [ref, options])

  return [setRef, isIntersecting] as const
}

// Scroll animation hook
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

// Parallax effect hook
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0)
  const scrollY = useScrollAnimation()

  useEffect(() => {
    setOffset(scrollY * speed)
  }, [scrollY, speed])

  return offset
}
