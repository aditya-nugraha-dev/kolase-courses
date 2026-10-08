import type { Metadata } from "next";
import ChatClient from "./ChatClient";

export const metadata: Metadata = {
  title: "Chat — KOLASE",
  description: "Chat murid dengan teacher: tanya jadwal, materi, dan progres kelas.",
};

export default function ChatPage() {
  return <ChatClient />;
}
