"use client";

import { motion } from "framer-motion";
import {
  Map,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

interface DashboardSidebarProps {
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function DashboardSidebar({
  open,
  onToggle,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile / collapsed toggle */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-indigo-500 transition-colors"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      <motion.aside
        initial={false}
        animate={{
          width: open ? 220 : 64,
        }}
        className="relative z-40 h-full shrink-0 bg-zinc-900 border-r border-zinc-800 overflow-hidden"
      >
        <div className="h-full flex flex-col">

          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-zinc-800">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>

            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 whitespace-nowrap"
              >
                <p className="font-bold text-sm text-white">
                  GIS News
                </p>
                <p className="text-[10px] text-zinc-500">
                  Intelligence
                </p>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">

            <SidebarItem
              href="/dashboard"
              icon={<Map className="w-5 h-5" />}
              label="Dashboard"
              open={open}
              active
            />

            <SidebarItem
              href="/analytics"
              icon={<BarChart3 className="w-5 h-5" />}
              label="Analytics"
              open={open}
            />

            <SidebarItem
              href="/trends"
              icon={<TrendingUp className="w-5 h-5" />}
              label="Trends"
              open={open}
            />

            <SidebarItem
              href="/insights"
              icon={<BrainCircuit className="w-5 h-5" />}
              label="AI Insights"
              open={open}
            />

          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-zinc-800 space-y-1">

            <SidebarItem
              href="/settings"
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              open={open}
            />

            <button
              onClick={onLogout}
              className={`w-full flex items-center ${
                open ? "gap-3 px-3" : "justify-center"
              } py-2.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors`}
            >
              <LogOut className="w-5 h-5 shrink-0" />

              {open && (
                <span className="text-sm whitespace-nowrap">
                  Logout
                </span>
              )}
            </button>

          </div>
        </div>
      </motion.aside>
    </>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  active?: boolean;
}

function SidebarItem({
  href,
  icon,
  label,
  open,
  active,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center ${
        open ? "gap-3 px-3" : "justify-center"
      } py-2.5 rounded-lg transition-colors ${
        active
          ? "bg-indigo-500/15 text-indigo-400"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
      }`}
    >
      {icon}

      {open && (
        <span className="text-sm whitespace-nowrap">
          {label}
        </span>
      )}
    </Link>
  );
}