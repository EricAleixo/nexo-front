import { GameClient } from "@/src/components/game/GameClient";
import { playerService } from "@/src/services/players.service";
import { questionService } from "@/src/services/question.service";
import { roomService } from "@/src/services/room.service";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function Page({ params }: Props) {
  const { code } = await params;

  const room = await roomService.findByCode(code);
  if (!room || room.status !== "started") {
    redirect(`/room/${code}`);
  }

  const questions = await questionService.findByRoomId(room.id);
  if (questions.length === 0) {
    redirect(`/room/${code}`);
  }

  // Busca as opções de cada pergunta em paralelo
  const questionsWithOptions = await Promise.all(
    questions.map(async (q) => ({
      ...q,
      options: await questionService.findOptionsByQuestionId(q.id),
    }))
  );

  const players = await playerService.findByRoomCode(code);

  return (
    <GameClient
      code={code}
      roomId={room.id}
      questions={questionsWithOptions}
      players={players}
      timePerQuestion={30}
    />
  );
}