import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        const variants = {
            primary: "bg-white text-black hover:bg-gray-200 shadow-sm",
            secondary: "bg-gray-800 text-white hover:bg-gray-700 shadow-sm",
            outline: "border border-gray-700 text-gray-300 hover:bg-gray-800",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
            ghost: "text-gray-400 hover:text-white hover:bg-white/10",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
