import { Role } from "../types/common";

export const canAccessUsers = (role: Role) => {
  return ["OWNER", "ADMIN_FINANCE"].includes(role);
};

export const canManageUsers = (role: Role) => {
  return role === "OWNER";
};

export const canEditBusinessProfile = (role: Role) => {
  return ["OWNER", "ADMIN_FINANCE"].includes(role);
};

export const canEditAppSettings = (role: Role) => {
  return role === "OWNER";
};

export const canMutateBusinessUnits = (role: Role) => {
  return role === "OWNER";
};

export const canMutateMasterData = (role: Role) => {
  return ["OWNER", "ADMIN_FINANCE"].includes(role);
};
