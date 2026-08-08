import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Sparkles,
  ShieldAlert,
  UserCheck,
  MapPin,
  BellRing,
  PhoneCall,
  Zap,
  ShieldCheck,
  BarChart3,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Shield,
} from 'lucide-react-native';
import { useAuthSession } from '@/hooks/useAuthSession';
import { resolveDashboardPath } from '@/utils/roles';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAppTheme } from '@/context/ThemeContext';

export function HomeHeroSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const { token, user, hydrated, redirectPath } = useAuthSession();

  const isLoggedIn = Boolean(hydrated && token && user);

  const navigateToDashboard = () => {
    if (!user) return;
    const role = (user?.role || user?.currentRole || '').toLowerCase();
    if (role === 'admin' || role === 'org_admin') {
      router.push('/(drawer)/admin/dashboard' as any);
    } else if (role === 'member') {
      router.push('/(drawer)/member/dashboard' as any);
    } else {
      const nextPath =
        resolveDashboardPath(role, user?.dashboardPath || redirectPath) ||
        '/(drawer)/member/dashboard';
      let expoPath = nextPath;
      if (expoPath.startsWith('/member/dashboard')) expoPath = '/(drawer)/member/dashboard';
      if (expoPath.startsWith('/admin/dashboard') || expoPath.startsWith('/org/dashboard'))
        expoPath = '/(drawer)/admin/dashboard';
      router.push(expoPath as any);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 24) + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Navigation Bar */}
        <View className="px-4 sm:px-6 pb-4 pt-2 flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
          <View className="flex-row items-center gap-2.5 flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 items-center justify-center shrink-0">
              <Shield color={isDark ? '#38bdf8' : '#2563eb'} size={22} />
            </View>
            <View className="shrink">
              <Text className="text-slate-900 dark:text-white font-black text-base sm:text-lg tracking-tight" numberOfLines={1}>
                ढोल - ताशा <Text className="text-blue-600 dark:text-sky-400">महासंघ</Text>
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                तिची सुरक्षा पोर्टल
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 shrink-0">
            <ThemeToggle />
            {isLoggedIn ? (
              <TouchableOpacity
                onPress={navigateToDashboard}
                className="flex-row items-center gap-1.5 bg-blue-600 active:bg-blue-700 px-3.5 py-2 rounded-xl shadow-sm"
              >
                <LayoutDashboard color="#ffffff" size={15} />
                <Text className="text-white font-bold text-xs">Dashboard</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login' as any)}
                  className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:bg-slate-100 dark:active:bg-slate-800 shadow-sm"
                >
                  <LogIn color={isDark ? '#94a3b8' : '#475569'} size={14} />
                  <Text className="text-slate-700 dark:text-slate-200 font-bold text-xs">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register' as any)}
                  className="flex-row items-center gap-1 bg-blue-600 active:bg-blue-700 px-3 py-1.5 rounded-xl shadow-md shadow-blue-500/25"
                >
                  <UserPlus color="#ffffff" size={14} />
                  <Text className="text-white font-black text-xs">Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 2. Hero Section */}
        <View className="px-4 sm:px-6 pt-8 pb-6 items-center">
          {/* Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 mb-5">
            <Sparkles color={isDark ? '#38bdf8' : '#2563eb'} size={13} />
            <Text className="text-blue-700 dark:text-sky-300 text-[11px] font-bold uppercase tracking-wider text-center">
              Women Safety & Emergency SOS System
            </Text>
          </View>

          {/* Main Title */}
          <Text className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white text-center tracking-tight leading-tight">
            ढोल - ताशा
          </Text>
          <Text className="text-3xl sm:text-5xl font-black text-blue-600 dark:text-sky-400 text-center tracking-tight leading-tight mb-4">
            महासंघ
          </Text>

          {/* Subtitle */}
          <Text className="text-slate-600 dark:text-slate-300 text-center text-sm sm:text-base font-medium leading-relaxed max-w-lg mb-6 px-2">
            <Text className="text-rose-600 dark:text-rose-400 font-extrabold">'तिची सुरक्षा'</Text> द्वारे महिलांच्या सुरक्षिततेसाठी अटूट बांधिलकीसह आपल्या महासंघाला सक्षम करणे.
          </Text>

          {/* Primary CTA Buttons */}
          <View className="w-full max-w-md flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <TouchableOpacity
                onPress={navigateToDashboard}
                className="w-full flex-row items-center justify-center gap-2 bg-blue-600 active:bg-blue-700 py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/30"
              >
                <LayoutDashboard color="#ffffff" size={18} />
                <Text className="text-white font-black text-sm sm:text-base">Open Dashboard</Text>
                <ArrowRight color="#ffffff" size={16} />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register' as any)}
                  className="w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-blue-600 active:bg-blue-700 py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-500/30"
                >
                  <Text className="text-white font-black text-sm">Get Started Now</Text>
                  <ArrowRight color="#ffffff" size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login' as any)}
                  className="w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 py-3.5 px-5 rounded-2xl active:bg-slate-100 dark:active:bg-slate-800 shadow-sm"
                >
                  <LogIn color={isDark ? '#ffffff' : '#0f172a'} size={16} />
                  <Text className="text-slate-900 dark:text-white font-black text-sm">Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 3. "सिस्टम कसे कार्य करते?" Quick Overview Box */}
        <View className="px-3 sm:px-5 mt-4">
          <View className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
            {/* Header */}
            <View className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
              <View className="flex-row items-center justify-between gap-2 mb-2">
                <View className="flex-row items-center gap-2.5 flex-1">
                  <View className="w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-blue-500/20 border border-blue-500/30 dark:border-blue-500/40 items-center justify-center shrink-0">
                    <Sparkles color={isDark ? '#38bdf8' : '#2563eb'} size={20} />
                  </View>
                  <Text className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight shrink">
                    सिस्टम कसे कार्य करते?
                  </Text>
                </View>

                <View className="flex-row items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 shrink-0">
                  <ShieldAlert color={isDark ? '#38bdf8' : '#2563eb'} size={12} />
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                    Safety
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-0.5">
                How this feature works — Quick Overview
              </Text>
            </View>

            {/* 4 Feature Cards Grid */}
            <View className="space-y-3">
              {/* Card 1: Auto-fill profile */}
              <View className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 mb-2.5">
                <View className="flex-row items-start gap-3">
                  <View className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 items-center justify-center shrink-0 mt-0.5">
                    <UserCheck color="#3b82f6" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      ऑटो-फील प्रोफाइल
                    </Text>
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      तुमचे नाव, ईमेल, फोन नंबर आणि संस्था (Org Name/ID) आपोआप प्रदर्शित होतात.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 2: Live GPS Location */}
              <View className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 mb-2.5">
                <View className="flex-row items-start gap-3">
                  <View className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center shrink-0 mt-0.5">
                    <MapPin color="#10b981" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Live GPS Location
                    </Text>
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      Device Geolocation API द्वारे तुमचे अचूक अक्षांश व रेखांश मिळवून Google Maps लिंक तयार केली जाते.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 3: Instant Email Alert */}
              <View className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 mb-2.5">
                <View className="flex-row items-start gap-3">
                  <View className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 items-center justify-center shrink-0 mt-0.5">
                    <BellRing color="#f59e0b" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      तात्काळ ईमेल अलर्ट
                    </Text>
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      SOS बटण दाबल्यावर सुरक्षित सर्व्हिस द्वारे तुमचा लोकेशन Admin ला आणि Support टीमला त्वरित ईमेल पाठवला जातो.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 4: Direct Call & WhatsApp */}
              <View className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 mb-2.5">
                <View className="flex-row items-start gap-3">
                  <View className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall color="#f43f5e" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      थेट कॉल व मेसेज
                    </Text>
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      Direct Call व WhatsApp शेअर लिंकद्वारे तुम्ही एका क्लिकवर तुमच्या जवळच्या व्यक्तींना माहिती पाठवू शकता.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick SOS Action Link */}
            <View className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Shield color="#f43f5e" size={14} />
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Emergency SOS Ready
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(drawer)/sos' as any)}
                className="flex-row items-center gap-1 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-xl active:bg-rose-500/25"
              >
                <Text className="text-rose-600 dark:text-rose-300 font-bold text-xs">Open SOS</Text>
                <ArrowRight color="#f43f5e" size={12} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Why ढोल - ताशा महासंघ? Feature Grid */}
        <View className="px-4 sm:px-6 mt-10">
          <View className="items-center mb-6">
            <Text className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center mb-1.5 tracking-tight">
              Why ढोल - ताशा महासंघ?
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-sky-400 text-center">
              Built for women safety & rapid response
            </Text>
          </View>

          <View className="space-y-3">
            {/* Feature 1 */}
            <View className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 mb-3 shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 items-center justify-center mb-3">
                <Zap color={isDark ? '#38bdf8' : '#2563eb'} size={20} />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-white mb-1">Instant Emergency SOS</Text>
              <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                एका क्लिकवर 3-सेकंदात आपत्कालीन SOS अलर्ट सुरू करा आणि थेट लाइव्ह GPS लोकेशन शेअर करा.
              </Text>
            </View>

            {/* Feature 2 */}
            <View className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 mb-3 shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 items-center justify-center mb-3">
                <ShieldCheck color="#6366f1" size={20} />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-white mb-1">Secure Organization Access</Text>
              <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                प्रत्येक संस्था आणि पथकासाठी सुरक्षित डेटा, सदस्य संपर्क आणि अधिकृत व्यवस्थापन.
              </Text>
            </View>

            {/* Feature 3 */}
            <View className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 mb-3 shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-3">
                <BarChart3 color="#10b981" size={20} />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-white mb-1">Automated Incident Alerting</Text>
              <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                संकटसमयी आपत्कालीन संपर्कांना आणि एडमिन टीमला त्वरित ईमेल व व्हॉट्सॲप सूचना.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Spotlight & Live Stats Banner */}
        <View className="px-3 sm:px-5 mt-8">
          <View className="rounded-3xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-slate-900 p-5">
            <View className="items-center mb-4">
              <Text className="text-lg sm:text-xl font-black text-slate-900 dark:text-white text-center leading-snug mb-3">
                महिला सुरक्षा आणि सक्षमीकरण,{'\n'}आमचे सर्वोच्च प्राधान्य.
              </Text>

              {/* Tag Chips */}
              <View className="flex-row flex-wrap justify-center gap-1.5 mb-4">
                {['Live SOS', 'GPS Tracking', 'Direct Call', 'Verified Teams'].map((tag) => (
                  <View
                    key={tag}
                    className="bg-blue-500/15 border border-blue-500/30 rounded-full px-2.5 py-1"
                  >
                    <Text className="text-blue-700 dark:text-blue-300 font-bold text-[9px] uppercase tracking-wider">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats Grid */}
            <View className="bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <View className="flex-row justify-between mb-3">
                <View className="items-center flex-1">
                  <Text className="text-xl font-black text-slate-900 dark:text-white">50K+</Text>
                  <Text className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                    Protected Alerts
                  </Text>
                </View>
                <View className="w-px bg-slate-200 dark:bg-slate-800 h-8 self-center" />
                <View className="items-center flex-1">
                  <Text className="text-xl font-black text-slate-900 dark:text-white">100+</Text>
                  <Text className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                    Organizations
                  </Text>
                </View>
              </View>

              <View className="w-full bg-slate-200 dark:bg-slate-800/80 h-px my-1" />

              <View className="flex-row justify-between mt-3">
                <View className="items-center flex-1">
                  <Text className="text-xl font-black text-emerald-600 dark:text-emerald-400">99.9%</Text>
                  <Text className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                    Uptime
                  </Text>
                </View>
                <View className="w-px bg-slate-200 dark:bg-slate-800 h-8 self-center" />
                <View className="items-center flex-1">
                  <Text className="text-xl font-black text-blue-600 dark:text-sky-400">24/7</Text>
                  <Text className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                    Support
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6. Footer */}
        <View className="px-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 items-center">
          <Text className="text-slate-600 dark:text-slate-400 font-bold text-xs text-center mb-1">
            ढोल - ताशा महासंघ © 2026
          </Text>
          <Text className="text-slate-500 text-[10px] text-center font-medium">
            'तिची सुरक्षा' - Women Safety & Emergency SOS Portal
          </Text>

          <View className="flex-row flex-wrap items-center justify-center gap-3 mt-4">
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Sign In</Text>
            </TouchableOpacity>
            <Text className="text-slate-400 dark:text-slate-700">•</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text className="text-slate-600 dark:text-slate-400 font-semibold text-xs">Create Account</Text>
            </TouchableOpacity>
            <Text className="text-slate-400 dark:text-slate-700">•</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/sos' as any)}>
              <Text className="text-rose-600 dark:text-rose-400 font-semibold text-xs">Emergency SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
