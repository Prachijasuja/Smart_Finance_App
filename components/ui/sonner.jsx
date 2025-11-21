"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner"; // Make sure 'sonner' is installed

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return <Sonner theme={theme} {...props} />;
};

export default Toaster; // ✅ Default export
