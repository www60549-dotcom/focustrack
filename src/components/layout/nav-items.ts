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

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Day", href: "/my-day", icon: CalendarDays },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Habits", href: "/habits", icon: Target },
  { title: "Focus", href: "/focus", icon: Timer },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Goals", href: "/goals", icon: Flag },
  { title: "Notes", href: "/notes", icon: StickyNote },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
];

export const bottomNavItems: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

export const mobileBottomNavItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Focus", href: "/focus", icon: Timer },
  { title: "Habits", href: "/habits", icon: Target },
  { title: "Settings", href: "/settings", icon: Settings },
];
