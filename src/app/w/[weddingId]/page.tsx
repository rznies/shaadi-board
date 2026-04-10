"use client";

import { use, useState } from "react";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TasksBoard, BudgetBoard, GuestsBoard, VendorsBoard, EventsBoard } from "@/components/boards";
import { Share2 } from "lucide-react";

export default function WeddingDashboard({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  const { user } = db.useAuth();

  const { data, isLoading } = db.useQuery({
    weddings: {
      $: { where: { id: weddingId } },
      tasks: {},
      budgetItems: {},
      guests: {},
      vendors: {},
      events: {}
    },
    members: {
      $: { where: { userId: user?.id || "unauthenticated" } },
      wedding: {}
    }
  });

  if (isLoading) return <div className="text-center p-20 text-[#6a6a6a] font-medium animate-pulse">Gathering wedding details...</div>;

  const wedding = data?.weddings[0];
  const myMember = data?.members.find((m: any) => m.wedding?.id === weddingId);

  if (!wedding || !myMember) return null;

  const isAdmin = myMember.role === "admin";
  const mySide = myMember.side;

  const canEdit = (itemSide: string) => {
    return isAdmin || mySide === 'both' || itemSide === 'both' || itemSide === mySide;
  };

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join?w=${weddingId}&role=member`;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-start flex-wrap gap-6">
        <div className="space-y-1">
          <h2 className="text-[32px] font-bold tracking-tight text-[#222222]">{wedding.name}</h2>
          <div className="flex items-center gap-2 text-[#6a6a6a] font-medium">
            <span className="underline cursor-pointer">{wedding.city || "Destination TBD"}</span>
            <span>·</span>
            <span>{wedding.date ? new Date(wedding.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : "Date not set"}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-semibold border-[#222222] text-[#222222] hover:bg-[#f2f2f2]" onClick={() => {
            navigator.clipboard.writeText(`${inviteLink}&side=bride`);
            alert("Bride side invite link copied!");
          }}>
            <Share2 className="w-4 h-4 mr-2" />
            Invite Bride Side
          </Button>
          <Button variant="outline" className="rounded-xl font-semibold border-[#222222] text-[#222222] hover:bg-[#f2f2f2]" onClick={() => {
            navigator.clipboard.writeText(`${inviteLink}&side=groom`);
            alert("Groom side invite link copied!");
          }}>
            <Share2 className="w-4 h-4 mr-2" />
            Invite Groom Side
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="pill-tabs-list bg-transparent border-b border-[#dddddd] rounded-none h-auto p-0 mb-8">
          <TabsTrigger value="tasks" className="pill-tab data-[active]:bg-transparent data-[active]:shadow-none px-0 mr-8">Checklist</TabsTrigger>
          <TabsTrigger value="events" className="pill-tab data-[active]:bg-transparent data-[active]:shadow-none px-0 mr-8">Events</TabsTrigger>
          <TabsTrigger value="budget" className="pill-tab data-[active]:bg-transparent data-[active]:shadow-none px-0 mr-8">Budget</TabsTrigger>
          <TabsTrigger value="guests" className="pill-tab data-[active]:bg-transparent data-[active]:shadow-none px-0 mr-8">Guests</TabsTrigger>
          <TabsTrigger value="vendors" className="pill-tab data-[active]:bg-transparent data-[active]:shadow-none px-0 mr-8">Vendors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
          <TasksBoard weddingId={weddingId} tasks={wedding.tasks || []} canEdit={canEdit} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="events" className="mt-0 focus-visible:outline-none">
          <EventsBoard weddingId={weddingId} events={wedding.events || []} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="budget" className="mt-0 focus-visible:outline-none">
          <BudgetBoard weddingId={weddingId} budgetItems={wedding.budgetItems || []} canEdit={canEdit} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="guests" className="mt-0 focus-visible:outline-none">
          <GuestsBoard weddingId={weddingId} guests={wedding.guests || []} events={wedding.events || []} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="vendors" className="mt-0 focus-visible:outline-none">
          <VendorsBoard weddingId={weddingId} vendors={wedding.vendors || []} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
