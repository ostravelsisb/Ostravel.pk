import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function useCurrency() {
    return useContext(CurrencyContext);
}

const EXCHANGE_RATES = {
    PKR: 1,
    USD: 0.0036, // 1 PKR = 0.0036 USD (Approx 1 USD = 277 PKR)
    EUR: 0.0033, // 1 PKR = 0.0033 EUR
    GBP: 0.0028, // 1 PKR = 0.0028 GBP
    AED: 0.013,  // 1 PKR = 0.013 AED
    SAR: 0.0135  // 1 PKR = 0.0135 SAR
};

const SYMBOLS = {
    PKR: "PKR",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED",
    SAR: "SAR"
};

export function CurrencyProvider({ children }) {
    // Try to load from local storage or default to PKR
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('appCurrency') || 'PKR';
    });

    useEffect(() => {
        localStorage.setItem('appCurrency', currency);
    }, [currency]);

    // Helper to convert price
    const convertPrice = (priceInPKR) => {
        if (!priceInPKR || isNaN(priceInPKR)) return "---";
        const rate = EXCHANGE_RATES[currency] || 1;
        const converted = priceInPKR * rate;

        // Formatting: 
        // PKR: No decimals usually needed for large numbers, but we'll stick to standard locale
        // Others: 2 decimals usually
        const formattedNumber = converted.toLocaleString(undefined, {
            minimumFractionDigits: currency === 'PKR' ? 0 : 2,
            maximumFractionDigits: 2
        });

        return `${SYMBOLS[currency]} ${formattedNumber}`;
    };

    const value = {
        currency,
        setCurrency,
        convertPrice,
        currencies: Object.keys(EXCHANGE_RATES)
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}
