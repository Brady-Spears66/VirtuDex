import type { Person, NewPerson } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiService = {
  // Get all people
  async getPeople(): Promise<Person[]> {
    const response = await fetch(`${API_BASE}/people`);
    if (!response.ok) {
      throw new Error("Failed to fetch people");
    }
    return response.json();
  },

  // Get person by ID
  async getPerson(id: number): Promise<Person> {
    const response = await fetch(`${API_BASE}/people/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch person");
    }
    return response.json();
  },

  // Create new person
  async createPerson(person: NewPerson): Promise<number> {
    const response = await fetch(`${API_BASE}/people`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(person),
    });
    console.log(person);
    if (!response.ok) {
      throw new Error("Failed to create person");
    }
    return response.json();
  },

  // Update person
  async updatePerson(id: number, person: NewPerson): Promise<void> {
    const response = await fetch(`${API_BASE}/people/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(person),
    });
    if (!response.ok) {
      throw new Error("Failed to update person");
    }
  },

  // Delete person
  async deletePerson(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/people/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete person");
    }
  },
};
