import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkFree | LPU Campus Parking",
  description: "Find an open parking area, explore the Lovely Professional University campus, and reserve a demo spot with ParkFree.",
  applicationName: "ParkFree",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
