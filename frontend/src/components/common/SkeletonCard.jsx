import React from "react";

export const SkeletonCard = ({ lines = 3, className = "" }) => (
  <div className={`card p-5 animate-pulse ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
      </div>
    </div>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 bg-gray-200 rounded-lg mb-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="card overflow-hidden animate-pulse">
    <div className="bg-gray-50 px-6 py-3 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 rounded flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-6 py-4 border-t border-gray-50 flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded-lg ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
    ))}
  </div>
);

export default SkeletonCard;
