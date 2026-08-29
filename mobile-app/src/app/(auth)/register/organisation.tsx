import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppFooter } from '@/components/layout/Footer';
import { useAppTheme } from '@/context/ThemeContext';
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
    .min(2, 'Organization name must be at least 2 characters')
    .max(150, 'Organization name is too long')
    .regex(
      ORGANIZATION_NAME_REGEX,
      'Organization name can only contain letters, numbers, spaces, and standard punctuation'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .refine(isNotCommonEmailTypo, {
      message: 'Did you mean .com or .co.in? Please enter a valid email address.',
    }),
  phoneCountryCode: z.string().regex(/^\+\d{1,3}$/, 'Select a valid country code'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        const digits = toDigitsOnly(val);
        return digits.length >= PHONE_DIGIT_MIN && digits.length <= PHONE_DIGIT_MAX;
      },
      {
        message: `Phone number must be between ${PHONE_DIGIT_MIN} and ${PHONE_DIGIT_MAX} digits`,
      }
    ).optional(),
  address: z
    .string()
    .trim()
    .max(250, 'Address is too long').optional(),
  city: z
    .string()
    .trim()
    .max(80, 'City is too long')
    .regex(PLACE_NAME_REGEX, 'City name contains invalid characters').optional(),
  state: z
    .string()
    .trim()
    .max(80, 'State is too long')
    .regex(PLACE_NAME_REGEX, 'State name contains invalid characters').optional(),
  country: z
    .string()
    .trim()
    .max(80, 'Country is too long').optional(),
});

// --- Step 2 Schema: Admin Details ---
const adminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Admin full name is required')
      .max(120, 'Name is too long')
      .regex(
        PERSON_NAME_REGEX,
        'Name can only contain letters, spaces, apostrophes, dots, or hyphens'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .refine(isNotCommonEmailTypo, {
        message: 'Did you mean .com or .co.in? Please enter a valid email address.',
      }),
    mobileCountryCode: z.string().regex(/^\+\d{1,3}$/, 'Select a valid country code'),
    mobile: z
      .string()
      .trim()
      .refine(
        (val) => {
          if (!val) return true;
          const digits = toDigitsOnly(val);
          return digits.length >= PHONE_DIGIT_MIN && digits.length <= PHONE_DIGIT_MAX;
        },
        {
          message: `Mobile number must be between ${PHONE_DIGIT_MIN} and ${PHONE_DIGIT_MAX} digits`,
        }
      ).optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_-])[A-Za-z\d@$!%*?&#^~_-]{8,}$/,
        'Password must contain upper, lower, number and special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    city: z.string().trim().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    bloodGroup: z
      .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'])
      .optional(),
    role: z.string().default(ROLES.ORG_ADMIN),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type OrgFormValues = z.infer<typeof orgSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

const GENDERS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterOrganisationScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ partnerRef?: string }>();
  const dispatch = useDispatch();
  const { isDark } = useAppTheme();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(1);
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
      gender: undefined,
      bloodGroup: undefined,
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
    if (!adminForm.getValues('city')) {
      adminForm.setValue('city', values.city);
    }
    setCurrentStep(2);
  };

  // Handle Step 2 Final Submit
  const handleAdminSubmit = async (values: AdminFormValues) => {
    await setRegistrationDraft(REGISTRATION_DRAFT_KEYS.admin, values);
    handleFinalSubmit();
  };

  // Handle Final Submission
  const handleFinalSubmit = async () => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const orgValues = orgForm.getValues();
      const adminValues = adminForm.getValues();

      const payload = {
        org: {
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
        'Registration failed. Please check your information.';
      setSubmitError(errorMsg);
      if (Platform.OS !== 'web') {
        Alert.alert('Registration Failed', errorMsg);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
          className="px-5 pt-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Top Header: Back Button & ThemeToggle */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as any);
              } else {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(auth)/register');
                }
              }
            }}
            className="flex-row items-center gap-1.5 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <ArrowLeft size={16} color={isDark ? '#38bdf8' : '#2563eb'} />
            <Text className="text-blue-600 dark:text-sky-400 font-bold text-sm">
              {currentStep === 1 ? 'Back to Options' : `Back to Step ${currentStep - 1}`}
            </Text>
          </TouchableOpacity>
          <ThemeToggle />
        </View>

        {/* Header Title Section */}
        <View className="mb-4">
          <BadgePill
            label={`Step ${currentStep} of 2 • ${
              currentStep === 1 ? 'Org Profile' : 'Admin Account'
            }`}
            variant="primary"
            className="mb-2.5"
          />
          <Text className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentStep === 1
              ? 'Register Organization'
              : 'Admin Account Credentials'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
            {currentStep === 1
              ? 'Enter your band or organization official details'
              : 'Create the primary admin credentials to manage your team'}
          </Text>
        </View>

        {/* Multi-step progress bar */}
        <View className="flex-row items-center gap-2 mb-6">
          {[1, 2].map((step) => (
            <View
              key={step}
              className={`h-2 flex-1 rounded-full ${
                currentStep >= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </View>

        {/* Error / Success Notifications */}
        {submitError ? (
          <View className="mb-5 flex-row items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 rounded-2xl">
            <AlertCircle size={20} color="#ef4444" />
            <Text className="text-red-700 dark:text-red-400 font-semibold text-xs flex-1">{submitError}</Text>
          </View>
        ) : null}

        {submitSuccess ? (
          <View className="mb-5 flex-row items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl">
            <CheckCircle2 size={20} color="#10b981" />
            <Text className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex-1">{submitSuccess}</Text>
          </View>
        ) : null}

        {/* STEP 1: Organization Details */}
        {currentStep === 1 && (
          <SurfaceCard className="mb-6">
            <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Building2 size={20} color="#2563eb" />
              <Text className="text-base font-extrabold text-slate-900 dark:text-white">Organization Profile</Text>
            </View>

            <Controller
              control={orgForm.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Organization Name"
                  required
                  placeholder="Enter organization name"
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
                  placeholder="Enter official email address"
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
                      label="Contact Phone Number (Optional)"

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
                      label="City (Optional)"

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
                      label="State (Optional)"

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
                  label="Country (Optional)"

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
                  label="Official Practice / Office Address (Optional)"

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
            <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User size={20} color="#4f46e5" />
              <Text className="text-base font-extrabold text-slate-900 dark:text-white">Admin Account Info</Text>
            </View>

            <Controller
              control={adminForm.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Admin Full Name"
                  required
                  placeholder="Enter admin full name"
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
                      label="Admin Mobile Number (Optional)"

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
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">
                Gender <Text className="text-slate-400 font-normal text-xs">(Optional)</Text>
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
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Text
                            className={`font-bold text-xs ${
                              isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
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
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">
                Blood Group <Text className="text-slate-400 font-normal text-xs">(Optional)</Text>
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
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Text
                            className={`font-black text-xs ${
                              isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
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
              isLoading={isSubmitting}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mt-2"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-base">Complete Registration</Text>
                <ArrowRight size={18} color="#fff" />
              </View>
            </Button>
          </SurfaceCard>
        )}

        <View className="mt-8">
          <AppFooter />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
