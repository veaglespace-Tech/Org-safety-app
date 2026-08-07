import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, router, usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  LayoutDashboard,
  Shield,
  User,
  LogOut,
  Settings,
} from 'lucide-react-native';
import { logout } from '@/store/slices/authSlice';
import { ROLES, formatRoleLabel } from '@/utils/roles';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function CustomDrawerContent(props: any) {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { isDark } = useAppTheme();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/');
  };

  const role = user?.role || ROLES.MEMBER;
  const isAdmin =
    role === 'admin' ||
    role === ROLES.ORG_ADMIN ||
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.SUB_ADMIN;

  const dashboardRoute = isAdmin
    ? '/(drawer)/admin/dashboard'
    : '/(drawer)/member/dashboard';

  const navItems = [
    {
      label: 'Dashboard',
      route: dashboardRoute,
      icon: LayoutDashboard,
      color: '#3b82f6',
    },
    {
      label: 'तिची सुरक्षा',
      route: '/(drawer)/sos',
      icon: Shield,
      color: '#ef4444',
    },
    {
      label: 'Profile Settings',
      route: '/(drawer)/profile',
      icon: Settings,
      color: '#94a3b8',
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#070e1e' : '#ffffff',
      }}
    >
      {/* User Profile Header */}
      <View
        className={`px-5 pt-14 pb-6 border-b ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View
            className={`w-14 h-14 rounded-2xl overflow-hidden items-center justify-center border-2 ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {user?.profilePhoto || user?.profile_photo ? (
              <Image
                source={{ uri: user.profilePhoto || user.profile_photo }}
                style={{ width: 56, height: 56 }}
              />
            ) : (
              <User color={isDark ? '#94a3b8' : '#64748b'} size={28} />
            )}
          </View>
          <View className="flex-1">
            <Text
              className={`font-black text-lg ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              numberOfLines={1}
            >
              {user?.name || 'User'}
            </Text>
            <Text
              className={`text-xs font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
              numberOfLines={1}
            >
              {user?.email}
            </Text>
            <View
              className={`mt-1 self-start px-2 py-0.5 rounded-md border ${
                isDark
                  ? 'bg-blue-600/20 border-blue-500/30'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                {formatRoleLabel(user?.role)}
              </Text>
            </View>
          </View>
        </View>

        {(user?.organization?.name || user?.organizations?.name) && (
          <View
            className={`mt-3.5 flex-row items-center gap-2 rounded-xl px-3 py-2 border ${
              isDark
                ? 'bg-slate-800/90 border-slate-700'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {user?.organization?.logo || user?.organizations?.logo ? (
              <Image
                source={{
                  uri: user?.organization?.logo || user?.organizations?.logo,
                }}
                style={{ width: 24, height: 24, borderRadius: 6 }}
              />
            ) : null}
            <Text
              className={`text-xs font-bold ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
              numberOfLines={1}
            >
              {user?.organization?.name || user?.organizations?.name}
            </Text>
          </View>
        )}
      </View>

      {/* Exactly 3 Nav Items */}
      <ScrollView style={{ flex: 1, paddingTop: 14 }}>
        {navItems.map((item) => {
          const isActive =
            item.label === 'Dashboard'
              ? pathname?.includes('/dashboard') || pathname === dashboardRoute
              : pathname === item.route || pathname?.startsWith(item.route);

          const IconComp = item.icon;
          return (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className={`flex-row items-center gap-3.5 mx-3 my-1 px-4 py-3.5 rounded-2xl ${
                isActive
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/30'
                  : isDark
                  ? 'active:bg-slate-800/80'
                  : 'active:bg-slate-100'
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <IconComp
                color={
                  isActive
                    ? '#ffffff'
                    : isDark
                    ? item.color
                    : item.color === '#94a3b8'
                    ? '#64748b'
                    : item.color
                }
                size={20}
              />
              <Text
                className={`font-extrabold text-sm ${
                  isActive
                    ? 'text-white'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-700'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Logout */}
      <View
        className={`p-4 border-t ${
          isDark ? 'border-slate-800/80' : 'border-slate-100'
        }`}
      >
        <Pressable
          onPress={handleLogout}
          className={`flex-row items-center gap-3 px-4 py-3.5 rounded-2xl border ${
            isDark
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-red-50 border-red-100'
          }`}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <LogOut color="#ef4444" size={20} />
          <Text className="text-red-600 dark:text-red-400 font-extrabold text-sm">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { user, loading } = useSelector((state: any) => state.auth);
  const { isDark } = useAppTheme();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            backgroundColor: isDark ? '#070e1e' : '#ffffff',
            width: 300,
          },
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
            color: isDark ? '#ffffff' : '#0f172a',
          },
          headerTintColor: isDark ? '#ffffff' : '#0f172a',
          headerStyle: {
            backgroundColor: isDark ? '#0b1329' : '#ffffff',
            borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
            borderBottomWidth: 1,
          },
          headerRight: () => (
            <View className="flex-row items-center gap-2 mr-4">
              <ThemeToggle />
              <Pressable
                onPress={() => router.push('/(drawer)/sos')}
                className="bg-red-500/10 w-9 h-9 rounded-full items-center justify-center border border-red-500/30"
              >
                <Shield color="#ef4444" size={18} />
              </Pressable>
            </View>
          ),
        }}
      >
        <Drawer.Screen
          name="admin/dashboard"
          options={{
            headerTitle: 'Dashboard',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="member/dashboard"
          options={{
            headerTitle: 'Dashboard',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="sos"
          options={{
            headerTitle: 'तिची सुरक्षा',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            headerTitle: 'Profile Settings',
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
