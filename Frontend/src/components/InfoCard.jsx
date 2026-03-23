import React from 'react';

// We accept "props" (ingredients) to customize each card
const InfoCard = ({ icon, title, subtitle, color, onClick, children, rightElement }) => {
  
  // 🎨 Theme Logic: This maps a simple word like "blue" to exact Tailwind colors
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-50 text-slate-600"
  };

  // Default to blue if no color is provided
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      onClick={onClick}
      // This long class string handles the "Card Look"
      // hover:border-blue-200 gives a gentle highlight when hovering
      // active:scale-95 gives a tiny "press" animation
      className={`bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-md flex flex-col gap-4 transition-all 
      ${onClick ? 'cursor-pointer active:scale-95 hover:border-blue-200' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* The Icon Box */}
          <div className={`p-4 rounded-2xl ${selectedColor}`}>
            {icon}
          </div>
          
          {/* Title and Subtitle */}
          <div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">{title}</h3>
            {subtitle && <p className="text-slate-400 font-bold text-sm">{subtitle}</p>}
          </div>
        </div>
        
        {/* Optional: Right side element (like an arrow or edit button) */}
        {rightElement}
      </div>

      {/* Children: This allows us to put extra content INSIDE the card later */}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};

export default InfoCard;