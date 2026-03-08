import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "bargain" | "seller" | "outline" | "ghost" | "danger" | "warning";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: React.ElementType;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            icon: Icon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm hover:shadow-lg";

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary",
            bargain: "bg-bargain text-white hover:bg-bargain-hover focus-visible:ring-bargain",
            seller: "bg-seller text-white hover:bg-seller-hover focus-visible:ring-seller",
            outline: "border-2 border-border text-text-primary hover:bg-background hover:border-primary shadow-sm hover:shadow-md",
            ghost: "hover:bg-background text-text-primary shadow-none hover:shadow-none hover:text-primary",
            danger: "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
            warning: "bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm",
            md: "h-12 px-6 text-base",
            lg: "h-14 px-8 text-lg font-bold",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
                className={twMerge(
                    clsx(baseStyles, variants[variant], sizes[size], className)
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 
              0 0 5.373 0 12h4zm2 
              5.291A7.962 7.962 0 
              014 12H0c0 3.042 
              1.135 5.824 3 
              7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    Icon && (
                        <Icon
                            className={clsx("w-4 h-4", children ? "mr-2" : "")}
                        />
                    )
                )}

                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";