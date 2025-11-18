import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-white border border-gray-200 shadow-card hover:shadow-card-hover",
    elevated: "bg-white shadow-lg hover:shadow-xl",
    outlined: "bg-white border-2 border-gray-200 hover:border-primary",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-card"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;