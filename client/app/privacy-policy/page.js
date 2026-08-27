import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TichiSuraksha",
  description: "Privacy Policy for the TichiSuraksha Android application.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 dark:bg-slate-950">
      <div className="site-container max-w-4xl">
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
          <h1 className="mb-6 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
            Privacy Policy for TichiSuraksha
          </h1>
          <p className="mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">1. Introduction</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Welcome to <strong>TichiSuraksha</strong>, a women's safety application developed by [COMPANY LEGAL NAME]. Your privacy and safety are our top priorities. This Privacy Policy explains how we collect, use, protect, and handle your information when you use the TichiSuraksha Android app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">2. What Personal Data is Collected</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                To provide you with our emergency and safety features, we collect the following types of information:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
                <li><strong>Account Information:</strong> Your name, email address, phone number, and profile details provided during registration.</li>
                <li><strong>Trusted Contacts:</strong> Names, phone numbers, and email addresses of the emergency contacts you choose to add.</li>
                <li><strong>Location Data:</strong> Your precise GPS location data, but only when you actively trigger the safety or emergency features.</li>
                <li><strong>Subscription/Payment Information:</strong> Information relating to paid plans and digital subscriptions (processed securely via Google Play billing or third-party payment gateways).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">3. Why We Collect This Data</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We collect your data solely for the purpose of ensuring the core functionality of the TichiSuraksha app:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
                <li>To create and manage your user account securely.</li>
                <li>To allow you to set up and manage your emergency/trusted contacts.</li>
                <li>To send emergency alerts, including your precise location, to your trusted contacts via SMS, Email, and WhatsApp.</li>
                <li>To process subscription payments for premium features.</li>
                <li>To ensure reliable communication with online services requiring internet connectivity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">4. Precise Location Collection and Sharing</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                TichiSuraksha accesses your device's precise location <strong>only when you actively use the safety or emergency alert features</strong>. We do not track or collect your location continuously in the background when the app is not in an active emergency state. 
                <br /><br />
                When an emergency is triggered, your precise location is temporarily accessed and shared directly with your selected trusted contacts via email, SMS, and WhatsApp to help them locate you. We do not sell or share your location data for advertising or marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">5. Trusted/Emergency Contacts</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                You can add phone numbers and email addresses of people you trust. By adding them, you confirm that you have their consent to provide their details to us. This information is stored securely and is strictly used to send automated alerts and location data during an emergency.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">6. SMS, Email and WhatsApp Sharing</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                In an emergency, TichiSuraksha utilizes internet connectivity and mobile network services to dispatch alerts:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
                <li><strong>SMS:</strong> The app may send standard SMS text messages to your trusted contacts.</li>
                <li><strong>Email:</strong> The app uses our servers or your configured email to dispatch emergency alerts containing your location.</li>
                <li><strong>WhatsApp:</strong> The app integrates with WhatsApp to securely share emergency information and location links to your contacts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">7. Subscription and Payment Information</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                TichiSuraksha offers paid plans that unlock premium digital services. Payment processing is handled by secure, authorized third-party payment processors (such as Google Play Billing). We do not directly store your credit card numbers or sensitive financial data on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">8. How Information is Stored and Protected</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We implement robust security measures, including encryption in transit and at rest, to protect your personal data, trusted contacts, and location data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">9. Sharing Information with Third Parties</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We <strong>do not sell, trade, or rent</strong> your personal data to outside parties. We only share information with trusted third-party service providers who assist us in operating our app and delivering emergency alerts (e.g., SMS gateways, Email delivery services, cloud hosting). These third parties are bound by strict confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">10. Data Retention</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We retain your account profile and trusted contact information for as long as your account is active. Location data generated during an emergency is only retained for the short duration necessary to deliver the alerts and is subsequently discarded or securely anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">11. User Rights and Data Deletion</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                You have the right to access, update, or delete your personal data. 
                <br /><br />
                <strong>How to request account deletion:</strong> You can permanently delete your account and all associated data directly from within the TichiSuraksha app settings. Alternatively, you can request account deletion by emailing us at [PRIVACY EMAIL]. Upon deletion, all your personal data, emergency contacts, and history will be permanently removed from our active servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">12. Children's Privacy</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                TichiSuraksha is not intended for use by children under the age of 13. We do not knowingly collect personal identifiable information from children. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">13. Changes to this Privacy Policy</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our app or legal requirements. We will notify users of any significant changes via in-app notifications or email. We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">14. Contact Information</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                <br /><br />
                <strong>Email:</strong> [PRIVACY EMAIL]<br />
                <strong>Company:</strong> [COMPANY LEGAL NAME]
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
