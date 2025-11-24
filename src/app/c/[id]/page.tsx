import { getModelList } from "@/lib/hackclub";
import { Chat } from "@/components/chat";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const models = await getModelList();

  return (
    <>
      <Chat models={models} chatId={id} />
    </>
  );
}
