import EmergencyEmailsManager from "@/components/tich-surksha/EmergencyEmailsManager";

export default function OrgEmergencyEmailsPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Emergency Emails</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage the email addresses that receive your SOS alerts.</p>
      </div>
      <EmergencyEmailsManager />
    </div>
  );
}
