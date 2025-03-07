export interface Task {
    id?: string; // Az azonosító opcionális
    title: string; // A feladat címe
    description: string; // A feladat leírása
    dueDate: string; // A határidő, pl. 'YYYY-MM-DD' formátumban
    priority: 'Alacsony' | 'Közepes' | 'Magas'; // A prioritás típusa
    userId?: string; // Az opcionális felhasználói azonosító
    createdAt?: Date; // A feladat létrehozásának dátuma (opcionális)
    updatedAt?: Date; // A feladat legutóbbi módosításának dátuma (opcionális)
    showMenu?: boolean;
}