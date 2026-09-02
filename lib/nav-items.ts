export type NavItem = {
  title: string
  url: string
  icon: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Overview", url: "/dashboard", icon: "tabler:layout-dashboard" },
    ],
  },
  {
    label: "Visits",
    items: [
      { title: "In log", url: "/kiosk/intake", icon: "tabler:login" },
      { title: "Out log", url: "/dashboard/visits/out-log", icon: "tabler:logout" },
      {
        title: "Visit history",
        url: "/dashboard/visits",
        icon: "tabler:clipboard-list",
      },
    ],
  },
  {
    label: "Directory",
    items: [
      { title: "Equipment", url: "/dashboard/equipment", icon: "tabler:device-laptop" },
      { title: "Departments", url: "/dashboard/departments", icon: "tabler:building" },
      { title: "Staff", url: "/dashboard/staff", icon: "tabler:users" },
    ],
  },
]
