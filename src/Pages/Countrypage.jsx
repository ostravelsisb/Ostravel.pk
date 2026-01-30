import { useParams ,Link} from "react-router-dom";
import { motion } from 'framer-motion';
import { FaGlobeAmericas, FaSearchMinus } from 'react-icons/fa';
// import all country components here
import Australia from "../Countries/Australia";
import Austria from "../Countries/Austria";
import Azerbaijan from "../Countries/Azerbaijan";
import Bahrain from "../Countries/Bahrain";
import Beligum from "../Countries/Belgium";
import Bulgaria from "../Countries/Bulgaria";
import Canada from "../Countries/Canada";
import China from "../Countries/China";
import Combodia from "../Countries/Combodia";
import CzecgRepublic from "../Countries/CzecgRepublic";
import Denmark from "../Countries/Denmark";
import Egypt from "../Countries/Egypt";
import Estonia from "../Countries/Estonia";
import Finland from "../Countries/Finland";
import France from "../Countries/France";
import Germany from "../Countries/Germany";
import Greece from "../Countries/Greece";
import Hungary from "../Countries/Hungary";
import Indonesia from "../Countries/Indonesia";
import Ireland from "../Countries/Ireland";
import Italy from "../Countries/Italy";
import Japan from "../Countries/Japan";
import Kazakhstan from "../Countries/Kazakhstan";
import Kenya from "../Countries/Kenya";
import Lithuania from "../Countries/Lithuania";
import Spain from "../Countries/Spain";
import UK from "../Countries/UK";
import USA from "../Countries/USA";
import Uganda from "../Countries/Uganda";
import Malasiya from "../Countries/Malasiya";
import Philippines from "../Countries/Philippines";
import Qatar from "../Countries/Qatar";
import Maldvies from "../Countries/Maldives";
import Nepal from "../Countries/Nepal";
import Vitnam from "../Countries/Vitenam";
import Thailand from "../Countries/Thailand";
import Srilanka from "../Countries/Srilanka";
import Turkey from "../Countries/Turkey";
import Tajkistan from "../Countries/Tajikistan";
import Poland from "../Countries/Poland";
import SothKorea from "../Countries/SouthKorea";
import Singapore from "../Countries/Singapore";
import Pakistan from "../Countries/Pakistan";
import UAE from "../Countries/UAE";
import Romania from "../Countries/Romania";
import Portugal from "../Countries/Portugal";
import Switzerland from "../Countries/Switzerland";
import Norway from "../Countries/Norway";
import Netherlands from "../Countries/Netherlands";
import CzechRepublic from "../Countries/CzecgRepublic";
import Ethopia from "../Countries/Ethopia";
import SouthAfrica from "../Countries/SouthAfrica";
import Zambia from "../Countries/Zambia";
import Moroco from "../Countries/Moroco";


const countryPages = {
  // --- Sorted Alphabetically ---
  australia: Australia,
  morocco: Moroco,
  austria: Austria,
  azerbaijan: Azerbaijan,
  bahrain: Bahrain,
  belgium: Beligum, // NOTE: Removed duplicate 'beligum: Beligum' entry
  bulgaria: Bulgaria,
  cambodia: Combodia, // FIXED: Combodia -> Cambodia
  canada: Canada,
  china: China,
  czechrepublic: CzechRepublic, // FIXED: CzecgRepublic -> CzechRepublic
  denmark: Denmark,
  egypt: Egypt,
  estonia: Estonia,
  ethiopia: Ethopia, // FIXED: Ethopia -> Ethiopia
  finland: Finland,
  france: France,
  germany: Germany,
  greece: Greece,
  hungary: Hungary,
  indonesia: Indonesia,
  ireland: Ireland,
  italy: Italy,
  japan: Japan,
  kazakhstan: Kazakhstan,
  kenya: Kenya,
  lithuania: Lithuania,
  malaysia: Malasiya, // FIXED: Malasiya -> Malaysia
  maldives: Maldvies, // FIXED: Maldvies -> Maldives
  nepal: Nepal,
  netherlands: Netherlands,
  norway: Norway,
  pakistan: Pakistan,
  philippines: Philippines,
  poland: Poland,
  portugal: Portugal,
  qatar: Qatar,
  romania: Romania,
  singapore: Singapore, // NOTE: This was not in the original list
  "south-africa": SouthAfrica, // NOTE: Removed duplicate 'southafrica: SouthAfrica' entry
  "south-korea": SothKorea, // FIXED: SothKorea -> SouthKorea
  spain: Spain,
  "sri-lanka": Srilanka, // FIXED: Srilanka -> SriLanka
  switzerland: Switzerland,
  tajikistan: Tajkistan, // FIXED: Tajkistan -> Tajikistan
  thailand: Thailand,
  turkey: Turkey,
  "uae": UAE, // NOTE: This was not in the original list
  uganda: Uganda,
  "united-kingdom": UK,
  "united-states": USA,
  vietnam: Vitnam, // FIXED: Vitnam -> Vietnam
  zambia: Zambia,
};
export default function CountryPage() {
  const { country } = useParams();

  // Normalize the country parameter to match keys in countryPages
  // Replaces spaces with hyphens, handles URL encoded spaces (%20)
  const key = country.toLowerCase().replace(/%20/g, "-").replace(/\s+/g, "-");

  const PageComponent = countryPages[key];

  // Framer Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!PageComponent) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-blue-500 text-6xl mb-4">
          <FaSearchMinus /> {/* "Not Found" icon */}
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl font-extrabold text-gray-800 mb-4 text-center">
          Oops! Country Not Found
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-6 text-center max-w-xl">
          We couldn't find a page for "
          <span className="font-semibold text-gray-800 capitalize">
            {country.replace(/%20/g, " ").replace(/-/g, " ")}
          </span>
          ".
          <br />
          It looks like the country you're looking for might not be in our database or there was a typo in the URL.
        </motion.p>

        <motion.p variants={itemVariants} className="text-lg text-gray-500 mb-8 text-center max-w-xl">
          Please double-check the spelling or try searching for another destination.
          If you believe this is an error, feel free to contact our support team!
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link
            to="/"
            className="flex items-center px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md
                       hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <FaGlobeAmericas className="mr-3" /> Go to Homepage
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return <PageComponent />;
}