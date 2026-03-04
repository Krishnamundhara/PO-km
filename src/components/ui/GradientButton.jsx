import React from "react";

/**
 * GradientButton - A fancy animated gradient button with icon support
 * @param {Object} props
 * @param {React.ReactElement} props.icon - Lucide icon element
 * @param {string} props.title - Main title text
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {Object} [props.gradientLight] - Light mode gradient colors
 * @param {Object} [props.gradientDark] - Dark mode gradient colors
 */
export default function GradientButton({
  icon,
  title,
  subtitle,
  size = "sm",
  
  gradientLight = { from: "from-indigo-700", via: "via-black/85", to: "to-black/100" },
  gradientDark = { from: "from-indigo-800/30", via: "via-black/50", to: "to-black/70" },
  ...props
}) {
  const sizes = {
    sm: "p-1 rounded-lg",
    md: "p-3 rounded-2xl",
    lg: "p-4 rounded-3xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconPadding = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  const gapSizes = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  };

  return (
    <button
      {...props}
      className={`group relative overflow-hidden border-2 cursor-pointer transition-all duration-500 ease-out 
                  shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95
                  ${sizes[size]} 
                  border-indigo-500/60 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700
                  dark:border-indigo-400/30 dark:from-indigo-800/30 dark:via-black/50 dark:to-black/70
                  ${props.className || ''}`}
    >
      {/* Moving gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

      {/* Overlay glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/20 via-indigo-300/10 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className={`relative z-10 flex items-center ${gapSizes[size]}`}>
        {/* Icon */}
        <div className={`${iconPadding[size]} rounded-lg bg-gradient-to-br from-indigo-400/50 to-indigo-500/40 dark:from-indigo-500/50 dark:to-indigo-400/30 backdrop-blur-sm group-hover:from-indigo-400/60 group-hover:to-indigo-500/50 transition-all duration-300`}>
          {React.cloneElement(icon, {
            className:
              `${iconSizes[size]} text-white group-hover:text-white/90 transition-all duration-300 group-hover:scale-110 drop-shadow-lg`,
          })}
        </div>

        {/* Texts */}
        <div className="flex-1 text-left">
          <p className={`text-white font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'} group-hover:text-white/90 transition-colors duration-300 drop-shadow-sm`}>
            {title}
          </p>
          {subtitle && (
            <p className="text-white/80 dark:text-white/70 text-xs group-hover:text-white/90 transition-colors duration-300">
              {subtitle}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          <svg
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-white`}
          >
            <path
              d="M9 5l7 7-7 7"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        </div>
      </div>
    </button>
  );
}
