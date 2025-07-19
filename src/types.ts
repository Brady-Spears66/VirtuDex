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

export type { NewPerson, Person };
