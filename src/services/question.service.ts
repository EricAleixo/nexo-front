const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.0.5:3000";

export interface Question {
  id: string;
  title: string;
  order: number;
  roomId: string;
  score: number;
  createdAt: Date;
  options: Option[];
}

export interface Option {
  id: string;
  title: string;
  isCorrect: boolean;
  questionId: string;
}

class QuestionService {
  async create(data: {
    title: string;
    order: number;
    roomId: string;
    score: number;
  }): Promise<Question> {
    const response = await fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create question");
    }

    return response.json();
  }

  async findByRoomId(roomId: string): Promise<Question[]> {
    const response = await fetch(`${API_URL}/questions/room/${roomId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/questions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete question");
    }
  }

  async createOption(data: {
    title: string;
    isCorrect: boolean;
    questionId: string;
  }): Promise<Option> {
    const response = await fetch(`${API_URL}/questions/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create option");
    }

    return response.json();
  }

  async findOptionsByQuestionId(questionId: string): Promise<Option[]> {
    const response = await fetch(`${API_URL}/questions/${questionId}/options`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch options");
    }

    return response.json();
  }

  async deleteOption(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/questions/options/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete option");
    }
  }
}

export const questionService = new QuestionService();