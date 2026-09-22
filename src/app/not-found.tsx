import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="max-w-md p-8 text-center">
        <p className="eyebrow">A little off course</p>
        <h1 className="my-4 text-3xl font-semibold">This page isn’t here.</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Let’s head back to your teaching workspace.
        </p>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
