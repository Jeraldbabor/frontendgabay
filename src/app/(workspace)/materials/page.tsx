import { Suspense } from "react";
import { GenerationWorkspace } from "@/features/generation/components/generation-workspace";
import { Loading } from "@/shared/components/ui/page";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <GenerationWorkspace feature="MATERIAL" />
    </Suspense>
  );
}
