import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      farmer: 'Farmer',
      manufacturer: 'Manufacturer',
      consumer: 'Consumer',
      education: 'Education',
      admin: 'Admin',
      
      // Common
      create: 'Create',
      verify: 'Verify',
      report: 'Report',
      scan: 'Scan',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      
      // Farmer Module
      farmerDashboard: 'Farmer Dashboard',
      createBatch: 'Create Batch',
      cropName: 'Crop Name',
      cropType: 'Crop Type',
      farmingArea: 'Farming Area (acres)',
      sowingDate: 'Sowing Date',
      uploadImages: 'Upload Field Images',
      batchCreated: 'Batch created successfully!',
      myBatches: 'My Batches',
      batchTimeline: 'Batch Timeline',
      
      // Manufacturer Module
      manufacturerDashboard: 'Manufacturer Dashboard',
      createProduct: 'Create Product Batch',
      productName: 'Product Name',
      productType: 'Product Type',
      batchSize: 'Batch Size',
      expiryDate: 'Expiry Date',
      labTest: 'Lab Test Report',
      productBatches: 'Product Batches',
      
      // Consumer Module
      consumerDashboard: 'Consumer Dashboard',
      verifyProduct: 'Verify Product',
      scanQR: 'Scan QR Code',
      verificationResult: 'Verification Result',
      productVerified: 'Product Verified',
      productSuspicious: 'Product Suspicious',
      reportFraud: 'Report Fraud',
      
      // Education Module
      educationCenter: 'Education Center',
      antiCounterfeit: 'Anti-Counterfeit Guide',
      safetyTips: 'Safety Tips',
      howToVerify: 'How to Verify Products',
      
      // Admin Module
      adminDashboard: 'Admin Dashboard',
      totalScans: 'Total Scans',
      totalBatches: 'Total Batches',
      fraudReports: 'Fraud Reports',
      verifiedProducts: 'Verified Products',
      scanTrends: 'Scan Trends',
      fraudTrends: 'Fraud Trends',
      
      // Fraud Prevention
      fraudPrevention: 'Fraud Prevention',
      reportType: 'Report Type',
      counterfeit: 'Counterfeit',
      expired: 'Expired',
      suspicious: 'Suspicious',
      other: 'Other',
      description: 'Description',
      reporterName: 'Reporter Name',
      reporterPhone: 'Reporter Phone',
      location: 'Location',
      
      // Status
      active: 'Active',
      verified: 'Verified',
      pending: 'Pending',
      investigating: 'Investigating',
      confirmed: 'Confirmed',
      dismissed: 'Dismissed',
      
      // Welcome
      welcome: 'Welcome to KrishiBarosa',
      subtitle: 'Ensuring Agricultural Product Authenticity',
      selectRole: 'Select Your Role',
      farmerDesc: 'Create and manage crop batches',
      manufacturerDesc: 'Manage product batches and certifications',
      consumerDesc: 'Verify product authenticity',
      educationDesc: 'Learn about product safety and verification',
      adminDesc: 'Monitor system analytics and fraud prevention'
    }
  },
  hi: {
    translation: {
      // Navigation
      home: 'मुख्य पृष्ठ',
      farmer: 'किसान',
      manufacturer: 'निर्माता',
      consumer: 'उपभोक्ता',
      education: 'शिक्षा',
      admin: 'प्रशासक',
      
      // Common
      create: 'बनाएं',
      verify: 'सत्यापित करें',
      report: 'रिपोर्ट',
      scan: 'स्कैन',
      submit: 'जमा करें',
      cancel: 'रद्द करें',
      save: 'सेव करें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      view: 'देखें',
      download: 'डाउनलोड',
      upload: 'अपलोड',
      search: 'खोजें',
      filter: 'फिल्टर',
      
      // Farmer Module
      farmerDashboard: 'किसान डैशबोर्ड',
      createBatch: 'बैच बनाएं',
      cropName: 'फसल का नाम',
      cropType: 'फसल का प्रकार',
      farmingArea: 'खेती का क्षेत्र (एकड़)',
      sowingDate: 'बुवाई की तारीख',
      uploadImages: 'खेत की तस्वीरें अपलोड करें',
      batchCreated: 'बैच सफलतापूर्वक बनाया गया!',
      myBatches: 'मेरे बैच',
      batchTimeline: 'बैच टाइमलाइन',
      
      // Manufacturer Module
      manufacturerDashboard: 'निर्माता डैशबोर्ड',
      createProduct: 'उत्पाद बैच बनाएं',
      productName: 'उत्पाद का नाम',
      productType: 'उत्पाद का प्रकार',
      batchSize: 'बैच का आकार',
      expiryDate: 'समाप्ति तिथि',
      labTest: 'प्रयोगशाला परीक्षण रिपोर्ट',
      productBatches: 'उत्पाद बैच',
      
      // Consumer Module
      consumerDashboard: 'उपभोक्ता डैशबोर्ड',
      verifyProduct: 'उत्पाद सत्यापित करें',
      scanQR: 'QR कोड स्कैन करें',
      verificationResult: 'सत्यापन परिणाम',
      productVerified: 'उत्पाद सत्यापित',
      productSuspicious: 'उत्पाद संदिग्ध',
      reportFraud: 'धोखाधड़ी की रिपोर्ट करें',
      
      // Education Module
      educationCenter: 'शिक्षा केंद्र',
      antiCounterfeit: 'नकली विरोधी गाइड',
      safetyTips: 'सुरक्षा टिप्स',
      howToVerify: 'उत्पादों को कैसे सत्यापित करें',
      
      // Admin Module
      adminDashboard: 'प्रशासक डैशबोर्ड',
      totalScans: 'कुल स्कैन',
      totalBatches: 'कुल बैच',
      fraudReports: 'धोखाधड़ी रिपोर्ट',
      verifiedProducts: 'सत्यापित उत्पाद',
      scanTrends: 'स्कैन ट्रेंड',
      fraudTrends: 'धोखाधड़ी ट्रेंड',
      
      // Welcome
      welcome: 'KrishiBarosa में आपका स्वागत है',
      subtitle: 'कृषि उत्पाद की प्रामाणिकता सुनिश्चित करना',
      selectRole: 'अपनी भूमिका चुनें',
      farmerDesc: 'फसल बैच बनाएं और प्रबंधित करें',
      manufacturerDesc: 'उत्पाद बैच और प्रमाणन प्रबंधित करें',
      consumerDesc: 'उत्पाद की प्रामाणिकता सत्यापित करें',
      educationDesc: 'उत्पाद सुरक्षा और सत्यापन के बारे में जानें',
      adminDesc: 'सिस्टम एनालिटिक्स और धोखाधड़ी की रोकथाम की निगरानी करें'
    }
  },
  bn: {
    translation: {
      // Navigation
      home: 'হোম',
      farmer: 'কৃষক',
      manufacturer: 'উৎপাদনকারী',
      consumer: 'ভোক্তা',
      education: 'শিক্ষা',
      admin: 'অ্যাডমিন',
      
      // Common
      create: 'তৈরি করুন',
      verify: 'যাচাই করুন',
      report: 'রিপোর্ট',
      scan: 'স্ক্যান',
      submit: 'জমা দিন',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ',
      
      // Welcome
      welcome: 'KrishiBarosa এ স্বাগতম',
      subtitle: 'কৃষি পণ্যের সত্যতা নিশ্চিত করা',
      selectRole: 'আপনার ভূমিকা নির্বাচন করুন',
      farmerDesc: 'ফসলের ব্যাচ তৈরি ও পরিচালনা করুন',
      manufacturerDesc: 'পণ্য ব্যাচ এবং সার্টিফিকেশন পরিচালনা করুন',
      consumerDesc: 'পণ্যের সত্যতা যাচাই করুন',
      educationDesc: 'পণ্য নিরাপত্তা এবং যাচাইকরণ সম্পর্কে জানুন',
      adminDesc: 'সিস্টেম অ্যানালিটিক্স এবং জালিয়াতি প্রতিরোধ পর্যবেক্ষণ করুন'
    }
  },
  // Add more languages as needed (keeping it manageable for the demo)
  ta: {
    translation: {
      welcome: 'KrishiBarosa இல் உங்களை வரவேற்கிறோம்',
      subtitle: 'விவசாய பொருட்களின் நம்பகத்தன்மையை உறுதிப்படுத்துதல்',
      selectRole: 'உங்கள் பங்கை தேர்ந்தெடுக்கவும்',
      farmer: 'விவசாயி',
      manufacturer: 'உற்பத்தியாளர்',
      consumer: 'நுகர்வோர்',
      education: 'கல்வி',
      admin: 'நிர்வாகி',
      farmerDesc: 'பயிர் தொகுப்புகளை உருவாக்கி நிர்வகிக்கவும்',
      manufacturerDesc: 'தயாரிப்பு தொகுப்புகள் மற்றும் சான்றிதழ்களை நிர்வகிக்கவும்',
      consumerDesc: 'தயாரிப்பு நம்பகத்தன்மையை சரிபார்க்கவும்',
      educationDesc: 'தயாரிப்பு பாதுகாப்பு மற்றும் சரிபார்ப்பு பற்றி அறியவும்',
      adminDesc: 'கணினி பகுப்பாய்வு மற்றும் மோசடி தடுப்பு கண்காணிப்பு'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;