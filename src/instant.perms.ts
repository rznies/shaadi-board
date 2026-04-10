// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  weddings: {
    allow: {
      view: "auth.id in data.ref('members.userId')",
      create: "auth.id != null",
      update: "auth.id in data.ref('members.userId')",
      delete: "auth.id in data.ref('members').where('role', 'admin').userId",
    },
  },
  members: {
    allow: {
      view: "auth.id in data.ref('wedding.members.userId') || auth.id == data.userId",
      create: "auth.id != null",
      update: "auth.id in data.ref('wedding.members').where('role', 'admin').userId || auth.id == data.userId",
      delete: "auth.id in data.ref('wedding.members').where('role', 'admin').userId",
    },
  },
  tasks: {
    allow: {
      view: "auth.id in data.ref('wedding.members.userId')",
      create: "auth.id in data.ref('wedding.members.userId')",
      update: "auth.id in data.ref('wedding.members.userId')", // UI handles side enforcement for granular logic
      delete: "auth.id in data.ref('wedding.members').where('role', 'admin').userId",
    },
  },
  budgetItems: {
    allow: {
      view: "auth.id in data.ref('wedding.members.userId')",
      create: "auth.id in data.ref('wedding.members.userId')",
      update: "auth.id in data.ref('wedding.members.userId')", // UI handles side enforcement
      delete: "auth.id in data.ref('wedding.members').where('role', 'admin').userId",
    },
  },
  guests: {
    allow: {
      view: "auth.id in data.ref('wedding.members.userId') || true", // Allow true for public RSVP view
      create: "auth.id in data.ref('wedding.members.userId')",
      update: "auth.id in data.ref('wedding.members.userId') || true", // Allow true for public RSVP updates
      delete: "auth.id in data.ref('wedding.members').where('role', 'admin').userId",
    },
  },
  events: {
    allow: {
      view: "auth.id in data.ref('wedding.members.userId')",
      create: "auth.id in data.ref('wedding.members.userId')",
      update: "auth.id in data.ref('wedding.members.userId')",
      delete: "auth.id in data.ref('wedding.members').where('role', 'admin').userId",
    },
  },
  vendors: {
    allow: {
      view: "auth.id in data.ref('wedding.members.userId')",
      create: "auth.id in data.ref('wedding.members.userId')",
      update: "auth.id in data.ref('wedding.members.userId')",
      delete: "auth.id in data.ref('wedding.members').where('role', 'admin').userId",
    },
  },
} satisfies InstantRules;

export default rules;
