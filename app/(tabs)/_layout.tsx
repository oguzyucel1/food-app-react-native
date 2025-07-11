import useAuthStore from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    // Redirect to the sign-up page if not authenticated
    return <Redirect href="/sign-in" />;
  }
  return <Slot />;
}
