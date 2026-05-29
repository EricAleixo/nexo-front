import { LobbyClient } from "@/src/components/game/LobbyClient";
import { playerService } from "@/src/services/players.service";
import { questionService } from "@/src/services/question.service";
import { roomService } from "@/src/services/room.service";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function LobbyPage({ params }: Props) {
  const { code } = await params;
  const players = await playerService.findByRoomCode(code);
  const room = await roomService.findByCode(code);
  const questions = await questionService.findByRoomId(room.id);

  return <LobbyClient code={code.toUpperCase()} playersData={players} roomId={room.id} questionsData={questions} />;
}