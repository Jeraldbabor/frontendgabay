"use client";
import { Button } from "@/shared/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto my-20 max-w-md rounded-2xl border border-border bg-white p-8 text-center">
      <h1 className="text-2xl font-semibold">Let’s try that again.</h1>
      <p className="my-5 text-sm leading-7 text-muted-foreground">
        Something interrupted this page. Your saved work is still in your
        library.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
