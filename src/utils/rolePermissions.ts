import type { UserRole } from '../types';

export type AdminTabId =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'categories'
  | 'coupons'
  | 'users'
  | 'cms'
  | 'reports';

export type UsersSubTabId = 'users' | 'messages' | 'newsletter' | 'reviews';

export interface RolePermissionConfig {
  role: UserRole;
  label: string;
  portalTitle: string;
  shortNavLabel: string;
  accountSummary: string;
  hasDashboardAccess: boolean;
  allowedTabs: AdminTabId[];
  defaultTab: AdminTabId;
  allowedUsersSubTabs: UsersSubTabId[];
  defaultUsersSubTab: UsersSubTabId;
  canManageRoles: boolean;
  canManageAllowlist: boolean;
  canManageSettings: boolean;
}

export const STAFF_DASHBOARD_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
  'support_agent',
];

const ALL_TABS: AdminTabId[] = [
  'overview',
  'products',
  'orders',
  'inventory',
  'categories',
  'coupons',
  'users',
  'cms',
  'reports',
];

const ROLE_CONFIGS: Record<UserRole, RolePermissionConfig> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin',
    portalTitle: 'Admin Dashboard',
    shortNavLabel: 'Admin',
    accountSummary:
      'You have full Super Administrator privileges across the store, staff roles, and settings.',
    hasDashboardAccess: true,
    allowedTabs: ALL_TABS,
    defaultTab: 'overview',
    allowedUsersSubTabs: ['users', 'messages', 'newsletter', 'reviews'],
    defaultUsersSubTab: 'users',
    canManageRoles: true,
    canManageAllowlist: true,
    canManageSettings: true,
  },
  admin: {
    role: 'admin',
    label: 'Admin',
    portalTitle: 'Admin Dashboard',
    shortNavLabel: 'Admin',
    accountSummary:
      'You have Store Administrator access to manage products, orders, inventory, inquiries, and reports.',
    hasDashboardAccess: true,
    allowedTabs: ALL_TABS,
    defaultTab: 'overview',
    allowedUsersSubTabs: ['users', 'messages', 'newsletter', 'reviews'],
    defaultUsersSubTab: 'users',
    canManageRoles: false,
    canManageAllowlist: false,
    canManageSettings: true,
  },
  order_manager: {
    role: 'order_manager',
    label: 'Order Manager',
    portalTitle: 'Order Manager',
    shortNavLabel: 'Orders',
    accountSummary:
      'You have Order Manager access to view, process, dispatch, track, and manage customer orders.',
    hasDashboardAccess: true,
    allowedTabs: ['orders'],
    defaultTab: 'orders',
    allowedUsersSubTabs: [],
    defaultUsersSubTab: 'messages',
    canManageRoles: false,
    canManageAllowlist: false,
    canManageSettings: false,
  },
  inventory_manager: {
    role: 'inventory_manager',
    label: 'Inventory Manager',
    portalTitle: 'Inventory Manager',
    shortNavLabel: 'Inventory',
    accountSummary:
      'You have Inventory Manager access to monitor stock levels, restock products, and view the stock ledger.',
    hasDashboardAccess: true,
    allowedTabs: ['inventory'],
    defaultTab: 'inventory',
    allowedUsersSubTabs: [],
    defaultUsersSubTab: 'messages',
    canManageRoles: false,
    canManageAllowlist: false,
    canManageSettings: false,
  },
  catalog_manager: {
    role: 'catalog_manager',
    label: 'Catalog Manager',
    portalTitle: 'Catalog Manager',
    shortNavLabel: 'Catalog',
    accountSummary:
      'You have Catalog Manager access to manage products, categories, and storefront banners & CMS.',
    hasDashboardAccess: true,
    allowedTabs: ['products', 'categories', 'cms'],
    defaultTab: 'products',
    allowedUsersSubTabs: [],
    defaultUsersSubTab: 'messages',
    canManageRoles: false,
    canManageAllowlist: false,
    canManageSettings: false,
  },
  support_agent: {
    role: 'support_agent',
    label: 'Support Agent',
    portalTitle: 'Support Desk',
    shortNavLabel: 'Support',
    accountSummary:
      'You have Support Agent access to respond to customer inquiries, manage newsletter lists, and moderate reviews.',
    hasDashboardAccess: true,
    allowedTabs: ['users'],
    defaultTab: 'users',
    allowedUsersSubTabs: ['messages', 'newsletter', 'reviews'],
    defaultUsersSubTab: 'messages',
    canManageRoles: false,
    canManageAllowlist: false,
    canManageSettings: false,
  },
  customer: {
    role: 'customer',
    label: 'Customer',
    portalTitle: 'My Account',
    shortNavLabel: 'Account',
    accountSummary:
      'Explore timeless collections, track your orders and manage your account with ease.',
    hasDashboardAccess: false,
    allowedTabs: [],
    defaultTab: 'overview',
    allowedUsersSubTabs: [],
    defaultUsersSubTab: 'messages',
    canManageRoles: false,
    canManageAllowlist: false,
    canManageSettings: false,
  },
};

export function normalizeUserRole(role?: string | null): UserRole {
  const clean = String(role || 'customer').toLowerCase().trim() as UserRole;
  return clean in ROLE_CONFIGS ? clean : 'customer';
}

export function getRoleConfig(role?: string | null): RolePermissionConfig {
  return ROLE_CONFIGS[normalizeUserRole(role)];
}

export function hasDashboardAccess(role?: string | null): boolean {
  return getRoleConfig(role).hasDashboardAccess;
}

export function canAccessTab(role: string | null | undefined, tab: AdminTabId): boolean {
  return getRoleConfig(role).allowedTabs.includes(tab);
}

export function canAccessUsersSubTab(
  role: string | null | undefined,
  subTab: UsersSubTabId
): boolean {
  return getRoleConfig(role).allowedUsersSubTabs.includes(subTab);
}
