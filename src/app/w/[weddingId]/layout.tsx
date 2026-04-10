"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const router = useRouter();
  const { weddingId } = use(params);
  const { isLoading, user } = db.useAuth();

  const { data: mData, isLoading: mLoading } = db.useQuery({
    members: {
      $: {
        where: { userId: user?.id || "unauthenticated" }
      },
      wedding: {}
    }
  });

  const room = db.room("weddingPresence", weddingId);
  const { peers, publishPresence } = room.usePresence();

  useEffect(() => {
    if (user) {
      publishPresence({ name: user.email?.split('@')[0] || "Guest" });
    }
  }, [user, publishPresence]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || mLoading) return <div className="p-8 text-center text-stone-500 font-medium">Loading workspace...</div>;

  if (!user) return null;

  const myMember = mData?.members.find((m: any) => m.wedding?.id === weddingId);
  if (!myMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-semibold text-lg">Access Denied</p>
          <button onClick={() => router.push("/")} className="text-[#ff385c] underline font-medium">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white border-b px-6 md:px-20 py-4 flex justify-between items-center h-[80px]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          {/* Minimalist Logo Icon */}
          <div className="w-8 h-8 bg-[#ff385c] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
          <h1 className="text-[#ff385c] text-xl font-bold tracking-tight hidden md:block">ShaadiBoard</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-[#222222]">
            <span className="capitalize">{myMember.side} Side</span>
            <span className="text-stone-300">|</span>
            <span className="text-[#6a6a6a] font-medium">{myMember.role}</span>
          </div>
          
          <div className="flex items-center gap-3 pl-6 border-l">
            <div className="flex -space-x-2 mr-2">
              {Object.entries(peers || {}).map(([peerId, presence]: [string, any]) => (
                <Avatar key={peerId} className="w-8 h-8 border-2 border-white bg-[#f2f2f2]" title={presence.name}>
                  <AvatarFallback className="text-[10px] text-[#222222] font-bold">{presence.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Avatar className="w-8 h-8 bg-[#222222] cursor-pointer" onClick={() => db.auth.signOut()}>
              <AvatarFallback className="text-white text-xs font-bold">{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 md:px-20 py-10">
        {children}
      </main>
    </div>
  );
}
