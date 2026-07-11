import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ emoji = "📭", title = "Nothing here yet", description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="font-heading font-semibold text-gray-900 text-lg mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </motion.div>
  );
}
