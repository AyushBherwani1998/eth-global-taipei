"use client";

import { useSelfApp } from "@/hooks/useSelfApp";
import SelfQRcodeWrapper from "@selfxyz/qrcode";

export const SelfQrCode = () => {
  const { selfApp } = useSelfApp();
  return (
    <SelfQRcodeWrapper
      selfApp={selfApp}
        onSuccess={() => {
          console.log('Verification successful');
          // Perform actions after successful verification
        }}
      />
    );
  }