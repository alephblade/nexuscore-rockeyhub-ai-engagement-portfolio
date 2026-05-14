/**
 * Role Permission Checker
 * RockeyHub / NexusCore AI — Creative Technology Portfolio Sample
 * Mirrors the permission guard logic from App.tsx
 */
const ROLES = { SUPER_MASTER: 'super_master', ADMIN: 'admin', LEADER: 'leader' };
const VIEWS = { DASHBOARD:'DASHBOARD', DIRECTORY:'DIRECTORY', MESSAGING:'MESSAGING', STRATEGY:'STRATEGY', ADMIN_USERS:'ADMIN_USERS', SAAS_PANEL:'SAAS_PANEL', INVITE_MANAGER:'INVITE_MANAGER', UNIVERSITY_MANAGER:'UNIVERSITY_MANAGER', UNIVERSITY_DASHBOARD:'UNIVERSITY_DASHBOARD', LEADS:'LEADS', ADMIN_LEADS:'ADMIN_LEADS' };
const VIEW_PERMISSIONS = {
  [VIEWS.SAAS_PANEL]:          [ROLES.SUPER_MASTER],
  [VIEWS.UNIVERSITY_MANAGER]:  [ROLES.SUPER_MASTER],
  [VIEWS.DIRECTORY]:           [ROLES.ADMIN],
  [VIEWS.STRATEGY]:            [ROLES.ADMIN],
  [VIEWS.ADMIN_USERS]:         [ROLES.ADMIN],
  [VIEWS.INVITE_MANAGER]:      [ROLES.ADMIN],
  [VIEWS.ADMIN_LEADS]:         [ROLES.ADMIN],
  [VIEWS.LEADS]:               [ROLES.LEADER],
  [VIEWS.MESSAGING]:           [ROLES.ADMIN, ROLES.LEADER, ROLES.SUPER_MASTER],
  [VIEWS.DASHBOARD]:           [ROLES.ADMIN, ROLES.LEADER],
  [VIEWS.UNIVERSITY_DASHBOARD]:[ROLES.ADMIN, ROLES.LEADER],
};
function canAccess(role, view) {
  const allowed = VIEW_PERMISSIONS[view];
  if (!allowed) return false;
  return allowed.includes(role);
}
function getPermissionMatrix(role) {
  return Object.entries(VIEWS).reduce((acc, [key, view]) => {
    acc[key] = canAccess(role, view);
    return acc;
  }, {});
}
function getDefaultView(role) {
  if (role === ROLES.SUPER_MASTER) return VIEWS.SAAS_PANEL;
  return VIEWS.DASHBOARD;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { canAccess, getPermissionMatrix, getDefaultView, ROLES, VIEWS };
}
