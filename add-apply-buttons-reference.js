// Script to add Apply Now button to Asian country pages
// This will be used to update all Asian country pages

const asianCountries = [
    { file: 'Malasiya.jsx', key: 'malaysia', name: 'Malaysia' },
    { file: 'Singapore.jsx', key: 'singapore', name: 'Singapore' },
    { file: 'China.jsx', key: 'china', name: 'China' },
    { file: 'Japan.jsx', key: 'japan', name: 'Japan' },
    { file: 'SouthKorea.jsx', key: 'south-korea', name: 'South Korea' },
    { file: 'Indonesia.jsx', key: 'indonesia', name: 'Indonesia' },
    { file: 'Philippines.jsx', key: 'philippines', name: 'Philippines' },
    { file: 'Vitenam.jsx', key: 'vietnam', name: 'Vietnam' },
    { file: 'Combodia.jsx', key: 'cambodia', name: 'Cambodia' },
    { file: 'Nepal.jsx', key: 'nepal', name: 'Nepal' },
    { file: 'Srilanka.jsx', key: 'sri-lanka', name: 'Sri Lanka' },
    { file: 'Maldives.jsx', key: 'maldives', name: 'Maldives' },
    { file: 'UAE.jsx', key: 'uae', name: 'UAE' },
    { file: 'Qatar.jsx', key: 'qatar', name: 'Qatar' },
    { file: 'Bahrain.jsx', key: 'bahrain', name: 'Bahrain' },
    { file: 'Azerbaijan.jsx', key: 'azerbaijan', name: 'Azerbaijan' },
    { file: 'Kazakhstan.jsx', key: 'kazakhstan', name: 'Kazakhstan' },
    { file: 'Tajikistan.jsx', key: 'tajikistan', name: 'Tajikistan' },
    { file: 'Turkey.jsx', key: 'turkey', name: 'Turkey' }
];

// The button code to add before the footer note
const getButtonCode = (countryKey, countryName) => `
      {/* Apply Now Button */}
      <motion.div
        variants={itemVariants}
        className="mt-12 text-center"
      >
        <button
          onClick={() => {
            // Store the selected country in sessionStorage
            sessionStorage.setItem('selected_visa_country', '${countryKey}');
            window.location.href = '/apply-visa';
          }}
          className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
        >
          <FaPassport className="text-2xl" />
          Apply for ${countryName} Visa Now
          <span className="text-2xl">→</span>
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Complete your application in minutes
        </p>
      </motion.div>
`;

console.log('Asian Countries to Update:');
asianCountries.forEach(country => {
    console.log(`- ${country.name} (${country.file}) - key: ${country.key}`);
});
