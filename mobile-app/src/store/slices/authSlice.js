import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMembershipForOrg,
  getUserOrganizationId,
  getUserRoleForOrg,
  normalizeMembership,
  normalizeMemberships,
  resolveDashboardPath,
  resolveUserPermissions,
} from "@/utils/roles";

const normalizeSessionUser = (user) => {
  if (!user || typeof user !== "object") return null;

  const organization = user.organization && typeof user.organization === "object" ? user.organization : null;
  const memberships = normalizeMemberships(user.memberships);
  const organizationId = getUserOrganizationId(
    { ...user, organization, memberships },
    organization?.id
  );
  const currentMembership = getMembershipForOrg(
    { ...user, organization, memberships },
    organizationId
  ) || normalizeMembership(user.currentMembership);
  
  const currentRole = getUserRoleForOrg(
    { ...user, organization, organizationId, memberships, currentMembership },
    organizationId
  ) || null;
  
  const permissions = resolveUserPermissions(
    { ...user, organization, organizationId, memberships, currentMembership, currentRole },
    organizationId
  );

  return {
    ...user,
    memberships,
    currentMembership,
    currentRole,
    permissions,
    organization,
    organizationId,
    organizationCode: user.organizationCode || organization?.organizationCode || null,
    city: user.city || organization?.city || null,
    dashboardPath: resolveDashboardPath(currentRole, user.dashboardPath),
  };
};

const COOKIE_SESSION_TOKEN = "__cookie_session__";

export const loadSession = createAsyncThunk('auth/loadSession', async () => {
  try {
    const userRaw = await AsyncStorage.getItem("user");
    const tokenRaw = await AsyncStorage.getItem("token");
    const redirectPathRaw = await AsyncStorage.getItem("redirectPath");
    
    let user = null;
    if (userRaw) {
      user = normalizeSessionUser(JSON.parse(userRaw));
    }
    
    const token = tokenRaw || (user ? COOKIE_SESSION_TOKEN : null);
    const redirectPath = user ? resolveDashboardPath(user.currentRole, redirectPathRaw || user.dashboardPath) : null;
    return { user, token, redirectPath };
  } catch (e) {
    return { user: null, token: null, redirectPath: null };
  }
});

const persistSessionUser = async (user, token) => {
  try {
    if (!user) {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      return;
    }
    await AsyncStorage.setItem("user", JSON.stringify(user));
    if (token) {
      await AsyncStorage.setItem("token", String(token));
    }
  } catch (e) {}
};

const persistRedirectPath = async (redirectPath) => {
  try {
    if (!redirectPath) {
      await AsyncStorage.removeItem("redirectPath");
      return;
    }
    await AsyncStorage.setItem("redirectPath", redirectPath);
  } catch (e) {}
};

const clearPersistedSession = async () => {
  try {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("status");
    await AsyncStorage.removeItem("redirectPath");
    await AsyncStorage.removeItem("admin");
  } catch (e) {}
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    redirectPath: null,
    hydrated: false,
    loading: true,
    error: null,
  },
  reducers: {
    setSession: (state, action) => {
      const nextUser = normalizeSessionUser(action.payload?.user);
      const nextToken = action.payload?.token || (nextUser ? COOKIE_SESSION_TOKEN : null);
      const nextRedirectPath = nextUser
        ? resolveDashboardPath(nextUser.currentRole, action.payload?.redirectPath || action.payload?.user?.dashboardPath)
        : null;

      state.user = nextUser;
      state.token = nextToken;
      state.redirectPath = nextRedirectPath;
      state.hydrated = true;
      state.loading = false;

      persistSessionUser(nextUser, nextToken);
      persistRedirectPath(nextRedirectPath);
    },
    setCurrentUser: (state, action) => {
      const nextUser = normalizeSessionUser(action.payload);
      const nextToken = state.token || (nextUser ? COOKIE_SESSION_TOKEN : null);
      const nextRedirectPath = nextUser ? resolveDashboardPath(nextUser.currentRole, state.redirectPath || nextUser.dashboardPath) : null;

      state.user = nextUser;
      state.token = nextToken;
      state.redirectPath = nextRedirectPath;
      state.hydrated = true;
      state.loading = false;

      persistSessionUser(nextUser, nextToken);
      persistRedirectPath(nextRedirectPath);
    },
    markSessionChecked: (state) => {
      state.hydrated = true;
      state.loading = false;
      if (!state.user) {
        state.token = null;
        state.redirectPath = null;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.redirectPath = null;
      state.hydrated = true;
      state.loading = false;
      clearPersistedSession();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSession.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token || (action.payload.user ? COOKIE_SESSION_TOKEN : null);
      state.redirectPath = action.payload.redirectPath;
      state.hydrated = true;
      state.loading = false;
    });
    builder.addCase(loadSession.rejected, (state) => {
      state.hydrated = true;
      state.loading = false;
    });
  }
});

export const { setSession, setCurrentUser, markSessionChecked, logout } = authSlice.actions;
export default authSlice.reducer;
