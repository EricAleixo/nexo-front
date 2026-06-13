import { RoomManagerClient } from "@/src/screens/room";
import { questionService } from "@/src/services/question.service";
import { roomService } from "@/src/services/room.service";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ code: string }>;
}

export default async function Page({ params }: PageProps) {
    const { code } = await params;
    const room = await roomService.findByCode(code);
    if (!room) notFound();

    const questions = await questionService.findByRoomId(room.id);

    return (
        <RoomManagerClient
            room={room}
            initialQuestions={questions}
        />
    );
}