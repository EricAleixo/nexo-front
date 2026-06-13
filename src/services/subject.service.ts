import { Subject } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.110:3000";

class SubjectService {

    async findAll(): Promise<Subject[]> {
        const response = await fetch(`${API_URL}/subjects`);

        if (!response.ok) return [];

        return response.json();
    }

    async create(data: {
        name: string;
        icon: string, // key of ICON_OPTIONS
        color: string
    }): Promise<Subject> {
        const response = await fetch(`${API_URL}/subjects`, {
            method: "POST",
            credentials: "include",
            headers:{
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                icon: data.icon,
                color: data.color
            })
        })

        return response.json();
    }

}

export const subjectService = new SubjectService();