import React, { useState } from "react"; // Added useState
// Import Framer Motion
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { useEffect } from "react";



// Make sure you have react-icons installed: npm install react-icons
import {
  FaBullseye,
  FaEye,
  FaAward,
  FaUsers,
  FaGlobe,
  FaStar,
  FaQuoteLeft,
  // --- ADDED ICONS ---
  FaPassport,
  FaPlane,
  FaHotel,
  FaKaaba, // Icon for Hajj/Umrah
  FaChevronDown,
} from "react-icons/fa";

// --- Animation Variants ---
const sectionVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const gridContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const gridItemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- Reusable Card Component for Reviews ---
const ReviewCard = ({ name, quote, rating }) => (
  <motion.div
    variants={gridItemVariant}
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-white rounded-xl shadow-xl p-6 h-full flex flex-col"
  >
    <FaQuoteLeft className="text-4xl text-blue-500 mb-4" />
    <p className="text-gray-600 italic mb-6 grow">"{quote}"</p>
    <div className="flex items-center justify-between mt-auto">
      <span className="text-lg font-semibold text-gray-800">{name}</span>
      <div className="flex">
        {[...Array(rating)].map((_, i) => (
          <FaStar key={i} className="text-yellow-400" />
        ))}
      </div>
    </div>
  </motion.div>
);

// --- Country Flag Component ---
const FlagCard = ({ country, code }) => (
  <motion.div
    variants={gridItemVariant}
    className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-md transition-all"
  >
    <img
      className="w-16 h-10 object-cover rounded"
      src={`https://flagcdn.com/w160/${code.toLowerCase()}.png`}
      alt={`${country} flag`}
    />
    <span className="font-semibold text-gray-700 text-sm text-center">
      {country}
    </span>
  </motion.div>
);

// --- NEW Reusable Card Component for Services ---
const ServiceCard = ({ icon, title, description }) => (
  <motion.div
    variants={gridItemVariant}
    className="bg-white p-6 rounded-lg shadow-lg text-center"
  >
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

// --- NEW Animated Accordion Item ---
const AccordionItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-6 text-left"
      >
        <span className="text-lg font-semibold text-gray-800">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-500"
        >
          <FaChevronDown className="shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, paddingTop: '0px', paddingBottom: '24px' }}
            exit={{ height: 0, opacity: 0, paddingTop: '0px', paddingBottom: '0px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 px-6">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- Main About Page Component ---
function About() {
  useEffect(() => { 
    document.title = "About Us - O.S Travel & Tours"; // Dynamically sets title
  }, []);
  const countries = [
    { name: "Schengen", code: "eu" },
    { name: "United Kingdom", code: "gb" },
    { name: "United States", code: "us" },
    { name: "Australia", code: "au" },
    { name: "New Zealand", code: "nz" },
    { name: "Canada", code: "ca" },
  ];

  const dropboxCountries = [
    { name: "Malaysia", code: "my" },
    { name:"Thailand", code: "th" },
    { name: "Indonesia", code: "id" },
    { name: "Vietnam", code: "vn" },
  ];

  // --- UPDATED: More Reviews ---
  const reviews = [
    {
      name: "Ahtisham H.",
      quote: "Applied for Singapore, Got visa in 3 days, very efficiently. They know what they are doing. God bless them!",
      rating: 5,
    },
    {
      name: "Sami Jamal",
      quote: "Obaid is an extremely competent person who handled my visa with utmost care. I will definitely use his services in future. Highly recommended!",
      rating: 5,
    },
    {
      name: "Nasir Islam",
      quote: "Trustable and good services. I got Singapore evisa from os travel in just 2 days. Quality and charges and services good. Thanks.",
      rating: 5,
    },
    {
      name: "Dr. Fatima K.",
      quote: "Used O.S. Travel for my Schengen visa file processing. Their team is extremely professional and knowledgeable. My application was approved without any issues.",
      rating: 5,
    },
    {
      name: "The Malik Family",
      quote: "We booked our complete Umrah package with them. From flights to hotels in Makkah and Madina, everything was perfectly arranged. Truly a 5-star service.",
      rating: 5,
    },
    {
      name: "Zubair A.",
      quote: "Best travel agency for USA visa services. They prepared my file and coached me for the interview. I got my 5-year visa thanks to their expert help.",
      rating: 5,
    },
  ];

  // --- NEW: FAQ Data ---
  const faqs = [
    {
      q: "What services does O.S. Travel & Tours provide?",
      a: "We are a full-service travel agency in Islamabad, Pakistan. Our core services include expert visa file processing (Schengen, USA, UK, etc.), E-Visas, flight booking, hotel reservations, and complete Hajj & Umrah packages."
    },
    {
      q: "Why are you considered the best travel agency for visa services?",
      a: "Our reputation as a top-rated visa consultant comes from years of experience, a high success rate, and deep knowledge of the visa application process. We provide personalized file preparation and interview coaching."
    },
    {
      q: "Do I need to be in Islamabad to use your services?",
      a: "No. While our office is in Islamabad, we successfully serve clients from all over Pakistan. For many services like E-Visas and file processing, consultation can be done remotely."
    },
    {
      q: "What is an 'Authorized Dropbox Service'?",
      a: "This means we are an officially trusted partner for certain embassies (like Malaysia , Indonesia, Vietnam, Thailand) to collect and submit visa applications, saving you the hassle of appearing in person."
    },
    {
  q: "Do you offer travel insurance and why is it important?",
  a: "Yes, we provide travel insurance from trusted companies for Schengen, USA, UK, UAE, and worldwide travel. Travel insurance protects you from medical emergencies, trip cancellations, lost baggage, and travel delays—making it essential for a safe and secure journey."
},
{
  q: "Can O.S. Travel & Tours help with embassy appointments and documentation?",
  a: "Absolutely. We assist with embassy appointment bookings, complete documentation review, cover letters, itinerary preparation, and guidance according to embassy requirements for Schengen, UK, USA, Turkey, and other countries."
},
{
  q: "Do you provide cheap flight bookings?",
  a: "Yes. We offer discounted air tickets for all major airlines, including one-way, return, student, and last-minute flights. We compare fares to ensure you get the cheapest and most reliable flight options."
},
{
  q: "Are your tour packages customizable?",
  a: "Yes, all our tour packages—Turkey, Dubai, Malaysia, Thailand, Saudi Arabia, and Europe—are fully customizable based on your budget, dates, and travel preferences."
},
{
  q: "Do you offer Umrah and Hajj packages?",
  a: "Yes, we provide economy, 3-star, 4-star, and 5-star Umrah packages along with VIP transport and Ziyarat. Hajj services include complete guidance, group arrangements, and comfortable accommodation."
},
{
  q: "How long does visa processing usually take?",
  a: "Visa processing time varies by embassy. Schengen visas can take 10–20 days, while UK and USA appointments depend on availability. We guide you with the latest and most accurate timelines."
},
{
  q: "Can you help students with study visas?",
  a: "Yes, we assist Pakistani students with study visa guidance for the UK, Australia, Canada, Germany, Turkey, and other countries—covering documentation, embassy requirements, and file preparation."
},
{
  q: "Is O.S. Travel & Tours an authorized partner for any embassies?",
  a: "Yes, we are an authorized dropbox and trusted partner for Malaysia, Indonesia, Thailand, and Vietnam visa submissions. We help clients submit their applications without visiting the embassy in person."
},
{
  q: "Do you assist with hotel and travel arrangements?",
  a: "Yes, we provide hotel bookings, airport transfers, car rentals, and complete travel planning for both business and leisure trips."
},
{
  q: "Can I get visa consultation online?",
  a: "Yes, we offer online visa consultation through WhatsApp, calls, and email. You can submit your documents digitally without visiting our office."
}

  ];

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* 1. Hero Section */}
      <div className="relative w-full h-64 md:h-80 bg-blue-600">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful travel destination with mountains and a lake"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-bold text-white mb-2"
          >
            About O.S Travel & Tours
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white opacity-90"
          >
            Your Trusted Partner in Creating Unforgettable Adventures
          </motion.p>
        </div>
      </div>

      {/* 2. Intro & Stats Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 md:py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Welcome to the Best Travel Agency in Islamabad
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            At O.S Travel & Tours, we believe travel broadens horizons and
            creates meaningful connections. We are passionate about sharing the
            world’s beauty with our customers and are proud to be a leading
            travel agent in Islamabad, Pakistan, specializing in visa services and tour packages.
          </p>
        </div>

        {/* Stats Bar */}
        <motion.div
          variants={gridContainerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {/* ... Stats Items ... */}
          <motion.div
            variants={gridItemVariant}
            className="p-6 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaAward className="text-4xl text-blue-500" />
            </div>
            <span className="text-3xl font-bold text-gray-800 block">
              Since 2009
            </span>
            <span className="text-gray-600">Years of Trusted Experience</span>
          </motion.div>
          <motion.div
            variants={gridItemVariant}
            className="p-6 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGlobe className="text-4xl text-blue-500" />
            </div>
            <span className="text-3xl font-bold text-gray-800 block">100+</span>
            <span className="text-gray-600">Destinations Served</span>
          </motion.div>
          <motion.div
            variants={gridItemVariant}
            className="p-6 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-4xl text-blue-500" />
            </div>
            <span className="text-3xl font-bold text-gray-800 block">
              5,000+
            </span>
            <span className="text-gray-600">Happy Clients in Pakistan</span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 3. NEW: Our Core Services Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 md:py-24 px-6 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Services
            </h2>
            <p className="text-lg text-gray-600">
              As a full-service travel agency, we provide everything you need
              for your journey, from expert visa consultation to flight bookings and
              complete tour packages.
            </p>
          </div>

          <motion.div
            variants={gridContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <ServiceCard
              icon={<FaPassport className="text-4xl text-blue-500" />}
              title="Visa File Processing"
              description="Expert visa file preparation for Schengen, USA, UK, Canada, and more. We guide you through every step."
            />
            <ServiceCard
              icon={<FaPlane className="text-4xl text-green-500" />}
              title="Air Ticketing"
              description="Access to the best fares for domestic and international flights. We find the perfect route for you."
            />
            <ServiceCard
              icon={<FaHotel className="text-4xl text-purple-500" />}
              title="Hotel Bookings"
              description="Worldwide hotel reservations, from budget-friendly options to luxury resorts, all at competitive prices."
            />
            <ServiceCard
              icon={<FaKaaba className="text-4xl text-yellow-600" />}
              title="Hajj & Umrah Services"
              description="Complete, trusted Hajj and Umrah packages from Pakistan, including visas, flights, and accommodation."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* 4. Mission & Vision Section */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
        >
          {/* Mission */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-8 bg-gray-50 rounded-lg shadow-lg h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <FaBullseye className="text-5xl text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              At O.S Travel & Tours, our mission is to provide exceptional
              travel experiences. We are committed to delivering the highest
              level of service and ensuring every aspect of your trip is
              cared for.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are dedicated to promoting responsible and sustainable tourism
              practices that protect and preserve the planet’s natural and
              cultural resources.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-8 bg-gray-50 rounded-lg shadow-lg h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <FaEye className="text-5xl text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our vision is to become the leading provider of exceptional
              travel experiences, setting the industry standard for
              personalized service, responsible tourism, and innovative
              travel solutions.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are committed to exceeding expectations while upholding our
              values of integrity, professionalism, and social
              responsibility.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. More About Us (Visa Services) */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 md:py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Expert Visa Consultants, Worldwide
            </h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              We understand the visa application process can be complex. That’s
              why our expert visa consultants offer services for destinations
              all over the world, making the process stress-free.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our experienced team is here to assist you every step of the
              way, from guidance on requirements, to helping you fill out
              forms, and preparing all supporting documents.
            </p>
            <div className="p-6 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg">
              <div className="flex items-center gap-3">
                <FaStar className="text-yellow-600 text-2xl" />
                <h3 className="font-bold text-gray-800">
                  Top-Rated Visa Agent in Islamabad
                </h3>
              </div>
              <p className="text-gray-700 mt-2">
                O.S Travel & Tours is the best and top travel agent for visa
                services in Islamabad, Pakistan. We offer expert processing for
                Schengen visas, UK visas, USA visas, and more, even if you
                are not located in Islamabad.
              </p>
            </div>
          </div>

          {/* Flag Grid */}
          <motion.div
            variants={gridContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h4 className="text-xl font-semibold text-center text-gray-800 mb-6">
              We Process Visas For Destinations Including:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {countries.map((country) => (
                <FlagCard
                  key={country.code}
                  country={country.name}
                  code={country.code}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 6. Authorized Dropbox Services Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 md:py-24 px-6 bg-gray-800 text-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Authorized Dropbox Services
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              We are proud to be an official authorized dropbox partner for visa
              applications to premier destinations. This exclusive service simplifies
              the submission process, offering you unparalleled convenience and peace
              of mind.
            </p>
          </div>
          
          <motion.div
            variants={gridContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {dropboxCountries.map((country) => (
              <FlagCard
                key={country.code}
                country={country.name}
                code={country.code}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 7. NEW: FAQ Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 md:py-24 px-6 bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Your questions, answered. Here is what you need to know about
              working with the best travel agents in Pakistan.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* 8. "Floating" Reviews Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 md:py-24 px-6 bg-gray-100"
      >
        <div className="text-center max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            What Our Clients Say
          </h2>

          <motion.div
            variants={gridContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {reviews.map((review) => (
              <ReviewCard
                key={review.name}
                name={review.name}
                quote={review.quote}
                rating={review.rating}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 9. Our Location Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full py-16 md:py-24 px-6 bg-gray-50"
      >
        <div className="text-center max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Visit Us in Islamabad, Pakistan
          </h2>
          <div className="w-full overflow-hidden rounded-xl shadow-2xl border-4 border-white">
            <iframe
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=O.S%20Travel%20&%20Tours%2C%20Islamabad%2C%20Pakistan&t=&z=15&ieUTF8&iwloc=&output=embed"
              title="O.S Travel & Tours Location Map"
            ></iframe>
          </div>
        </div>
      </motion.section>

      {/* 10. Closing Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 px-6 text-center max-w-3xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Let's Plan Your Next Adventure
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for considering O.S Travel & Tours. As the most trusted
          travel agents in Islamabad, we look forward to helping you create
          unforgettable travel experiences!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg px-10 py-3 transition-colors"
        >
          Contact Us Today
        </motion.button>
      </motion.section>
    </div>
  );
}

export default About;