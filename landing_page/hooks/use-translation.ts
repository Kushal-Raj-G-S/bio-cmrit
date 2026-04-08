"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  SARVAM_LANGUAGES,
  getSarvamCode,
  getNativeName,
  ALL_LANGUAGE_CODES,
} from "@/lib/sarvam-languages"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TranslationCache {
  [langCode: string]: {
    [englishText: string]: string
  }
}

// ---------------------------------------------------------------------------
// English base strings — the single source of truth.
// Every UI text starts here; other languages are fetched via Sarvam API.
// ---------------------------------------------------------------------------
const EN_STRINGS: Record<string, any> = {
  navigation: {
    home: "Home",
    products: "Products",
    about: "About",
    support: "Support",
    getStarted: "Get Started",
  },
  hero: {
    badge: "Revolutionary AI Platform",
    madeForIndia: "Made for Indian Agriculture",
    title: "Transform Your",
    titleHighlight: "Farming Future",
    subtitle:
      "Harness the power of artificial intelligence to optimize crop yields, predict weather patterns, and revolutionize your agricultural practices with BioBloom's cutting-edge solutions designed specifically for Indian farmers.",
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
    subtitle:
      "Discover our comprehensive suite of intelligent farming tools designed to maximize your agricultural productivity and sustainability.",
    exploreAll: "Explore All Products",
  },
  product: {
    cropRotation: {
      title: "Smart Crop Rotation",
      description:
        "AI-driven crop rotation recommendations based on soil health and climate data.",
    },
    wasteConverter: {
      title: "Waste Converter",
      description:
        "Transform agricultural waste into valuable compost and organic fertilizers.",
    },
    pestPredictor: {
      title: "Pest Predictor",
      description:
        "Predict and prevent pest infestations with advanced AI algorithms.",
    },
    vetHelper: {
      title: "Vet Helper",
      description:
        "AI-powered livestock health monitoring and disease prevention.",
    },
    blockchain: {
      title: "Blockchain Supply Chain",
      description:
        "Transparent and secure supply chain management for agricultural products.",
    },
    aiHub: {
      title: "AI Hub Dashboard",
      description:
        "Unified platform for all your AI-powered farming needs.",
    },
  },
  features: {
    title: "Why Choose BioBloom?",
    subtitle:
      "Our platform is built with Indian farmers in mind, offering features that truly matter for your success.",
    multilingual: {
      title: "Multi-Language Support",
      description:
        "Available in 22 Indian languages powered by Sarvam AI. Get support in your native language.",
    },
    organic: {
      title: "100% Organic Focus",
      description:
        "All our recommendations and solutions promote organic farming practices, ensuring sustainable and healthy agricultural production.",
    },
    farmerCentric: {
      title: "Farmer-Centric Design",
      description:
        "Built by farmers, for farmers. Every feature is designed based on real feedback from Indian agricultural communities.",
    },
  },
  cta: {
    title: "Ready to Transform Your Farming?",
    subtitle:
      "Join thousands of farmers who are already experiencing the benefits of AI-powered agriculture. Start your journey today with a free trial.",
    primary: "Get Started Free",
    secondary: "Contact Sales",
  },
  about: {
    title: "Empowering Indian Agriculture with AI Innovation",
    subtitle:
      "Founded by agricultural experts and AI pioneers, BioBloom is on a mission to transform Indian farming through intelligent, accessible, and sustainable technology solutions.",
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
    heroSubtitle:
      "Discover our comprehensive suite of AI-powered agricultural tools designed specifically for Indian farmers. From crop management to livestock care, we've got every aspect of your farm covered.",
    detailedInfo: "Detailed Product Information",
    affordablePricing: "Affordable Pricing for Every Farm Size",
    completeSuite: "Complete Suite",
    individualTools: "Individual Tools",
    enterprise: "Enterprise",
    transformFarm: "Ready to Transform Your Farm with AI?",
    joinFarmers:
      "Join thousands of Indian farmers who are already using BioBloom to increase yields, reduce costs, and build sustainable agricultural practices.",
  },
  support: {
    title: "24/7 Support in Your Language",
    subtitle:
      "Get help when you need it, in the language you're comfortable with",
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
  aiFeatures: {
    badge: "Powered by Advanced AI",
    title: "Revolutionary AI for Indian Agriculture",
    subtitle: "Experience the future of farming with our cutting-edge artificial intelligence designed specifically for Indian soil, climate, and farming practices. From crop prediction to pest management, our AI learns from millions of data points to give you precise, actionable insights.",
    smartCrop: {
      title: "Smart Crop Intelligence",
      description: "Our AI analyzes soil conditions, weather patterns, and historical data to recommend the perfect crops for your land. Increase yields by up to 45% with data-driven crop selection and rotation strategies.",
    },
    realTime: {
      title: "Real-Time Monitoring",
      description: "Get instant alerts about pest threats, disease outbreaks, and optimal harvesting times. Our AI monitors satellite imagery and weather data 24/7 to protect your investment.",
    },
    predictive: {
      title: "Predictive Analytics",
      description: "Forecast market prices, predict weather impacts, and plan your farming calendar with AI-powered insights. Make informed decisions that maximize profitability and minimize risks.",
    },
    aiPowered: "AI-Powered",
  },
  whyBioBloom: {
    badge: "Why BioBloom?",
    title: "The Smart Choice for Modern Farmers",
    subtitle: "Join thousands of progressive farmers who are transforming their agricultural practices with intelligent technology",
    accuracy: {
      title: "95% Accuracy",
      description: "AI predictions backed by millions of data points from Indian farms",
    },
    easyToUse: {
      title: "Easy to Use",
      description: "Simple interface designed for farmers, accessible on any device",
    },
    costSavings: {
      title: "Cost Savings",
      description: "Reduce input costs by 30% with optimized resource management",
    },
    expertSupport: {
      title: "Expert Support",
      description: "Connect with agricultural experts and farming community 24/7",
    },
  },
  howItWorks: {
    badge: "Simple Process",
    title: "Get Started in 3 Easy Steps",
    subtitle: "Start your journey to smarter farming in minutes",
    step1: {
      title: "Sign Up Free",
      description: "Create your account in seconds. No credit card required, no hidden fees.",
    },
    step2: {
      title: "Add Your Farm",
      description: "Tell us about your land, crops, and location. Our AI will personalize recommendations.",
    },
    step3: {
      title: "Start Growing",
      description: "Get instant insights, predictions, and recommendations to boost your yields.",
    },
    startTrial: "Start Your Free Trial",
  },
  testimonials: {
    badge: "Success Stories",
    title: "Trusted by Farmers Across India",
    subtitle: "Real stories from farmers who transformed their agricultural practices",
    review1: {
      text: "BioBloom's AI helped me increase my wheat yield by 42%. The crop rotation suggestions were perfect for my soil type. Game changer!",
      name: "Rajesh Kumar",
      location: "Punjab · 45 acres",
    },
    review2: {
      text: "The pest predictor saved my entire cotton crop. Early warning system is incredibly accurate. Reduced pesticide use by 60%!",
      name: "Sunita Patel",
      location: "Gujarat · 30 acres",
    },
    review3: {
      text: "Finally, technology that understands Indian farming! The Hindi interface and local crop database make it so easy to use.",
      name: "Mahesh Singh",
      location: "Uttar Pradesh · 25 acres",
    },
  },
  ctaBanner: {
    badge: "Limited Time Offer",
    freeTrial: "Free 30-day trial",
    noCreditCard: "No credit card required",
    support24x7: "24/7 support in Hindi",
    trustedBy: "Trusted by over 10,000+ farmers across India",
    reviews: "(2,450 reviews)",
  },
  stats: {
    aiSupport: "AI Support",
  },
  dashboard: {
    topbar: {
      notifications: "Notifications",
      markAllRead: "Mark all read",
      noNotifications: "No new notifications",
      myAccount: "My Account",
      profileSettings: "Profile Settings",
      logout: "Logout",
      language: "Language",
      translating: "Translating...",
    },
  },
  gyanaAshram: {
    nav: {
      overview: "Overview",
      courses: "Courses",
      learningPaths: "Learning Paths",
      community: "Community",
      mobile: "Mobile",
    },
    hero: {
      welcomeBack: "Welcome back",
      subtitle: "Continue your farming mastery journey",
      continueLearning: "Continue Learning",
      joinCommunity: "Join Community",
      level: "Level",
      points: "Points",
      dayStreak: "Day Streak",
      aiPoweredLearning: "AI-Powered Learning",
      personalizedRec: "Personalized recommendations just for you",
    },
    banner: {
      learningCompanion: "Learning Companion",
      title: "GyanaAshram",
      tagline: "Learn Daily. Apply Better Practices. Grow With Confidence.",
    },
    stats: {
      coursesCompleted: "Courses Completed",
      studyHours: "Study Hours",
      currentStreak: "Current Streak",
      certificates: "Certificates",
      thisWeek: "this week",
      keepItUp: "Keep it up!",
      pending: "pending",
      days: "days",
    },
    courses: {
      backToCourses: "Back to Courses",
      yourCourses: "Your Courses",
      searchPlaceholder: "Search courses, topics...",
    },
    overview: {
      loadingDashboard: "Loading your dashboard...",
      tryAgain: "Try Again",
      xpToNextLevel: "XP to next level",
      activeCourses: "Active Courses",
      progress: "Progress",
      statsAndAchievements: "Stats & Achievements",
      completed: "Completed",
      thisMonth: "This Month",
      learningStreak: "Learning Streak",
      keepMomentum: "Keep the momentum going!",
      daysInARow: "days in a row",
      recentAchievements: "Recent Achievements",
      firstCourseCompleted: "First Course Completed",
      weekStreak: "Week Streak",
      communityMember: "Community Member",
      todaysGoal: "Today's Goal",
      todaysGoalStatus: "completed",
      dailyGoalMessage: "Complete 1 more lesson to reach your daily goal!",
      learningCalendar: "Learning Calendar",
      visited: "Visited",
      today: "Today",
      visitsTotal: "visits total",
      activityAndProgress: "Activity & Progress",
      recentActivity: "Recent Activity",
      completedLesson: "Completed lesson",
      startedCourse: "Started course",
      earnedCertificate: "Earned certificate",
      joinedCommunity: "Joined community",
      hoursAgo: "hours ago",
      dayAgo: "day ago",
      daysAgo: "days ago",
      thisWeeksProgress: "This Week's Progress",
      daysCompleted: "days completed",
      weeklyGoal: "weekly goal",
      studyTimeBreakdown: "Study Time Breakdown",
      quickActions: "Quick Actions",
      continueLearning: "Continue Learning",
      downloadCertificate: "Download Certificate",
      joinStudyGroup: "Join Study Group",
      askCommunity: "Ask Community",
      communities: "Communities",
      farmers: "farmers",
      exploreCommunities: "Explore Communities",
      learningPath: "Learning Path",
      recommendedCourses: "Recommended Courses",
      startCourse: "Start Course",
      learningInsights: "Learning Insights",
      smartRecommendation: "Smart Recommendation",
      insightMessage: "Based on your progress in crop monitoring, consider exploring pest management next.",
      nextMilestones: "Next Milestones",
      completeCourses: "Complete 10 courses",
      earnCertificates: "Earn 5 certificates",
      studyHoursGoal: "50 study hours",
      cropMonitoring: "Crop Monitoring",
      waterManagement: "Water Management",
      soilScience: "Soil Science",
    },
    calendar: {
      sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
      january: "January", february: "February", march: "March", april: "April",
      may: "May", june: "June", july: "July", august: "August",
      september: "September", october: "October", november: "November", december: "December",
    },
  },
}

// ---------------------------------------------------------------------------
// Manual translations for GyanaAshram (used for demo — no API calls needed)
// ---------------------------------------------------------------------------
const MANUAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    // Navigation
    "gyanaAshram.nav.overview": "अवलोकन",
    "gyanaAshram.nav.courses": "पाठ्यक्रम",
    "gyanaAshram.nav.learningPaths": "सीखने के मार्ग",
    "gyanaAshram.nav.community": "समुदाय",
    "gyanaAshram.nav.mobile": "मोबाइल",
    // Hero
    "gyanaAshram.hero.welcomeBack": "वापस स्वागत है",
    "gyanaAshram.hero.subtitle": "अपनी खेती महारत यात्रा जारी रखें",
    "gyanaAshram.hero.continueLearning": "सीखना जारी रखें",
    "gyanaAshram.hero.joinCommunity": "समुदाय से जुड़ें",
    "gyanaAshram.hero.level": "स्तर",
    "gyanaAshram.hero.points": "अंक",
    "gyanaAshram.hero.dayStreak": "दिन की लय",
    "gyanaAshram.hero.aiPoweredLearning": "AI-संचालित शिक्षा",
    "gyanaAshram.hero.personalizedRec": "आपके लिए व्यक्तिगत सिफारिशें",
    // Banner
    "gyanaAshram.banner.learningCompanion": "शिक्षण साथी",
    "gyanaAshram.banner.title": "ज्ञान आश्रम",
    "gyanaAshram.banner.tagline": "रोज़ सीखें। बेहतर प्रथाएं अपनाएं। आत्मविश्वास से बढ़ें।",
    // Stats
    "gyanaAshram.stats.coursesCompleted": "पूर्ण पाठ्यक्रम",
    "gyanaAshram.stats.studyHours": "अध्ययन के घंटे",
    "gyanaAshram.stats.currentStreak": "वर्तमान लय",
    "gyanaAshram.stats.certificates": "प्रमाणपत्र",
    "gyanaAshram.stats.thisWeek": "इस सप्ताह",
    "gyanaAshram.stats.keepItUp": "ऐसे ही चलते रहो!",
    "gyanaAshram.stats.pending": "लंबित",
    "gyanaAshram.stats.days": "दिन",
    // Courses
    "gyanaAshram.courses.backToCourses": "पाठ्यक्रमों पर वापस",
    "gyanaAshram.courses.yourCourses": "आपके पाठ्यक्रम",
    "gyanaAshram.courses.searchPlaceholder": "पाठ्यक्रम, विषय खोजें...",
    // Overview dashboard
    "gyanaAshram.overview.loadingDashboard": "आपका डैशबोर्ड लोड हो रहा है...",
    "gyanaAshram.overview.tryAgain": "पुनः प्रयास करें",
    "gyanaAshram.overview.xpToNextLevel": "अगले स्तर तक XP",
    "gyanaAshram.overview.activeCourses": "सक्रिय पाठ्यक्रम",
    "gyanaAshram.overview.progress": "प्रगति",
    "gyanaAshram.overview.statsAndAchievements": "आंकड़े और उपलब्धियां",
    "gyanaAshram.overview.completed": "पूर्ण",
    "gyanaAshram.overview.thisMonth": "इस महीने",
    "gyanaAshram.overview.learningStreak": "सीखने की लय",
    "gyanaAshram.overview.keepMomentum": "गति बनाए रखें!",
    "gyanaAshram.overview.daysInARow": "दिन लगातार",
    "gyanaAshram.overview.recentAchievements": "हालिया उपलब्धियां",
    "gyanaAshram.overview.firstCourseCompleted": "पहला पाठ्यक्रम पूर्ण",
    "gyanaAshram.overview.weekStreak": "सप्ताह की लय",
    "gyanaAshram.overview.communityMember": "समुदाय सदस्य",
    "gyanaAshram.overview.todaysGoal": "आज का लक्ष्य",
    "gyanaAshram.overview.todaysGoalStatus": "पूर्ण",
    "gyanaAshram.overview.dailyGoalMessage": "अपने दैनिक लक्ष्य तक पहुंचने के लिए 1 और पाठ पूरा करें!",
    "gyanaAshram.overview.learningCalendar": "शिक्षण कैलेंडर",
    "gyanaAshram.overview.visited": "देखा गया",
    "gyanaAshram.overview.today": "आज",
    "gyanaAshram.overview.visitsTotal": "कुल विज़िट",
    "gyanaAshram.overview.activityAndProgress": "गतिविधि और प्रगति",
    "gyanaAshram.overview.recentActivity": "हालिया गतिविधि",
    "gyanaAshram.overview.completedLesson": "पाठ पूरा किया",
    "gyanaAshram.overview.startedCourse": "पाठ्यक्रम शुरू किया",
    "gyanaAshram.overview.earnedCertificate": "प्रमाणपत्र अर्जित किया",
    "gyanaAshram.overview.joinedCommunity": "समुदाय में शामिल हुए",
    "gyanaAshram.overview.hoursAgo": "घंटे पहले",
    "gyanaAshram.overview.dayAgo": "दिन पहले",
    "gyanaAshram.overview.daysAgo": "दिन पहले",
    "gyanaAshram.overview.thisWeeksProgress": "इस सप्ताह की प्रगति",
    "gyanaAshram.overview.daysCompleted": "दिन पूर्ण",
    "gyanaAshram.overview.weeklyGoal": "साप्ताहिक लक्ष्य",
    "gyanaAshram.overview.studyTimeBreakdown": "अध्ययन समय विश्लेषण",
    "gyanaAshram.overview.quickActions": "त्वरित कार्रवाई",
    "gyanaAshram.overview.continueLearning": "सीखना जारी रखें",
    "gyanaAshram.overview.downloadCertificate": "प्रमाणपत्र डाउनलोड करें",
    "gyanaAshram.overview.joinStudyGroup": "अध्ययन समूह में शामिल हों",
    "gyanaAshram.overview.askCommunity": "समुदाय से पूछें",
    "gyanaAshram.overview.communities": "समुदाय",
    "gyanaAshram.overview.farmers": "किसान",
    "gyanaAshram.overview.exploreCommunities": "समुदायों का अन्वेषण करें",
    "gyanaAshram.overview.learningPath": "सीखने का मार्ग",
    "gyanaAshram.overview.recommendedCourses": "अनुशंसित पाठ्यक्रम",
    "gyanaAshram.overview.startCourse": "पाठ्यक्रम शुरू करें",
    "gyanaAshram.overview.learningInsights": "शिक्षण अंतर्दृष्टि",
    "gyanaAshram.overview.smartRecommendation": "स्मार्ट सिफारिश",
    "gyanaAshram.overview.insightMessage": "फसल निगरानी में आपकी प्रगति के आधार पर, अगला कीट प्रबंधन पर विचार करें।",
    "gyanaAshram.overview.nextMilestones": "अगले मील के पत्थर",
    "gyanaAshram.overview.completeCourses": "10 पाठ्यक्रम पूर्ण करें",
    "gyanaAshram.overview.earnCertificates": "5 प्रमाणपत्र अर्जित करें",
    "gyanaAshram.overview.studyHoursGoal": "50 अध्ययन घंटे",
    "gyanaAshram.overview.cropMonitoring": "फसल निगरानी",
    "gyanaAshram.overview.waterManagement": "जल प्रबंधन",
    "gyanaAshram.overview.soilScience": "मृदा विज्ञान",
    // Calendar
    "gyanaAshram.calendar.sun": "रवि", "gyanaAshram.calendar.mon": "सोम", "gyanaAshram.calendar.tue": "मंगल",
    "gyanaAshram.calendar.wed": "बुध", "gyanaAshram.calendar.thu": "गुरु", "gyanaAshram.calendar.fri": "शुक्र", "gyanaAshram.calendar.sat": "शनि",
    "gyanaAshram.calendar.january": "जनवरी", "gyanaAshram.calendar.february": "फरवरी", "gyanaAshram.calendar.march": "मार्च",
    "gyanaAshram.calendar.april": "अप्रैल", "gyanaAshram.calendar.may": "मई", "gyanaAshram.calendar.june": "जून",
    "gyanaAshram.calendar.july": "जुलाई", "gyanaAshram.calendar.august": "अगस्त", "gyanaAshram.calendar.september": "सितंबर",
    "gyanaAshram.calendar.october": "अक्टूबर", "gyanaAshram.calendar.november": "नवंबर", "gyanaAshram.calendar.december": "दिसंबर",
    // Dashboard / topbar
    "dashboard.topbar.notifications": "सूचनाएं",
    "dashboard.topbar.markAllRead": "सभी पढ़ा हुआ करें",
    "dashboard.topbar.noNotifications": "कोई नई सूचना नहीं",
    "dashboard.topbar.myAccount": "मेरा खाता",
    "dashboard.topbar.profileSettings": "प्रोफ़ाइल सेटिंग्स",
    "dashboard.topbar.logout": "लॉग आउट",
    "dashboard.topbar.language": "भाषा",
    "dashboard.topbar.translating": "अनुवाद हो रहा है...",
  },
  kn: {
    // Navigation
    "gyanaAshram.nav.overview": "ಅವಲೋಕನ",
    "gyanaAshram.nav.courses": "ಕೋರ್ಸ್‌ಗಳು",
    "gyanaAshram.nav.learningPaths": "ಕಲಿಕೆಯ ಮಾರ್ಗಗಳು",
    "gyanaAshram.nav.community": "ಸಮುದಾಯ",
    "gyanaAshram.nav.mobile": "ಮೊಬೈಲ್",
    // Hero
    "gyanaAshram.hero.welcomeBack": "ಮರಳಿ ಸ್ವಾಗತ",
    "gyanaAshram.hero.subtitle": "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಾವೀಣ್ಯ ಪ್ರಯಾಣವನ್ನು ಮುಂದುವರಿಸಿ",
    "gyanaAshram.hero.continueLearning": "ಕಲಿಯುವುದನ್ನು ಮುಂದುವರಿಸಿ",
    "gyanaAshram.hero.joinCommunity": "ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",
    "gyanaAshram.hero.level": "ಮಟ್ಟ",
    "gyanaAshram.hero.points": "ಅಂಕಗಳು",
    "gyanaAshram.hero.dayStreak": "ದಿನಗಳ ಸರಣಿ",
    "gyanaAshram.hero.aiPoweredLearning": "AI-ಚಾಲಿತ ಕಲಿಕೆ",
    "gyanaAshram.hero.personalizedRec": "ನಿಮಗಾಗಿ ವೈಯಕ್ತಿಕ ಶಿಫಾರಸುಗಳು",
    // Banner
    "gyanaAshram.banner.learningCompanion": "ಕಲಿಕೆಯ ಸಂಗಾತಿ",
    "gyanaAshram.banner.title": "ಜ್ಞಾನ ಆಶ್ರಮ",
    "gyanaAshram.banner.tagline": "ಪ್ರತಿದಿನ ಕಲಿಯಿರಿ. ಉತ್ತಮ ಅಭ್ಯಾಸಗಳನ್ನು ಅಳವಡಿಸಿ. ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಬೆಳೆಯಿರಿ.",
    // Stats
    "gyanaAshram.stats.coursesCompleted": "ಪೂರ್ಣಗೊಂಡ ಕೋರ್ಸ್‌ಗಳು",
    "gyanaAshram.stats.studyHours": "ಅಧ್ಯಯನ ಗಂಟೆಗಳು",
    "gyanaAshram.stats.currentStreak": "ಪ್ರಸ್ತುತ ಸರಣಿ",
    "gyanaAshram.stats.certificates": "ಪ್ರಮಾಣಪತ್ರಗಳು",
    "gyanaAshram.stats.thisWeek": "ಈ ವಾರ",
    "gyanaAshram.stats.keepItUp": "ಹೀಗೆಯೇ ಮುಂದುವರಿಸಿ!",
    "gyanaAshram.stats.pending": "ಬಾಕಿ",
    "gyanaAshram.stats.days": "ದಿನಗಳು",
    // Courses
    "gyanaAshram.courses.backToCourses": "ಕೋರ್ಸ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    "gyanaAshram.courses.yourCourses": "ನಿಮ್ಮ ಕೋರ್ಸ್‌ಗಳು",
    "gyanaAshram.courses.searchPlaceholder": "ಕೋರ್ಸ್‌ಗಳು, ವಿಷಯಗಳನ್ನು ಹುಡುಕಿ...",
    // Overview dashboard
    "gyanaAshram.overview.loadingDashboard": "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "gyanaAshram.overview.tryAgain": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    "gyanaAshram.overview.xpToNextLevel": "ಮುಂದಿನ ಮಟ್ಟಕ್ಕೆ XP",
    "gyanaAshram.overview.activeCourses": "ಸಕ್ರಿಯ ಕೋರ್ಸ್‌ಗಳು",
    "gyanaAshram.overview.progress": "ಪ್ರಗತಿ",
    "gyanaAshram.overview.statsAndAchievements": "ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ಸಾಧನೆಗಳು",
    "gyanaAshram.overview.completed": "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "gyanaAshram.overview.thisMonth": "ಈ ತಿಂಗಳು",
    "gyanaAshram.overview.learningStreak": "ಕಲಿಕೆಯ ಸರಣಿ",
    "gyanaAshram.overview.keepMomentum": "ವೇಗವನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಿ!",
    "gyanaAshram.overview.daysInARow": "ದಿನಗಳು ಸತತವಾಗಿ",
    "gyanaAshram.overview.recentAchievements": "ಇತ್ತೀಚಿನ ಸಾಧನೆಗಳು",
    "gyanaAshram.overview.firstCourseCompleted": "ಮೊದಲ ಕೋರ್ಸ್ ಪೂರ್ಣ",
    "gyanaAshram.overview.weekStreak": "ವಾರದ ಸರಣಿ",
    "gyanaAshram.overview.communityMember": "ಸಮುದಾಯ ಸದಸ್ಯ",
    "gyanaAshram.overview.todaysGoal": "ಇಂದಿನ ಗುರಿ",
    "gyanaAshram.overview.todaysGoalStatus": "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "gyanaAshram.overview.dailyGoalMessage": "ನಿಮ್ಮ ದೈನಿಕ ಗುರಿಯನ್ನು ತಲುಪಲು ಇನ್ನೊಂದು ಪಾಠ ಪೂರ್ಣಗೊಳಿಸಿ!",
    "gyanaAshram.overview.learningCalendar": "ಕಲಿಕೆಯ ಕ್ಯಾಲೆಂಡರ್",
    "gyanaAshram.overview.visited": "ಭೇಟಿ ನೀಡಿದ",
    "gyanaAshram.overview.today": "ಇಂದು",
    "gyanaAshram.overview.visitsTotal": "ಒಟ್ಟು ಭೇಟಿಗಳು",
    "gyanaAshram.overview.activityAndProgress": "ಚಟುವಟಿಕೆ ಮತ್ತು ಪ್ರಗತಿ",
    "gyanaAshram.overview.recentActivity": "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
    "gyanaAshram.overview.completedLesson": "ಪಾಠ ಪೂರ್ಣಗೊಳಿಸಿದರು",
    "gyanaAshram.overview.startedCourse": "ಕೋರ್ಸ್ ಪ್ರಾರಂಭಿಸಿದರು",
    "gyanaAshram.overview.earnedCertificate": "ಪ್ರಮಾಣಪತ್ರ ಗಳಿಸಿದರು",
    "gyanaAshram.overview.joinedCommunity": "ಸಮುದಾಯಕ್ಕೆ ಸೇರಿದರು",
    "gyanaAshram.overview.hoursAgo": "ಗಂಟೆಗಳ ಹಿಂದೆ",
    "gyanaAshram.overview.dayAgo": "ದಿನ ಹಿಂದೆ",
    "gyanaAshram.overview.daysAgo": "ದಿನಗಳ ಹಿಂದೆ",
    "gyanaAshram.overview.thisWeeksProgress": "ಈ ವಾರದ ಪ್ರಗತಿ",
    "gyanaAshram.overview.daysCompleted": "ದಿನಗಳು ಪೂರ್ಣ",
    "gyanaAshram.overview.weeklyGoal": "ಸಾಪ್ತಾಹಿಕ ಗುರಿ",
    "gyanaAshram.overview.studyTimeBreakdown": "ಅಧ್ಯಯನ ಸಮಯ ವಿಶ್ಲೇಷಣೆ",
    "gyanaAshram.overview.quickActions": "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    "gyanaAshram.overview.continueLearning": "ಕಲಿಯುವುದನ್ನು ಮುಂದುವರಿಸಿ",
    "gyanaAshram.overview.downloadCertificate": "ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    "gyanaAshram.overview.joinStudyGroup": "ಅಧ್ಯಯನ ಗುಂಪಿಗೆ ಸೇರಿ",
    "gyanaAshram.overview.askCommunity": "ಸಮುದಾಯವನ್ನು ಕೇಳಿ",
    "gyanaAshram.overview.communities": "ಸಮುದಾಯಗಳು",
    "gyanaAshram.overview.farmers": "ರೈತರು",
    "gyanaAshram.overview.exploreCommunities": "ಸಮುದಾಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    "gyanaAshram.overview.learningPath": "ಕಲಿಕೆಯ ಮಾರ್ಗ",
    "gyanaAshram.overview.recommendedCourses": "ಶಿಫಾರಸು ಮಾಡಿದ ಕೋರ್ಸ್‌ಗಳು",
    "gyanaAshram.overview.startCourse": "ಕೋರ್ಸ್ ಪ್ರಾರಂಭಿಸಿ",
    "gyanaAshram.overview.learningInsights": "ಕಲಿಕೆಯ ಒಳನೋಟಗಳು",
    "gyanaAshram.overview.smartRecommendation": "ಸ್ಮಾರ್ಟ್ ಶಿಫಾರಸು",
    "gyanaAshram.overview.insightMessage": "ಬೆಳೆ ಮೇಲ್ವಿಚಾರಣೆಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಗತಿಯ ಆಧಾರದ ಮೇಲೆ, ಮುಂದಿನ ಕೀಟ ನಿರ್ವಹಣೆಯನ್ನು ಪರಿಗಣಿಸಿ.",
    "gyanaAshram.overview.nextMilestones": "ಮುಂದಿನ ಮೈಲಿಗಲ್ಲುಗಳು",
    "gyanaAshram.overview.completeCourses": "10 ಕೋರ್ಸ್‌ಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
    "gyanaAshram.overview.earnCertificates": "5 ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಗಳಿಸಿ",
    "gyanaAshram.overview.studyHoursGoal": "50 ಅಧ್ಯಯನ ಗಂಟೆಗಳು",
    "gyanaAshram.overview.cropMonitoring": "ಬೆಳೆ ಮೇಲ್ವಿಚಾರಣೆ",
    "gyanaAshram.overview.waterManagement": "ನೀರು ನಿರ್ವಹಣೆ",
    "gyanaAshram.overview.soilScience": "ಮಣ್ಣಿನ ವಿಜ್ಞಾನ",
    // Calendar
    "gyanaAshram.calendar.sun": "ಭಾನು", "gyanaAshram.calendar.mon": "ಸೋಮ", "gyanaAshram.calendar.tue": "ಮಂಗಳ",
    "gyanaAshram.calendar.wed": "ಬುಧ", "gyanaAshram.calendar.thu": "ಗುರು", "gyanaAshram.calendar.fri": "ಶುಕ್ರ", "gyanaAshram.calendar.sat": "ಶನಿ",
    "gyanaAshram.calendar.january": "ಜನವರಿ", "gyanaAshram.calendar.february": "ಫೆಬ್ರವರಿ", "gyanaAshram.calendar.march": "ಮಾರ್ಚ್",
    "gyanaAshram.calendar.april": "ಏಪ್ರಿಲ್", "gyanaAshram.calendar.may": "ಮೇ", "gyanaAshram.calendar.june": "ಜೂನ್",
    "gyanaAshram.calendar.july": "ಜುಲೈ", "gyanaAshram.calendar.august": "ಆಗಸ್ಟ್", "gyanaAshram.calendar.september": "ಸೆಪ್ಟೆಂಬರ್",
    "gyanaAshram.calendar.october": "ಅಕ್ಟೋಬರ್", "gyanaAshram.calendar.november": "ನವೆಂಬರ್", "gyanaAshram.calendar.december": "ಡಿಸೆಂಬರ್",
    // Dashboard / topbar
    "dashboard.topbar.notifications": "ಅಧಿಸೂಚನೆಗಳು",
    "dashboard.topbar.markAllRead": "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    "dashboard.topbar.noNotifications": "ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ",
    "dashboard.topbar.myAccount": "ನನ್ನ ಖಾತೆ",
    "dashboard.topbar.profileSettings": "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "dashboard.topbar.logout": "ಲಾಗ್ ಔಟ್",
    "dashboard.topbar.language": "ಭಾಷೆ",
    "dashboard.topbar.translating": "ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...",
  },
  bn: {
    "gyanaAshram.nav.overview": "সারসংক্ষেপ",
    "gyanaAshram.nav.courses": "কোর্স",
    "gyanaAshram.nav.learningPaths": "শেখার পথ",
    "gyanaAshram.nav.community": "সম্প্রদায়",
    "gyanaAshram.nav.mobile": "মোবাইল",
    "gyanaAshram.hero.welcomeBack": "আবার স্বাগতম",
    "gyanaAshram.hero.subtitle": "আপনার কৃষি দক্ষতার যাত্রা চালিয়ে যান",
    "gyanaAshram.hero.continueLearning": "শেখা চালিয়ে যান",
    "gyanaAshram.hero.joinCommunity": "সম্প্রদায়ে যোগ দিন",
    "gyanaAshram.hero.level": "স্তর",
    "gyanaAshram.hero.points": "পয়েন্ট",
    "gyanaAshram.hero.dayStreak": "দিনের ধারা",
    "gyanaAshram.hero.aiPoweredLearning": "AI-চালিত শিক্ষা",
    "gyanaAshram.hero.personalizedRec": "আপনার জন্য ব্যক্তিগত সুপারিশ",
    "gyanaAshram.banner.learningCompanion": "শেখার সঙ্গী",
    "gyanaAshram.banner.title": "জ্ঞান আশ্রম",
    "gyanaAshram.banner.tagline": "প্রতিদিন শিখুন। উত্তম অভ্যাস প্রয়োগ করুন। আত্মবিশ্বাসের সাথে বেড়ে উঠুন।",
    "gyanaAshram.stats.coursesCompleted": "সম্পন্ন কোর্স",
    "gyanaAshram.stats.studyHours": "অধ্যয়নের ঘণ্টা",
    "gyanaAshram.stats.currentStreak": "বর্তমান ধারা",
    "gyanaAshram.stats.certificates": "সার্টিফিকেট",
    "gyanaAshram.stats.thisWeek": "এই সপ্তাহে",
    "gyanaAshram.stats.keepItUp": "এভাবেই চালিয়ে যান!",
    "gyanaAshram.stats.pending": "মুলতুবি",
    "gyanaAshram.stats.days": "দিন",
    "gyanaAshram.courses.backToCourses": "কোর্সে ফিরে যান",
    "gyanaAshram.courses.yourCourses": "আপনার কোর্স",
    "gyanaAshram.courses.searchPlaceholder": "কোর্স, বিষয় খুঁজুন...",
  },
  ta: {
    "gyanaAshram.nav.overview": "கண்ணோட்டம்",
    "gyanaAshram.nav.courses": "படிப்புகள்",
    "gyanaAshram.nav.learningPaths": "கற்றல் பாதைகள்",
    "gyanaAshram.nav.community": "சமூகம்",
    "gyanaAshram.nav.mobile": "மொபைல்",
    "gyanaAshram.hero.welcomeBack": "மீண்டும் வரவேற்கிறோம்",
    "gyanaAshram.hero.subtitle": "உங்கள் விவசாய திறன் பயணத்தைத் தொடருங்கள்",
    "gyanaAshram.hero.continueLearning": "கற்றலைத் தொடருங்கள்",
    "gyanaAshram.hero.joinCommunity": "சமூகத்தில் சேருங்கள்",
    "gyanaAshram.hero.level": "நிலை",
    "gyanaAshram.hero.points": "புள்ளிகள்",
    "gyanaAshram.hero.dayStreak": "நாள் தொடர்",
    "gyanaAshram.hero.aiPoweredLearning": "AI-இயக்கப்படும் கற்றல்",
    "gyanaAshram.hero.personalizedRec": "உங்களுக்கான தனிப்பட்ட பரிந்துரைகள்",
    "gyanaAshram.banner.learningCompanion": "கற்றல் துணை",
    "gyanaAshram.banner.title": "ஞான ஆசிரமம்",
    "gyanaAshram.banner.tagline": "தினமும் கற்றுக்கொள்ளுங்கள். சிறந்த நடைமுறைகளை பின்பற்றுங்கள். நம்பிக்கையுடன் வளருங்கள்.",
    "gyanaAshram.stats.coursesCompleted": "முடிக்கப்பட்ட படிப்புகள்",
    "gyanaAshram.stats.studyHours": "படிப்பு மணி நேரம்",
    "gyanaAshram.stats.currentStreak": "தற்போதைய தொடர்",
    "gyanaAshram.stats.certificates": "சான்றிதழ்கள்",
    "gyanaAshram.stats.thisWeek": "இந்த வாரம்",
    "gyanaAshram.stats.keepItUp": "இப்படியே தொடருங்கள்!",
    "gyanaAshram.stats.pending": "நிலுவையில்",
    "gyanaAshram.stats.days": "நாட்கள்",
    "gyanaAshram.courses.backToCourses": "படிப்புகளுக்குத் திரும்பு",
    "gyanaAshram.courses.yourCourses": "உங்கள் படிப்புகள்",
    "gyanaAshram.courses.searchPlaceholder": "படிப்புகள், தலைப்புகளைத் தேடுங்கள்...",
  },
  te: {
    "gyanaAshram.nav.overview": "అవలోకనం",
    "gyanaAshram.nav.courses": "కోర్సులు",
    "gyanaAshram.nav.learningPaths": "అభ్యాస మార్గాలు",
    "gyanaAshram.nav.community": "సంఘం",
    "gyanaAshram.nav.mobile": "మొబైల్",
    "gyanaAshram.hero.welcomeBack": "తిరిగి స్వాగతం",
    "gyanaAshram.hero.subtitle": "మీ వ్యవసాయ నైపుణ్య ప్రయాణాన్ని కొనసాగించండి",
    "gyanaAshram.hero.continueLearning": "నేర్చుకోవడం కొనసాగించండి",
    "gyanaAshram.hero.joinCommunity": "సంఘంలో చేరండి",
    "gyanaAshram.hero.level": "స్థాయి",
    "gyanaAshram.hero.points": "పాయింట్లు",
    "gyanaAshram.hero.dayStreak": "రోజువారీ ధారా",
    "gyanaAshram.hero.aiPoweredLearning": "AI-ఆధారిత అభ్యాసం",
    "gyanaAshram.hero.personalizedRec": "మీ కోసం వ్యక్తిగత సిఫార్సులు",
    "gyanaAshram.banner.learningCompanion": "అభ్యాస సహచరుడు",
    "gyanaAshram.banner.title": "జ్ఞాన ఆశ్రమం",
    "gyanaAshram.banner.tagline": "ప్రతిరోజు నేర్చుకోండి. మెరుగైన పద్ధతులు అనుసరించండి. ఆత్మవిశ్వాసంతో ఎదగండి.",
    "gyanaAshram.stats.coursesCompleted": "పూర్తయిన కోర్సులు",
    "gyanaAshram.stats.studyHours": "అధ్యయన గంటలు",
    "gyanaAshram.stats.currentStreak": "ప్రస్తుత ధారా",
    "gyanaAshram.stats.certificates": "ధ్రువపత్రాలు",
    "gyanaAshram.stats.thisWeek": "ఈ వారం",
    "gyanaAshram.stats.keepItUp": "ఇలాగే కొనసాగించండి!",
    "gyanaAshram.stats.pending": "పెండింగ్",
    "gyanaAshram.stats.days": "రోజులు",
    "gyanaAshram.courses.backToCourses": "కోర్సులకు తిరిగి",
    "gyanaAshram.courses.yourCourses": "మీ కోర్సులు",
    "gyanaAshram.courses.searchPlaceholder": "కోర్సులు, అంశాలను శోధించండి...",
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten nested object into dot-notation keys: { "a.b": "value", ... } */
function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], fullKey))
    } else {
      result[fullKey] = String(obj[key])
    }
  }
  return result
}

/** Resolve a dot-separated key from a nested object */
function resolveKey(obj: Record<string, any>, key: string): string | undefined {
  const parts = key.split(".")
  let current: any = obj
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part]
    } else {
      return undefined
    }
  }
  return typeof current === "string" ? current : undefined
}

// ---------------------------------------------------------------------------
// Cache persistence (localStorage)
// ---------------------------------------------------------------------------
const CACHE_KEY = "biobloom-sarvam-translations"

function loadCacheFromStorage(): TranslationCache {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return {}
}

function saveCacheToStorage(cache: TranslationCache) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch { }
}

// ---------------------------------------------------------------------------
// Translate via our Next.js proxy → Sarvam AI
// ---------------------------------------------------------------------------
async function translateText(text: string, targetLangCode: string): Promise<string> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: text,
        source_language_code: "en-IN",
        target_language_code: getSarvamCode(targetLangCode),
      }),
    })
    if (!res.ok) {
      console.warn(`Translation API returned ${res.status}`)
      return text
    }
    const data = await res.json()
    return data.translated_text || text
  } catch (err) {
    console.warn("Translation request failed:", err)
    return text
  }
}

/**
 * Batch-translate multiple strings.  
 * Sarvam's /translate endpoint accepts a single string (max 2000 chars).
 * We join short strings with a separator, translate in one call, then split.
 * Falls back to individual calls for long texts.
 */
const SEPARATOR = " ||| "
const MAX_BATCH_CHARS = 1800

async function batchTranslate(
  entries: Array<{ key: string; text: string }>,
  targetLangCode: string
): Promise<Record<string, string>> {
  const results: Record<string, string> = {}
  if (entries.length === 0) return results

  // Group entries into batches that fit within limit
  const batches: Array<Array<{ key: string; text: string }>> = []
  let currentBatch: Array<{ key: string; text: string }> = []
  let currentLen = 0

  for (const entry of entries) {
    const addLen = entry.text.length + SEPARATOR.length
    if (currentLen + addLen > MAX_BATCH_CHARS && currentBatch.length > 0) {
      batches.push(currentBatch)
      currentBatch = []
      currentLen = 0
    }
    currentBatch.push(entry)
    currentLen += addLen
  }
  if (currentBatch.length > 0) batches.push(currentBatch)

  // Translate each batch
  await Promise.all(
    batches.map(async (batch) => {
      const joinedInput = batch.map((e) => e.text).join(SEPARATOR)
      const translated = await translateText(joinedInput, targetLangCode)
      const parts = translated.split(/\s*\|\|\|\s*/)

      // Map results back
      batch.forEach((entry, i) => {
        results[entry.key] = parts[i]?.trim() || entry.text
      })
    })
  )

  return results
}

// ---------------------------------------------------------------------------
// The hook
// ---------------------------------------------------------------------------
export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedStrings, setTranslatedStrings] = useState<Record<string, string>>({})
  const cacheRef = useRef<TranslationCache>(loadCacheFromStorage())
  const abortRef = useRef<AbortController | null>(null)

  // Load saved language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("biobloom-language")
      if (saved && saved !== currentLanguage) {
        setCurrentLanguage(saved)
      }
    }
  }, [])

  // When language changes, load manual translations + optionally call Sarvam API
  useEffect(() => {
    if (currentLanguage === "en") {
      setTranslatedStrings({})
      setIsTranslating(false)
      return
    }

    // Start with manual translations if available (instant, no API cost)
    const manual = MANUAL_TRANSLATIONS[currentLanguage] || {}
    
    // Check if translations are already cached
    const cached = cacheRef.current[currentLanguage]
    const flatEN = flattenObject(EN_STRINGS)
    const allKeys = Object.keys(flatEN)

    // Merge manual + cached
    const combined = { ...manual, ...(cached || {}) }
    
    // Set manual translations immediately (no loading state for these)
    if (Object.keys(combined).length > 0) {
      setTranslatedStrings(combined)
    }

    const missing = allKeys.filter((k) => !(k in combined))
    if (missing.length === 0) {
      // Everything covered by manual + cache — no API needed
      setIsTranslating(false)
      return
    }

    // For remaining keys, call Sarvam API  
    setIsTranslating(true)

    // Cancel previous in-flight translation
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const doTranslate = async () => {
      const toTranslate = missing.map((k) => ({ key: k, text: flatEN[k] }))

      try {
        const freshTranslations = await batchTranslate(toTranslate, currentLanguage)

        if (controller.signal.aborted) return

        const merged = { ...combined, ...freshTranslations }
        cacheRef.current[currentLanguage] = merged
        saveCacheToStorage(cacheRef.current)
        setTranslatedStrings(merged)
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("Translation batch failed:", err)
        // Keep manual translations even if API fails
        setTranslatedStrings(combined)
      } finally {
        if (!controller.signal.aborted) {
          setIsTranslating(false)
        }
      }
    }

    doTranslate()

    return () => {
      controller.abort()
    }
  }, [currentLanguage])

  // Memoized t() — checks: manual translations → Sarvam cache → English fallback
  const t = useCallback(
    (key: string): string => {
      if (currentLanguage === "en") {
        return resolveKey(EN_STRINGS, key) || key
      }
      // 1. Check manual translations (instant, no API)
      const manual = MANUAL_TRANSLATIONS[currentLanguage]
      if (manual && key in manual) {
        return manual[key]
      }
      // 2. Check Sarvam API translated strings
      if (translatedStrings[key]) {
        return translatedStrings[key]
      }
      // 3. Fallback to English
      return resolveKey(EN_STRINGS, key) || key
    },
    [currentLanguage, translatedStrings]
  )

  const changeLanguage = useCallback(
    (language: string) => {
      if (language !== currentLanguage) {
        setCurrentLanguage(language)
        if (typeof window !== "undefined") {
          localStorage.setItem("biobloom-language", language)
          window.dispatchEvent(
            new CustomEvent("languageChanged", { detail: language })
          )
        }
      }
    },
    [currentLanguage]
  )

  const availableLanguages = ALL_LANGUAGE_CODES

  const getLanguageName = useCallback((code: string): string => {
    return getNativeName(code)
  }, [])

  const hasTranslation = useCallback(
    (key: string, language?: string): boolean => {
      const lang = language || currentLanguage
      if (lang === "en") return resolveKey(EN_STRINGS, key) !== undefined
      return !!translatedStrings[key]
    },
    [currentLanguage, translatedStrings]
  )

  // Listen for global language change events
  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = (e: CustomEvent) => {
      if (e.detail !== currentLanguage) {
        setCurrentLanguage(e.detail)
      }
    }
    window.addEventListener("languageChanged", handler as EventListener)
    return () =>
      window.removeEventListener("languageChanged", handler as EventListener)
  }, [currentLanguage])

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    getLanguageName,
    hasTranslation,
    isTranslating,
  }
}

// ---------------------------------------------------------------------------
// Other hooks (unchanged)
// ---------------------------------------------------------------------------

/** Intersection Observer hook for animations */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
        ...options,
      }
    )

    observer.observe(ref)

    return () => {
      if (ref) {
        observer.unobserve(ref)
      }
    }
  }, [ref, options])

  return [setRef, isIntersecting] as const
}

/** Scroll animation hook */
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return scrollY
}

/** Parallax effect hook */
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0)
  const scrollY = useScrollAnimation()

  useEffect(() => {
    setOffset(scrollY * speed)
  }, [scrollY, speed])

  return offset
}
