"use client";

import { use, useState } from "react";
import { db } from "@/lib/db";
import { tx } from "@instantdb/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";

export default function RSVPPage({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = use(params);
  
  const { data, isLoading } = db.useQuery({
    weddings: {
      $: { where: { id: weddingId } },
      guests: {
        events: {}
      }
    }
  });

  const [guestId, setGuestId] = useState("");
  const [status, setStatus] = useState("attending");
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-[#6a6a6a] font-medium animate-pulse">Loading RSVP...</div>;

  const wedding = data?.weddings[0];
  if (!wedding) return <div className="p-8 text-center text-red-500 font-bold">Wedding not found.</div>;

  const selectedGuest = wedding.guests?.find((g: any) => g.id === guestId);

  const handleRSVP = () => {
    if (!guestId) return;
    db.transact([tx.guests[guestId].update({ rsvpStatus: status })]);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-sans p-6">
        <Card className="airbnb-card w-[450px] text-center p-10 border-none">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-[#ff385c]" fill="#ff385c" size={32} />
          </div>
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-[#222222]">Thank You!</CardTitle>
            <CardDescription className="text-base text-[#6a6a6a] font-medium">Your RSVP for {wedding.name} has been saved. We can't wait to see you there!</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50 font-sans p-6">
      <Card className="airbnb-card w-[450px] overflow-hidden border-none">
        <div className="h-40 bg-[#ff385c] flex flex-col items-center justify-center text-white p-6 text-center">
          <Heart size={40} className="mb-2" />
          <h1 className="text-2xl font-bold tracking-tight">You're Invited!</h1>
          <p className="text-pink-100 font-medium">{wedding.name}</p>
        </div>
        <CardContent className="p-10 space-y-8 bg-white">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#222222] uppercase tracking-wider">Your Name</label>
            <Select value={guestId} onValueChange={(val) => { if(val) setGuestId(val) }}>
              <SelectTrigger className="h-12 rounded-xl border-[#dddddd] shadow-none"><SelectValue placeholder="Select your name from list" /></SelectTrigger>
              <SelectContent>
                {wedding.guests?.map((g: any) => (
                  <SelectItem key={g.id} value={g.id} className="h-10">{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#6a6a6a]">If you don't see your name, please contact the host.</p>
          </div>
          
          {selectedGuest && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
              {selectedGuest.events?.length > 0 && (
                <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-[#dddddd]">
                  <p className="text-xs font-bold text-[#6a6a6a] uppercase mb-2">You are invited to:</p>
                  <ul className="space-y-1">
                    {selectedGuest.events.map((e: any) => (
                      <li key={e.id} className="text-sm font-semibold text-[#222222] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff385c]" />
                        {e.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#222222] uppercase tracking-wider">Will you attend?</label>
                <Select value={status} onValueChange={(val) => { if(val) setStatus(val) }}>
                  <SelectTrigger className="h-12 rounded-xl border-[#dddddd] shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attending" className="h-10">Yes, I'll be there!</SelectItem>
                    <SelectItem value="declined" className="h-10">No, I can't make it</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button disabled={!guestId} onClick={handleRSVP} className="btn-primary-dark w-full h-12 text-lg mt-4">Confirm RSVP</Button>
        </CardContent>
      </Card>
    </div>
  );
}
