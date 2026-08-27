import React from "react";
import Link from "next/link";
import { ChevronLeft, Shield, Users, Bell, Smartphone, Monitor } from "lucide-react";

export const metadata = {
  title: "About & User Guide | TichiSuraksha",
  description: "Learn how to use the TichiSuraksha app and organization management dashboard.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 dark:bg-slate-950">
      <div className="site-container max-w-5xl">
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
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
              About & How to Use
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Welcome to our comprehensive safety platform. Whether you're using the <strong>TichiSuraksha</strong> mobile app or managing a team on the <strong>Web Dashboard</strong>, here is everything you need to know.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Mobile App Section */}
            <div className="space-y-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/20 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
                  <Smartphone size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  TichiSuraksha App
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Register & Setup Profile</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Download the app, create your account, and fill in your basic profile details so emergency contacts know who is requesting help.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Add Trusted Contacts</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Navigate to the "Contacts" section in the app. Add phone numbers and email addresses of close friends, family members, or organization leaders you trust.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">3</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Triggering an SOS</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">In an emergency, tap the large SOS button. The app will immediately fetch your precise location and send alerts via SMS, Email, and WhatsApp to your trusted contacts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Web Dashboard Section */}
            <div className="space-y-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/20 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <Monitor size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Web Dashboard
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"><Users size={16} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Organization Setup</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Register your organization through the website. Once approved, you can invite team leaders and members into your secure workspace.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"><Bell size={16} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Emergency Monitoring</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">If your members use TichiSuraksha, organization admins can be configured as trusted contacts to receive emergency emails instantly on the dashboard.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"><Shield size={16} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Role Management</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">The platform supports multiple roles including Super Admin, Organization Admin, Team Leader, and standard Members. Use the dashboard settings to assign the right access levels.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-blue-50 p-6 text-center dark:bg-blue-500/10 md:p-8">
            <h3 className="mb-2 text-xl font-black text-slate-900 dark:text-white">Need More Help?</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              If you have any questions or run into technical issues while using the platform, our support team is ready to assist you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
