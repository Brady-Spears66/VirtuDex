import { invoke } from "@tauri-apps/api/core";
import type { Person, NewPerson, SearchParams } from "../types";

export const apiService = {
  // Get all people
  async getPeople(searchParams?: SearchParams): Promise<Person[]> {
    if (!searchParams) {
      return await invoke("get_people");
    } else {
      return await invoke("search_people", {
        searchQuery: searchParams.query,
        searchField: searchParams.field,
      });
    }
  },

  // Get person by ID
  async getPerson(id: number): Promise<Person> {
    return await invoke("get_person", { id });
  },

  // Create new person
  async createPerson(person: NewPerson): Promise<number> {
    console.log(person);
    return await invoke("create_person", { person });
  },

  // Update person
  async updatePerson(id: number, person: NewPerson): Promise<void> {
    return await invoke("update_person", { id, person });
  },

  // Delete person
  async deletePerson(id: number): Promise<void> {
    return await invoke("delete_person", { id });
  },
};
