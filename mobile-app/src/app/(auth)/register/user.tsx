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
  User,
  Mail,
  Lock,
  MapPin,
  Link2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react-native';

import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { CountryPhoneField } from '@/components/ui/CountryPhoneField';
import { BadgePill } from '@/components/ui/BadgePill';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import {
  useJoinOrganizationMutation,
  useValidateReferralCodeQuery,
} from '@/services/api/authApi';
import { setSession } from '@/store/slices/authSlice';
import {
  PERSON_NAME_REGEX,
  PLACE_NAME_REGEX,
  PHONE_DIGIT_MIN,
  PHONE_DIGIT_MAX,
  normalizeEmailInput,
  normalizeTextInput,
  toDigitsOnly,
  isNotCommonEmailTypo,
} from '@/utils/formValidation';

const userSchema = z
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
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
    bloodGroup: z.string().trim().min(1, 'Blood Group is required'),
    city: z
      .string()
      .trim()
      .min(1, 'City is required')
      .max(80, 'City is too long')
      .regex(PLACE_NAME_REGEX, 'Enter a valid city'),
    emergencyContact: z
      .string()
      .trim()
      .refine(
        (value) => toDigitsOnly(value).length >= PHONE_DIGIT_MIN,
        'Emergency contact number is too short'
      )
      .refine(
        (value) => toDigitsOnly(value).length <= PHONE_DIGIT_MAX,
        'Emergency contact number is too long'
      ),
    currentAddress: z
      .string()
      .trim()
      .min(5, 'Current address is required')
      .max(191, 'Current address is too long'),
    permanentAddress: z
      .string()
      .trim()
      .min(5, 'Permanent address is required')
      .max(191, 'Permanent address is too long'),
    referralCode: z
      .string()
      .trim()
      .min(1, 'Referral code is required')
      .regex(/^REF-[A-Za-z0-9]{8}$/i, 'Referral code format should be REF-XXXXXXXX'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type UserFormValues = z.infer<typeof userSchema>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
] as const;

export default function UserRegister() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useLocalSearchParams<{ ref?: string }>();

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [sameAddress, setSameAddress] = useState(true);

  const [joinOrganization, { isLoading: isSubmitting }] = useJoinOrganizationMutation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      mobileCountryCode: '+91',
      mobile: '',
      password: '',
      confirmPassword: '',
      gender: 'MALE',
      bloodGroup: 'O+',
      city: '',
      emergencyContact: '',
      currentAddress: '',
      permanentAddress: '',
      referralCode: searchParams.ref || '',
    },
  });

  const referralCode = watch('referralCode');
  const currentAddress = watch('currentAddress');

  const { data: referralValidation, isFetching: isValidatingRef } =
    useValidateReferralCodeQuery(referralCode, {
      skip: !referralCode || !/^REF-[A-Za-z0-9]{8}$/i.test(referralCode),
    });

  useEffect(() => {
    if (searchParams.ref) {
      setValue('referralCode', searchParams.ref, { shouldValidate: true });
    }
  }, [searchParams.ref, setValue]);

  useEffect(() => {
    if (sameAddress && currentAddress) {
      setValue('permanentAddress', currentAddress, { shouldValidate: true });
    }
  }, [sameAddress, currentAddress, setValue]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const payload = {
        ...values,
        name: normalizeTextInput(values.name),
        email: normalizeEmailInput(values.email),
        city: normalizeTextInput(values.city),
        mobile: toDigitsOnly(values.mobile),
        emergencyContact: toDigitsOnly(values.emergencyContact),
        currentAddress: normalizeTextInput(values.currentAddress),
        permanentAddress: normalizeTextInput(values.permanentAddress),
      };

      const normalizedReferralCode = values.referralCode.trim().toUpperCase();

      const response = await joinOrganization({
        referralCode: normalizedReferralCode,
        data: payload,
      }).unwrap();

      if (response?.user && response?.token) {
        dispatch(setSession(response));
      }

      setSubmitSuccess(response?.message || 'Successfully joined organization!');

      setTimeout(() => {
        router.replace('/(drawer)/member/dashboard');
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="px-5 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 mb-6 self-start bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <Text className="text-blue-600 font-bold text-sm">← Back to Options</Text>
        </TouchableOpacity>

        {/* Header Title Section */}
        <View className="mb-6">
          <BadgePill label="Member Registration" variant="member" className="mb-2.5" />
          <Text className="text-3xl font-black text-slate-900 tracking-tight">
            Join Your Team
          </Text>
          <Text className="text-slate-500 font-medium text-sm mt-1">
            Register with your organization's referral code
          </Text>
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
            <Text className="text-emerald-700 font-semibold text-xs flex-1">
              {submitSuccess}
            </Text>
          </View>
        ) : null}

        {/* Section 1: Referral Code Card */}
        <SurfaceCard variant="glow" className="mb-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Link2 size={20} color="#4f46e5" />
            <Text className="text-base font-extrabold text-slate-900">Referral Code</Text>
          </View>

          <Controller
            control={control}
            name="referralCode"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="REF-XXXXXXXX"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                error={errors.referralCode?.message}
                autoCapitalize="characters"
                leftIcon={<Link2 size={18} color="#64748b" />}
                helpText="Enter the 8-digit referral code provided by your organization admin."
              />
            )}
          />

          {isValidatingRef && (
            <View className="flex-row items-center gap-2 mt-1">
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text className="text-xs font-semibold text-indigo-600">Verifying code...</Text>
            </View>
          )}

          {referralValidation?.organization && (
            <View className="mt-2 flex-row items-center gap-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
              <Building2 size={20} color="#059669" />
              <View className="flex-1">
                <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Verified Organization
                </Text>
                <Text className="text-sm font-extrabold text-emerald-950">
                  {referralValidation.organization.name}
                </Text>
              </View>
              <CheckCircle2 size={20} color="#059669" />
            </View>
          )}
        </SurfaceCard>

        {/* Section 2: Personal Profile Details */}
        <SurfaceCard className="mb-5">
          <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <User size={20} color="#3b82f6" />
            <Text className="text-base font-extrabold text-slate-900">Personal Information</Text>
          </View>

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Full Name"
                required
                placeholder="e.g. Rahul Sharma"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                leftIcon={<User size={18} color="#64748b" />}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email Address"
                required
                placeholder="rahul@example.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                leftIcon={<Mail size={18} color="#64748b" />}
              />
            )}
          />

          {/* Mobile */}
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, value } }) => (
              <Controller
                control={control}
                name="mobileCountryCode"
                render={({ field: { onChange: onCodeChange, value: codeValue } }) => (
                  <CountryPhoneField
                    label="Mobile Number"
                    required
                    countryCode={codeValue}
                    phone={value}
                    onCountryCodeChange={onCodeChange}
                    onPhoneChange={onChange}
                    phoneError={errors.mobile?.message}
                  />
                )}
              />
            )}
          />

          {/* Gender Selector */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Gender <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
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
            {errors.gender && (
              <Text className="text-red-500 text-xs font-medium mt-1 ml-1">
                {errors.gender.message}
              </Text>
            )}
          </View>

          {/* Blood Group Selector */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Blood Group <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
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
            {errors.bloodGroup && (
              <Text className="text-red-500 text-xs font-medium mt-1 ml-1">
                {errors.bloodGroup.message}
              </Text>
            )}
          </View>
        </SurfaceCard>

        {/* Section 3: Safety & Emergency Information */}
        <SurfaceCard className="mb-5">
          <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <ShieldCheck size={20} color="#ef4444" />
            <Text className="text-base font-extrabold text-slate-900">
              Safety & Emergency Contact
            </Text>
          </View>

          <Controller
            control={control}
            name="emergencyContact"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Emergency Contact Number"
                required
                placeholder="Parent / Guardian / Spouse Number"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.emergencyContact?.message}
                helpText="This number is instantly alerted when you trigger तिची सुरक्षा SOS."
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="City"
                required
                placeholder="e.g. Pune"
                value={value}
                onChangeText={onChange}
                error={errors.city?.message}
                leftIcon={<MapPin size={18} color="#64748b" />}
              />
            )}
          />

          <Controller
            control={control}
            name="currentAddress"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Current Address"
                required
                placeholder="Flat / Street / Area"
                value={value}
                onChangeText={onChange}
                error={errors.currentAddress?.message}
              />
            )}
          />

          {/* Same as current toggle */}
          <TouchableOpacity
            onPress={() => {
              const nextVal = !sameAddress;
              setSameAddress(nextVal);
              if (nextVal && currentAddress) {
                setValue('permanentAddress', currentAddress, { shouldValidate: true });
              }
            }}
            className="flex-row items-center gap-2.5 mb-4 ml-1"
          >
            <View
              className={`w-5 h-5 rounded-md items-center justify-center border ${
                sameAddress ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
              }`}
            >
              {sameAddress && <CheckCircle2 size={14} color="#fff" />}
            </View>
            <Text className="text-xs font-bold text-slate-700">
              Permanent address is same as current address
            </Text>
          </TouchableOpacity>

          {!sameAddress && (
            <Controller
              control={control}
              name="permanentAddress"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Permanent Address"
                  required
                  placeholder="Native place / Home town address"
                  value={value}
                  onChangeText={onChange}
                  error={errors.permanentAddress?.message}
                />
              )}
            />
          )}
        </SurfaceCard>

        {/* Section 4: Account Security */}
        <SurfaceCard className="mb-6">
          <View className="flex-row items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Lock size={20} color="#4f46e5" />
            <Text className="text-base font-extrabold text-slate-900">Security & Password</Text>
          </View>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Password"
                required
                isPassword
                placeholder="Min 8 characters (1 Upper, 1 Lower, 1 Num, 1 Spec)"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                leftIcon={<Lock size={18} color="#64748b" />}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Confirm Password"
                required
                isPassword
                placeholder="Re-enter password"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                leftIcon={<Lock size={18} color="#64748b" />}
              />
            )}
          />
        </SurfaceCard>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          size="lg"
          className="bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-8"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-white font-extrabold text-base">Complete Member Setup</Text>
            <ArrowRight size={18} color="#fff" />
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
