import React from 'react';
import Skeleton from './Skeleton';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4 flex flex-col gap-4">
            {/* Image / Icon Placeholder */}
            <Skeleton className="w-full h-48 rounded-lg" />

            {/* Content */}
            <div className="flex flex-col gap-2">
                <Skeleton variant="text" width="60%" className="h-6 mb-2" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="40%" />
            </div>

            {/* Action Button */}
            <Skeleton className="h-10 w-full rounded-full mt-2" />
        </div>
    );
};

export default SkeletonCard;
