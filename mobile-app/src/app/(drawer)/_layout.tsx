import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, router, usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Shield,
  Home,
  User,
  Users,
  LogOut,
  Settings,
  CalendarCheck,
  UserPlus,
  UsersRound,
  Bell,
  Package,
  Wallet,
  BarChart3,
  Crown,
  Ticket,
} from 'lucide-react-native';
import { logout } from '@/store/slices/authSlice';
import { ROLES, formatRoleLabel } from '@/utils/roles';

function CustomDrawerContent(props) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const pathname = usePathname();

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

  const navItems = [
    ...(isAdmin
      ? [
          { label: 'Dashboard', route: '/(drawer)/admin/dashboard', icon: Home, color: '#4f46e5' },
          { label: 'Attendance & Geofence', route: '/(drawer)/admin/attendance', icon: CalendarCheck, color: '#059669' },
          { label: 'Requests Hub', route: '/(drawer)/admin/requests', icon: UserPlus, color: '#d97706' },
          { label: 'Members Directory', route: '/(drawer)/admin/users', icon: Users, color: '#3b82f6' },
          { label: 'Teams & Pods', route: '/(drawer)/admin/teams', icon: UsersRound, color: '#8b5cf6' },
          { label: 'Posts & Polls', route: '/(drawer)/admin/posts', icon: Bell, color: '#ec4899' },
          { label: 'Instruments Inventory', route: '/(drawer)/admin/instruments', icon: Package, color: '#f97316' },
          { label: 'Funds & Expenses', route: '/(drawer)/admin/expenses', icon: Wallet, color: '#10b981' },
          { label: 'Reports & Analytics', route: '/(drawer)/admin/reports', icon: BarChart3, color: '#6366f1' },
          { label: 'Subscription Plan', route: '/(drawer)/admin/subscription', icon: Crown, color: '#eab308' },
        ]
      : [
          { label: 'Dashboard', route: '/(drawer)/member/dashboard', icon: Home, color: '#4f46e5' },
          { label: 'Mark Attendance', route: '/(drawer)/member/attendance', icon: CalendarCheck, color: '#059669' },
          { label: 'Announcements & Polls', route: '/(drawer)/member/posts', icon: Bell, color: '#ec4899' },
          { label: 'My Instruments', route: '/(drawer)/member/instruments', icon: Package, color: '#f97316' },
          { label: 'Expense Claims', route: '/(drawer)/member/expenses', icon: Wallet, color: '#10b981' },
        ]),
    { label: 'तिची सुरक्षा (SOS)', route: '/(drawer)/sos', icon: Shield, color: '#ef4444' },
    { label: 'Partner Coupons', route: '/(drawer)/coupons', icon: Ticket, color: '#8b5cf6' },
    { label: 'Profile Settings', route: '/(drawer)/profile', icon: Settings, color: '#64748b' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* User Profile Header */}
      <View className="bg-indigo-600 px-5 pt-14 pb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-14 h-14 rounded-2xl bg-white/20 overflow-hidden items-center justify-center border-2 border-white/30">
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={{ width: 56, height: 56 }} />
            ) : (
              <User color="#fff" size={28} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-lg" numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <Text className="text-indigo-200 text-xs font-medium" numberOfLines={1}>
              {user?.email}
            </Text>
            <View className="mt-1 bg-white/20 self-start px-2 py-0.5 rounded-md">
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                {formatRoleLabel(user?.role)}
              </Text>
            </View>
          </View>
        </View>
        {user?.organization?.name && (
          <View className="mt-3 flex-row items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            {user?.organization?.logo ? (
              <Image
                source={{ uri: user.organization.logo }}
                style={{ width: 24, height: 24, borderRadius: 6 }}
              />
            ) : null}
            <Text className="text-white/90 text-xs font-bold" numberOfLines={1}>
              {user.organization.name}
            </Text>
          </View>
        )}
      </View>

      {/* Nav Items */}
      <ScrollView style={{ flex: 1, paddingTop: 8 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.route || pathname?.startsWith(item.route);
          const IconComp = item.icon;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              className={`flex-row items-center gap-3 mx-3 my-1 px-4 py-3 rounded-xl ${
                isActive ? 'bg-indigo-50' : ''
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <IconComp color={isActive ? '#4f46e5' : item.color} size={20} />
              <Text
                className={`font-bold text-sm ${
                  isActive ? 'text-indigo-600' : 'text-slate-700'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Logout */}
      <View className="border-t border-slate-100 p-4">
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-50"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <LogOut color="#ef4444" size={20} />
          <Text className="text-red-600 font-bold text-sm">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { user, loading } = useSelector((state) => state.auth);

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
            backgroundColor: '#ffffff',
            width: 310,
          },
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          headerTintColor: '#0f172a',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Drawer.Screen
          name="admin/dashboard"
          options={{
            headerTitle: 'Organization Dashboard',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/attendance"
          options={{
            headerTitle: 'Org Attendance',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/requests"
          options={{
            headerTitle: 'Requests Hub',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/users/index"
          options={{
            headerTitle: 'Members Directory',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/users/[userId]"
          options={{
            headerTitle: 'Member Details',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/teams/index"
          options={{
            headerTitle: 'Teams & Pods',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/teams/[teamId]"
          options={{
            headerTitle: 'Team Details',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/posts"
          options={{
            headerTitle: 'Posts & Polls',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/instruments"
          options={{
            headerTitle: 'Instruments Inventory',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/expenses"
          options={{
            headerTitle: 'Funds & Expenses',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/reports"
          options={{
            headerTitle: 'Analytics & Reports',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="admin/subscription"
          options={{
            headerTitle: 'Subscription Plan',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="member/dashboard"
          options={{
            headerTitle: 'My Dashboard',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="member/attendance"
          options={{
            headerTitle: 'Mark Attendance',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="member/posts"
          options={{
            headerTitle: 'Announcements',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="member/instruments"
          options={{
            headerTitle: 'My Instruments',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="member/expenses"
          options={{
            headerTitle: 'Expense Claims',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="sos"
          options={{
            headerTitle: 'Emergency SOS',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="coupons"
          options={{
            headerTitle: 'Partner Coupons',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            headerTitle: 'Account Settings',
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
