import { Leaf, Mail, Phone, MapPin, Globe, ArrowUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"

export default function Footer() {
  const { t } = useTranslation()
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 transform rotate-12 scale-150"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 animate-in slide-in-from-bottom-4 duration-400">
              <div className="flex items-center gap-3 mb-6 group">
                <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <Image
                    src="/main.png"
                    alt="BioBloom Logo"
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-2xl text-white group-hover:text-green-400 transition-colors duration-200">
                    BioBloom
                  </h3>
                  <p className="text-sm text-green-400 font-medium">For Indian Farmers</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                Empowering Indian farmers with intelligent AI-driven solutions for sustainable agriculture. 
                We're committed to revolutionizing farming practices across India with cutting-edge technology.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span>Pan India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span>12 Languages</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="animate-in slide-in-from-bottom-4 duration-400 delay-200">
              <h4 className="font-heading font-semibold text-lg text-white mb-6 border-b border-gray-700 pb-2">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-300 hover:text-green-400 transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {t("navigation.home")}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products" 
                    className="text-gray-300 hover:text-green-400 transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {t("navigation.products")}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-gray-300 hover:text-green-400 transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {t("navigation.about")}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/support" 
                    className="text-gray-300 hover:text-green-400 transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {t("navigation.support")}
                  </Link>
                </li>
                <li>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="animate-in slide-in-from-bottom-4 duration-400 delay-400">
              <h4 className="font-heading font-semibold text-lg text-white mb-6 border-b border-gray-700 pb-2">
                Connect With Us
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors duration-200">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-sm">+91-9876543210</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors duration-200">
                  <Mail className="w-4 h-4 text-green-400" />
                  <span className="text-sm">support@biobloom.tech</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Bengaluru, Karnataka, India</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-400 mb-3">Follow Us</h5>
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-all duration-200 hover:scale-110 group"
                  >
                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-all duration-200 hover:scale-110 group"
                  >
                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-all duration-200 hover:scale-110 group"
                  >
                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-all duration-200 hover:scale-110 group"
                  >
                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </a>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-gray-400 text-sm text-center md:text-left">
                <p>&copy; 2025 BioBloom. All rights reserved. Empowering farmers across India with AI-driven agriculture.</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <Link href="#" className="hover:text-green-400 transition-colors duration-200">Privacy Policy</Link>
                <Link href="#" className="hover:text-green-400 transition-colors duration-200">Terms of Service</Link>
                <Link href="#" className="hover:text-green-400 transition-colors duration-200">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-in slide-in-from-bottom-4 duration-400 delay-800"
        >
          <ArrowUp className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </footer>
  )
}
