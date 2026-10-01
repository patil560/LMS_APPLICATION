import React from "react";

export const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`flex min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 ${className}`}
    {...props}
  />
);
