import React, { useState, useEffect } from 'react';
import {
  FaPlane,
  FaFileAlt,
  FaHotel,
  FaMoon,
  FaMap,
  FaCar,
  FaBriefcase,
  FaGlobe,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';

// --- SEO Data & Content ---

const COMPANY_NAME = "OS Travels & Tours ISB";

const SERVICES = [
  {
    title: "Flight Booking Services",
    id: "flights",
    icon: <FaPlane className="w-8 h-8 text-blue-600" />,
    shortDesc: "Domestic & International Flights",
    description: "OS Travels & Tours ISB provides hassle-free flight booking services, offering competitive rates on domestic and international flights. With a user-friendly online booking system and a dedicated team of travel experts, we ensure the flight booking process is smooth and straightforward.",
    details: "Using advanced technology and partnerships with major airlines, we ensure customers get the best deals and the most convenient flight schedules. Our sophisticated booking platform integrates real-time data to find the most affordable fares. Whether flying from Islamabad to London, Dubai, or Karachi, our network enables access to budget-friendly options and premium experiences. We also offer exclusive deals, extra baggage allowances, and seat upgrades."
  },
  {
    title: "Visa Assistance & Consultancy",
    id: "visa",
    icon: <FaFileAlt className="w-8 h-8 text-green-600" />,
    shortDesc: "Expert Visa Processing",
    description: "Navigating visa complexities can be daunting. OS Travels & Tours ISB simplifies this process by offering professional visa assistance services, ensuring every step of the application is handled with precision.",
    details: "We provide accurate, up-to-date information on visa requirements for the USA, UK, Canada, Schenegen, and Middle East. Our services include detailed guidance on tourist, business, and student visas. We assist with documentation, appointment scheduling, and interview preparation to ensure you proceed confidently. Our support team is available to address time-sensitive visa issues."
  },
  {
    title: "Hotel Reservations",
    id: "hotels",
    icon: <FaHotel className="w-8 h-8 text-purple-600" />,
    shortDesc: "Luxury & Budget Accommodations",
    description: "Finding the right accommodation is crucial. We offer extensive hotel reservation services designed to meet diverse needs, securing the best rates and prime locations globally.",
    details: "From luxury resorts to budget-friendly lodgings, our global network ensures you find the perfect stay. We partner with renowned hotel chains and independent establishments to offer options near city centers, airports, or tourist attractions. Enjoy seamless booking with instant confirmations."
  },
  {
    title: "Umrah and Hajj Packages 2025",
    id: "umrah",
    icon: <FaMoon className="w-8 h-8 text-amber-500" />,
    shortDesc: "Spiritual Pilgrimage Services",
    description: "For the sacred journeys of Umrah and Hajj, OS Travels & Tours offers specialized packages meticulously designed to ensure a smooth and enriching pilgrimage experience.",
    details: "Our comprehensive packages include return flights, visa processing, accommodation in Makkah and Madinah (near Haram), guided Ziarat tours, and transport. We handle the logistical complexities so pilgrims can focus fully on their spiritual obligations. Options range from Economy to 5-Star VIP packages."
  },
  {
    title: "Customized Tour Packages",
    id: "tours",
    icon: <FaMap className="w-8 h-8 text-red-500" />,
    shortDesc: "Tailored Holiday Experiences",
    description: "We excel in creating customized tour packages tailored to individual preferences. Whether you seek adventure, relaxation, or culture, we ensure a unique memorable experience.",
    details: "From honeymoons in Maldives to trekking in Northern Pakistan, our personalized itineraries cater to your specific interests. We handle all logistics including transfers, guides, and activity bookings."
  },
  {
    title: "Car Rentals",
    id: "cars",
    icon: <FaCar className="w-8 h-8 text-indigo-500" />,
    description: "For travelers preferring flexibility, we offer reliable car rental services with a range of vehicles coupled with competitive rates.",
    details: "Choose from compact cars for city driving, spacious SUVs for family trips to Northern Areas, or luxury sedans for business. We offer transparent pricing with no hidden fees, ensuring safe and comfortable self-driven or chauffeur-driven travel."
  },
  {
    title: "Corporate Travel Management",
    id: "corporate",
    icon: <FaBriefcase className="w-8 h-8 text-slate-600" />,
    description: "Specialized corporate services including flight/hotel bookings, itinerary management, and 24/7 support for efficient business trips.",
    details: "We provide tailored solutions for corporate clients, managing travel policies and expenses to allow businesses to focus on their objectives while we handle the logistics."
  },
  {
    title: "World & Pakistan Tours",
    id: "world",
    icon: <FaGlobe className="w-8 h-8 text-teal-500" />,
    description: "Offering both world tours and specialized Pakistan tours to discover global destinations or hidden gems within the country.",
    details: "Explore the beauty of Hunza, Skardu, and Swat, or travel internationally to Turkey, Malaysia, and Thailand. Our packages are expertly planned to be memorable and enriching."
  },
  {
    title: "Franchise Opportunities",
    id: "franchise",
    icon: <FaUsers className="w-8 h-8 text-orange-600" />,
    description: "Lucrative franchising opportunities for entrepreneurs to leverage our brand recognition and proven business model in the travel industry.",
    details: "Gain access to a trusted brand, extensive network, and a framework for sustainable growth. We support our franchisees with training and operational guidance."
  }
];

// --- UPDATED AIRLINES LIST ---
const AIRLINES = [
  "Kuwait Airways", "Kenya Airways", "Gulf Air", "Fly Dubai", "Cathay Pacific",
  "Etihad Airways", "Pakistan International Airlines", "Saudi Airlines", "Serene Air",
  "SriLankan Airlines", "British Airways", "Oman Air", "Qatar Airways", "KLM Airlines",
  "Lufthansa", "Ryanair", "Singapore Airlines", "Air Asia", "Air Canada",
  "Austrian Airlines", "EasyJet", "Thai Airways", "American Airlines", "Turkish Airlines",
  "Air Malindo", "Air China", "Air Arabia", "AirBlue", "Emirates", "Fly Jinnah", "AirSial"
];

// --- UPDATED HOTELS & KEYWORDS LIST ---
const HOTELS = [
  "Al-Eiman Royal Hotel", "Hotels In Makkah And Madinah", "Shaza Al Madina",
  "Sofaraa Al Huda Hotel Madinah", "Al Kiswah Towers Hotel", "Serena Hotel Faisalabad",
  "Serena Hotel Gilgit", "Serena Hotel Hunza", "Serena Hotel Islamabad",
  "Serena Hotel Khaplu", "Serena Hotel Quetta", "Serena Hotel Shigar Fort",
  "Serena Hotel Swat", "Marriott Hotel Islamabad", "Marriott Hotel Karachi",
  "Dar Al Tawhid", "Makarim Ajyad Hotel", "Intercontinental Dar Al Tawhid",
  "Fairmont Clock Tower Makkah", "Hotels in Makkah Near Haram", "Pullman Zamzam Makkah",
  "Swissotel Makkah", "Movenpick Hajar Tower", "Makkah Millennium Hotel",
  "Hilton Makkah Convention Hotel", "Dar Al Taqwa", "Al Haram Hotel", "Anjum Hotel",
  "Dar Al Hijra Intercontinental Hotel", "Al Marwa Rayhaan By Rotana", "Umrah Hotels",
  "3 Star Hotels in Makkah", "Nearest Hotels in Makkah and Madinah", "Madinah Hilton Hotel",
  "Pullman zamzam Madina", "Intercontinental Madinah Dar Al Iman an IHG Hotel",
  "Closest Hotel to Makkah", "10 Best Hotels in Makkah", "Nearest Hotel in Makkah Haram",
  "Luxury Hotels in Makkah Saudi Arabia", "4 Star Hotels in Makkah Near Haram",
  "3 Star Hotels in Medina", "4 Star Hotels in Medina"
];

// --- Components ---

const ServiceCard = ({ service }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            {service.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
            <p className="text-sm text-gray-500">{service.shortDesc}</p>
          </div>
        </div>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {service.description}
        </p>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <p className="text-gray-600 pt-4 border-t border-gray-100 text-sm bg-gray-50 p-4 rounded-md">
            {service.details}
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm focus:outline-none"
        >
          {isExpanded ? (
            <>Read Less <FaChevronUp className="w-4 h-4" /></>
          ) : (
            <>Read More <FaChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

const RefundPolicySection = () => (
  <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" id="refund-policy">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FaShieldAlt className="w-10 h-10 text-red-600" />
        <h2 className="text-3xl font-bold text-gray-900">Refund & Cancellation Policy</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">

        {/* Medical Insurance Policy */}
        <article>
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaCheckCircle className="w-5 h-5 text-green-500" />
            Medical & Travel Insurance Refund Policy
          </h3>
          <div className="prose text-gray-600 space-y-2">
            <p>
              <strong>Policy Issuance:</strong> Travel insurance policies (Health/Medical) are generally <strong>non-refundable</strong> once the policy certificate has been issued by the provider (e.g., UIC, Adamjee, Jubilee), especially if the coverage start date has passed.
            </p>
            <div>
              <strong>Visa Rejection Cases:</strong> In the event of a visa rejection, a partial refund <em>may</em> be considered subject to the specific terms of the insurance company.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>You must provide a valid <strong>Visa Rejection Letter</strong> from the embassy.</li>
                <li>A standard cancellation fee (typically 35% to 50% of the premium) is deducted by the insurance provider.</li>
                <li>No refund is possible if the policy has already expired or if the travel dates have commenced.</li>
              </ul>
            </div>
            <p className="text-sm italic text-gray-500 mt-2">
              Note: "Free-look" periods are generally not applicable to short-term travel insurance policies in Pakistan once the document is generated for visa filing.
            </p>
          </div>
        </article>

        <div className="border-t border-gray-100"></div>

        {/* Flight Refund Policy */}
        <article>
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaPlane className="w-5 h-5 text-blue-500" />
            Flight Ticket Cancellation & Medical Emergencies
          </h3>
          <div className="prose text-gray-600 space-y-2">
            <div>
              <strong>Standard Cancellation:</strong> Flight ticket refunds are strictly governed by the airline's Fare Rules.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Non-Refundable Tickets:</strong> Hold no cash value if cancelled voluntarily. Taxes <em>may</em> be refundable depending on the airline.</li>
                <li><strong>Refundable Tickets:</strong> Subject to airline penalties + OS Travels service charges.</li>
              </ul>
            </div>
            <div>
              <strong>Medical Emergency Waivers:</strong> If a passenger cannot travel due to a sudden medical emergency (hospitalization or severe illness):
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>A valid <strong>Medical Certificate</strong> from a recognized hospital must be submitted immediately.</li>
                <li>We will forward the request to the airline for a "Medical Waiver." <strong>However, approval is at the sole discretion of the airline</strong> and is not guaranteed.</li>
                <li>If approved, the airline may offer a full refund or a travel voucher for future use.</li>
              </ul>
            </div>
            <p>
              <strong>Processing Time:</strong> Refunds typically take 14–21 working days to process after airline approval.
            </p>
          </div>
        </article>

      </div>
    </div>
  </section>
);

const KeywordCloud = () => (
  <div className="bg-gray-900 text-gray-400 py-16 px-4 text-xs leading-relaxed border-t border-gray-800">
    <div className="max-w-7xl mx-auto">
      <h4 className="text-gray-200 font-bold mb-6 uppercase tracking-wider text-center text-sm">Our Airline Partners & Destinations</h4>

      {/* Airlines Cloud */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center text-center mb-8">
        {AIRLINES.map((airline, i) => (
          <span key={i} className="hover:text-white transition-colors cursor-default">
            {airline} <span className="text-gray-700 ml-2">|</span>
          </span>
        ))}
      </div>

      <div className="my-8 border-t border-gray-800 w-1/2 mx-auto"></div>

      <h4 className="text-gray-200 font-bold mb-6 uppercase tracking-wider text-center text-sm">Top Hotels & Accommodation Keywords</h4>

      {/* Hotels Cloud */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center text-center">
        {HOTELS.map((hotel, i) => (
          <span key={i} className="hover:text-white transition-colors cursor-default">
            {hotel} <span className="text-gray-700 ml-2">|</span>
          </span>
        ))}
      </div>

      <div className="my-8 border-t border-gray-800"></div>

      <p className="text-center max-w-4xl mx-auto opacity-70">
        Cheap Flights Islamabad  Visa Consultant Blue Area • Umrah Packages 2025 • Best Travel Agency Pakistan •
        Travel Insurance Online •  Hajj Services •
        Corporate Travel Management • Air Blue Tickets • Serene Air Booking • PIA Flight Schedule
      </p>
    </div>
  </div>
);

// --- Main App Component ---

const Seopage = () => {
  const [scrolled, setScrolled] = useState(false);

  // SEO: Update document title dynamically
  useEffect(() => {
    document.title = "OS Travels & Tours ISB | Best Travel Agency in Islamabad | Flights, Umrah & Visas";
  }, []);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">



      {/* Services Grid */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Premium Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            OS Travels & Tours ISB offers a comprehensive suite of travel solutions tailored to make every journey memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </section>

      {/* Refund Policy Section */}
      <RefundPolicySection />

      {/* SEO Keyword Cloud */}
      <KeywordCloud />

    </div>

  );
};

export default Seopage;