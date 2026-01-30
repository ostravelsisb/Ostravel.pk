export const chatbotKB = [
    // --- GENERAL & CONTACT ---
    {
        keywords: ["hello", "hi", "hey", "salam", "assalam", "start", "menu"],
        answer: "Assalamu Alaikum! Welcome to O.S. Travel & Tours. I can help you with:\n\n1. Hajj & Umrah Packages\n2. Tourist Visas (Turkey, Malaysia, Schengen, UK, USA)\n3. File Processing & Appointments\n\nWhat are you looking for today?",
        replies: ["Hajj & Umrah", "Visas", "Contact Agent"]
    },
    {
        keywords: ["contact", "call", "phone", "number", "email", "address", "location", "office"],
        type: "contact",
        answer: {
            title: "Contact Us",
            office: "Office # 3, Aaly Plaza, Fazal-e-Haq Road, Block E G 6/2 Blue Area, Islamabad, 44000.",
            phone: "051-2120700-701",
            whatsapp: "0333-5542877",
            email: "info@ostravels.com",
            hours: "Mon-Sat, 10:00 AM - 7:00 PM"
        },
        replies: ["Call Now", "WhatsApp Us", "Back to Menu"]
    },

    // --- HAJJ & UMRAH ---
    {
        keywords: ["hajj", "haji"],
        answer: "We offer premium and economy Hajj packages. Our services include:\n- Hajj Visa Processing\n- 5-Star & Economy Hotel options in Makkah & Madinah\n- Complete Transport\n- Ziarat\n\nFor the latest Hajj 2025 rates, please contact our Hajj department directly.",
        replies: ["Umrah Packages", "Contact for Hajj"]
    },
    {
        keywords: ["umrah", "umra"],
        answer: "Our Umrah services are customizable! You can now **build your own package** on our website.\n\nServices:\n- Umrah Visa\n- Hotels (Makkah & Madinah)\n- Transport (Car/Bus)\n- Return Flights\n\nDo you want to create a custom package inquiry now?",
        replies: ["Create Custom Package", "View Pre-made Packages"]
    },

    // --- VISAS: ASIA ---
    // --- VISAS: ASIA ---
    {
        keywords: ["turkey", "turkish"],
        type: "visa",
        answer: {
            country: "Turkey",
            flag: "🇹🇷",
            title: "Turkey Tourist Visa",
            image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop",
            details: [
                "Valid US/UK/Schengen Visa holders can get E-Visa.",
                "Sticker Visa requires personal appearance.",
                "Bank Statement (Last 6 Months)."
            ],
            processing: "2-3 Weeks (Sticker)",
            price: "Contact for Quote"
        },
        replies: ["Apply for Turkey", "Other Visas"]
    },
    {
        keywords: ["malaysia", "malay"],
        type: "visa",
        answer: {
            country: "Malaysia",
            flag: "🇲🇾",
            title: "Malaysia Visit Visa",
            image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2070&auto=format&fit=crop",
            details: [
                "E-Visa & Sticker Visa Available.",
                "White Background Photo.",
                "Ticket Booking & Hotel Reservation."
            ],
            processing: "5-7 Working Days",
            price: "Contact for Quote"
        },
        replies: ["Apply for Malaysia", "Other Visas"]
    },
    {
        keywords: ["thailand", "thai"],
        type: "visa",
        answer: {
            country: "Thailand",
            flag: "🇹🇭",
            title: "Thailand Tourist Visa",
            image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2039&auto=format&fit=crop",
            details: [
                "Passport & CNIC.",
                "Account Maintenance Certificate.",
                "Confirmed Airline Ticket."
            ],
            processing: "10-12 Working Days",
            price: "Contact for Quote"
        },
        replies: ["Contact Agent", "Other Visas"]
    },
    {
        keywords: ["dubai", "uae", "emirates"],
        type: "visa",
        answer: {
            country: "UAE",
            flag: "🇦🇪",
            title: "Dubai Tourist Visa",
            image: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=2009&auto=format&fit=crop",
            details: [
                "30 Days / 60 Days Options.",
                "Scanning Passport Copy.",
                "White Background Photo.",
                "High Success Rate."
            ],
            processing: "1-3 Working Days",
            price: "Contact for Quote"
        },
        replies: ["Apply Now", "Other Visas"]
    },
    {
        keywords: ["azerbaijan", "baku"],
        type: "visa",
        answer: {
            country: "Azerbaijan",
            flag: "🇦🇿",
            title: "Baku E-Visa",
            image: "https://images.unsplash.com/photo-1629815598150-1634b3353443?q=80&w=2070&auto=format&fit=crop",
            details: [
                "Standard & Urgent Options.",
                "Scanned Passport Only.",
                "Easy Entry for Pakistanis."
            ],
            processing: "3-4 Days (Urgent: 4 Hours)",
            price: "Contact for Quote"
        },
        replies: ["Apply Now", "Other Visas"]
    },

    // --- VISAS: EUROPE / SCHENGEN ---
    // --- VISAS: EUROPE / SCHENGEN ---
    {
        keywords: ["schengen", "europe", "germany", "france", "italy", "spain", "netherland", "switzerland"],
        type: "visa",
        answer: {
            country: "Schengen",
            flag: "🇪🇺",
            title: "Schengen Visa Support",
            image: "https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=2020&auto=format&fit=crop",
            details: [
                "Appointment Booking Assistance.",
                "Strong Bank Statement (6 Months).",
                "Tax Returns (FBR) & NTN.",
                "Confirmed Hotel & Flight."
            ],
            processing: "Varies by Embassy",
            price: "Consultancy Fee Applies"
        },
        replies: ["Book Appointment", "Contact Consultant"]
    },
    {
        keywords: ["uk", "united kingdom", "london", "england"],
        type: "visa",
        answer: {
            country: "United Kingdom",
            flag: "🇬🇧",
            title: "UK Standard Visitor Visa",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
            details: [
                "6 Months Standard Visitor Visa.",
                "Bank Statement with Good Closing.",
                "Property/Asset Documents.",
                "Family Registration Cert (FRC)."
            ],
            processing: "15 Working Days (Standard)",
            price: "Contact for Quote"
        },
        replies: ["Start UK Process", "Contact Consultant"]
    },

    // --- VISAS: NORTH AMERICA ---
    {
        keywords: ["usa", "america", "us visa", "united states"],
        type: "visa",
        answer: {
            country: "USA",
            flag: "🇺🇸",
            title: "USA B1/B2 Visa",
            image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2000&auto=format&fit=crop",
            details: [
                "Form DS-160 Filing.",
                "Interview Appointment Scheduling.",
                "Interview Preparation.",
                "Wait times can be long."
            ],
            processing: "Interview Dependent",
            price: "Consultancy Fee Applies"
        },
        replies: ["Book Appointment", "Contact Consultant"]
    },
    {
        keywords: ["canada", "canadian"],
        type: "visa",
        answer: {
            country: "Canada",
            flag: "🇨🇦",
            title: "Canada Visit Visa",
            image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2011&auto=format&fit=crop",
            details: [
                "Online Submission (GCKey).",
                "Travel History Preferred.",
                "Strong Financial Ties Required.",
                "Property/Business Docs."
            ],
            processing: "30-60+ Days",
            price: "Contact for Quote"
        },
        replies: ["Start Canada Process", "Contact Consultant"]
    },

    // --- RESTRICTED ---
    {
        keywords: ["work", "job", "employment", "study", "student", "scholarship", "immigration", "pr", "residence"],
        answer: "POLICY ALERT: 🚫\n\n**We ONLY deal with Tourist, Visit, and Umrah visas.**\n\nWe do **NOT** provide Work Visas, Student Visas, or Immigration services. Please do not pay anyone claiming to offer these through us.",
        replies: ["View Tourist Visas", "Contact for Visit"]
    }
];
