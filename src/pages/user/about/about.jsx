import React from 'react';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import mainImg from '../../../assets/images/shop.jpg'
import profile1 from "../../../assets/images/profile-2.webp"
import profile2 from "../../../assets/images/pic 2.jpg"
import profile3 from "../../../assets/images/pic 4.jpg"
import profile4 from "../../../assets/images/pic 3.jpg"
import profile5 from "../../../assets/images/pic 5.jpg"

const AboutContent = () => {
  return (
    <>
    <HeaderLogin/>
    <div className="bg-white min-h-screen py-12 mt-2">
      <main className="container mx-auto px-4">
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-[#47645a] mb-8">About Green Mind</h1>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <p className="text-[#2c3e36] mb-4">
                Green Mind was born from a passion for bringing nature indoors. Our journey began in a small greenhouse,
                where we cultivated not just plants, but a vision of greener, more vibrant living spaces.
              </p>
              <p className="text-[#2c3e36]">
                Today, we're proud to offer a curated selection of plants that bring life, color, and fresh air to homes
                and offices across the country. Our commitment to quality and sustainability has made us a trusted name
                in the world of indoor gardening.
              </p>
            </div>
            <div className="md:w-1/2 h-64 bg-[#d1e0d9] rounded-lg overflow-hidden">
              <img
                src={mainImg}
                alt="Green Mind Greenhouse"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#47645a] mb-6">Our Mission</h2>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-[#2c3e36] text-lg mb-4">
              At Green Mind, our mission is to connect people with nature, one plant at a time. We believe in:
            </p>
            <ul className="list-disc list-inside text-[#2c3e36] space-y-2">
              <li>Promoting sustainable and eco-friendly gardening practices</li>
              <li>Educating our community about the benefits of indoor plants</li>
              <li>Providing top-quality, ethically sourced plants and accessories</li>
              <li>Creating a greener, healthier world through the power of plants</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#47645a] mb-6">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Expert Care", description: "Our team of horticulturists ensures every plant is healthy and thriving before it reaches your doorstep. We provide detailed care instructions and ongoing support to help your plants flourish." },
              { title: "Wide Selection", description: "From rare specimens to classic favorites, we have the perfect plant for every space and skill level. Our collection is constantly updated to bring you the latest trends in indoor gardening." },
              { title: "Sustainable Practices", description: "We're committed to eco-friendly packaging and responsible sourcing. Our pots are made from recycled materials, and we partner with local growers to reduce our carbon footprint." }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-[#47645a] mb-2">{feature.title}</h3>
                <p className="text-[#2c3e36]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-[#47645a] mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: "Abel Tomy", role: "Founder & Plant Specialist", image: profile1 },
              { name: "Michael Fern", role: "Horticulturist",image: profile2 },
              { name: "Sarah Bloom", role: "Customer Experience Manager", image: profile3 },
              { name: "David Root", role: "Sustainability Coordinator", image: profile4 }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-48 bg-[#d1e0d9]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#47645a]">{member.name}</h3>
                  <p className="text-[#2c3e36] text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* <section className="mt-16">
          <h2 className="text-3xl font-semibold text-[#47645a] mb-6">Visit Our Store</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-[#2c3e36] mb-4">
              Experience the Green Mind difference in person. Visit our store to explore our lush collection, 
              get expert advice, and find the perfect plants for your space.
            </p>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-[#2c3e36]"><strong>Address:</strong> 123 Botanical Lane, Greenville, GR 12345</p>
                <p className="text-[#2c3e36]"><strong>Hours:</strong> Monday-Saturday: 9am-6pm, Sunday: 10am-4pm</p>
              </div>
              <button className="mt-4 md:mt-0 bg-[#47645a] text-white py-2 px-4 rounded hover:bg-[#3a5049] transition-colors">
                Get Directions
              </button>
            </div>
          </div>
        </section> */}
      </main>
    </div>
    <Footer/>
    </>
  );
};

export default AboutContent;