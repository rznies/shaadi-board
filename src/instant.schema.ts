import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    weddings: i.entity({
      name: i.string(),
      date: i.string().optional(),
      city: i.string().optional(),
      budgetTotal: i.number().optional(),
    }),
    members: i.entity({
      userId: i.string(),
      role: i.string(), // "admin" | "member"
      side: i.string(), // "bride" | "groom" | "both"
    }),
    events: i.entity({
      name: i.string(),
      date: i.string().optional(),
      venue: i.string().optional(),
    }),
    guests: i.entity({
      name: i.string(),
      phone: i.string().optional(),
      side: i.string(), // "bride" | "groom" | "both"
      rsvpStatus: i.string(), // "attending" | "declined" | "pending"
    }),
    tasks: i.entity({
      title: i.string(),
      assignedTo: i.string().optional(),
      dueDate: i.string().optional(),
      done: i.boolean(),
      side: i.string(), // "bride" | "groom" | "both"
      status: i.string(), // "todo" | "in_progress" | "done"
      order: i.number().optional(),
    }),
    budgetItems: i.entity({
      category: i.string(),
      estimated: i.number(),
      actual: i.number(),
      paidBy: i.string().optional(), // "bride" | "groom" | "both"
      side: i.string(), // "bride" | "groom" | "both"
    }),
    vendors: i.entity({
      type: i.string(),
      name: i.string(),
      quote: i.number().optional(),
      contact: i.string().optional(),
    }),
  },
  links: {
    // Wedding -> Members
    weddingMembers: {
      forward: { on: "weddings", has: "many", label: "members" },
      reverse: { on: "members", has: "one", label: "wedding" },
    },
    weddingEvents: {
      forward: { on: "weddings", has: "many", label: "events" },
      reverse: { on: "events", has: "one", label: "wedding" },
    },
    weddingGuests: {
      forward: { on: "weddings", has: "many", label: "guests" },
      reverse: { on: "guests", has: "one", label: "wedding" },
    },
    eventGuests: {
      forward: { on: "events", has: "many", label: "guests" },
      reverse: { on: "guests", has: "many", label: "events" },
    },
    weddingTasks: {
      forward: { on: "weddings", has: "many", label: "tasks" },
      reverse: { on: "tasks", has: "one", label: "wedding" },
    },
    weddingBudgetItems: {
      forward: { on: "weddings", has: "many", label: "budgetItems" },
      reverse: { on: "budgetItems", has: "one", label: "wedding" },
    },
    weddingVendors: {
      forward: { on: "weddings", has: "many", label: "vendors" },
      reverse: { on: "vendors", has: "one", label: "wedding" },
    }
  },
  rooms: {
    weddingPresence: {
      presence: i.entity({
        name: i.string(),
        avatar: i.string().optional(),
      }),
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
