// Mock data for KrishiBarosa - Comprehensive agricultural traceability platform

export interface Batch {
  id: string;
  type: 'crop' | 'product';
  name: string;
  category: string;
  area?: number;
  quantity?: number;
  sowingDate?: Date;
  expiryDate?: Date;
  status: 'active' | 'verified' | 'suspicious' | 'fraudulent';
  qrCode: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  farmer?: {
    name: string;
    id: string;
    phone: string;
  };
  manufacturer?: {
    name: string;
    id: string;
    license: string;
  };
  labTest?: {
    url: string;
    passed: boolean;
    date: Date;
  };
  timeline: {
    date: Date;
    event: string;
    description: string;
  }[];
  fraudReports: number;
  verified: boolean;
  createdAt: Date;
}

export interface FraudReport {
  id: string;
  batchId: string;
  productName: string;
  reporterName: string;
  reporterPhone: string;
  reportType: 'counterfeit' | 'expired' | 'suspicious' | 'other';
  description: string;
  images: string[];
  location: string;
  status: 'pending' | 'investigating' | 'confirmed' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: Date;
}

export interface AnalyticsData {
  totalScans: number;
  totalBatches: number;
  fraudReports: number;
  verifiedProducts: number;
  recentScans: {
    date: string;
    count: number;
  }[];
  topLocations: {
    location: string;
    scans: number;
    lat: number;
    lng: number;
  }[];
  fraudTrends: {
    month: string;
    reports: number;
    confirmed: number;
  }[];
  batchDistribution: {
    category: string;
    count: number;
    color: string;
  }[];
}

// Mock farmer batches
export const mockFarmerBatches: Batch[] = [
  {
    id: 'FB001',
    type: 'crop',
    name: 'Organic Wheat',
    category: 'Grains',
    area: 5.2,
    sowingDate: new Date('2024-01-15'),
    status: 'verified',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FB001',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'],
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Khajuraho, Madhya Pradesh, India'
    },
    farmer: {
      name: 'Ramesh Kumar',
      id: 'F001',
      phone: '+91 9876543210'
    },
    timeline: [
      { date: new Date('2024-01-15'), event: 'Sowing', description: 'Organic wheat seeds sown in 5.2 acres' },
      { date: new Date('2024-03-01'), event: 'First Inspection', description: 'Crop health excellent, no pests detected' },
      { date: new Date('2024-04-15'), event: 'Pre-harvest', description: 'Crop ready for harvest in 2 weeks' },
      { date: new Date('2024-05-01'), event: 'Harvest', description: 'Successful harvest yielding 2.5 tonnes' }
    ],
    fraudReports: 0,
    verified: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'FB002',
    type: 'crop',
    name: 'Basmati Rice',
    category: 'Grains',
    area: 8.5,
    sowingDate: new Date('2024-06-01'),
    status: 'active',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FB002',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
    location: {
      lat: 30.7333,
      lng: 76.7794,
      address: 'Chandigarh, Punjab, India'
    },
    farmer: {
      name: 'Sukhwinder Singh',
      id: 'F002',
      phone: '+91 9876543211'
    },
    timeline: [
      { date: new Date('2024-06-01'), event: 'Sowing', description: 'Premium Basmati rice seeds planted' },
      { date: new Date('2024-07-15'), event: 'First Irrigation', description: 'Crop irrigation completed' },
      { date: new Date('2024-08-01'), event: 'Pest Control', description: 'Organic pest control applied' }
    ],
    fraudReports: 0,
    verified: false,
    createdAt: new Date('2024-06-01')
  }
];

// Mock manufacturer batches
export const mockManufacturerBatches: Batch[] = [
  {
    id: 'MB001',
    type: 'product',
    name: 'OrganicGrow Pesticide',
    category: 'Pesticides',
    quantity: 1000,
    expiryDate: new Date('2025-12-31'),
    status: 'verified',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MB001',
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Mumbai, Maharashtra, India'
    },
    manufacturer: {
      name: 'AgriTech Solutions Ltd.',
      id: 'M001',
      license: 'LIC-2024-001'
    },
    labTest: {
      url: 'https://example.com/lab-report-MB001.pdf',
      passed: true,
      date: new Date('2024-01-10')
    },
    timeline: [
      { date: new Date('2024-01-05'), event: 'Production', description: 'Batch production started' },
      { date: new Date('2024-01-08'), event: 'Quality Check', description: 'Internal quality control passed' },
      { date: new Date('2024-01-10'), event: 'Lab Testing', description: 'Third-party lab testing completed' },
      { date: new Date('2024-01-12'), event: 'Packaging', description: 'Products packaged and labeled' }
    ],
    fraudReports: 0,
    verified: true,
    createdAt: new Date('2024-01-05')
  },
  {
    id: 'MB002',
    type: 'product',
    name: 'SuperGrain Seeds',
    category: 'Seeds',
    quantity: 500,
    expiryDate: new Date('2025-06-30'),
    status: 'suspicious',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MB002',
    images: ['https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400'],
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Chennai, Tamil Nadu, India'
    },
    manufacturer: {
      name: 'Tamil Seeds Corp.',
      id: 'M002',
      license: 'LIC-2024-002'
    },
    labTest: {
      url: 'https://example.com/lab-report-MB002.pdf',
      passed: false,
      date: new Date('2024-02-15')
    },
    timeline: [
      { date: new Date('2024-02-01'), event: 'Production', description: 'Batch production started' },
      { date: new Date('2024-02-15'), event: 'Lab Testing', description: 'Quality concerns identified' },
      { date: new Date('2024-02-18'), event: 'Investigation', description: 'Internal investigation ongoing' }
    ],
    fraudReports: 3,
    verified: false,
    createdAt: new Date('2024-02-01')
  }
];

// Mock fraud reports
export const mockFraudReports: FraudReport[] = [
  {
    id: 'FR001',
    batchId: 'MB002',
    productName: 'SuperGrain Seeds',
    reporterName: 'Kavita Sharma',
    reporterPhone: '+91 9876543212',
    reportType: 'counterfeit',
    description: 'Seeds appear to be of inferior quality, different from original product',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'],
    location: 'Coimbatore, Tamil Nadu',
    status: 'investigating',
    priority: 'high',
    reportedAt: new Date('2024-02-20')
  },
  {
    id: 'FR002',
    batchId: 'MB003',
    productName: 'FakeGrow Pesticide',
    reporterName: 'Rajesh Patel',
    reporterPhone: '+91 9876543213',
    reportType: 'expired',
    description: 'Product shows signs of expiration despite valid date on package',
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
    location: 'Ahmedabad, Gujarat',
    status: 'confirmed',
    priority: 'critical',
    reportedAt: new Date('2024-02-18')
  }
];

// Mock analytics data
export const mockAnalyticsData: AnalyticsData = {
  totalScans: 12847,
  totalBatches: 2156,
  fraudReports: 47,
  verifiedProducts: 1998,
  recentScans: [
    { date: '2024-01-01', count: 145 },
    { date: '2024-01-02', count: 167 },
    { date: '2024-01-03', count: 134 },
    { date: '2024-01-04', count: 189 },
    { date: '2024-01-05', count: 156 },
    { date: '2024-01-06', count: 198 },
    { date: '2024-01-07', count: 176 }
  ],
  topLocations: [
    { location: 'Mumbai, Maharashtra', scans: 1456, lat: 19.0760, lng: 72.8777 },
    { location: 'Delhi, NCR', scans: 1234, lat: 28.6139, lng: 77.2090 },
    { location: 'Bangalore, Karnataka', scans: 1123, lat: 12.9716, lng: 77.5946 },
    { location: 'Chennai, Tamil Nadu', scans: 987, lat: 13.0827, lng: 80.2707 },
    { location: 'Hyderabad, Telangana', scans: 876, lat: 17.3850, lng: 78.4867 }
  ],
  fraudTrends: [
    { month: 'Jan', reports: 12, confirmed: 8 },
    { month: 'Feb', reports: 15, confirmed: 11 },
    { month: 'Mar', reports: 9, confirmed: 6 },
    { month: 'Apr', reports: 18, confirmed: 14 },
    { month: 'May', reports: 7, confirmed: 4 },
    { month: 'Jun', reports: 11, confirmed: 9 }
  ],
  batchDistribution: [
    { category: 'Grains', count: 856, color: '#10B981' },
    { category: 'Pesticides', count: 423, color: '#F59E0B' },
    { category: 'Seeds', count: 345, color: '#EF4444' },
    { category: 'Fertilizers', count: 289, color: '#8B5CF6' },
    { category: 'Equipment', count: 156, color: '#06B6D4' },
    { category: 'Others', count: 87, color: '#84CC16' }
  ]
};

// Educational content
export const mockEducationalContent = {
  antiCounterfeit: [
    {
      title: 'How to Identify Fake Products',
      description: 'Learn to spot counterfeit agricultural products',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      content: 'Always check for QR codes, verify manufacturer details, and report suspicious products.'
    },
    {
      title: 'QR Code Verification',
      description: 'Step-by-step guide to verify products',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      content: 'Use your smartphone camera to scan QR codes and verify product authenticity.'
    }
  ],
  safetyTips: [
    {
      title: 'Pesticide Safety',
      description: 'Safe handling of agricultural chemicals',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      content: 'Always wear protective equipment and follow manufacturer guidelines.'
    },
    {
      title: 'Seed Storage',
      description: 'Proper storage techniques for seeds',
      image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400',
      content: 'Store seeds in cool, dry places to maintain viability.'
    }
  ]
};

// Language data
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];