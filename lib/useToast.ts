"use client";

import { useEffect, useState } from "react";

export function useToast(timeout = 2000) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), timeout);
    return () => window.clearTimeout(timer);
  }, [message, timeout]);

  return { message, showToast: setMessage };
}
