"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import {
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
  Users,
  Handshake,
  Award,
  BookOpen,
  Video,
  FileText,
  Clock,
  CheckCircle,
  Star,
  MapPin,
} from "lucide-react"

export default function SupportPage() {
  const { t, currentLanguage, changeLanguage } = useTranslation()

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Get instant help from our agricultural experts",
      availability: "24/7 in Hindi & English",
      action: "Start Chat",
      color: "bg-green-600",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our farming specialists",
      availability: "Mon-Sat, 8 AM - 8 PM",
      action: "Call Now",
      color: "bg-blue-600",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send detailed queries and get comprehensive answers",
      availability: "Response within 4 hours",
      action: "Send Email",
      color: "bg-purple-600",
    },
    {
      icon: Video,
      title: "Video Consultation",
      description: "One-on-one sessions with agricultural consultants",
      availability: "By appointment",
      action: "Book Session",
      color: "bg-orange-600",
    },
  ]

  const communityOptions = [
    {
      icon: Users,
      title: "Join Our Beta Community",
      description: "Connect with early adopters and help shape BioBloom's future",
      benefits: ["Share feedback", "Get early access", "Influence development", "Direct support channel"],
      action: "Join Beta",
      members: "Beta Testing Phase",
    },
    {
      icon: Handshake,
      title: "Partner Program",
      description: "Become a BioBloom partner and help us reach more farmers",
      benefits: ["Earn commissions", "Training & certification", "Marketing support", "Priority support"],
      action: "Become Partner",
      members: "500+ Partners",
    },
    {
      icon: Award,
      title: "Ambassador Program",
      description: "Lead agricultural innovation in your region",
      benefits: ["Recognition & rewards", "Direct access to founders", "Beta product access", "Speaking opportunities"],
      action: "Apply Now",
      members: "100+ Ambassadors",
    },
  ]

  const faqs = [
    {
      question: "How does BioBloom's AI technology work for Indian farming conditions?",
      answer:
        "Our AI is specifically trained on 10M+ Indian agricultural data points, including soil types, climate patterns, crop varieties, and regional farming practices. We integrate real-time satellite imagery, weather data, and IoT sensor inputs to provide hyper-local recommendations with 95% accuracy for Indian farming conditions.",
    },
    {
      question: "Is BioBloom completely free for farmers?",
      answer:
        "Yes! BioBloom is 100% free for all farmers with no hidden costs, subscription fees, or premium tiers. We believe advanced agricultural technology should be accessible to every farmer, regardless of farm size or economic status. No registration fees, no credit card required.",
    },
    {
      question: "What languages does BioBloom support?",
      answer:
        "BioBloom currently supports 3 languages - Hindi, Kannada, and English - with native AI understanding of regional agricultural terminology. We're expanding to 12+ Indian languages including Bengali, Telugu, Marathi, Tamil, Gujarati, Malayalam, Punjabi, and Odia.",
    },
    {
      question: "How accurate are BioBloom's AI predictions?",
      answer:
        "Our AI models achieve 95% accuracy in crop recommendations, pest detection, and yield predictions - significantly higher than global agricultural AI models (60-70% accuracy) because we're trained specifically on Indian agricultural conditions and local farming practices.",
    },
    {
      question: "Can I use BioBloom without internet connectivity?",
      answer:
        "Yes! BioBloom offers offline functionality for 70% of core features. You can access crop recommendations, pest identification guides, and farming calendars offline. Data syncs automatically when connectivity is restored, ensuring uninterrupted farming guidance.",
    },
    {
      question: "What makes BioBloom different from other AgTech solutions?",
      answer:
        "Unlike expensive AgTech platforms ($50,000+/year), BioBloom is completely free, supports local languages, works offline, and is trained specifically on Indian agricultural data. We focus on smallholder farmers rather than large agribusinesses, making modern farming accessible to everyone.",
    },
    {
      question: "How do I get started with BioBloom?",
      answer:
        "Simply visit our platform, select your preferred language, and start using any of our 6 AI-powered tools immediately. No registration, no setup fees, no waiting period. Our intuitive interface guides you through each tool with contextual help in your local language.",
    },
    {
      question: "Is my farm data secure and private?",
      answer:
        "Absolutely! All farm data is encrypted end-to-end and stored securely on Indian servers. We never sell or share individual farm data with third parties. You maintain complete ownership and control of your agricultural data, with the option to export or delete it anytime.",
    },
  ]

  const resources = [
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Comprehensive guides and tutorials",
      count: "200+ Articles",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides in Hindi & English",
      count: "50+ Videos",
    },
    {
      icon: FileText,
      title: "Best Practices",
      description: "Agricultural best practices and case studies",
      count: "100+ Guides",
    },
    {
      icon: Users,
      title: "Webinars",
      description: "Live sessions with agricultural experts",
      count: "Weekly Sessions",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header currentLanguage={currentLanguage} onLanguageChange={changeLanguage} />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 text-sm px-4 py-2">
            Support & Community
          </Badge>

          <h1 className="font-heading font-bold text-5xl md:text-6xl text-gray-900 mb-6 leading-tight">
            We're Here to <span className="text-green-600">Support Your Success</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get technical support, connect with fellow farmers, and access comprehensive resources to maximize your
            farming success with BioBloom's AI-powered platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-heading font-semibold text-2xl text-gray-900">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-heading font-semibold text-2xl text-gray-900">Beta</div>
              <div className="text-gray-600">Testing Phase</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-heading font-semibold text-2xl text-gray-900">MVP</div>
              <div className="text-gray-600">Development Stage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">Get Platform Support</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our development team and agricultural advisors are here to help you get the most out of BioBloom's AI tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 text-center">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 ${option.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-heading text-xl mb-2">{option.title}</CardTitle>
                  <CardDescription className="text-base">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    {option.availability}
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    {option.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 bg-green-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading font-bold text-4xl text-gray-900 mb-6">Send Us a Message</h2>
              <p className="text-lg text-gray-600 mb-8">
                Have a specific question or need personalized assistance? Fill out the form and our agricultural experts
                will get back to you within 4 hours.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600">+91-9876543210</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600">support@biobloom.tech</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office Address</h3>
                    <p className="text-gray-600">Bengaluru, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input placeholder="Enter your phone number" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <Input type="email" placeholder="Enter your email address" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                  <Input placeholder="City, State" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How can we help you?</label>
                  <Textarea placeholder="Describe your question or issue in detail..." rows={4} />
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  Send Message
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-6">Join Our Growing Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with early adopters and fellow farmers exploring AI-powered agricultural solutions. Share experiences and learn together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityOptions.map((option, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <option.icon className="w-8 h-8 text-green-600 group-hover:text-white" />
                  </div>
                  <CardTitle className="font-heading text-2xl mb-2">{option.title}</CardTitle>
                  <CardDescription className="text-base mb-4">{option.description}</CardDescription>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {option.members}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {option.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    {option.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources & FAQ */}
      <section className="py-20 px-4 bg-green-50">
        <div className="container mx-auto">
          <Tabs defaultValue="resources" className="w-full">
            <div className="text-center mb-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="resources">
              <div className="text-center mb-16">
                <h2 className="font-heading font-bold text-5xl md:text-6xl text-gray-900 mb-6">Learning Resources</h2>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Access comprehensive resources to master BioBloom and improve your farming practices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {resources.map((resource, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 text-center">
                    <CardHeader className="pb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <resource.icon className="w-8 h-8 text-green-600 group-hover:text-white" />
                      </div>
                      <CardTitle className="font-heading text-2xl mb-3">{resource.title}</CardTitle>
                      <CardDescription className="text-lg leading-relaxed">{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-green-100 text-green-800 mb-4">{resource.count}</Badge>
                      <Button variant="ghost" className="text-green-600 hover:text-green-700 p-0">
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq">
              <div className="text-center mb-16">
                <h2 className="font-heading font-bold text-5xl md:text-6xl text-gray-900 mb-6">Frequently Asked Questions</h2>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Find answers to common questions about BioBloom and our AI-powered farming solutions.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border px-6">
                      <AccordionTrigger className="text-left font-semibold text-lg md:text-xl text-gray-900 hover:text-green-600">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed text-lg">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-6">
            Ready to Experience BioBloom?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the growing community of Indian farmers exploring AI-powered agriculture. Access all tools completely free
            and experience the future of farming today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              Start Using Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              30-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              24/7 Hindi support
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
