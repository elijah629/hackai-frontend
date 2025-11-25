import { Button } from "@/components/ui/button";
import Image from "next/image";
import dinobox from "@/images/dinobox.svg";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex items-center justify-center flex-col gap-5 size-full">
      <Image
        src={dinobox}
        alt="dino box"
        className="animate-spin animation-duration-[5s] absolute top-0"
      />
      <h1 className="text-5xl md:text-8xl font-black">404!</h1>
      <h2 className="text-xl md:text-4xl">We couldn't find that page.</h2>
      <Button size="lg" className="text-xl" asChild>
        <Link href="/">New chat</Link>
      </Button>
    </main>
  );
}
