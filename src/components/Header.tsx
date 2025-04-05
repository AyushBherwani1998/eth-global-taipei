import * as React from "react";
import Image from "next/image";
import ConnectButton from "@/components/ConnectButton";

export default function Header() {
  return (
    <header className="w-full pt-4 pb-4 px-32 flex justify-between items-center p">
      <div className="flex items-center">
        <Image src="/logo.svg" alt="Dune Wars" width={120} height={30} />
      </div>
        <ConnectButton />
    </header>
  );
}