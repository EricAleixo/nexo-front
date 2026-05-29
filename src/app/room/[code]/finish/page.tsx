import { FinishClient } from "@/src/components/game/FinishClient";
import { answerService } from "@/src/services/answer.service";
import { playerService } from "@/src/services/players.service";
import { questionService } from "@/src/services/question.service";
import { roomService } from "@/src/services/room.service";
import { notFound } from "next/navigation";

export default async function FinishPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const room = await roomService.findByCode(code);
    if (!room) return notFound();

    const [players, questions] = await Promise.all([
        playerService.findByRoomCode(code),
        questionService.findByRoomId(room.id),
    ]);

    // Busca respostas de todos os jogadores para todas as perguntas
    const answersPerQuestion = await Promise.all(
        questions.map(q => answerService.findByQuestionId(q.id))
    );

    return (
        <FinishClient
            code={code}
            players={players}
            questions={questions}
            answersPerQuestion={answersPerQuestion}
        />
    );
}