import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
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
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import { useAuthSession } from '@/hooks/useAuthSession';
import { resolveDashboardPath } from '@/utils/roles';

export function HomeHeroSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { token, user, hydrated, redirectPath } = useAuthSession();

  const isLoggedIn = Boolean(hydrated && token && user);
  const isLargeScreen = width >= 768;

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
    <View style={{ flex: 1, backgroundColor: '#070e1e' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24) + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Navigation Bar */}
        <View className="px-5 pb-6 pt-2 flex-row items-center justify-between border-b border-slate-800/80">
          <View className="flex-row items-center gap-2">
            <View className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 items-center justify-center">
              <Shield color="#38bdf8" size={20} />
            </View>
            <View>
              <Text className="text-white font-black text-lg tracking-tight">
                ढोल - ताशा <Text className="text-sky-400">महासंघ</Text>
              </Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                तिची सुरक्षा पोर्टल
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2.5">
            {isLoggedIn ? (
              <TouchableOpacity
                onPress={navigateToDashboard}
                className="flex-row items-center gap-1.5 bg-blue-600 active:bg-blue-700 px-4 py-2 rounded-xl"
              >
                <LayoutDashboard color="#ffffff" size={16} />
                <Text className="text-white font-bold text-xs">Dashboard</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login' as any)}
                  className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 active:bg-slate-800"
                >
                  <LogIn color="#94a3b8" size={15} />
                  <Text className="text-slate-200 font-bold text-xs">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register' as any)}
                  className="flex-row items-center gap-1.5 bg-blue-600 active:bg-blue-700 px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/25"
                >
                  <UserPlus color="#ffffff" size={15} />
                  <Text className="text-white font-black text-xs">Get Started</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 2. Hero Section */}
        <View className="px-5 pt-10 pb-8 items-center text-center">
          {/* Badge */}
          <View className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <Sparkles color="#38bdf8" size={14} />
            <Text className="text-sky-300 text-xs font-bold uppercase tracking-wider">
              Women Safety & Emergency SOS System
            </Text>
          </View>

          {/* Main Title */}
          <Text className="text-4xl sm:text-5xl md:text-6xl font-black text-white text-center tracking-tight leading-tight mb-2">
            ढोल - ताशा
          </Text>
          <Text className="text-4xl sm:text-5xl md:text-6xl font-black text-sky-400 text-center tracking-tight leading-tight mb-6">
            महासंघ
          </Text>

          {/* Subtitle */}
          <Text className="text-slate-300 text-center text-base sm:text-lg font-medium leading-relaxed max-w-xl px-2 mb-8">
            <Text className="text-rose-400 font-extrabold">'तिची सुरक्षा'</Text> द्वारे महिलांच्या सुरक्षिततेसाठी अटूट बांधिलकीसह आपल्या महासंघाला सक्षम करणे.
          </Text>

          {/* Primary CTA Buttons */}
          <View className="w-full flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md">
            {isLoggedIn ? (
              <TouchableOpacity
                onPress={navigateToDashboard}
                className="w-full flex-row items-center justify-center gap-2.5 bg-blue-600 active:bg-blue-700 py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/30"
              >
                <LayoutDashboard color="#ffffff" size={20} />
                <Text className="text-white font-black text-base">Open Dashboard</Text>
                <ArrowRight color="#ffffff" size={18} />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register/organisation' as any)}
                  className="w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-blue-600 active:bg-blue-700 py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30"
                >
                  <Text className="text-white font-black text-base">Get Started Now</Text>
                  <ArrowRight color="#ffffff" size={18} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login' as any)}
                  className="w-full sm:flex-1 flex-row items-center justify-center gap-2 bg-slate-900/90 border-2 border-slate-700 py-4 px-6 rounded-2xl active:bg-slate-800"
                >
                  <LogIn color="#ffffff" size={18} />
                  <Text className="text-white font-black text-base">Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 3. "सिस्टम कसे कार्य करते?" Quick Overview Box (Exact UI from Web Client) */}
        <View className="px-4 mt-6">
          <View className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-2xl">
            {/* Header */}
            <View className="flex-col sm:flex-row items-start sm:items-center justify-between pb-5 mb-5 border-b border-slate-800/80 gap-3">
              <View className="flex-row items-center gap-3.5">
                <View className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 items-center justify-center shadow-sm">
                  <Sparkles color="#38bdf8" size={24} />
                </View>
                <View>
                  <Text className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    सिस्टम कसे कार्य करते?
                  </Text>
                  <Text className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
                    How this feature works — Quick Overview
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5">
                <ShieldAlert color="#38bdf8" size={14} />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                  Safety & Security
                </Text>
              </View>
            </View>

            {/* 4 Feature Cards Grid */}
            <View className="flex-col md:flex-row flex-wrap gap-4">
              {/* Card 1: Auto-fill profile */}
              <View className="w-full md:w-[48%] rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 sm:p-5">
                <View className="flex-row items-start gap-3.5">
                  <View className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 items-center justify-center shrink-0">
                    <UserCheck color="#60a5fa" size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-white mb-1.5">
                      ऑटो-फील प्रोफाइल
                    </Text>
                    <Text className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                      तुमचे नाव, ईमेल, फोन नंबर आणि संस्था (Org Name/ID) आपोआप प्रदर्शित होतात.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 2: Live GPS Location */}
              <View className="w-full md:w-[48%] rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 sm:p-5">
                <View className="flex-row items-start gap-3.5">
                  <View className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center shrink-0">
                    <MapPin color="#34d399" size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-white mb-1.5">
                      Live GPS Location
                    </Text>
                    <Text className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                      Device Geolocation API द्वारे तुमचे अचूक अक्षांश व रेखांश मिळवून Google Maps लिंक तयार केली जाते.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 3: Instant Email Alert */}
              <View className="w-full md:w-[48%] rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 sm:p-5">
                <View className="flex-row items-start gap-3.5">
                  <View className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 items-center justify-center shrink-0">
                    <BellRing color="#fbbf24" size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-white mb-1.5">
                      तात्काळ ईमेल अलर्ट
                    </Text>
                    <Text className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                      SOS बटण दाबल्यावर सुरक्षित ईमेल सर्व्हिस द्वारे तुमचा लोकेशन Admin ला आणि Support टीमला त्वरित ईमेल पाठवला जातो.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 4: Direct Call & WhatsApp */}
              <View className="w-full md:w-[48%] rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 sm:p-5">
                <View className="flex-row items-start gap-3.5">
                  <View className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 items-center justify-center shrink-0">
                    <PhoneCall color="#fb7185" size={22} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-white mb-1.5">
                      थेट कॉल व मेसेज
                    </Text>
                    <Text className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                      Direct Call व WhatsApp शेअर लिंकद्वारे तुम्ही एका क्लिकवर तुमच्या जवळच्या व्यक्तींना माहिती पाठवू शकता.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick SOS Action Link */}
            <View className="mt-5 pt-4 border-t border-slate-800/60 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Shield color="#f43f5e" size={16} />
                <Text className="text-slate-400 text-xs font-semibold">
                  Emergency SOS ready on mobile
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(drawer)/sos' as any)}
                className="flex-row items-center gap-1 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-xl active:bg-rose-500/25"
              >
                <Text className="text-rose-300 font-bold text-xs">Open SOS</Text>
                <ArrowRight color="#fb7185" size={14} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Why ढोल - ताशा महासंघ? Feature Grid */}
        <View className="px-5 mt-14">
          <View className="items-center mb-8">
            <Text className="text-2xl sm:text-3xl font-black text-white text-center mb-2 tracking-tight">
              Why ढोल - ताशा महासंघ?
            </Text>
            <Text className="text-[11px] font-bold uppercase tracking-widest text-sky-400 text-center">
              Built for women safety, trust & rapid response
            </Text>
          </View>

          <View className="space-y-4">
            {/* Feature 1 */}
            <View className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <View className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 items-center justify-center mb-4">
                <Zap color="#38bdf8" size={24} />
              </View>
              <Text className="text-xl font-black text-white mb-2">Instant Emergency SOS</Text>
              <Text className="text-slate-300 text-sm font-medium leading-relaxed">
                एका क्लिकवर 3-सेकंदात आपत्कालीन SOS अलर्ट सुरू करा आणि थेट लाइव्ह GPS लोकेशन शेअर करा.
              </Text>
            </View>

            {/* Feature 2 */}
            <View className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 mt-4">
              <View className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 items-center justify-center mb-4">
                <ShieldCheck color="#818cf8" size={24} />
              </View>
              <Text className="text-xl font-black text-white mb-2">Secure Organization Access</Text>
              <Text className="text-slate-300 text-sm font-medium leading-relaxed">
                प्रत्येक संस्था आणि पथकासाठी सुरक्षित डेटा, सदस्य संपर्क आणि अधिकृत व्यवस्थापन.
              </Text>
            </View>

            {/* Feature 3 */}
            <View className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 mt-4">
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-4">
                <BarChart3 color="#34d399" size={24} />
              </View>
              <Text className="text-xl font-black text-white mb-2">Automated Incident Alerting</Text>
              <Text className="text-slate-300 text-sm font-medium leading-relaxed">
                संकटसमयी आपत्कालीन संपर्कांना आणि एडमिन टीमला त्वरित ईमेल व व्हॉट्सॲप सूचना.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Spotlight & Live Stats Banner */}
        <View className="px-4 mt-14">
          <View className="relative overflow-hidden rounded-[2.5rem] border border-blue-900/50 bg-slate-900 p-6 sm:p-8">
            <View className="items-center mb-6">
              <Text className="text-2xl sm:text-3xl font-black text-white text-center leading-tight mb-4">
                महिला सुरक्षा आणि सक्षमीकरण,{'\n'}आमचे सर्वोच्च प्राधान्य.
              </Text>

              {/* Tag Chips */}
              <View className="flex-row flex-wrap justify-center gap-2 mb-6">
                {['Live SOS', 'GPS Tracking', 'Direct Call', 'Verified Teams'].map((tag) => (
                  <View
                    key={tag}
                    className="bg-blue-500/15 border border-blue-500/30 rounded-full px-3.5 py-1.5"
                  >
                    <Text className="text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats Grid */}
            <View className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 mb-6">
              <View className="flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-white">50K+</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Protected Alerts
                  </Text>
                </View>
                <View className="w-px bg-slate-800 h-10 self-center" />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-white">100+</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Organizations
                  </Text>
                </View>
              </View>

              <View className="w-full bg-slate-800/80 h-px my-1" />

              <View className="flex-row justify-between mt-4">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-emerald-400">99.9%</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Uptime
                  </Text>
                </View>
                <View className="w-px bg-slate-800 h-10 self-center" />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-black text-sky-400">24/7</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Support
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6. Footer */}
        <View className="px-5 mt-14 pt-8 border-t border-slate-800/80 items-center">
          <Text className="text-slate-400 font-bold text-xs text-center mb-2">
            ढोल - ताशा महासंघ © 2026
          </Text>
          <Text className="text-slate-500 text-[11px] text-center font-medium">
            'तिची सुरक्षा' - Women Safety & Emergency SOS Portal
          </Text>

          <View className="flex-row flex-wrap items-center justify-center gap-4 mt-5">
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text className="text-slate-400 font-semibold text-xs">Sign In</Text>
            </TouchableOpacity>
            <Text className="text-slate-700">•</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text className="text-slate-400 font-semibold text-xs">Create Account</Text>
            </TouchableOpacity>
            <Text className="text-slate-700">•</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/sos' as any)}>
              <Text className="text-rose-400 font-semibold text-xs">Emergency SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
