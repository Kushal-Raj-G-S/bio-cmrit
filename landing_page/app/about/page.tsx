"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { FadeIn, SlideUp, SlideLeft, SlideRight, ScaleIn } from "@/components/ui/animation-wrapper"
import {
  Target,
  Eye,
  Heart,
  Lightbulb,
  Globe,
  Leaf,
  Users,
  MapPin,
  TrendingUp,
  Star,
  Mail,
  FileText,
  ExternalLink
} from "lucide-react"

export default function AboutPage() {
  const { t, currentLanguage, changeLanguage } = useTranslation()

  const founders = [
    {
      name: "Kushal Raj G S",
      role: "Founder & CEO",
      background: "AI Engineer",
      experience: "2+ years of experience in AIML",
      image: "/kush.JPG",
      bio: "Kushal combines deep agricultural knowledge with cutting-edge AI expertise. He has led multiple successful AgTech ventures and holds 12 patents in precision agriculture.",
      linkedin: "https://www.linkedin.com/in/kushal-raj-g-s/",
      github: "https://github.com/kushalrajgs",
      email: "kushalrajgs@gmail.com",
      portfolio: "https://kushalrajgs.me",
    }
  ]



  const values = [
    {
      icon: Heart,
      title: "Farmer-First Approach",
      description: "Every decision we make is guided by what's best for the farmers we serve. Their success is our success.",
    },
    {
      icon: Lightbulb,
      title: "Innovation with Purpose",
      description: "We leverage cutting-edge AI technology to solve real agricultural challenges, not just for the sake of innovation.",
    },
    {
      icon: Globe,
      title: "Accessibility for All",
      description: "We believe advanced agricultural technology should be accessible to every farmer, regardless of farm size or location.",
    },
    {
      icon: Leaf,
      title: "Sustainable Agriculture",
      description: "We're committed to promoting organic, sustainable farming practices that protect our environment for future generations.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header currentLanguage={currentLanguage} onLanguageChange={changeLanguage} />
      
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto">
          <FadeIn>
            <Badge className="bg-white/20 text-white mb-6">About BioBloom</Badge>
          </FadeIn>
          <SlideUp delay={200}>
            <h1 className="font-heading font-bold text-5xl md:text-6xl text-white mb-6">
              {t("about.title")}
            </h1>
          </SlideUp>
          <SlideUp delay={300}>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Empowering Indian farmers with AI-powered solutions for sustainable and profitable agriculture.
            </p>
          </SlideUp>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <ScaleIn delay={400}>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-heading font-semibold text-2xl text-gray-900">95%</div>
                <div className="text-gray-600">Model Accuracy</div>
              </div>
            </ScaleIn>
            <ScaleIn delay={450}>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-heading font-semibold text-2xl text-gray-900">3</div>
                <div className="text-gray-600">Languages Supported</div>
              </div>
            </ScaleIn>
            <ScaleIn delay={500}>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-heading font-semibold text-2xl text-gray-900">45%</div>
                <div className="text-gray-600">Avg. Yield Increase</div>
              </div>
            </ScaleIn>
            <ScaleIn delay={550}>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-heading font-semibold text-2xl text-gray-900">6</div>
                <div className="text-gray-600">AI-Powered Tools</div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideLeft delay={200}>
              <div>
                <img
                  src="main.png"
                  alt="BioBloom team working on AI agriculture solutions"
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </SlideLeft>

            <div className="space-y-8">
              <SlideRight delay={300}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="font-heading font-bold text-3xl text-gray-900">{t("about.mission")}</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    To democratize advanced agricultural technology and make AI-powered farming solutions accessible to
                    every Indian farmer, regardless of farm size or location. We believe that technology should serve
                    farmers, not the other way around.
                  </p>
                </div>
              </SlideRight>

              <SlideRight delay={400}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="font-heading font-bold text-3xl text-gray-900">{t("about.vision")}</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    To create a future where every Indian farmer has access to intelligent, sustainable, and profitable
                    farming solutions. We envision an agricultural ecosystem where technology and traditional wisdom work
                    together to ensure food security and farmer prosperity.
                  </p>
                </div>
              </SlideRight>

              <SlideRight delay={500}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="font-heading font-bold text-3xl text-gray-900">{t("about.impact")}</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Since our founding, we've helped farmers increase their yields by an average of 45%, reduce input
                    costs by 30%, and adopt sustainable farming practices. Our technology has directly contributed to
                    improving the livelihoods of over 50,000 farming families across India.
                  </p>
                </div>
              </SlideRight>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="container mx-auto">
          <FadeIn delay={200}>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">{t("about.founders")}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our founding team combines deep agricultural expertise, cutting-edge AI knowledge, and grassroots
                understanding of Indian farming challenges.
              </p>
            </div>
          </FadeIn>

          <div className="flex justify-center">
            {founders.map((founder, index) => (
              <ScaleIn key={index} delay={400 + index * 100}>
                <Card className="group hover:shadow-xl transition-all duration-300 bg-white max-w-md">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto mb-4">
                      <img
                        src={founder.image || "/placeholder.svg"}
                        alt={founder.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-100"
                      />
                    </div>
                    <CardTitle className="font-heading text-2xl mb-2">{founder.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800 mb-2">{founder.role}</Badge>
                    <CardDescription className="text-sm text-gray-600">
                      {founder.background} • {founder.experience}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{founder.bio}</p>
                    <div className="flex justify-center gap-4 pt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${founder.email}`, '_blank')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => window.open(founder.linkedin, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => window.open(founder.github, '_blank')}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-green-50 hover:text-green-600"
                        onClick={() => window.open(founder.portfolio, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <FadeIn delay={200}>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">{t("about.values")}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our values guide everything we do, from the technology we build to the partnerships we form.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ScaleIn key={index} delay={300 + index * 100}>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Insights Section */}  
      <section className="py-20 px-4 bg-green-50">
        <div className="container mx-auto">
          <FadeIn delay={200}>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">The Agricultural Revolution</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Understanding the real challenges behind India's agricultural crisis and our innovative approach to solving them.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <ScaleIn delay={300}>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900">The Crisis</h3>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>60% of farmers still rely on traditional guesswork for crop planning</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>₹2.5 lakh crores lost annually due to improper pest management</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Language barriers prevent 70% farmers from accessing modern agricultural knowledge</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Average farmer income remains below ₹10,000/month despite food inflation</span>
                  </p>
                </div>
              </div>
            </ScaleIn>

            <ScaleIn delay={400}>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900">Our Innovation</h3>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>AI models trained on 10M+ Indian agricultural data points for local accuracy</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Real-time satellite imagery + weather integration for precision farming</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Native language AI that understands regional farming terminology</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Blockchain supply chain removing 3+ middleman layers for direct profit</span>
                  </p>
                </div>
              </div>
            </ScaleIn>

            <ScaleIn delay={500}>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white md:col-span-2">
                <div className="text-center mb-8">
                  <h3 className="font-bold text-3xl mb-4">The BioBloom Difference</h3>
                  <p className="text-blue-100 text-lg">Why our approach works where others fail</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">95%</div>
                    <div className="text-blue-100">Accuracy in local conditions vs 60% for global models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">₹0</div>
                    <div className="text-blue-100">Cost to farmers vs ₹50,000/year for premium AgTech</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-blue-100">Availability vs limited extension officer hours</div>
                  </div>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <FadeIn delay={200}>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-6">Join Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Ready to revolutionize Indian agriculture? We're always looking for passionate individuals to join our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=kush.mistry02@gmail.com', '_blank')}
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                <FileText className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}
