/** DEV MOCK DATA — fictional direct-message threads for the current user. */
import { hoursAgo, minutesAgo } from "./time";

export interface MockConversation {
  id: string;
  participantId: string;
  lastMessage: string;
  updatedAt: string;
  unread: number;
  outgoing: boolean;
}

export const conversations: MockConversation[] = [
  {
    id: "c_1",
    participantId: "u_raf",
    lastMessage: "gg man, rematch tomorrow?",
    updatedAt: minutesAgo(12),
    unread: 2,
    outgoing: false,
  },
  {
    id: "c_2",
    participantId: "t_highpress",
    lastMessage: "We'd love you to trial for the ST spot.",
    updatedAt: hoursAgo(1),
    unread: 1,
    outgoing: false,
  },
  {
    id: "c_3",
    participantId: "u_lexi",
    lastMessage: "You: sending the clip now 🎯",
    updatedAt: hoursAgo(3),
    unread: 0,
    outgoing: true,
  },
  {
    id: "c_4",
    participantId: "u_tactics",
    lastMessage: "The 4-2-3-1 breakdown is up if you want to react.",
    updatedAt: hoursAgo(20),
    unread: 0,
    outgoing: false,
  },
];
