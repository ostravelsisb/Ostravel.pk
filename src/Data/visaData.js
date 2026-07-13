// Visa data for Asian countries with multiple visa types and urgent processing options

export const visaCountriesData = {
    thailand: {
        country: "Thailand",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 15000,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "3 Months",
                stayDuration: "60 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 7000,
        allowUrgent: true
    },

    malaysia: {
        country: "Malaysia",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 18000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "3 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 8000,
        allowUrgent: true
    },

    singapore: {
        country: "Singapore",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 25000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "2 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 10000,
        allowUrgent: true
    },

    china: {
        country: "China",
        visaTypes: [
            {
                type: "Tourist Visa (Single Entry)",
                fee: 13200,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "3 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            },
            {
                type: "Tourist Visa (Double Entry)",
                fee: 13200,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "6 Months",
                stayDuration: "30 Days per Entry",
                category: "Double Entry"
            }
        ],
        urgentFee: 8000,
        allowUrgent: true
    },

    japan: {
        country: "Japan",
        visaTypes: [
            {
                type: "Tourist Visa",
                fee: 1,
                processingTime: "10-15 Working Days",
                urgentProcessingTime: "5-7 Working Days",
                validity: "3 Months",
                stayDuration: "15-30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 12000,
        allowUrgent: true
    },

    "south-korea": {
        country: "South Korea",
        visaTypes: [
            {
                type: "Tourist Visa",
                fee: 28000,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "3 Months",
                stayDuration: "90 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 10000,
        allowUrgent: true
    },

    indonesia: {
        country: "Indonesia",
        visaTypes: [
            {
                type: "Sticker Visa",
                fee: 35000,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "90 Days",
                stayDuration: "60 Days",
                category: "Single Entry"
            },
            {
                type: "E-Visa",
                fee: 28000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "90 Days",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 8000,
        allowUrgent: true
    },

    philippines: {
        country: "Philippines",
        visaTypes: [
            {
                type: "Tourist Visa",
                fee: 16000,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "3 Months",
                stayDuration: "59 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 7000,
        allowUrgent: true
    },

    vietnam: {
        country: "Vietnam",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 14000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "90 Days",
                stayDuration: "90 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 6000,
        allowUrgent: true
    },

    cambodia: {
        country: "Cambodia",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 14000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "3 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 6000,
        allowUrgent: true
    },

    nepal: {
        country: "Nepal",
        visaTypes: [
            {
                type: "Tourist Visa",
                fee: 12000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "6 Months",
                stayDuration: "30 Days",
                category: "Multiple Entry"
            }
        ],
        urgentFee: 5000,
        allowUrgent: true
    },

    "sri-lanka": {
        country: "Sri Lanka",
        visaTypes: [
            {
                type: "ETA (Electronic Travel Authorization)",
                fee: 16000,
                processingTime: "3-5 Working Days",
                urgentProcessingTime: "1-2 Working Days",
                validity: "6 Months",
                stayDuration: "30 Days",
                category: "Double Entry"
            }
        ],
        urgentFee: 7000,
        allowUrgent: true
    },

    maldives: {
        country: "Maldives",
        visaTypes: [
            {
                type: "Visa on Arrival (Pre-arranged)",
                fee: 18000,
                processingTime: "3-5 Working Days",
                urgentProcessingTime: "1-2 Working Days",
                validity: "3 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 8000,
        allowUrgent: true
    },

    uae: {
        country: "UAE",
        visaTypes: [
            {
                type: "30-Day Tourist Visa",
                fee: 32000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "2 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            },
            {
                type: "90-Day Tourist Visa",
                fee: 48000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "2 Months",
                stayDuration: "90 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 12000,
        allowUrgent: true
    },

    qatar: {
        country: "Qatar",
        visaTypes: [
            {
                type: "Tourist Visa",
                fee: 28000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "1 Month",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 10000,
        allowUrgent: true
    },

    bahrain: {
        country: "Bahrain",
        visaTypes: [
            {
                type: "14-Day Visit E-Visa",
                fee: 22000,
                processingTime: "3-7 Working Days",
                urgentProcessingTime: "1-2 Working Days",
                validity: "3 Months",
                stayDuration: "14 Days",
                category: "Single Entry"
            },
            {
                type: "1-Month Visit E-Visa",
                fee: 35000,
                processingTime: "3-7 Working Days",
                urgentProcessingTime: "1-2 Working Days",
                validity: "3 Months",
                stayDuration: "1 Month",
                category: "Multiple Entry"
            },
            {
                type: "1-Year Visit E-Visa",
                fee: 55000,
                processingTime: "3-7 Working Days",
                urgentProcessingTime: "1-2 Working Days",
                validity: "1 Year",
                stayDuration: "3 Months per Visit",
                category: "Multiple Entry"
            }
        ],
        urgentFee: 10000,
        allowUrgent: true
    },

    azerbaijan: {
        country: "Azerbaijan",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 20000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "90 Days",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 8000,
        allowUrgent: true
    },

    kazakhstan: {
        country: "Kazakhstan",
        visaTypes: [
            {
                type: "Tourist Visa",
                fee: 45000,
                processingTime: "7-10 Working Days",
                urgentProcessingTime: "3-5 Working Days",
                validity: "3 Months",
                stayDuration: "30 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 15000,
        allowUrgent: true
    },

    tajikistan: {
        country: "Tajikistan",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 18000,
                processingTime: "5-7 Working Days",
                urgentProcessingTime: "2-3 Working Days",
                validity: "90 Days",
                stayDuration: "45 Days",
                category: "Single Entry"
            }
        ],
        urgentFee: 7000,
        allowUrgent: true
    },

    turkey: {
        country: "Turkey",
        visaTypes: [
            {
                type: "E-Visa",
                fee: 22000,
                processingTime: "3-5 Working Days",
                urgentProcessingTime: "1-2 Working Days",
                validity: "6 Months",
                stayDuration: "90 Days",
                category: "Multiple Entry"
            }
        ],
        urgentFee: 8000,
        allowUrgent: true
    }
};

// Helper function to get visa data by country key
export const getVisaDataByCountry = (countryKey) => {
    return visaCountriesData[countryKey] || null;
};

// Helper function to get all country names for dropdown
export const getAllCountryNames = () => {
    return Object.values(visaCountriesData).map(data => ({
        key: Object.keys(visaCountriesData).find(key => visaCountriesData[key] === data),
        name: data.country
    }));
};

// Helper function to calculate total fee
export const calculateTotalFee = (countryKey, visaTypeIndex, isUrgent) => {
    const countryData = getVisaDataByCountry(countryKey);
    if (!countryData) return 0;

    const visaType = countryData.visaTypes[visaTypeIndex];
    if (!visaType) return 0;

    const baseFee = visaType.fee;
    const urgentFee = (isUrgent && countryData.allowUrgent) ? countryData.urgentFee : 0;

    return baseFee + urgentFee;
};
