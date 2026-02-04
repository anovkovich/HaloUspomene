"use client";

import React, { useState } from "react";
import { Heart, Check, Send, Users, MessageSquare, User } from "lucide-react";
import { Entry_IDs } from "../types";
import { useTheme } from "./ThemeProvider";

interface RSVPFormProps {
  formUrl: string;
  entry_IDs: Entry_IDs;
}

export const RSVPForm: React.FC<RSVPFormProps> = ({ formUrl, entry_IDs }) => {
  const { t } = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    attending: "Da",
    plusOnes: "1",
    details: "",
  });

  const isAttending = formData.attending === "Da";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    params.append(entry_IDs.name, formData.name);
    params.append(entry_IDs.attending, formData.attending);
    params.append(entry_IDs.plusOnes, isAttending ? formData.plusOnes : "0");
    params.append(entry_IDs.details, isAttending ? formData.details || "-" : "-");

    try {
      await fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    } catch {
      // no-cors responses are opaque, submission still goes through
    }

    setLoading(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: "", attending: "Da", plusOnes: "1", details: "" });
  };

  // Helper for pluralization
  const getPersonLabel = (count: number) => {
    if (count === 1) return t.person;
    if (count < 5) return t.people;
    return t.person;
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div
          className="relative p-8 sm:p-12 overflow-hidden text-center"
          style={{
            backgroundColor: "var(--theme-background)",
            borderRadius: "var(--theme-radius)",
            boxShadow: "var(--theme-shadow)",
            border: "1px solid var(--theme-border-light)",
          }}
        >
          <DecorativeCorners />

          {/* Animated success icon */}
          <div
            className="relative mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center animate-[scale-in_0.5s_ease-out]"
            style={{
              backgroundColor: "var(--theme-primary-muted)",
              border: "3px solid var(--theme-primary)",
            }}
          >
            <div className="animate-[bounce-in_0.6s_ease-out_0.2s_both]">
              {isAttending ? (
                <Check
                  size={40}
                  strokeWidth={3}
                  style={{ color: "var(--theme-primary)" }}
                />
              ) : (
                <Heart
                  size={36}
                  strokeWidth={2}
                  style={{ color: "var(--theme-primary)" }}
                />
              )}
            </div>
          </div>

          {/* Thank you message */}
          <div className="animate-[fade-in-up_0.5s_ease-out_0.3s_both]">
            <h3
              className="font-serif text-2xl sm:text-3xl mb-3"
              style={{ color: "var(--theme-text)" }}
            >
              {isAttending ? t.thankYou : t.thankYouResponse}
            </h3>
            <p
              className="font-light text-base sm:text-lg mb-2"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {isAttending
                ? t.confirmationRecorded
                : t.sorryNotAttending}
            </p>
            <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
              {isAttending
                ? t.lookingForward
                : t.hopeToSee}
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 my-8 animate-[fade-in_0.5s_ease-out_0.5s_both]">
            <div
              className="h-px w-16"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
            <Heart
              size={16}
              className="animate-pulse"
              style={{ color: "var(--theme-primary)" }}
            />
            <div
              className="h-px w-16"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
          </div>

          {/* Guest info summary */}
          <div
            className="p-4 mb-6 animate-[fade-in-up_0.5s_ease-out_0.6s_both]"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderRadius: "var(--theme-radius)",
            }}
          >
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--theme-text)" }}
            >
              {formData.name}
            </p>
            <p className="text-xs" style={{ color: "var(--theme-text-light)" }}>
              {isAttending
                ? `${formData.plusOnes} ${getPersonLabel(parseInt(formData.plusOnes))}`
                : t.notAttending}
            </p>
          </div>

          <button
            onClick={resetForm}
            className="text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-70 animate-[fade-in_0.5s_ease-out_0.7s_both]"
            style={{ color: "var(--theme-text-light)" }}
          >
            {t.submitAnother}
          </button>
        </div>

        <style jsx>{`
          @keyframes scale-in {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes bounce-in {
            0% {
              transform: scale(0);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
          @keyframes fade-in-up {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes fade-in {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div
        className="relative p-8 sm:p-12 overflow-hidden"
        style={{
          backgroundColor: "var(--theme-background)",
          borderRadius: "var(--theme-radius)",
          boxShadow: "var(--theme-shadow)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <DecorativeCorners />

        <form onSubmit={handleSubmit} className="relative space-y-8">
          {/* Name field */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-elegant uppercase tracking-[0.2em] mb-3"
              style={{ color: "var(--theme-text-light)" }}
            >
              <User size={14} />
              {t.nameLabel}
            </label>
            <input
              required
              type="text"
              className="w-full bg-transparent py-3 text-lg font-serif placeholder:opacity-30 outline-none transition-colors duration-300"
              style={{
                color: "var(--theme-text)",
                borderBottom: "2px solid var(--theme-border-light)",
              }}
              placeholder={t.namePlaceholder}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onFocus={(e) =>
                (e.target.style.borderBottomColor = "var(--theme-primary)")
              }
              onBlur={(e) =>
                (e.target.style.borderBottomColor = "var(--theme-border-light)")
              }
            />
          </div>

          {/* Attendance field */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-elegant uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--theme-text-light)" }}
            >
              <Heart size={14} />
              {t.attendingLabel}
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: "Da",
                  label: t.attendingYes,
                  sublabel: t.attendingYesSub,
                  icon: Check,
                },
                {
                  value: "Ne",
                  label: t.attendingNo,
                  sublabel: t.attendingNoSub,
                  icon: Heart,
                },
              ].map((option) => {
                const selected = formData.attending === option.value;
                return (
                  <label
                    key={option.value}
                    className="relative flex flex-col items-center justify-center py-4 px-2 cursor-pointer transition-all duration-300"
                    style={{
                      borderRadius: "var(--theme-radius)",
                      border: `2px solid var(--theme-${selected ? "primary" : "border-light"})`,
                      backgroundColor: selected
                        ? "var(--theme-primary-muted)"
                        : "transparent",
                      boxShadow: selected ? "var(--theme-shadow)" : "none",
                    }}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={selected}
                      onChange={() =>
                        setFormData({ ...formData, attending: option.value })
                      }
                    />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors"
                      style={{
                        backgroundColor: selected
                          ? "var(--theme-primary)"
                          : "var(--theme-surface)",
                        color: selected ? "white" : "var(--theme-text-light)",
                      }}
                    >
                      <option.icon size={20} />
                    </div>
                    <span
                      className="font-serif text-lg"
                      style={{
                        color: `var(--theme-${selected ? "primary" : "text-muted"})`,
                      }}
                    >
                      {option.label}
                    </span>
                    <span
                      className="text-xs mt-1"
                      style={{ color: "var(--theme-text-light)" }}
                    >
                      {option.sublabel}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Plus ones field */}
          {isAttending && (
            <div className="animate-fade-in-up">
              <label
                className="flex items-center gap-2 text-xs font-elegant uppercase tracking-[0.2em] mb-3"
                style={{ color: "var(--theme-text-light)" }}
              >
                <Users size={14} />
                {t.guestCount}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      plusOnes: Math.max(
                        1,
                        parseInt(formData.plusOnes) - 1,
                      ).toString(),
                    })
                  }
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    border: "2px solid var(--theme-border-light)",
                    color: "var(--theme-text-light)",
                  }}
                >
                  −
                </button>
                <span
                  className="text-4xl font-elegant w-16 text-center"
                  style={{ color: "var(--theme-text)" }}
                >
                  {formData.plusOnes}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      plusOnes: (parseInt(formData.plusOnes) + 1).toString(),
                    })
                  }
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    border: "2px solid var(--theme-border-light)",
                    color: "var(--theme-text-light)",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Notes field */}
          {isAttending && (
            <div>
              <label
                className="flex items-center gap-2 text-xs font-elegant uppercase tracking-[0.2em] mb-3"
                style={{ color: "var(--theme-text-light)" }}
              >
                <MessageSquare size={14} />
                {t.additionalNotes}
              </label>
              <textarea
                className="w-full p-4 h-25 md:h-15 font-light outline-none transition-all duration-300 resize-none"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  color: "var(--theme-text-muted)",
                  borderRadius: "var(--theme-radius)",
                  border: "2px solid transparent",
                }}
                placeholder={t.notesPlaceholder}
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--theme-border)";
                  e.target.style.backgroundColor = "var(--theme-background)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "transparent";
                  e.target.style.backgroundColor = "var(--theme-surface)";
                }}
              />
            </div>
          )}

          {/* Submit button */}
          <button
            disabled={loading}
            type="submit"
            className="relative w-full py-5 uppercase tracking-[0.2em] text-sm font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden text-white"
            style={{
              borderRadius: "var(--theme-radius)",
              backgroundColor: loading
                ? "var(--theme-text-light)"
                : "var(--theme-text)",
              boxShadow: loading ? "none" : "var(--theme-shadow)",
            }}
          >
            {loading ? (
              <>
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor: "var(--theme-text-light)",
                    borderTopColor: "transparent",
                  }}
                />
                {t.sending}
              </>
            ) : (
              <>
                <Send size={18} />
                {t.confirmAttendance}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const DecorativeCorners = () => (
  <>
    <div
      className="hidden md:block absolute top-6 left-6 w-12 h-12"
      style={{
        borderTop: "2px solid var(--theme-border)",
        borderLeft: "2px solid var(--theme-border)",
        borderRadius: "var(--theme-radius) 0 0 0",
      }}
    />
    <div
      className="hidden md:block absolute top-6 right-6 w-12 h-12"
      style={{
        borderTop: "2px solid var(--theme-border)",
        borderRight: "2px solid var(--theme-border)",
        borderRadius: "0 var(--theme-radius) 0 0",
      }}
    />
    <div
      className="hidden md:block absolute bottom-6 left-6 w-12 h-12"
      style={{
        borderBottom: "2px solid var(--theme-border)",
        borderLeft: "2px solid var(--theme-border)",
        borderRadius: "0 0 0 var(--theme-radius)",
      }}
    />
    <div
      className="hidden md:block absolute bottom-6 right-6 w-12 h-12"
      style={{
        borderBottom: "2px solid var(--theme-border)",
        borderRight: "2px solid var(--theme-border)",
        borderRadius: "0 0 var(--theme-radius) 0",
      }}
    />
  </>
);
