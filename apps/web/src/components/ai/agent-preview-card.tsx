import {
  Conversation,
  ConversationContent
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getUiNamespace } from "@openpolis/ui/namespaces";

type AgentPreviewCardProps = {
  title: string;
  description: string;
  userPrompt: string;
  assistantReply: string;
};

export function AgentPreviewCard({
  title,
  description,
  userPrompt,
  assistantReply
}: AgentPreviewCardProps) {
  return (
    <Card
      className="border-border/70 bg-card/90 shadow-sm"
      data-ui={getUiNamespace("agent", "agent-preview-card")}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-72">
        <Conversation className="h-full rounded-2xl border border-border/70 bg-background/80">
          <ConversationContent className="gap-6 p-5">
            <Message from="user">
              <MessageContent>{userPrompt}</MessageContent>
            </Message>
            <Message from="assistant">
              <MessageContent>{assistantReply}</MessageContent>
            </Message>
          </ConversationContent>
        </Conversation>
      </CardContent>
    </Card>
  );
}
