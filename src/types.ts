type Person = {
  id: number;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  tags: string;
  notes: string;
  date_met: string;
  location_met: string;
  linkedin: string;
};

type NewPerson = {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  tags?: string;
  notes?: string;
  date_met?: string;
  location_met?: string;
  linkedin?: string;
};

interface SearchParams {
  query: string;
  field: string;
}

export const jsonExample = `[
{
  "name": "John Doe",
  "phone": "123-456-7890",
  "email": "john@example.com",
  "company": "Acme Corp",
  "title": "Software Engineer",
  "location_met": "Tech Conference",
  "date_met": "2023-01-15",
  "linkedin": "https://www.linkedin.com/in/johndoe",
  "tags": "developer,react",
  "notes": "Interested in React"
}
]`;

export type { NewPerson, Person, SearchParams };
