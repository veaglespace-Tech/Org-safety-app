"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ChevronRight, Globe, Mail, MapPin, ShieldCheck } from "lucide-react";

import CountryPhoneField from "@/components/ui/CountryPhoneField";
import RegisterFlowShell from "@/components/register/RegisterFlowShell";
import RegisterStepBack from "@/components/register/RegisterStepBack";
import { Field } from "@/components/ui/Field";
import { organisationSchema, organisationDefaultValues } from "@/lib/validations/organisation";
import { normalizeEmailInput, normalizeTextInput, toDigitsOnly } from "@/utils/formValidation";
import { getRegistrationDraft, REGISTRATION_DRAFT_KEYS, setRegistrationDraft } from "@/utils/registerDraft";
import { API_BASE_URL } from "@/services/api/baseApi";

const fieldClassName =
  "w-full rounded-[1.6rem] border-2 bg-white px-4 py-4 text-sm text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.08)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-blue-600 focus:ring-4 focus:ring-blue-100/80 dark:border-white/75 dark:bg-white dark:text-slate-950 dark:placeholder:text-slate-500 dark:shadow-[0_18px_45px_rgba(2,6,23,0.35)] dark:focus:border-blue-500 dark:focus:ring-blue-500/20";
const normalFieldClassName = "border-slate-200 hover:border-slate-300 dark:border-white/80";
const errorFieldClassName =
  "border-red-400 bg-red-50/70 focus:border-red-500 focus:ring-red-500/10 dark:border-red-300 dark:bg-white";

const browserAutofillBlockProps = { autoComplete: "on" };
const emailFieldProps = {
  ...browserAutofillBlockProps,
  inputMode: "email",
  autoCapitalize: "none",
  spellCheck: false,
};

function OrganisationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerRef = searchParams.get("partnerRef");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(organisationSchema),
    mode: "all",
    defaultValues: organisationDefaultValues,
  });
  const phoneCountryCode = useWatch({ control, name: "phoneCountryCode" });
  const phone = useWatch({ control, name: "phone" });

  useEffect(() => {
    let activePartnerRef = partnerRef;
    if (typeof window !== "undefined") {
      const globalRef = localStorage.getItem("globalPartnerRef");
      if (globalRef && !activePartnerRef) {
        activePartnerRef = globalRef;
      }
    }

    const storedOrganization = getRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation);

    if (!storedOrganization) {
      if (activePartnerRef) {
        setRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation, { partnerReferralCode: activePartnerRef });
      }
      return;
    }

    if (activePartnerRef && !storedOrganization.partnerReferralCode) {
      storedOrganization.partnerReferralCode = activePartnerRef;
      setRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation, storedOrganization);
    }

    reset({
      ...organisationDefaultValues,
      ...storedOrganization,
      phoneCountryCode: storedOrganization.phoneCountryCode || organisationDefaultValues.phoneCountryCode,
      country: storedOrganization.country || organisationDefaultValues.country,
    });
  }, [reset, partnerRef]);

  const onSubmit = async (values) => {
    const existingDraft = getRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation) || {};
    const orgDraft = {
      ...existingDraft,
      ...values,
      name: normalizeTextInput(values.name),
      email: normalizeEmailInput(values.email),
      city: normalizeTextInput(values.city),
      state: normalizeTextInput(values.state),
      country: normalizeTextInput(values.country),
      address: normalizeTextInput(values.address),
      phone: toDigitsOnly(values.phone),
    };
    setRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation, orgDraft);

    try {
      await fetch(`${API_BASE_URL}/auth/save-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org: orgDraft, admin: {} }),
      });
    } catch (err) {
      console.error("Failed to save lead:", err);
    }

    router.push("/register/organisation/admin");
  };

  const fields = [
    { name: "name", label: "Organization Name", icon: Building2, placeholder: "Acme Corp" },
    { name: "email", label: "Business Email", icon: Mail, placeholder: "contact@acme.com", type: "email" },
    { name: "city", label: "City", icon: Globe, placeholder: "Mumbai" },
    { name: "state", label: "State", icon: Globe, placeholder: "Maharashtra" },
    { name: "country", label: "Country", icon: Globe, placeholder: "India" },
    { name: "address", label: "Office Address (Optional)", icon: MapPin, placeholder: "Street, Area, etc." },
  ];

  return (
    <RegisterFlowShell
      badge="Step 1 of 2"
      badgeIcon={ShieldCheck}
      title="Register Organization"
      description="Company profile setup"
      beforeCard={<RegisterStepBack href="/register" label="Back to Registration Options" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            icon={field.icon}
            placeholder={field.placeholder}
            error={errors[field.name]?.message}
            className={field.name === "address" ? "md:col-span-2" : ""}
          >
            <input
              type={field.type || "text"}
              {...register(field.name)}
              {...(field.name === "email" ? emailFieldProps : browserAutofillBlockProps)}
              className={`${fieldClassName} !pl-12 ${errors[field.name] ? errorFieldClassName : normalFieldClassName}`}
            />
          </Field>
        ))}

        <CountryPhoneField
          label="Business Phone"
          required
          countryCode={phoneCountryCode}
          phone={phone || ""}
          countryCodeName="organisationPhoneCountryCodeDisplay"
          phoneName="organisationPhoneDisplay"
          selectAutoComplete="on"
          phoneAutoComplete="on"
          onCountryCodeChange={(event) =>
            setValue("phoneCountryCode", event.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }
          onPhoneChange={(event) =>
            setValue("phone", event.target.value.replace(/[^\d]/g, ""), { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }
          countryCodeError={errors.phoneCountryCode?.message}
          phoneError={errors.phone?.message}
          helpText=""
          containerClassName="space-y-1.5 md:col-span-2"
          labelClassName="ml-1 block text-[11px] font-black uppercase tracking-widest leading-none text-slate-500 dark:text-slate-300"
          selectProps={browserAutofillBlockProps}
          phoneProps={browserAutofillBlockProps}
        />
        <input type="hidden" {...register("phoneCountryCode")} />
        <input type="hidden" {...register("phone")} />

        <div className="mt-4 md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-2 flex w-full items-center justify-center gap-3 rounded-3xl bg-blue-600 py-5 font-black text-white shadow-[0_28px_70px_rgba(59,130,246,0.28)] transition-all duration-500 hover:-translate-y-1 hover:bg-slate-900 hover:shadow-[0_30px_76px_rgba(15,23,42,0.22)] active:scale-95 disabled:opacity-50 dark:bg-blue-400 dark:text-slate-950 dark:shadow-[0_24px_60px_rgba(37,99,235,0.24)] dark:hover:bg-blue-300"
          >
            Save and Setup Admin
            <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </RegisterFlowShell>
  );
}

export default function OrganisationForm() {
  return (
    <Suspense fallback={null}>
      <OrganisationFormContent />
    </Suspense>
  );
}
