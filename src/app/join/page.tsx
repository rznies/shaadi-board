"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { id, tx } from "@instantdb/react";
import { db } from "@/lib/db";

function JoinWeddingLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wId = searchParams.get("w");
  const role = searchParams.get("role") || "member";
  const side = searchParams.get("side") || "both";

  const { isLoading, user } = db.useAuth();

  const { data: weddingData, isLoading: wLoading } = db.useQuery({
    weddings: {
      $: {
        where: { id: wId as string }
      }
    }
  });

  const { data: membersData, isLoading: mLoading } = db.useQuery({
    members: {
      $: {
        where: { userId: user?.id }
      },
      wedding: {}
    }
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user && !wLoading && !mLoading && weddingData && membersData) {
      if (!wId || !weddingData.weddings.length) {
        alert("Wedding not found");
        router.push("/");
        return;
      }
      
      const isMember = membersData.members.some((m: any) => m.wedding?.id === wId);
      
      if (!isMember) {
        const mId = id();
        db.transact([
          tx.members[mId].update({ userId: user.id, role, side }).link({ wedding: wId })
        ]).then(() => {
          router.push(`/w/${wId}`);
        });
      } else {
        router.push(`/w/${wId}`);
      }
    }
  }, [user, wLoading, mLoading, weddingData, membersData, router, wId, role, side]);

  return <div className="p-8 text-center">Joining wedding...</div>;
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <JoinWeddingLogic />
    </Suspense>
  );
}
