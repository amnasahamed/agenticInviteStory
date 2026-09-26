import { ChatMessage, MediaKind, AssetId } from "@invitestory/contracts";
export interface ParsedChat {
    messages: ChatMessage[];
    participantNames: string[];
    dateRange: {
        start: Date;
        end: Date;
    } | null;
}
export declare function parseWhatsAppChat(content: string): Promise<ParsedChat>;
export declare function linkMediaToMessages(messages: ChatMessage[], mediaAssets: Array<{
    id: AssetId;
    kind: MediaKind;
    originalName: string;
}>): ChatMessage[];
//# sourceMappingURL=whatsapp-parser.d.ts.map