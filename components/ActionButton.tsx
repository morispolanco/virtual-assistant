
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  ariaLabel: string;
  disabled?: boolean;
  children: React.ReactNode;
  isActive?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, label, ariaLabel, disabled = false, children, isActive = false }) => {
  const baseClasses = "flex flex-col items-center justify-center p-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900";
  const colorClasses = isActive 
    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400 focus:ring-yellow-400"
    : "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500";
  const disabledClasses = "disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`${baseClasses} ${colorClasses} ${disabledClasses} w-24 h-24 sm:w-28 sm:h-28`}
      >
        {children}
      </button>
      <span className="text-sm font-medium text-center text-gray-200">{label}</span>
    </div>
  );
};

export default ActionButton;
