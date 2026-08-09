"use client";

import { useEffect } from "react";
import { markAllNotificationsRead } from "@/lib/notifications/actions";

/** Marks the viewer's notifications read once they've been shown. */
export function MarkReadOnView() {
  useEffect(() => {
    void markAllNotificationsRead();
  }, []);
  return null;
}
