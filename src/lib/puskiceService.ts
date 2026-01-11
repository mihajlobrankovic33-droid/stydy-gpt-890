// Puskice (Cheat Sheets) Daily Limit Service

const STORAGE_KEY = "studybuddy-puskice";
const DAILY_LIMIT = 5;

interface PuskiceData {
  date: string;
  count: number;
  items: PuskiceItem[];
}

export interface PuskiceItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getData(): PuskiceData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { date: getTodayDate(), count: 0, items: [] };
  }
  
  const data: PuskiceData = JSON.parse(stored);
  
  // Reset count if it's a new day
  if (data.date !== getTodayDate()) {
    return { date: getTodayDate(), count: 0, items: data.items };
  }
  
  return data;
}

function saveData(data: PuskiceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function canCreatePuskica(): boolean {
  const data = getData();
  return data.count < DAILY_LIMIT;
}

export function getRemainingToday(): number {
  const data = getData();
  return Math.max(0, DAILY_LIMIT - data.count);
}

export function getTodayCount(): number {
  return getData().count;
}

export function getAllPuskice(): PuskiceItem[] {
  return getData().items;
}

export function createPuskica(title: string, content: string): { success: boolean; item?: PuskiceItem } {
  const data = getData();
  
  if (data.count >= DAILY_LIMIT) {
    return { success: false };
  }
  
  const newItem: PuskiceItem = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };
  
  data.count += 1;
  data.items.push(newItem);
  saveData(data);
  
  return { success: true, item: newItem };
}

export function deletePuskica(id: string): void {
  const data = getData();
  data.items = data.items.filter(item => item.id !== id);
  saveData(data);
}
