// Batch processing script for moving Apply Now buttons
// Remaining countries: Japan, South Korea, Indonesia, Philippines, Vietnam, Cambodia, Nepal, 
// Sri Lanka, Maldives, UAE, Qatar, Bahrain, Azerbaijan, Kazakhstan, Tajikistan, Turkey

// Pattern for each country:
// 1. Find header end (after </motion.div> following the header)
// 2. Insert Apply Now button with mt-8
// 3. Find and remove Apply Now button from bottom (before Footer Note)

// Completed: Thailand, Malaysia, Singapore, China (4/19)
// Remaining: 15 countries

const remaining = [
    'Japan', 'SouthKorea', 'Indonesia', 'Philippines', 'Vietnam',
    'Cambodia', 'Nepal', 'SriLanka', 'Maldives', 'UAE',
    'Qatar', 'Bahrain', 'Azerbaijan', 'Kazakhstan', 'Tajikistan', 'Turkey'
];

console.log(`Remaining countries to update: ${remaining.length}`);
