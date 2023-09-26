"use client";

import { usePathname } from "next/navigation";
import {
  Layout,
  Compass,
  List,
  BarChart,
} from "lucide-react";
import { SideBarItem } from "./sidebar-item";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Browse",
    href: "/search",
  },
];

const TeacherRoutes = [
  {
    icon: List,
    label: "Course",
    href: "/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
];

export const SideBarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage =
    pathname?.includes("/teacher");

  const routes = isTeacherPage
    ? TeacherRoutes
    : guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SideBarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
