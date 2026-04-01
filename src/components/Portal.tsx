"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElement(el);
    setMounted(true);

    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!mounted || !element) return null;
  return createPortal(children, element);
}
