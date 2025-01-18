import { useState } from 'react'
import { Send, Phone, Mail, MapPin } from 'lucide-react'
import Footer from '../../../components/footer/footer'
import HeaderLogin from '../../../components/header-login/header-login'
import emailjs from '@emailjs/browser'
import { toast } from 'react-toastify'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: 'greenmind202@gmail.com' // Replace with your email
      }

      await emailjs.send(
        'service_yuihg6z', 
        'template_0idsjvg', 
        templateParams,
        'b7_5HO0LhxZ3K89N4' 
      )

      setFormData({ name: '', email: '', message: '' })
      toast.success('Thank you for your message. We will get back to you soon!')
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Sorry, there was an error sending your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <HeaderLogin/>
    <div className="bg-white min-h-screen py-12 mt-2">
      <main className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#47645a] mb-8">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="name" className="block text-[#2c3e36] mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#d1e0d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#47645a]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-[#2c3e36] mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#d1e0d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#47645a]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-[#2c3e36] mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-[#d1e0d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#47645a]"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#47645a] text-white py-2 px-4 rounded-md hover:bg-[#3a5049] transition-colors flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-semibold text-[#47645a] mb-4">Store Information</h2>
              <div className="space-y-4">
                <p className="flex items-center text-[#2c3e36]">
                  <MapPin className="mr-2 h-5 w-5 text-[#47645a]" />
                  123 Botanical Lane, Greenville, GR 12345
                </p>
                <p className="flex items-center text-[#2c3e36]">
                  <Phone className="mr-2 h-5 w-5 text-[#47645a]" />
                  (555) 123-4567
                </p>
                <p className="flex items-center text-[#2c3e36]">
                  <Mail className="mr-2 h-5 w-5 text-[#47645a]" />
                  info@greenmind.com
                </p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-[#47645a] mb-2">Hours of Operation</h3>
                <p className="text-[#2c3e36]">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-[#2c3e36]">Saturday: 10:00 AM - 4:00 PM</p>
                <p className="text-[#2c3e36]">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <Footer/>
    </>
  )
}