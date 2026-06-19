export type LeadStatus = "new" | "won" | "lost" | "pending";

export interface LeadConfig {
  decor: string | null;
  riserOption: string | null;
  stepCount: number | null;
  uniformStepDimensions: boolean | null;
  widthBand: string | null;
  depthBand: string | null;
  openSides: boolean;
  intermediateLanding: boolean;
  landingFinish: string | null;
  stepEndCap: string | null;
  openStepEndSide: string | null;
  lateralEndSide: string | null;
  country: string | null;
}

export interface Lead {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  status: LeadStatus;
  step: string;
  price: number;
  lastTime: string;
  lastTs: number;
  snippet: string;
  unread: number;
  phone: string;
  funnelHistory: string[];
  config: LeadConfig | null;
  internalNotes: string;
  photos: string[];
  assignedTo: number | null;
  assignedAgent: string | null;
  assignedAtTs: number | null;
}

export interface Message {
  author: "client" | "vendor";
  text: string;
  media?: string[];
  status?: string | null;   // queued | sent | delivered | read | failed
  agent?: string | null;    // nom du commercial (messages vendor)
  time: string;
}

export interface KPIs {
  totalCA: number;
  activeLeads: number;
  conversionRate: number;
  avgTicket: number;
}

export type Conversations = Record<string, Message[]>;
