import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rect" | "circle";
  shape?: "circle" | "rectangle";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
  variant = "rect",
  shape
}) => {
  const activeVariant = shape === "circle" ? "circle" : variant;

  const baseStyles =
    "animate-pulse bg-border relative overflow-hidden";

  const variantStyles = {
    text: "h-4 w-full rounded-lg",
    rect: "rounded-2xl",
    circle: "rounded-full"
  };

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variantStyles[activeVariant], className))}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className = "" }) => {
  return (
    <div className={twMerge("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lines > 1 ? "70%" : "100%"}
        />
      ))}
    </div>
  );
};

export const SkeletonCircle: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className = "" }) => {
  return (
    <Skeleton
      variant="circle"
      width={size}
      height={size}
      className={className}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden col-span-1">
      <Skeleton className="h-48 w-full rounded-none" />

      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-12 w-28 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};