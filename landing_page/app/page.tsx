"use client"
import NextLink from "next/link"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn, SlideUp, SlideLeft, SlideRight, ScaleIn } from "@/components/ui/animation-wrapper"
import { useTranslation } from "@/hooks/use-translation"
import {
  ArrowRight,
  Leaf,
  Brain,
  Recycle,
  Shield,
  Stethoscope,
  Link,
  Users,
  TrendingUp,
  Globe,
  BarChart3,
  Zap,
  CheckCircle,
  Star,
  MapPin,
  Sprout,
  Cloud,
  DollarSign,
  Smartphone,
  Award,
  Target,
  Clock,
  HeartHandshake,
} from "lucide-react"

const Header = dynamic(() => import("@/components/header"), { ssr: true })
const Footer = dynamic(() => import("@/components/footer"), { ssr: true })
const Card = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })), { ssr: true })
const CardContent = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })), { ssr: true })
const CardDescription = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription })), { ssr: true })
const CardHeader = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })), { ssr: true })
const CardTitle = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })), { ssr: true })

export default function HomePage() {
  const { t, currentLanguage, changeLanguage } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header currentLanguage={currentLanguage} onLanguageChange={changeLanguage} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <FadeIn delay={50}>
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 text-sm px-4 py-2">
              {t("hero.badge")} • Made for Indian Agriculture 🇮🇳
            </Badge>
          </FadeIn>

          <SlideUp delay={80}>
            <h1 className="font-heading font-bold text-5xl md:text-7xl text-gray-900 mb-6 leading-tight">
              {t("hero.title")} <span className="text-green-600 bg-clip-text">{t("hero.titleHighlight")}</span>
            </h1>
          </SlideUp>

          <SlideUp delay={110}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </SlideUp>

          <SlideUp delay={140}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <NextLink href="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  {t("hero.cta.primary")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </NextLink>
              <Button
                size="lg"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg bg-transparent transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                {t("hero.cta.secondary")}
              </Button>
            </div>
          </SlideUp>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16">
            <ScaleIn delay={170}>
              <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                  <Users className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="font-heading font-bold text-3xl text-gray-900">24/7</div>
                <div className="text-gray-600 font-medium">AI Support</div>
              </div>
            </ScaleIn>
            <ScaleIn delay={200}>
              <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                  <TrendingUp className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="font-heading font-bold text-3xl text-gray-900">45%</div>
                <div className="text-gray-600 font-medium">{t("hero.stats.yield")}</div>
              </div>
            </ScaleIn>
            <ScaleIn delay={230}>
              <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                  <Leaf className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="font-heading font-bold text-3xl text-gray-900">100%</div>
                <div className="text-gray-600 font-medium">{t("hero.stats.organic")}</div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* AI-Powered Features Section */}
      <section className="py-20 px-4 bg-white relative">
        
        <div className="container mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm px-4 py-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Powered by Advanced AI
              </Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">
                Revolutionary AI for Indian Agriculture
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Experience the future of farming with our cutting-edge artificial intelligence designed specifically for
                Indian soil, climate, and farming practices. From crop prediction to pest management, our AI learns from
                millions of data points to give you precise, actionable insights.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <SlideLeft delay={100}>
              <div className="space-y-8">
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-3">Smart Crop Intelligence</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Our AI analyzes soil conditions, weather patterns, and historical data to recommend the perfect
                      crops for your land. Increase yields by up to 45% with data-driven crop selection and rotation
                      strategies.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-3">Real-Time Monitoring</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Get instant alerts about pest threats, disease outbreaks, and optimal harvesting times. Our AI
                      monitors satellite imagery and weather data 24/7 to protect your investment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-3">Predictive Analytics</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Forecast market prices, predict weather impacts, and plan your farming calendar with AI-powered
                      insights. Make informed decisions that maximize profitability and minimize risks.
                    </p>
                  </div>
                </div>
              </div>
            </SlideLeft>

            <SlideRight delay={150}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                  <Image
                    src="/one.jpg"
                    alt="AI-powered farming dashboard"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg animate-pulse">
                  <Zap className="w-4 h-4 inline mr-2" />
                  AI-Powered
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Why Choose BioBloom Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200 text-sm px-4 py-2">
                <Award className="w-4 h-4 inline mr-2" />
                Why BioBloom?
              </Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">
                The Smart Choice for Modern Farmers
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of progressive farmers who are transforming their agricultural practices with intelligent technology
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScaleIn delay={50}>
              <Card className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">95% Accuracy</h3>
                  <p className="text-gray-600">AI predictions backed by millions of data points from Indian farms</p>
                </CardContent>
              </Card>
            </ScaleIn>

            <ScaleIn delay={80}>
              <Card className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">Easy to Use</h3>
                  <p className="text-gray-600">Simple interface designed for farmers, accessible on any device</p>
                </CardContent>
              </Card>
            </ScaleIn>

            <ScaleIn delay={110}>
              <Card className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">Cost Savings</h3>
                  <p className="text-gray-600">Reduce input costs by 30% with optimized resource management</p>
                </CardContent>
              </Card>
            </ScaleIn>

            <ScaleIn delay={140}>
              <Card className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <HeartHandshake className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">Expert Support</h3>
                  <p className="text-gray-600">Connect with agricultural experts and farming community 24/7</p>
                </CardContent>
              </Card>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm px-4 py-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Simple Process
              </Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">
                Get Started in 3 Easy Steps
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start your journey to smarter farming in minutes
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-green-300"></div>

            <SlideUp delay={50}>
              <div className="relative text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl mb-4 text-gray-900">Sign Up Free</h3>
                <p className="text-gray-600 text-lg">
                  Create your account in seconds. No credit card required, no hidden fees.
                </p>
              </div>
            </SlideUp>

            <SlideUp delay={80}>
              <div className="relative text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl mb-4 text-gray-900">Add Your Farm</h3>
                <p className="text-gray-600 text-lg">
                  Tell us about your land, crops, and location. Our AI will personalize recommendations.
                </p>
              </div>
            </SlideUp>

            <SlideUp delay={110}>
              <div className="relative text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl mb-4 text-gray-900">Start Growing</h3>
                <p className="text-gray-600 text-lg">
                  Get instant insights, predictions, and recommendations to boost your yields.
                </p>
              </div>
            </SlideUp>
          </div>

          <SlideUp delay={140}>
            <div className="text-center mt-12">
              <NextLink href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-5 text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </NextLink>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200 text-sm px-4 py-2">
                <Sprout className="w-4 h-4 inline mr-2" />
                Core Features
              </Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">{t("features.title")}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("features.subtitle")}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <SlideLeft delay={100}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Image
                    src="/indian-farmer-smartphone.png"
                    alt="Farmer using BioBloom platform"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </SlideLeft>

            <SlideRight delay={130}>
              <div className="space-y-8">
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-3">
                      {t("features.multilingual.title")}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{t("features.multilingual.description")}</p>
                  </div>
                </div>

                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <Leaf className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-3">
                      {t("features.organic.title")}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{t("features.organic.description")}</p>
                  </div>
                </div>

                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-3">
                      {t("features.farmerCentric.title")}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{t("features.farmerCentric.description")}</p>
                  </div>
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm px-4 py-2">
                <Star className="w-4 h-4 inline mr-2 fill-yellow-600" />
                Success Stories
              </Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">
                Trusted by Farmers Across India
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from farmers who transformed their agricultural practices
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScaleIn delay={50}>
              <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "BioBloom's AI helped me increase my wheat yield by 42%. The crop rotation suggestions were perfect for my soil type. Game changer!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">RK</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                      <p className="text-sm text-gray-600">Punjab • 45 acres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>

            <ScaleIn delay={80}>
              <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "The pest predictor saved my entire cotton crop. Early warning system is incredibly accurate. Reduced pesticide use by 60%!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SP</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Sunita Patel</h4>
                      <p className="text-sm text-gray-600">Gujarat • 30 acres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>

            <ScaleIn delay={110}>
              <Card className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-100 hover:border-yellow-300 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "Finally, technology that understands Indian farming! The Hindi interface and local crop database make it so easy to use."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">MS</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Mahesh Singh</h4>
                      <p className="text-sm text-gray-600">Uttar Pradesh • 25 acres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <Badge className="mb-6 bg-green-600 text-white hover:bg-green-700 text-sm px-4 py-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Limited Time Offer
              </Badge>
            </FadeIn>
            <FadeIn delay={40}>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-6">
                {t("cta.title")}
              </h2>
            </FadeIn>
            <SlideUp delay={70}>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {t("cta.subtitle")}
              </p>
            </SlideUp>

            <SlideUp delay={100}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <NextLink href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-10 py-5 text-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl shadow-lg">
                    {t("cta.primary")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </NextLink>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-5 text-lg bg-transparent transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                >
                  {t("cta.secondary")}
                </Button>
              </div>
            </SlideUp>

            <SlideUp delay={130}>
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">24/7 support in Hindi</span>
                </div>
              </div>
            </SlideUp>

            <ScaleIn delay={160}>
              <div className="mt-12 pt-8 border-t border-gray-700">
                <p className="text-gray-400 mb-4">Trusted by over 10,000+ farmers across India</p>
                <div className="flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-white font-semibold ml-2">4.9/5</span>
                  <span className="text-gray-400 ml-1">(2,450 reviews)</span>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
