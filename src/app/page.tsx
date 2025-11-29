import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { createChat } from "@/lib/db/actions";
import Form from "next/form";
import { headers } from "next/headers";
import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <main>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                Hey
                <Suspense>
                  <Name />
                </Suspense>
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                Welcome to hackai! Get started by creating a new chat!
              </p>
            </div>
            <Form action={createChat}>
              <Button size="lg" className="text-xl" type="submit">
                New chat
              </Button>
            </Form>
          </div>
          <div>
            <Button asChild variant="outline" size="icon">
              <Link href="https://github.com/elijah629/hackai-frontend">
                <SiGithub />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

async function Name() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const name = session?.user.name;

  return name && ", " + name + ". 👋";
}
