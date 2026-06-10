const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.0.5:3000";

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    roomId: string;
    score: number;
    answeredCorrectly: boolean
}

class PlayerService {
    async findByRoomCode(
        code: string,
    ): Promise<Player[]> {
        const response = await fetch(`${API_URL}/players/room/code/${code}`,
            {
                cache: "no-store"
            },
        );

        console.log(response)

        if (!response.ok) {
            throw new Error(
                "Failed to fetch players",
            );
        }

        return response.json();
    }

    async me(token: string) {
        const response = await fetch(`${API_URL}/players/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    }
}

export const playerService = new PlayerService();