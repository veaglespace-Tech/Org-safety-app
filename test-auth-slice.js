const { getUserRoleForOrg, getUserOrganizationId, normalizeMemberships, getMembershipForOrg, normalizeMembership, resolveUserPermissions, resolveDashboardPath } = require('./client/utils/roles.js');

const user = {
  "id": 3,
  "name": "abc",
  "email": "abc@gmail.com",
  "role": "member",
  "phone": "9829823132",
  "emergencyContact": null,
  "organization_id": 1,
  "organization": {
    "id": 1,
    "name": "Akshay Singare",
    "email": "singareakshay937@gmail.com",
    "phone": "7020540649",
    "address": "Kudale heritage",
    "city": "PUNE",
    "state": "Maharashtra",
    "country": "India",
    "created_at": "2026-07-27T07:29:10.000Z"
  }
};

const normalizeSessionUser = (user) => {
  if (!user || typeof user !== "object") return null;

  const organization =
    user.organization && typeof user.organization === "object" ? user.organization : null;
  const memberships = normalizeMemberships(user.memberships);
  const organizationId = getUserOrganizationId(
    {
      ...user,
      organization,
      memberships,
    },
    organization?.id
  );
  const currentMembership =
    getMembershipForOrg(
      {
        ...user,
        organization,
        memberships,
      },
      organizationId
    ) || normalizeMembership(user.currentMembership);
  const currentRole =
    getUserRoleForOrg(
      {
        ...user,
        organization,
        organizationId,
        memberships,
        currentMembership,
      },
      organizationId
    ) || null;
  const permissions = resolveUserPermissions(
    {
      ...user,
      organization,
      organizationId,
      memberships,
      currentMembership,
      currentRole,
    },
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

console.log(normalizeSessionUser(user));
