import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Target,
  Timer,
  Calendar,
  Flag,
  StickyNote,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "My Day", href: "/my-day", icon: CalendarDays },
      { title: "Tasks", href: "/tasks", icon: CheckSquare },
      { title: "Habits", href: "/habits", icon: Target },
      { title: "Focus", href: "/focus", icon: Timer },
      { title: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Goals", href: "/goals", icon: Flag },
      { title: "Notes", href: "/notes", icon: StickyNote },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
];

export const mainNavItems: NavItem[] = navSections.flatMap((s) => s.items);

export const bottomNavItems: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

export const mobileBottomNavItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Focus", href: "/focus", icon: Timer },
  { title: "Habits", href: "/habits", icon: Target },
  { title: "More", href: "/settings", icon: Settings },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
