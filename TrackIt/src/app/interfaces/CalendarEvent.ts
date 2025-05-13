export interface CalendarEvent {
  id: string;
  title: string;  // Ha a `name` helyett `title` kell
  description: string;  // Esemény leírása
  startTime: string | Date;  // Esemény kezdete
  endTime: string;
  color?: string;  // Opcionális mező a színhez
  selected: boolean;
  days?:number[];
  editing: boolean;
  _backup?: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
  };// Ez szükséges az események szerkesztéséhez
}
