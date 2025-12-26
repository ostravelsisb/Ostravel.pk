import React from 'react';
import Skeleton from './Skeleton';

const SkeletonTable = ({ rows = 5 }) => {
    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex p-4 border-b border-gray-100 gap-4 bg-gray-50">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
            </div>

            {/* Rows */}
            <div className="flex flex-col">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex p-4 gap-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-1/5" />
                        <Skeleton className="h-8 w-1/6 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonTable;
