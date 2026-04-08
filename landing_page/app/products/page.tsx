"use client"

import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { FadeIn, SlideUp, SlideLeft, SlideRight, ScaleIn } from "@/components/ui/animation-wrapper"
import {
  Recycle,
  Leaf,
  Shield,
  Stethoscope,
  Link,
  CheckCircle,
  Star,
  Zap,
  TrendingUp,
  Users,
  Award,
  Book,
  Target,
  Sparkles,
  ArrowRight,
  Brain,
  BarChart3,
} from "lucide-react"

export default function ProductsPage() {
  const { t } = useTranslation()

  const getProducts = () => [
    {
      id: "crop-rotation",
      icon: Recycle,
      title: "KrishiChakra",
      description: "Smart Crop Management: Optimize yields effortlessly with AI-powered rotation planning.",
      features: [
        "AI-powered soil analysis and health monitoring",
        "Seasonal crop recommendations based on climate data",
        "Yield prediction with 95% accuracy",
        "Nutrient optimization planning",
        "Water usage efficiency tracking",
      ],
      benefits: [
        "Increase crop yields by up to 40%",
        "Reduce fertilizer costs by 25%",
        "Improve soil health naturally",
        "Reduce soil degradation by 60%",
        "Optimize water usage by 30%",
        "Maximize profit margins through strategic planning",
      ],
      // image: "/crop-rotation-dashboard.png",
      pricing: "FREE",
      link: "http://localhost:3000"
    },
    {
      id: "waste-converter",
      icon: Leaf,
      title: "KrishiUddhar",
      description: "Transform waste into resources with innovative conversion strategies and market linkages.",
      features: [
        "Organic waste processing optimization",
        "Compost quality analysis and improvement",
        "Revenue stream identification and planning",
        "Environmental impact assessment",
        "Automated process monitoring",
      ],
      benefits: [
        "Generate additional income streams",
        "Reduce waste disposal costs by 80%",
        "Create high-quality organic fertilizer",
        "Reduce environmental impact",
        "Support circular economy principles",
        "Market integration and premium pricing strategies",
      ],
      // image: "/waste-converter-process.png",
      pricing: "FREE"
    },
    {
      id: "pest-predictor",
      icon: Shield,
      title: "KrishiAusadh",
      description: "Pest Control Solutions: Protect your harvest with precision using organic-first methods.",
      features: [
        "Early pest detection using satellite imagery",
        "Weather-based pest risk assessment",
        "Organic and chemical treatment recommendations",
        "Cost-effective prevention strategies",
        "Real-time monitoring and alerts",
      ],
      benefits: [
        "Reduce crop losses by up to 30%",
        "Minimize pesticide usage by 50%",
        "Lower treatment costs through early detection",
        "Improve harvest quality and market value",
        "Protect beneficial insects and pollinators",
      ],
      // image: "/pest-detection-ai.png",
      pricing: "FREE"
    },
    {
       id: "vet-helper",
       icon: Stethoscope,
       title: "PashudhanSakhi",
       description: "Comprehensive livestock health management with AI-powered diagnostics and care plans.",
       features: [
         "AI-powered disease diagnosis support",
         "Vaccination schedule management",
         "Nutrition planning for optimal health",
         "Emergency care guidelines",
         "Health record management system",
       ],
       benefits: [
         "Reduce veterinary costs by 40%",
         "Improve animal health outcomes",
         "Increase milk/meat production by 20%",
         "Prevent disease outbreaks",
         "Streamline farm management",
       ],
       // image: "/livestock-health-monitoring.png",
       pricing: "FREE"
    },
    {
      id: "blockchain-supply",
      icon: Link,
      title: "KrishiBarosa",
      description: "Transparent and secure supply chain management for agricultural products.",
      features: [
        "End-to-end traceability",
        "Smart contract automation",
        "Quality certification tracking",
        "Direct farmer-to-consumer connections",
        "Transparent pricing mechanisms",
      ],
      benefits: [
        "Premium pricing for certified products",
        "Direct market access",
        "Reduced middleman costs",
        "Enhanced consumer trust",
        "Streamlined transactions",
      ],
      // image: "/blockchain-supply-chain.png",
      pricing: "FREE"
    },
    {
  id: "education-hub",
  icon: Book,
  title: "GyanaAshram",
  description: "A personalized learning hub empowering users with agricultural knowledge through courses, community engagement, and daily progress tracking.",
  
  features: [
    "Daily login streak tracking",
    "Access to structured learning courses",
    "Community hub for discussions and knowledge-sharing",
    "Latest agriculture news and insights",
    "Personalized learning dashboard",
  ],

  benefits: [
    "Stay motivated with login streaks and achievements",
    "Gain expert knowledge with curated agriculture courses",
    "Connect with farmers, learners, and experts in the community",
    "Stay updated with real-time agriculture news and trends",
    "Track learning progress and improve consistently",
  ],

  pricing: "FREE"
}
  ]

  const products = getProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          {/* Animated background elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
            <FadeIn>
              <Badge className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 text-xs px-4 py-1.5 shadow-lg">
                <Sparkles className="w-3 h-3 inline mr-2" />
                All Tools Completely Free
              </Badge>
            </FadeIn>
            <FadeIn delay={40}>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
                {t('products.title')}
              </h1>
            </FadeIn>
            <SlideUp delay={70}>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed">
                {t('products.subtitle')}
              </p>
            </SlideUp>
            <SlideUp delay={100}>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Badge className="text-sm px-4 py-2 bg-white text-gray-800 border border-green-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('common.completelyFree')}
                </Badge>
                <Badge className="text-sm px-4 py-2 bg-white text-gray-800 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  {t('common.noSignupRequired')}
                </Badge>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <ScaleIn delay={50}>
            <Card className="text-center bg-gradient-to-br from-green-50 to-white border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">95%</div>
                <div className="text-xs text-gray-600 font-medium">AI Accuracy Rate</div>
              </CardContent>
            </Card>
          </ScaleIn>
          <ScaleIn delay={80}>
            <Card className="text-center bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">40%</div>
                <div className="text-xs text-gray-600 font-medium">Yield Increase</div>
              </CardContent>
            </Card>
          </ScaleIn>
          <ScaleIn delay={110}>
            <Card className="text-center bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">6</div>
                <div className="text-xs text-gray-600 font-medium">AI-Powered Tools</div>
              </CardContent>
            </Card>
          </ScaleIn>
          <ScaleIn delay={140}>
            <Card className="text-center bg-gradient-to-br from-orange-50 to-white border border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">10K+</div>
                <div className="text-xs text-gray-600 font-medium">Happy Farmers</div>
              </CardContent>
            </Card>
          </ScaleIn>
        </div>

        {/* Products Grid */}
        <div className="mb-10">
          <FadeIn>
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-3 py-1.5">
                <BarChart3 className="w-3 h-3 inline mr-2" />
                Our Product Suite
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 font-heading">
                Comprehensive Agricultural Solutions
              </h2>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                Each tool is designed with Indian farmers in mind, combining cutting-edge AI with practical farming wisdom
              </p>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => (
            <ScaleIn key={product.id + index} delay={50 + index * 30}>
              <Card className="group hover:shadow-xl transition-all duration-300 border hover:border-green-300 bg-white h-full hover:-translate-y-1">
                
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-end mb-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 text-xs font-semibold shadow-md">
                      {product.pricing}
                    </Badge>
                  </div>
                  <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-400 via-green-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <product.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 mb-2 font-heading group-hover:text-green-600 transition-colors">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-600 leading-relaxed">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <Tabs defaultValue="features" className="w-full flex-1">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-8">
                      <TabsTrigger value="features" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs">Features</TabsTrigger>
                      <TabsTrigger value="benefits" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs">Benefits</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="features" className="space-y-2 mt-3">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-1.5 rounded hover:bg-green-50 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="benefits" className="space-y-2 mt-3">
                      {product.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-1.5 rounded hover:bg-yellow-50 transition-colors">
                          <Star className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0 fill-yellow-500" />
                          <span className="text-xs text-gray-700 leading-relaxed">{benefit}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-2 mt-auto pt-3 border-t">
                    {product.link ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 h-9 text-sm"
                        onClick={() => window.open(product.link, '_blank')}
                      >
                        Launch Tool
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 h-9 text-sm">
                        Launch Tool
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>
          ))}
        </div>

        {/* Value Proposition */}
        <SlideUp delay={100}>
          <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-700 rounded-2xl p-8 md:p-12 text-white text-center mb-12 relative overflow-hidden shadow-xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 text-xs px-4 py-1.5 backdrop-blur-sm">
                <Award className="w-3 h-3 inline mr-2" />
                Join the Revolution
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
                Empowering Indian Agriculture
              </h2>
              <p className="text-base md:text-lg mb-8 opacity-95 max-w-2xl mx-auto leading-relaxed">
                Join the agricultural revolution with cutting-edge AI technology designed specifically for Indian farmers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ScaleIn delay={130}>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Increase Productivity</h3>
                    <p className="opacity-90 text-sm">Up to 40% yield improvement</p>
                  </div>
                </ScaleIn>
                <ScaleIn delay={160}>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <Leaf className="w-10 h-10 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Sustainable Farming</h3>
                    <p className="opacity-90 text-sm">Eco-friendly solutions</p>
                  </div>
                </ScaleIn>
                <ScaleIn delay={190}>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <Users className="w-10 h-10 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Community Support</h3>
                    <p className="opacity-90 text-sm">Connect with fellow farmers</p>
                  </div>
                </ScaleIn>
              </div>
              <div className="space-y-4">
                <p className="text-base opacity-95 mb-6">
                  No hidden costs, no subscription fees. Just pure agricultural innovation at your fingertips.
                </p>
                <NextLink href="/auth">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-10 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
                    Start Using Today
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </NextLink>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  ))}
                  <span className="ml-2 text-sm font-semibold">4.9/5 from 10,000+ farmers</span>
                </div>
              </div>
            </div>
          </div>
        </SlideUp>
      </main>

      <Footer />
    </div>
  )
}
