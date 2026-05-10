import { Separator } from "@/components/ui/separator";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <div className="text-lg font-semibold tracking-tight">FairSpace</div>
          <div className="text-sm text-muted-foreground">
            Fair-use study room bookings for university life.
          </div>
          <Separator className="mt-6" />
        </div>
        {children}
      </div>
    </div>
  );
}

