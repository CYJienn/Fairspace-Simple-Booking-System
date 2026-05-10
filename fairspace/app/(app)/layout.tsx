import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";
import { Separator } from "@/components/ui/separator";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
        <aside className="hidden w-64 flex-col border-r bg-sidebar p-4 md:flex">
          <div className="text-sm font-semibold tracking-tight">FairSpace</div>
          <div className="mt-1 text-xs text-muted-foreground">University room bookings</div>
          <Separator className="my-4" />
          <nav className="flex flex-col gap-1 text-sm">
            <Link className="rounded-md px-2 py-2 hover:bg-sidebar-accent" href="/app">
              Calendar
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-sidebar-accent" href="/app/rooms">
              Rooms
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-sidebar-accent" href="/app/bookings">
              My bookings
            </Link>
          </nav>
          <div className="mt-auto pt-4">
            <form action={signOut}>
              <Button type="submit" variant="secondary" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
            <div className="text-sm font-medium">FairSpace</div>
            <div className="md:hidden">
              <form action={signOut}>
                <Button type="submit" variant="secondary" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          </header>
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

