// src/services/answer.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.110:3000";

export interface Answer {
  id: string;
  playerId: string;
  questionId: string;
  optionId: string;
}

class AnswerService {
  async create(data: {
    playerId: string;
    questionId: string;
    optionId: string;
  }): Promise<Answer> {
    const response = await fetch(`${API_URL}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create answer");
    }

    return response.json();
  }

  async findByQuestionId(questionId: string): Promise<Answer[]> {
    const response = await fetch(
      `${API_URL}/answers/question/${questionId}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch answers");
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/answers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete answer");
    }
  }
}

export const answerService = new AnswerService();