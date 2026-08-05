import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "@/store/slices/authSlice";
import { normalizeRole, ROLES, hasPermission, PERMISSIONS } from "@/utils/roles";
import { API_BASE_URL as CONFIG_API_BASE_URL } from "@/config";

const DEFAULT_LOCAL_API_URL = "http://localhost:5001/api";
const DEFAULT_PRODUCTION_API_URL = String(CONFIG_API_BASE_URL || "https://atty.veaglespace.com/api");

const trimTrailingSlash = (url) => String(url || "").trim().replace(/\/+$/, "");

const isLocalHost = (hostname) => {
  if (!hostname) return false;

  const normalizedHost = String(hostname).toLowerCase().trim();

  return (
    normalizedHost === "localhost" ||
    normalizedHost === "0.0.0.0" ||
    normalizedHost.startsWith("127.") ||
    normalizedHost.startsWith("10.") ||
    normalizedHost.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalizedHost)
  );
};

export const API_BASE_URL = CONFIG_API_BASE_URL;

const LIVE_API_URL = process.env.EXPO_PUBLIC_LIVE_API_URL || "https://tichisuraksha.veaglespace.com/api";
let useLiveApi = false;

const getBaseQuery = (isLive) => fetchBaseQuery({
  baseUrl: isLive ? LIVE_API_URL : API_BASE_URL,
  credentials: "include",
  cache: "no-store",
  prepareHeaders: (headers) => {
    headers.set("cache-control", "no-cache, no-store, max-age=0");
    headers.set("pragma", "no-cache");
    return headers;
  },
});

const localBaseQuery = getBaseQuery(false);
const liveBaseQuery = getBaseQuery(true);

const PROTECTED_APP_ROOTS = ["/dashboard", "/org", "/member", "/team-leader", "/super-admin"];

const resolveRequestUrl = (args) => {
  if (typeof args === "string") return args;
  return String(args?.url || "");
};

const isAuthMutationRequest = (url) =>
  ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/auth/reset-password/validate"]
    .some((path) => String(url).includes(path));

const shouldForceLogoutForForbidden = (error) => {
  const message = String(error?.data?.message || error?.error || "").trim().toLowerCase();
  if (!message) return false;

  return [
    "your account has been removed",
    "your account is inactive",
    "your registration is pending approval",
    "your registration request was rejected",
    "you do not belong to the selected organization",
    "your organization membership is inactive",
    "no active organization membership found",
  ].some((fragment) => message.includes(fragment));
};

const redirectForExpiredSubscription = (api) => {
  if (typeof window === "undefined") return;

  const user = api.getState?.()?.auth?.user;
  const currentPath = window.location.pathname;

  if (hasPermission(user, PERMISSIONS.SUBSCRIPTION.MANAGE)) {
    if (!currentPath.startsWith("/pricing")) {
      window.location.replace("/pricing?renew=1");
    }
    return;
  }

  api.dispatch(logout());
  if (currentPath !== "/subscription-expired") {
    window.location.replace("/subscription-expired");
  }
};

const handleUnauthorizedSession = (api, args) => {
  if (typeof window === "undefined") return;

  const requestUrl = resolveRequestUrl(args);
  if (isAuthMutationRequest(requestUrl)) {
    return;
  }

  api.dispatch(logout());

  const currentPath = window.location.pathname || "/";
  const isProtectedPath = PROTECTED_APP_ROOTS.some((root) => currentPath.startsWith(root));

  if (!isProtectedPath) {
    return;
  }

  const isSuperAdminRoute = currentPath.startsWith("/super-admin");
  const loginPath = isSuperAdminRoute ? "/super-admin/login" : "/login";

  if (currentPath !== loginPath) {
    window.location.replace(loginPath);
  }
};

export const buildBaseQuery = () => async (args, api, extraOptions) => {
  let result;

  if (useLiveApi) {
    result = await liveBaseQuery(args, api, extraOptions);
  } else {
    result = await localBaseQuery(args, api, extraOptions);
    
    // If local fetch fails, switch to live API and retry
    if (result?.error?.status === "FETCH_ERROR") {
      console.warn("Local API failed, switching to live API:", LIVE_API_URL);
      useLiveApi = true;
      result = await liveBaseQuery(args, api, extraOptions);
    }
  }

  if (result?.error) {
    const statusCode = Number(result.error.status || result.error.originalStatus || 0);

    if (statusCode === 402) {
      redirectForExpiredSubscription(api);
    }

    if (statusCode === 401 || (statusCode === 403 && shouldForceLogoutForForbidden(result.error))) {
      handleUnauthorizedSession(api, args);
    }

    // Sanitize non-JSON or cryptic errors into user-friendly messages
    let customMessage = "";
    if (result.error.status === "FETCH_ERROR") {
      customMessage = "Network error. Please check your internet connection.";
    } else if (result.error.status === "PARSING_ERROR" || String(result.error.error).includes("SyntaxError")) {
      if (statusCode === 413) {
        customMessage = "The uploaded file or request is too large.";
      } else if (statusCode >= 500) {
        customMessage = "An unexpected server error occurred. Please try again later.";
      } else {
        customMessage = "The server returned an unexpected response. Please try again later.";
      }
    } else if (statusCode >= 500 && !result.error.data?.message) {
      customMessage = "An unexpected server error occurred. Please try again later.";
    } else if (statusCode === 413 && !result.error.data?.message) {
      customMessage = "The uploaded file or request is too large.";
    }

    if (customMessage) {
      result.error = {
        ...result.error,
        message: customMessage,
        data: {
          ...(typeof result.error.data === "object" ? result.error.data : {}),
          message: customMessage,
        },
      };
    } else if (result.error.data?.message) {
      // Ensure error.message exists if error.data.message exists
      result.error.message = result.error.data.message;
    }
  }

  return result;
};
