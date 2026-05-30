"use client";

import clsx from "clsx";
import { FC, ReactNode } from "react";

export type TabItem = {
  tab: string;
  label: string;
  render: () => ReactNode;
};

export type TabsProps = {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  tabs: TabItem[];
};

export const Tabs: FC<TabsProps> = ({ activeTab, onTabChange, tabs }) => {
  const activeItem = tabs.find((t) => t.tab === activeTab);

  return (
    <div>
      <div className="flex border-b">
        {tabs.map(({ tab, label }) => (
          <button
            className={clsx(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === activeTab
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400 hover:text-white",
            )}
            key={tab}
            onClick={() => onTabChange?.(tab)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pt-4">{activeItem?.render()}</div>
    </div>
  );
};
