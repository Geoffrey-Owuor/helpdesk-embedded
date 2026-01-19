// A reusable createPortal function to solve server side document is not defined errors
"use client";

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

type ClientPortalProps = {
  children: React.ReactNode;
  selector?: string;
};

const ClientPortal = ({ children, selector = "body" }: ClientPortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    return () => setMounted(false);
  }, []);

  //   Check if mounted
  if (!mounted) {
    return null;
  }

  // container uses "body" by default but a specific id can be passed if needed
  const container = document.querySelector(selector);

  return container ? createPortal(children, container) : null;
};

export default ClientPortal;
