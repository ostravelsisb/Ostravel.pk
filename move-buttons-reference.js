// Script to move Apply Now buttons from bottom to top for all Asian countries
// This lists the pattern for each country

const countries = [
    { file: 'Malasiya.jsx', key: 'malaysia', name: 'Malaysia', headerEnd: 120, buttonStart: 219, buttonEnd: 240 },
    { file: 'Singapore.jsx', key: 'singapore', name: 'Singapore', headerEnd: 145, buttonStart: 249, buttonEnd: 270 },
    { file: 'China.jsx', key: 'china', name: 'China', headerEnd: 148, buttonStart: 278, buttonEnd: 299 },
    { file: 'Japan.jsx', key: 'japan', name: 'Japan', headerEnd: 141, buttonStart: 224, buttonEnd: 245 },
    { file: 'SouthKorea.jsx', key: 'south-korea', name: 'South Korea', headerEnd: 138, buttonStart: 243, buttonEnd: 264 },
    { file: 'Indonesia.jsx', key: 'indonesia', name: 'Indonesia', headerEnd: 144, buttonStart: 246, buttonEnd: 267 },
    { file: 'Philippines.jsx', key: 'philippines', name: 'Philippines', headerEnd: 148, buttonStart: 274, buttonEnd: 295 },
    { file: 'Vitenam.jsx', key: 'vietnam', name: 'Vietnam', headerEnd: 143, buttonStart: 247, buttonEnd: 268 },
    { file: 'Combodia.jsx', key: 'cambodia', name: 'Cambodia', headerEnd: 119, buttonStart: 224, buttonEnd: 245 },
    { file: 'Nepal.jsx', key: 'nepal', name: 'Nepal', headerEnd: 121, buttonStart: 224, buttonEnd: 245 },
    { file: 'Srilanka.jsx', key: 'sri-lanka', name: 'Sri Lanka', headerEnd: 120, buttonStart: 222, buttonEnd: 243 },
    { file: 'Maldives.jsx', key: 'maldives', name: 'Maldives', headerEnd: 120, buttonStart: 225, buttonEnd: 246 },
    { file: 'UAE.jsx', key: 'uae', name: 'UAE', headerEnd: 120, buttonStart: 228, buttonEnd: 249 },
    { file: 'Qatar.jsx', key: 'qatar', name: 'Qatar', headerEnd: 120, buttonStart: 243, buttonEnd: 264 },
    { file: 'Bahrain.jsx', key: 'bahrain', name: 'Bahrain', headerEnd: 120, buttonStart: 245, buttonEnd: 266 },
    { file: 'Azerbaijan.jsx', key: 'azerbaijan', name: 'Azerbaijan', headerEnd: 120, buttonStart: 220, buttonEnd: 241 },
    { file: 'Kazakhstan.jsx', key: 'kazakhstan', name: 'Kazakhstan', headerEnd: 120, buttonStart: 225, buttonEnd: 246 },
    { file: 'Tajikistan.jsx', key: 'tajikistan', name: 'Tajikistan', headerEnd: 120, buttonStart: 246, buttonEnd: 267 },
    { file: 'Turkey.jsx', key: 'turkey', name: 'Turkey', headerEnd: 120, buttonStart: 249, buttonEnd: 270 }
];

console.log('Countries to update:', countries.length);
