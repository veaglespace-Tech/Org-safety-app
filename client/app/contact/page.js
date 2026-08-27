"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Mail, User, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { API_BASE_URL } from "@/services/api/baseApi";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Message sent successfully!");
        reset();
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Contact Form Error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 dark:bg-slate-950">
      <div className="site-container max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-900 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              Contact Us
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Have questions or need assistance? Fill out the form below and we'll get back to you.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`block w-full rounded-2xl border bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 ${errors.name ? "border-rose-500" : "border-slate-200"}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className={`block w-full rounded-2xl border bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 ${errors.email ? "border-rose-500" : "border-slate-200"}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs font-semibold text-rose-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Subject (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <MessageSquare size={18} className="text-slate-400" />
                </div>
                <input
                  id="subject"
                  type="text"
                  {...register("subject")}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  placeholder="How can we help?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                {...register("message", { required: "Message is required" })}
                className={`block w-full rounded-2xl border bg-slate-50 p-4 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 ${errors.message ? "border-rose-500" : "border-slate-200"}`}
                placeholder="Write your message here..."
              ></textarea>
              {errors.message && <p className="text-xs font-semibold text-rose-500">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_20px_52px_rgba(59,130,246,0.24)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_24px_60px_rgba(59,130,246,0.28)] disabled:pointer-events-none disabled:opacity-70 dark:shadow-blue-950/30"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
