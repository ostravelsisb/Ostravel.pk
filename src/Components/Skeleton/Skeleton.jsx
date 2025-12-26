import React from 'react';

// Reusable Primitive Skeleton Component
const Skeleton = ({ className = "", variant = "rect", height, width }) => {
    const baseClasses = "animate-pulse bg-gray-200 rounded-md";

    // Specific shape variants
    const variants = {
        rect: "",
        circle: "rounded-full",
        text: "h-4 w-3/4 rounded-sm"
    };

    const style = {};
    if (height) style.height = height;
    if (width) style.width = width;

    return (
        <div
            className={`${baseClasses} ${variants[variant] || ""} ${className}`}
            style={style}
        ></div>
    );
};

export default Skeleton;
