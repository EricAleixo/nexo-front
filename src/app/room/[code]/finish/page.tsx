import { FinishClient } from "@/src/components/game/FinishClient";
import { answerService } from "@/src/services/answer.service";
import { playerService } from "@/src/services/players.service";
import { questionService } from "@/src/services/question.service";
import { roomService } from "@/src/services/room.service";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export default async function FinishPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const room = await roomService.findByCode(code);
  if (!room) return notFound();

  const [players, questions] = await Promise.all([
    playerService.findByRoomCode(code),
    questionService.findByRoomId(room.id),
  ]);

  const answersPerQuestion = await Promise.all(
    questions.map((q) => answerService.findByQuestionId(q.id))
  );

  let currentPlayer = null;
  let currentIsHost = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("player_session")?.value;

    if (token) {
      currentPlayer = await playerService.me(token);

      if (currentPlayer) {
        currentIsHost = currentPlayer.isHost;
      }
    }
  } catch {
    // cookie inválido ou player não encontrado
  }

  return (
    <FinishClient
      code={code}
      players={players}
      questions={questions}
      answersPerQuestion={answersPerQuestion}
      currentPlayer={currentPlayer}
      currentIsHost={currentIsHost}
    />
  );
}