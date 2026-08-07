import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  User,
  Mail,
  Lock,
  MapPin,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Crown,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';

import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { CountryPhoneField } from '@/components/ui/CountryPhoneField';
import { BadgePill } from '@/components/ui/BadgePill';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { useRegisterOrganizationMutation } from '@/services/api/authApi';
import { useGetPlansQuery } from '@/services/api/planApi';
import { setSession } from '@/store/slices/authSlice';
import { ROLES } from '@/utils/roles';
import {
  PERSON_NAME_REGEX,
  ORGANIZATION_NAME_REGEX,
  PLACE_NAME_REGEX,
  PHONE_DIGIT_MIN,
  PHONE_DIGIT_MAX,
  normalizeEmailInput,
  normalizeTextInput,
  toDigitsOnly,
  isNotCommonEmailTypo,
} from '@/utils/formValidation';
import {
  getRegistrationDraft,
  setRegistrationDraft,
  clearAllRegistrationDrafts,
  REGISTRATION_DRAFT_KEYS,
} from '@/utils/registerDraft';

// --- Step 1 Schema: Org Details ---
const orgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Organization name is required')
    .max(100, 'Organization name is too long')
    .regex(
      ORGANIZATION_NAME_REGEX,
      'Organization name can only include letters, numbers, spaces, and . & ( ) - characters'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Business email is required')
    .email('Invalid business email address')
    .refine(isNotCommonEmailTypo, {
      message: 'Did you mean .com or .co.in? Please enter a valid email address.',
    }),
  phoneCountryCode: z.string().regex(/^\+\d{1,3}$/, 'Select a valid country code'),
  phone: z
    .string()
    .trim()
    .min(1, 'Business phone is required')
    .refine(
      (value) => toDigitsOnly(value).length >= PHONE_DIGIT_MIN,
      'Business phone number is too short'
    )
    .refine(
      (value) => toDigitsOnly(value).length <= PHONE_DIGIT_MAX,
      'Business phone number is too long'
    ),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(80, 'City is too long')
    .regex(PLACE_NAME_REGEX, 'Enter a valid city'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .max(80, 'State is too long')
    .regex(PLACE_NAME_REGEX, 'Enter a valid state'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(80, 'Country is too long')
    .regex(PLACE_NAME_REGEX, 'Enter a valid country'),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(180, 'Address is too long'),
});

// --- Step 2 Schema: Admin Details ---
const adminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name is required')
      .max(120, 'Full name is too long')
      .regex(
        PERSON_NAME_REGEX,
        'Full name can only include letters, spaces, apostrophes, dots, or hyphens'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'Admin email is required')
      .email('Invalid email address')
      .refine(isNotCommonEmailTypo, {
        message: 'Did you mean .com or .co.in? Please enter a valid email address.',
      }),
    mobileCountryCode: z.string().regex(/^\+\d{1,3}$/, 'Select a valid country code'),
    mobile: z
      .string()
      .trim()
      .refine(
        (value) => toDigitsOnly(value).length >= PHONE_DIGIT_MIN,
        'Mobile number is too short'
      )
      .refine(
        (value) => toDigitsOnly(value).length <= PHONE_DIGIT_MAX,
        'Mobile number is too long'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 64 characters')
      .regex(/[A-Z]/, 'Password must contain at least one capital letter')
      .regex(/[a-z]/, 'Password must contain at least one small letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    city: z
      .string()
      .trim()
      .min(1, 'City is required')
      .max(80, 'City is too long')
      .regex(PLACE_NAME_REGEX, 'Enter a valid city'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
    bloodGroup: z.string().trim().min(1, 'Blood Group is required'),
    role: z.string().default(ROLES.ORG_ADMIN),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type OrgFormValues = z.infer<typeof orgSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
] as const;

export default function OrganisationRegister() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useLocalSearchParams<{ partnerRef?: string }>();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<number | string>(1);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [registerOrganization, { isLoading: isSubmitting }] =
    useRegisterOrganizationMutation();
  const { data: plans = [] } = useGetPlansQuery(undefined);

  // Step 1 Form
  const orgForm = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneCountryCode: '+91',
      phone: '',
      address: '',
      city: '',
      state: 'Maharashtra',
      country: 'India',
    },
  });

  // Step 2 Form
  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      mobileCountryCode: '+91',
      mobile: '',
      password: '',
      confirmPassword: '',
      city: '',
      gender: 'MALE',
      bloodGroup: 'O+',
      role: ROLES.ORG_ADMIN,
    },
  });

  // Load existing drafts on mount
  useEffect(() => {
    (async () => {
      const orgDraft = await getRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation);
      if (orgDraft) {
        orgForm.reset({
          ...orgDraft,
          phoneCountryCode: orgDraft.phoneCountryCode || '+91',
          country: orgDraft.country || 'India',
        });
      }
      const adminDraft = await getRegistrationDraft(REGISTRATION_DRAFT_KEYS.admin);
      if (adminDraft) {
        adminForm.reset({
          ...adminDraft,
          mobileCountryCode: adminDraft.mobileCountryCode || '+91',
        });
      }
    })();
  }, []);

  // Handle Step 1 Next
  const handleOrgSubmit = async (values: OrgFormValues) => {
    await setRegistrationDraft(REGISTRATION_DRAFT_KEYS.organisation, values);
    // Autofill admin city from org city if empty
    if (!adminForm.getValues('city')) {
      adminForm.setValue('city', values.city);
    }
    setCurrentStep(2);
  };

  // Handle Step 2 Next
  const handleAdminSubmit = async (values: AdminFormValues) => {
    await setRegistrationDraft(REGISTRATION_DRAFT_KEYS.admin, values);
    setCurrentStep(3);
  };

  // Handle Final Submission
  const handleFinalSubmit = async () => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const orgValues = orgForm.getValues();
      const adminValues = adminForm.getValues();

      const payload = {
        organisation: {
          ...orgValues,
          name: normalizeTextInput(orgValues.name),
          email: normalizeEmailInput(orgValues.email),
          city: normalizeTextInput(orgValues.city),
          state: normalizeTextInput(orgValues.state),
          country: normalizeTextInput(orgValues.country),
          address: normalizeTextInput(orgValues.address),
          phone: toDigitsOnly(orgValues.phone),
          partnerReferralCode: searchParams.partnerRef || undefined,
        },
        admin: {
          ...adminValues,
          name: normalizeTextInput(adminValues.name),
          email: normalizeEmailInput(adminValues.email),
          city: normalizeTextInput(adminValues.city),
          mobile: toDigitsOnly(adminValues.mobile),
          role: ROLES.ORG_ADMIN,
        },
        planId: selectedPlanId,
      };

      const response = await registerOrganization(payload).unwrap();

      if (response?.user && response?.token) {
        dispatch(setSession(response));
      }

      await clearAllRegistrationDrafts();
      setSubmitSuccess(response?.message || 'Organization registered successfully!');

      setTimeout(() => {
        router.replace('/(drawer)/admin/dashboard');
      }, 1500);
    } catch (err: any) {
      const errorMsg =
        err?.data?.error ||
        err?.data?.message ||
        err?.error ||
        err?.message ||
        'Registration failed. Please check all entries.';
      setSubmitError(errorMsg);
      if (Platform.OS !== 'web') {
        Alert.alert('Registration Error', errorMsg);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="px-5 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep((prev) => (prev - 1) as any);
            } else {
              router.back();
            }
          }}
          className="flex-row items-center gap-1.5 mb-6 self-start bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} color="#2563eb" />
          <Text className="text-blue-600 font-bold text-sm">
            {currentStep === 1 ? 'Back to Options' : `Back to Step ${currentStep - 1}`}
          </Text>
        </TouchableOpacity>

        {/* Header Title Section */}
        <View className="mb-4">
          <BadgePill
            label={`Step ${currentStep} of 3 • ${
              currentStep === 1 ? 'Org Profile' : currentStep === 2 ? 'Admin Account' : 'Plan Selection'
            }`}
            variant="primary"
            className="mb-2.5"
          />
          <Text className="text-3xl font-black text-slate-900 tracking-tight">
            {currentStep === 1
              ? 'Register Organization'
              : currentStep === 2
              ? 'Admin Account Credentials'
              : 'Choose Your Plan'}
          </Text>
          <Text className="text-slate-500 font-medium text-sm mt-1">
            {currentStep === 1
              ? 'Enter your band or organization official details'
              : currentStep === 2
              ? 'Create the primary admin credentials to manage your team'
              : 'Select your subscription tier to activate safety tools'}
          </Text>
        </View>

        {/* Multi-step progress bar */}
        <View className="flex-row items-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              className={`h-2 flex-1 rounded-full ${
                currentStep >= step ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </View>

        {/* Error / Success Notifications */}
        {submitError ? (
          <View className="mb-5 flex-row items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-2xl">
            <AlertCircle size={20} color="#ef4444" />
            <Text className="text-red-700 font-semibold text-xs flex-1">{submitError}</Text>
          </View>
        ) : null}

        {submitSuccess ? (
          <View className="mb-5 flex-row items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
            <CheckCircle2 size={20} color="#10b981" />
            <Text className="text-emerald-700 font-semibold text-xs flex-1">{submitSuccess}</Text>
          </View>
        ) : null}

        {/* STEP 1: Organization Details */}
        {currentStep === 1 && (
          <SurfaceCard className="mb-6">
            <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Building2 size={20} color="#2563eb" />
              <Text className="text-base font-extrabold text-slate-900">Organization Profile</Text>
            </View>

            <Controller
              control={orgForm.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Organization Name"
                  required
                  placeholder="e.g. शिवगर्जना ढोल ताशा पथक"
                  value={value}
                  onChangeText={onChange}
                  error={orgForm.formState.errors.name?.message}
                  leftIcon={<Building2 size={18} color="#64748b" />}
                />
              )}
            />

            <Controller
              control={orgForm.control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Official Email Address"
                  required
                  placeholder="contact@shivgarjana.org"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={orgForm.formState.errors.email?.message}
                  leftIcon={<Mail size={18} color="#64748b" />}
                />
              )}
            />

            <Controller
              control={orgForm.control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Controller
                  control={orgForm.control}
                  name="phoneCountryCode"
                  render={({ field: { onChange: onCodeChange, value: codeValue } }) => (
                    <CountryPhoneField
                      label="Contact Phone Number"
                      required
                      countryCode={codeValue}
                      phone={value}
                      onCountryCodeChange={onCodeChange}
                      onPhoneChange={onChange}
                      phoneError={orgForm.formState.errors.phone?.message}
                    />
                  )}
                />
              )}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={orgForm.control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="City"
                      required
                      placeholder="Pune"
                      value={value}
                      onChangeText={onChange}
                      error={orgForm.formState.errors.city?.message}
                      leftIcon={<MapPin size={18} color="#64748b" />}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={orgForm.control}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="State"
                      required
                      placeholder="Maharashtra"
                      value={value}
                      onChangeText={onChange}
                      error={orgForm.formState.errors.state?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={orgForm.control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Country"
                  required
                  placeholder="India"
                  value={value}
                  onChangeText={onChange}
                  error={orgForm.formState.errors.country?.message}
                  leftIcon={<Globe size={18} color="#64748b" />}
                />
              )}
            />

            <Controller
              control={orgForm.control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Official Practice / Office Address"
                  required
                  placeholder="Ground / Hall / Road location"
                  value={value}
                  onChangeText={onChange}
                  error={orgForm.formState.errors.address?.message}
                />
              )}
            />

            <Button
              onPress={orgForm.handleSubmit(handleOrgSubmit)}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mt-2"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-base">Next: Admin Account</Text>
                <ArrowRight size={18} color="#fff" />
              </View>
            </Button>
          </SurfaceCard>
        )}

        {/* STEP 2: Admin Account Credentials */}
        {currentStep === 2 && (
          <SurfaceCard className="mb-6">
            <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <User size={20} color="#4f46e5" />
              <Text className="text-base font-extrabold text-slate-900">Admin Account Info</Text>
            </View>

            <Controller
              control={adminForm.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Admin Full Name"
                  required
                  placeholder="e.g. Akshay Singare"
                  value={value}
                  onChangeText={onChange}
                  error={adminForm.formState.errors.name?.message}
                  leftIcon={<User size={18} color="#64748b" />}
                />
              )}
            />

            <Controller
              control={adminForm.control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Admin Login Email"
                  required
                  placeholder="admin@example.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={adminForm.formState.errors.email?.message}
                  leftIcon={<Mail size={18} color="#64748b" />}
                />
              )}
            />

            <Controller
              control={adminForm.control}
              name="mobile"
              render={({ field: { onChange, value } }) => (
                <Controller
                  control={adminForm.control}
                  name="mobileCountryCode"
                  render={({ field: { onChange: onCodeChange, value: codeValue } }) => (
                    <CountryPhoneField
                      label="Admin Mobile Number"
                      required
                      countryCode={codeValue}
                      phone={value}
                      onCountryCodeChange={onCodeChange}
                      onPhoneChange={onChange}
                      phoneError={adminForm.formState.errors.mobile?.message}
                    />
                  )}
                />
              )}
            />

            {/* Gender */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Gender <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={adminForm.control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-2.5">
                    {GENDERS.map((g) => {
                      const isSelected = value === g.value;
                      return (
                        <TouchableOpacity
                          key={g.value}
                          onPress={() => onChange(g.value)}
                          className={`flex-1 py-3 rounded-2xl items-center border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <Text
                            className={`font-bold text-xs ${
                              isSelected ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Blood Group */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Blood Group <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={adminForm.control}
                name="bloodGroup"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {BLOOD_GROUPS.map((bg) => {
                      const isSelected = value === bg;
                      return (
                        <TouchableOpacity
                          key={bg}
                          onPress={() => onChange(bg)}
                          className={`px-4 py-2.5 rounded-xl border-2 ${
                            isSelected
                              ? 'bg-red-600 border-red-600 shadow-sm'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <Text
                            className={`font-black text-xs ${
                              isSelected ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {bg}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            <Controller
              control={adminForm.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Admin Password"
                  required
                  isPassword
                  placeholder="Min 8 chars (1 Upper, 1 Lower, 1 Num, 1 Spec)"
                  value={value}
                  onChangeText={onChange}
                  error={adminForm.formState.errors.password?.message}
                  leftIcon={<Lock size={18} color="#64748b" />}
                />
              )}
            />

            <Controller
              control={adminForm.control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Confirm Password"
                  required
                  isPassword
                  placeholder="Re-enter password"
                  value={value}
                  onChangeText={onChange}
                  error={adminForm.formState.errors.confirmPassword?.message}
                  leftIcon={<Lock size={18} color="#64748b" />}
                />
              )}
            />

            <Button
              onPress={adminForm.handleSubmit(handleAdminSubmit)}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mt-2"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-base">Next: Select Plan</Text>
                <ArrowRight size={18} color="#fff" />
              </View>
            </Button>
          </SurfaceCard>
        )}

        {/* STEP 3: Plan Selection & Final Confirm */}
        {currentStep === 3 && (
          <View className="space-y-4 mb-6">
            {/* Plans List */}
            {(plans.length > 0
              ? plans
              : [
                  {
                    id: 1,
                    name: 'Free Starter Trial',
                    price: 0,
                    memberLimit: 50,
                    description: 'Full safety features, Geofence attendance, and SOS alerts.',
                  },
                  {
                    id: 2,
                    name: 'Pro Organization',
                    price: 999,
                    memberLimit: 250,
                    description: 'Unlimited teams, instrument inventory, priority SMS SOS.',
                  },
                ]
            ).map((plan: any) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlanId(plan.id)}
                  activeOpacity={0.9}
                >
                  <SurfaceCard
                    variant={isSelected ? 'glow' : 'default'}
                    className={`border-2 transition-all ${
                      isSelected ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200'
                    }`}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center gap-2">
                        <Crown size={20} color={isSelected ? '#2563eb' : '#64748b'} />
                        <Text className="text-lg font-black text-slate-900">{plan.name}</Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={16} color="#fff" />}
                      </View>
                    </View>

                    <Text className="text-slate-600 font-medium text-xs mb-3">
                      {plan.description}
                    </Text>

                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-2xl font-black text-slate-900">
                        ₹{plan.price || 0}
                      </Text>
                      <Text className="text-slate-500 font-bold text-xs">/ year</Text>
                    </View>

                    <View className="mt-3 pt-3 border-t border-slate-100 flex-row items-center gap-2">
                      <Zap size={14} color="#059669" />
                      <Text className="text-xs font-bold text-emerald-800">
                        Up to {plan.memberLimit || 50} active members
                      </Text>
                    </View>
                  </SurfaceCard>
                </TouchableOpacity>
              );
            })}

            {/* Summary Review Card */}
            <SurfaceCard variant="flat" className="mt-4">
              <View className="flex-row items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <ShieldCheck size={18} color="#4f46e5" />
                <Text className="text-sm font-extrabold text-slate-900">Registration Summary</Text>
              </View>

              <View className="space-y-1.5">
                <View className="flex-row justify-between">
                  <Text className="text-xs font-medium text-slate-500">Organization:</Text>
                  <Text className="text-xs font-bold text-slate-900">
                    {orgForm.getValues('name')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-medium text-slate-500">Location:</Text>
                  <Text className="text-xs font-bold text-slate-900">
                    {orgForm.getValues('city')}, {orgForm.getValues('state')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-medium text-slate-500">Admin:</Text>
                  <Text className="text-xs font-bold text-slate-900">
                    {adminForm.getValues('name')} ({adminForm.getValues('email')})
                  </Text>
                </View>
              </View>
            </SurfaceCard>

            {/* Final Submit Button */}
            <Button
              onPress={handleFinalSubmit}
              isLoading={isSubmitting}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mt-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-base">
                  Complete Registration & Launch
                </Text>
                <ArrowRight size={18} color="#fff" />
              </View>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
