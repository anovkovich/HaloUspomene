import React from "react";
import {
  Church,
  Users,
  Heart,
  Music,
  Camera,
  GlassWater,
  Utensils,
  Sparkles,
  CalendarHeart,
  HouseHeart,
} from "lucide-react";
import { TimelineItem } from "../types";

const IconMap: Record<
  string,
  React.ComponentType<{
    size: number;
    strokeWidth: number;
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  Church,
  Users,
  Heart,
  Music,
  Camera,
  GlassWater,
  Utensils,
  Sparkles,
  CalendarHeart,
  HouseHeart,
};

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="relative max-w-3xl mx-auto px-6 py-12">
      {/* Central Line with gradient */}
      <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 h-full w-px top-0">
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(to bottom, transparent, var(--theme-primary), transparent)`,
          }}
        />
      </div>

      <div className="space-y-12 sm:space-y-16">
        {items.map((item, index) => {
          const IconComponent = IconMap[item.icon] || Heart;
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              className={`relative flex items-center w-full md:justify-between ${isEven ? "md:flex-row-reverse" : ""}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Desktop Spacer */}
              <div className="hidden md:block md:w-5/12"></div>

              {/* Center Icon */}
              <div className="absolute left-2 md:left-1/2 transform -translate-x-1/2 z-10">
                <div className="relative group">
                  {/* Outer ring */}
                  <div
                    className="absolute inset-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full scale-125 group-hover:scale-150 transition-transform duration-500"
                    style={{ backgroundColor: "var(--theme-primary-muted)" }}
                  />
                  {/* Main icon container */}
                  <div
                    className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white group-hover:shadow-xl transition-all duration-300"
                    style={{
                      border: "2px solid var(--theme-primary)",
                      boxShadow: "var(--theme-shadow)",
                    }}
                  >
                    <IconComponent
                      size={22}
                      strokeWidth={1.5}
                      style={{ color: "var(--theme-primary)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full md:w-5/12 pl-16 md:pl-0">
                <div
                  className={`relative backdrop-blur-sm p-6 sm:p-8 group overflow-hidden transition-all duration-500 ${isEven ? "md:text-left" : "md:text-right"}`}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "var(--theme-radius)",
                    boxShadow: "var(--theme-shadow)",
                    border: "1px solid var(--theme-border-light)",
                  }}
                >
                  {/* Hover shimmer effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to right, transparent, var(--theme-primary-muted), transparent)`,
                    }}
                  />

                  {/* Decorative corner */}
                  <div
                    className={`absolute top-0 ${isEven ? "md:left-0" : "md:right-0"} left-0 w-12 h-12`}
                  >
                    <div
                      className={`absolute top-3 ${isEven ? "md:left-3" : "md:right-3"} left-3 w-6 h-6`}
                      style={{
                        borderTop: "1px solid var(--theme-border)",
                        borderLeft: "1px solid var(--theme-border)",
                      }}
                    />
                  </div>

                  <div
                    className={`relative flex flex-col ${isEven ? "md:items-start" : "md:items-end"}`}
                  >
                    {/* Time badge */}
                    <span
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] mb-4"
                      style={{
                        backgroundColor: "var(--theme-surface)",
                        border: "1px solid var(--theme-border)",
                        color: "var(--theme-primary)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--theme-primary)" }}
                      />
                      {item.time}
                    </span>

                    {/* Title */}
                    <h4
                      className="text-xl sm:text-2xl font-serif mb-2 leading-tight"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {item.title}
                    </h4>

                    {/* Description */}
                    {item.description && (
                      <p
                        className="text-sm sm:text-base font-light leading-relaxed tracking-wide"
                        style={{ color: "var(--theme-text-muted)" }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* End ornament */}
      <div className="flex justify-center mt-16">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-px"
            style={{
              background: `linear-gradient(to right, transparent, var(--theme-border))`,
            }}
          />
          <Heart
            size={16}
            style={{ color: "var(--theme-primary)", opacity: 0.4 }}
            strokeWidth={1}
          />
          <div
            className="w-12 h-px"
            style={{
              background: `linear-gradient(to left, transparent, var(--theme-border))`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
