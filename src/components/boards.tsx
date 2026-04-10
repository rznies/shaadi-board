import { useState } from 'react';
import { id, tx } from "@instantdb/react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, CheckCircle2, Circle, Plus, Calendar, User, MapPin, IndianRupee } from "lucide-react";

// --- Tasks Board ---

function SortableTaskItem({ task, canEdit, isAdmin }: { task: any, canEdit: (s: string) => boolean, isAdmin: boolean }) {
  const isEditable = canEdit(task.side);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id, disabled: !isEditable });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 bg-white border border-[#dddddd] rounded-xl mb-3 transition-shadow hover:shadow-md ${!isEditable ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4 flex-1">
        <div {...attributes} {...listeners} className={`cursor-grab text-stone-400 ${!isEditable ? 'invisible' : ''}`}>
          <GripVertical size={18} />
        </div>
        <button onClick={() => {
          if (isEditable) db.transact([tx.tasks[task.id].update({ done: !task.done })]);
        }} disabled={!isEditable}>
          {task.done ? <CheckCircle2 className="text-[#ff385c]" size={24} /> : <Circle className="text-stone-300" size={24} />}
        </button>
        <div className="flex-1">
          <p className={`text-base font-semibold text-[#222222] ${task.done ? 'line-through text-stone-400' : ''}`}>{task.title}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6a6a6a]">{task.side} side</span>
            {task.assignedTo && <span className="text-xs text-[#6a6a6a]">· {task.assignedTo}</span>}
            {task.dueDate && <span className="text-xs text-[#6a6a6a]">· {task.dueDate}</span>}
          </div>
        </div>
      </div>
      {isAdmin && (
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 text-red-500" onClick={() => db.transact([tx.tasks[task.id].delete()])}>
          <Trash2 size={18} />
        </Button>
      )}
    </div>
  );
}

export function TasksBoard({ weddingId, tasks, canEdit, isAdmin }: { weddingId: string, tasks: any[], canEdit: (s: string) => boolean, isAdmin: boolean }) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [side, setSide] = useState("both");

  const addTask = () => {
    if (!title) return;
    const tId = id();
    db.transact([
      tx.tasks[tId].update({ title, assignedTo, dueDate, done: false, side, order: tasks.length }).link({ wedding: weddingId })
    ]);
    setTitle("");
    setAssignedTo("");
    setDueDate("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      const txs = newTasks.map((t, idx) => tx.tasks[t.id].update({ order: idx }));
      db.transact(txs);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold mb-6">Checklist</h3>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {sortedTasks.map(task => (
              <SortableTaskItem key={task.id} task={task} canEdit={canEdit} isAdmin={isAdmin} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="airbnb-card sticky top-28">
          <CardHeader>
            <CardTitle className="text-xl">Add New Task</CardTitle>
            <CardDescription>Assign tasks to family members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Task Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Book DJ" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Assignee</label>
              <Input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Due Date</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Side</label>
              <Select value={side} onValueChange={(val) => { if(val) setSide(val) }}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bride">Bride Side</SelectItem>
                  <SelectItem value="groom">Groom Side</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addTask} className="btn-primary-dark w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Events Board ---

export function EventsBoard({ weddingId, events, isAdmin }: { weddingId: string, events: any[], isAdmin: boolean }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");

  const addEvent = () => {
    if (!name) return;
    const eId = id();
    db.transact([
      tx.events[eId].update({ name, date, venue }).link({ wedding: weddingId })
    ]);
    setName("");
    setDate("");
    setVenue("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold mb-6">Wedding Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => (
            <Card key={event.id} className="airbnb-card overflow-hidden">
              <div className="h-32 bg-stone-100 flex items-center justify-center text-stone-300">
                <Calendar size={48} />
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold text-[#222222]">{event.name}</h4>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 rounded-full" onClick={() => db.transact([tx.events[event.id].delete()])}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6a6a6a]">
                  <Calendar size={14} />
                  <span>{event.date ? new Date(event.date).toLocaleString() : "Date TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6a6a6a]">
                  <MapPin size={14} />
                  <span>{event.venue || "Venue TBD"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="airbnb-card sticky top-28">
          <CardHeader>
            <CardTitle className="text-xl">Plan an Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Event Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mehendi Night" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Date & Time</label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Venue</label>
              <Input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Location" className="rounded-xl" />
            </div>
            <Button onClick={addEvent} className="btn-primary-dark w-full mt-4">Add Event</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Budget Board ---

export function BudgetBoard({ weddingId, budgetItems, canEdit, isAdmin }: { weddingId: string, budgetItems: any[], canEdit: (s: string) => boolean, isAdmin: boolean }) {
  const [category, setCategory] = useState("");
  const [estimated, setEstimated] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [side, setSide] = useState("both");

  const addBudgetItem = () => {
    if (!category || !estimated) return;
    const bId = id();
    db.transact([
      tx.budgetItems[bId].update({ category, estimated: Number(estimated), actual: 0, paidBy, side }).link({ wedding: weddingId })
    ]);
    setCategory("");
    setEstimated("");
    setPaidBy("");
  };

  const brideTotal = budgetItems.filter(b => b.side === 'bride' || b.side === 'both').reduce((sum, b) => sum + (b.actual || 0), 0);
  const groomTotal = budgetItems.filter(b => b.side === 'groom' || b.side === 'both').reduce((sum, b) => sum + (b.actual || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold mb-6">Budget Overview</h3>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Card className="airbnb-card p-6 bg-white border-l-4 border-l-pink-500">
            <p className="text-sm font-bold text-[#6a6a6a] uppercase tracking-wider">Bride Side Actuals</p>
            <p className="text-3xl font-bold text-[#222222] mt-2">₹{brideTotal.toLocaleString()}</p>
          </Card>
          <Card className="airbnb-card p-6 bg-white border-l-4 border-l-blue-500">
            <p className="text-sm font-bold text-[#6a6a6a] uppercase tracking-wider">Groom Side Actuals</p>
            <p className="text-3xl font-bold text-[#222222] mt-2">₹{groomTotal.toLocaleString()}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {budgetItems.map(item => (
            <div key={item.id} className={`flex items-center justify-between p-5 bg-white border border-[#dddddd] rounded-2xl ${!canEdit(item.side) ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <p className="text-lg font-bold text-[#222222]">{item.category}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs font-bold uppercase text-[#6a6a6a]">{item.side}</span>
                  {item.paidBy && <span className="text-xs text-[#6a6a6a]">· Paid by {item.paidBy}</span>}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#6a6a6a] uppercase">Estimated</p>
                  <p className="text-base font-semibold">₹{item.estimated?.toLocaleString()}</p>
                </div>
                <div className="text-right w-32">
                  <p className="text-xs font-bold text-[#6a6a6a] uppercase">Actual</p>
                  {canEdit(item.side) ? (
                    <div className="relative mt-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-sm">₹</span>
                      <Input 
                        type="number" 
                        className="h-9 pl-6 text-right font-bold rounded-lg border-[#dddddd]" 
                        value={item.actual || ''} 
                        onChange={e => db.transact([tx.budgetItems[item.id].update({ actual: Number(e.target.value) })])} 
                      />
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-[#ff385c]">₹{item.actual?.toLocaleString() || 0}</p>
                  )}
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="rounded-full text-red-500" onClick={() => db.transact([tx.budgetItems[item.id].delete()])}>
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="airbnb-card sticky top-28">
          <CardHeader>
            <CardTitle className="text-xl">Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Category</label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Photography" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Estimated Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#222222] font-semibold">₹</span>
                <Input type="number" value={estimated} onChange={e => setEstimated(e.target.value)} placeholder="0" className="pl-8 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Paid By</label>
              <Input value={paidBy} onChange={e => setPaidBy(e.target.value)} placeholder="Family member name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Responsibility</label>
              <Select value={side} onValueChange={(val) => { if(val) setSide(val) }}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bride">Bride Side</SelectItem>
                  <SelectItem value="groom">Groom Side</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addBudgetItem} className="btn-primary-dark w-full mt-4">Add Item</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Guests Board ---

export function GuestsBoard({ weddingId, guests, events, isAdmin }: { weddingId: string, guests: any[], events: any[], isAdmin: boolean }) {
  const [name, setName] = useState("");
  const [side, setSide] = useState("bride");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const addGuest = () => {
    if (!name) return;
    const gId = id();
    const transactions = [
      tx.guests[gId].update({ name, side, rsvpStatus: "pending" }).link({ wedding: weddingId })
    ];
    
    selectedEvents.forEach(eId => {
      transactions.push(tx.guests[gId].link({ events: eId }));
    });

    db.transact(transactions);
    setName("");
    setSelectedEvents([]);
  };

  const toggleEvent = (eId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eId) ? prev.filter(id => id !== eId) : [...prev, eId]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold mb-6">Guest List</h3>
        <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-[#dddddd]">
                <th className="p-4 text-xs font-bold uppercase text-[#6a6a6a]">Name</th>
                <th className="p-4 text-xs font-bold uppercase text-[#6a6a6a]">Side</th>
                <th className="p-4 text-xs font-bold uppercase text-[#6a6a6a]">Events</th>
                <th className="p-4 text-xs font-bold uppercase text-[#6a6a6a]">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dddddd]">
              {guests.map(guest => (
                <tr key={guest.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-semibold text-[#222222]">{guest.name}</td>
                  <td className="p-4 capitalize text-[#6a6a6a]">{guest.side}</td>
                  <td className="p-4 text-sm text-[#6a6a6a]">
                    {guest.events?.map((e: any) => e.name).join(", ") || "-"}
                  </td>
                  <td className="p-4">
                    <span className={`text-[11px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                      guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-700' : 
                      guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 rounded-full" onClick={() => db.transact([tx.guests[guest.id].delete()])}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Card className="airbnb-card mt-10 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-lg font-bold">Public RSVP Link</h4>
              <p className="text-sm text-[#6a6a6a]">Share this link with your guests to collect RSVPs.</p>
            </div>
            <div className="flex gap-2 flex-1 min-w-[300px]">
              <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/rsvp/${weddingId}`} className="bg-[#f2f2f2] font-mono text-xs rounded-xl" />
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/rsvp/${weddingId}`)}>Copy</Button>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="airbnb-card sticky top-28">
          <CardHeader>
            <CardTitle className="text-xl">Add Guest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Guest Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Guest Side</label>
              <Select value={side} onValueChange={(val) => { if(val) setSide(val) }}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bride">Bride Side</SelectItem>
                  <SelectItem value="groom">Groom Side</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {events.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#222222]">Invite to Events</label>
                <div className="grid grid-cols-1 gap-2">
                  {events.map(event => (
                    <div key={event.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleEvent(event.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedEvents.includes(event.id) ? 'bg-[#ff385c] border-[#ff385c]' : 'bg-white border-[#dddddd]'}`}>
                        {selectedEvents.includes(event.id) && <Plus className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{event.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={addGuest} className="btn-primary-dark w-full mt-4">Invite Guest</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Vendors Board ---

export function VendorsBoard({ weddingId, vendors, isAdmin }: { weddingId: string, vendors: any[], isAdmin: boolean }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Catering");
  const [quote, setQuote] = useState("");

  const addVendor = () => {
    if (!name) return;
    const vId = id();
    db.transact([
      tx.vendors[vId].update({ name, type, quote: Number(quote) || 0 }).link({ wedding: weddingId })
    ]);
    setName("");
    setQuote("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold mb-6">Vendors & Quotes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map(vendor => (
            <Card key={vendor.id} className="airbnb-card p-6 flex flex-col justify-between h-[180px]">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">{vendor.type}</span>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 rounded-full" onClick={() => db.transact([tx.vendors[vendor.id].delete()])}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                <h4 className="text-xl font-bold text-[#222222]">{vendor.name}</h4>
              </div>
              <div>
                <p className="text-xs text-[#6a6a6a]">Quote</p>
                <p className="text-2xl font-bold text-[#222222]">₹{vendor.quote?.toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="airbnb-card sticky top-28">
          <CardHeader>
            <CardTitle className="text-xl">Add Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Vendor Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Business Name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Service Type</label>
              <Input value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Venue" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#222222]">Quote Amount</label>
              <Input type="number" value={quote} onChange={e => setQuote(e.target.value)} placeholder="0" className="rounded-xl" />
            </div>
            <Button onClick={addVendor} className="btn-primary-dark w-full mt-4">Add Vendor</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
