import SidebarPanel from "./SidebarContent";
import {useState} from "react";
import {SidebarHeader} from "./SidebarHeader";

const leftChevron = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const rightChevron = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);
export function Sidebar({
  collapsed,
  toggleSidebar,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <div
      className="fixed top-0 right-0 h-full border-solid border-4 border-sky-500"
      style={{
        width: collapsed ? "0" : "428px",
        transition: "width 0.3s",
      }}
    >
      <div
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 flex items-center justify-center p-2 cursor-pointer bg-white border border-gray-300"
        onClick={toggleSidebar}
        style={{zIndex: 1001}} // Ensure it's above the sidebar
      >
        {collapsed ? leftChevron : rightChevron}
      </div>
      {collapsed ? null : (
        <div style={{overflowY: "auto", height: "100%"}}>
          <SidebarHeader></SidebarHeader>
          <SidebarPanel></SidebarPanel>
        </div>
      )}
    </div>
  );
}
