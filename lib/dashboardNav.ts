import {
  ChartColumnBig,
  CirclePlus,
  LayoutDashboard,
  LucideIcon,
  NotebookPen,
  ShieldPlus,
  ShieldUser,
} from "lucide-react";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";

// The dashboard navigation shared by the desktop rail (DashboardSidebar) and
// the mobile drawer (MobileSideBar), so the two can't drift apart.

// Items that open a dashboard modal instead of a page
export type DashboardNavAction = "adminPanel";

type DashboardNavItemBase = {
  key: string;
  label: string;
  // Fits the 64px desktop rail; the tooltip shows the full label
  shortLabel: string;
  Icon: LucideIcon;
  // Keyboard shortcut shown in the tooltip and the More menu
  shortcut?: string;
};

export type DashboardNavItem = DashboardNavItemBase &
  (
    | { kind: "link"; href: string }
    | { kind: "action"; action: DashboardNavAction }
  );

export type DashboardNavGroup = {
  key: string;
  label: string;
  items: DashboardNavItem[];
};

type NavUser = {
  role: string;
  isSuper: boolean;
  specialAccess?: string[] | null;
};

const HOME_HREF = "/dashboard";

export const NEW_ISSUE_HREF = "/dashboard/new-issue";

export const HOME_NAV_ITEM: DashboardNavItem = {
  kind: "link",
  key: "home",
  href: HOME_HREF,
  label: "Dashboard",
  shortLabel: "Home",
  Icon: LayoutDashboard,
};

export function getDashboardNavGroups(user: NavUser): DashboardNavGroup[] {
  const groups: DashboardNavGroup[] = [
    {
      key: "workspace",
      label: "Workspace",
      items: [
        {
          kind: "link",
          key: "newIssue",
          href: NEW_ISSUE_HREF,
          label: "New Issue",
          shortLabel: "New Issue",
          Icon: CirclePlus,
          shortcut: "Ctrl + Q",
        },
        {
          kind: "link",
          key: "articles",
          href: "/dashboard/articles",
          label: "Articles Hub",
          shortLabel: "Articles",
          Icon: NotebookPen,
        },
        ...(hasFeatureAccess(user, FEATURES.ANALYTICS)
          ? [
              {
                kind: "link",
                key: "analytics",
                href: "/dashboard/analytics",
                label: "Issues Analytics",
                shortLabel: "Analytics",
                Icon: ChartColumnBig,
              } satisfies DashboardNavItem,
            ]
          : []),
      ],
    },
  ];

  const adminItems: DashboardNavItem[] = [
    ...(user.isSuper
      ? [
          {
            kind: "link",
            key: "superadmin",
            href: "/dashboard/superadmin",
            label: "Super Admin",
            shortLabel: "Super",
            Icon: ShieldPlus,
          } satisfies DashboardNavItem,
        ]
      : []),
    ...(user.role === "admin"
      ? [
          {
            kind: "action",
            key: "adminPanel",
            action: "adminPanel",
            label: "Admin Panel",
            shortLabel: "Admin",
            Icon: ShieldUser,
          } satisfies DashboardNavItem,
        ]
      : []),
  ];
  if (adminItems.length > 0) {
    groups.push({ key: "admin", label: "Administration", items: adminItems });
  }

  return groups;
}

// Every dashboard section with its own nav item, whoever can see it
const SECTION_PATHS = [
  NEW_ISSUE_HREF,
  "/dashboard/articles",
  "/dashboard/analytics",
  "/dashboard/superadmin",
];

// A link is active on its page and everything under it (an article, an
// analytics drill-down). Home owns the rest of /dashboard, including the
// issue pages at /dashboard/[uuid].
export function isNavItemActive(item: DashboardNavItem, pathname: string) {
  if (item.kind !== "link") return false;
  const isUnder = (base: string) =>
    pathname === base || pathname.startsWith(`${base}/`);
  if (item.href === HOME_HREF) {
    return isUnder(item.href) && !SECTION_PATHS.some(isUnder);
  }
  return isUnder(item.href);
}
