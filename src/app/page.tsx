"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { id, tx } from "@instantdb/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Plus } from "lucide-react";

export default function Home() {
  const { isLoading, user } = db.useAuth();

  if (isLoading) return <div className="p-8 text-center text-[#6a6a6a] font-medium animate-pulse">Entering ShaadiBoard...</div>;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-sans p-6">
        <div className="max-w-md w-full space-y-10">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#ff385c] rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-pink-100">S</div>
            <h1 className="text-3xl font-bold text-[#222222]">Welcome to ShaadiBoard</h1>
            <p className="text-[#6a6a6a] font-medium">Your shared wedding planner, simplified.</p>
          </div>
          
          <Card className="airbnb-card border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>Enter your email to receive a magic login code.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailLogin />
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-xs text-[#b0b0b0]">By signing in, you agree to organize beautiful weddings.</p>
          </div>
        </div>
      </div>
    );
  }

  return <UserDashboard user={user} />;
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  const sendEmail = () => {
    db.auth.sendMagicCode({ email }).then(() => setSent(true));
  };
  const verifyCode = () => {
    db.auth.signInWithMagicCode({ email, code });
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-bold text-[#222222]">Code sent to {email}</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="h-12 rounded-xl border-[#dddddd] font-mono tracking-widest text-center text-lg" />
        </div>
        <Button onClick={verifyCode} className="btn-primary-dark w-full h-12 text-base">Verify & Continue</Button>
        <Button variant="ghost" onClick={() => setSent(false)} className="w-full text-sm text-[#6a6a6a] hover:bg-transparent hover:underline">Resend code</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-bold text-[#222222]">Email Address</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="h-12 rounded-xl border-[#dddddd]" />
      </div>
      <Button onClick={sendEmail} className="btn-primary-dark w-full h-12 text-base">Get Magic Code</Button>
    </div>
  );
}

function UserDashboard({ user }: { user: any }) {
  const router = useRouter();
  const { data, isLoading } = db.useQuery({
    members: {
      $: {
        where: { userId: user.id }
      },
      wedding: {}
    }
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [wName, setWName] = useState("");
  const [side, setSide] = useState("both");

  const createWedding = () => {
    if (!wName) return;
    const wId = id();
    const mId = id();
    db.transact([
      tx.weddings[wId].update({ name: wName }),
      tx.members[mId].update({ userId: user.id, role: "admin", side }).link({ wedding: wId })
    ]);
    setCreateOpen(false);
    router.push(`/w/${wId}`);
  };

  if (isLoading) return <div className="p-20 text-center text-[#6a6a6a] font-medium animate-pulse">Loading your weddings...</div>;

  const memberships = data?.members || [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-[#222222]">Your Weddings</h1>
          <p className="text-[#6a6a6a] font-medium mt-1">Manage shared checklists and budgets.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <Button variant="outline" className="rounded-xl border-[#dddddd] font-semibold" onClick={() => db.auth.signOut()}>Sign Out</Button>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <Button className="btn-primary-dark rounded-xl h-11" onClick={() => setCreateOpen(true)}>Plan New Wedding</Button>
            <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-[#222222]">Start Planning</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold">Wedding Name</Label>
                  <Input value={wName} onChange={(e) => setWName(e.target.value)} placeholder="e.g. Neha & Rohan's Wedding" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Your Role/Side</Label>
                  <Select value={side} onValueChange={(val) => { if(val) setSide(val) }}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bride">Bride Side</SelectItem>
                      <SelectItem value="groom">Groom Side</SelectItem>
                      <SelectItem value="both">Both / Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createWedding} className="btn-primary-dark w-full h-12 text-lg mt-4">Create Wedding</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {memberships.map((m: any) => {
          const w = m.wedding;
          if (!w) return null;
          return (
            <div key={m.id} className="group cursor-pointer" onClick={() => router.push(`/w/${w.id}`)}>
              <div className="aspect-[16/10] bg-stone-100 rounded-[20px] mb-4 overflow-hidden shadow-sm transition-shadow group-hover:shadow-md relative">
                <div className="absolute inset-0 flex items-center justify-center text-stone-200">
                  <Heart size={64} fill="currentColor" />
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <Share2 className="w-4 h-4 text-[#222222]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-[#222222]">{w.name}</h3>
                  <span className="text-sm font-semibold capitalize">{m.side} side</span>
                </div>
                <p className="text-[#6a6a6a] font-medium">{w.city || "Destination TBD"}</p>
                <p className="text-sm text-[#6a6a6a]">{m.role} access</p>
              </div>
            </div>
          );
        })}
        {memberships.length === 0 && (
          <div className="col-span-full text-center py-24 bg-stone-50 border-2 border-dashed border-[#dddddd] rounded-[32px] space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-stone-300">
              <Plus size={32} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#222222]">No weddings yet</p>
              <p className="text-[#6a6a6a] font-medium">Create your first wedding to start planning together.</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="rounded-xl font-bold border-[#222222]">Get Started</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Share2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
}
