// WhatsApp chat parser - handles multiple export formats

import { ChatMessage, MessageId, MediaKind, AssetId } from "@invitestory/contracts";

export interface ParsedChat {
  messages: ChatMessage[];
  participantNames: string[];
  dateRange: { start: Date; end: Date } | null;
}

const WHATSAPP_PATTERNS = [
  // [DD/MM/YYYY, HH:MM:SS] Name: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.*)$/,
  // DD/MM/YYYY, HH:MM - Name: Message
  /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.*)$/,
  // MM/DD/YY, HH:MM AM/PM - Name: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2}),\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*([^:]+):\s*(.*)$/,
  // [DD/MM/YY, HH:MM:SS] Name: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s*(\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.*)$/,
  // Android export format: DD MMM YYYY, HH:MM - Name: Message
  /^(\d{1,2}\s+\w{3}\s+\d{4}),\s*(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.*)$/
];

const MEDIA_PATTERNS = [
  /<attached:\s*([^>]+)>/gi,
  /\(file attached\)/gi,
  /📎/g,
  /📷/g,
  /🎵/g,
  /🎙️/g,
  /📄/g
];

const SYSTEM_MESSAGES = [
  /^.+? created group .+$/i,
  /^.+? added .+$/i,
  /^.+? left$/i,
  /^.+? removed .+$/i,
  /^.+? changed the group description$/i,
  /^.+? changed the group icon$/i,
  /^Messages and calls are end-to-end encrypted$/i,
  /^You\'re now an admin$/i,
  /^.+? changed this group\'s settings$/i
];

function parseDate(dateStr: string, timeStr: string): Date | null {
  // Try multiple date formats
  const combined = `${dateStr} ${timeStr}`;
  
  // Format: DD/MM/YYYY HH:MM:SS or DD/MM/YYYY HH:MM
  let match = combined.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const [, day, month, year, hour, minute, second = "0"] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Format: MM/DD/YY HH:MM AM/PM
  match = combined.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}),?\s+(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (match) {
    const [, month, day, year, hour, minute, ampm] = match;
    let h = parseInt(hour);
    if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
    const date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), h, parseInt(minute));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Format: D MMM YYYY HH:MM
  match = combined.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4}),?\s+(\d{1,2}):(\d{2})/);
  if (match) {
    const [, day, monthStr, year, hour, minute] = match;
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = monthMap[monthStr.toLowerCase()];
    if (month !== undefined) {
      const date = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute));
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Fallback: try native Date parsing
  const fallback = new Date(combined.replace(",", ""));
  if (!isNaN(fallback.getTime())) return fallback;
  
  return null;
}

function isSystemMessage(text: string): boolean {
  return SYSTEM_MESSAGES.some(pattern => pattern.test(text.trim()));
}

function extractMediaReferences(text: string): { cleanText: string; mediaHints: string[] } {
  const hints: string[] = [];
  let cleanText = text;

  for (const pattern of MEDIA_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) hints.push(match[1]);
    }
    cleanText = cleanText.replace(pattern, "").trim();
  }

  return { cleanText, mediaHints: hints };
}

export async function parseWhatsAppChat(content: string): Promise<ParsedChat> {
  const lines = content.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  const participants = new Set<string>();
  let currentMessage: Partial<ChatMessage> | null = null;
  let messageIndex = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let matched = false;
    for (const pattern of WHATSAPP_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (currentMessage) {
          messages.push(finalizeMessage(currentMessage, messageIndex++));
        }

        const [, dateStr, timeStr, sender, text] = match;
        const timestamp = parseDate(dateStr, timeStr);
        if (!timestamp) continue;

        const { cleanText, mediaHints } = extractMediaReferences(text);
        
        if (isSystemMessage(cleanText)) {
          currentMessage = null;
          matched = true;
          break;
        }

        participants.add(sender.trim());
        currentMessage = {
          id: `msg_${messageIndex.toString().padStart(5, "0")}` as MessageId,
          timestamp: timestamp.toISOString(),
          sender: sender.trim(),
          rawText: cleanText,
          mediaAssetIds: [],
          isVoice: mediaHints.some(h => h.includes("audio") || h.includes("voice") || h.includes("🎙️") || h.includes("🎵")),
          voiceDurationSec: undefined
        };
        matched = true;
        break;
      }
    }

    if (!matched && currentMessage) {
      currentMessage.rawText += "\n" + line;
    }
  }

  if (currentMessage) {
    messages.push(finalizeMessage(currentMessage, messageIndex));
  }

  const dateRange = messages.length > 0
    ? { start: new Date(messages[0].timestamp), end: new Date(messages[messages.length - 1].timestamp) }
    : null;

  return {
    messages,
    participantNames: Array.from(participants),
    dateRange
  };
}

function finalizeMessage(msg: Partial<ChatMessage>, index: number): ChatMessage {
  return {
    id: msg.id || `msg_${index.toString().padStart(5, "0")}` as MessageId,
    timestamp: msg.timestamp || new Date().toISOString(),
    sender: msg.sender || "Unknown",
    rawText: msg.rawText || "",
    mediaAssetIds: msg.mediaAssetIds || [],
    isVoice: msg.isVoice || false,
    voiceDurationSec: msg.voiceDurationSec
  };
}

export function linkMediaToMessages(
  messages: ChatMessage[],
  mediaAssets: Array<{ id: AssetId; kind: MediaKind; originalName: string }>
): ChatMessage[] {
  const mediaByName = new Map<string, AssetId>();
  for (const asset of mediaAssets) {
    mediaByName.set(asset.originalName.toLowerCase(), asset.id);
    const baseName = asset.originalName.replace(/\.[^.]+$/, "").toLowerCase();
    mediaByName.set(baseName, asset.id);
  }

  return messages.map(msg => {
    const linkedIds: AssetId[] = [];
    const textLower = msg.rawText.toLowerCase();

    for (const [name, id] of mediaByName) {
      if (textLower.includes(name)) {
        linkedIds.push(id);
      }
    }

    return { ...msg, mediaAssetIds: linkedIds };
  });
}