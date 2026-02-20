export type CubicleStatus = 'available' | 'in-use' | 'not-available';

export interface CubicleData {
  id: string;
  name: string;
  instruments: string[];
  equipment: string[];
  employees: string[];
  status: CubicleStatus;
  color: string;
  // floor placement
  placed: boolean;
  position: [number, number, number];
  width: number;   // grid units
  depth: number;   // grid units
  rotationY: number;
}

export const STATUS_COLORS: Record<CubicleStatus, string> = {
  available: '#22c55e',
  'in-use': '#f59e0b',
  'not-available': '#ef4444',
};

export const STATUS_LABELS: Record<CubicleStatus, string> = {
  available: 'Available',
  'in-use': 'In Use',
  'not-available': 'Not Available',
};

export const INITIAL_CUBICLES: CubicleData[] = [
  {
    id: 'c1', name: 'Cubicle 1',
    instruments: ['pH Meter', 'Dissolution Apparatus'],
    equipment: ['Weighing Balance', 'UV Cabinet'],
    employees: ['Dr. Priya Sharma', 'Tech. Ravi Kumar'],
    status: 'available', color: '#7c3aed',
    placed: false, position: [0, 0, 0], width: 3, depth: 3, rotationY: 0,
  },
  {
    id: 'c2', name: 'Cubicle 2',
    instruments: ['HPLC System', 'Spectrophotometer'],
    equipment: ['Refrigerator', 'Autoclave'],
    employees: ['Mr. Arun Mehta'],
    status: 'in-use', color: '#2563eb',
    placed: false, position: [0, 0, 0], width: 3, depth: 3, rotationY: 0,
  },
  {
    id: 'c3', name: 'Cubicle 3',
    instruments: ['Karl Fischer Titrator'],
    equipment: ['Hot Air Oven', 'Desiccator'],
    employees: ['Ms. Neha Joshi', 'Tech. Suresh Rao', 'Asst. Kavya'],
    status: 'not-available', color: '#0f766e',
    placed: false, position: [0, 0, 0], width: 3, depth: 3, rotationY: 0,
  },
  {
    id: 'c4', name: 'Cubicle 4',
    instruments: ['Dissolution Tester', 'Hardness Tester'],
    equipment: ['Tablet Counter', 'Microscope'],
    employees: ['Dr. Amit Patel'],
    status: 'available', color: '#b45309',
    placed: false, position: [0, 0, 0], width: 3, depth: 3, rotationY: 0,
  },
  {
    id: 'c5', name: 'Cubicle 5',
    instruments: ['GC System', 'Melting Point Apparatus'],
    equipment: ['Laminar Flow Hood'],
    employees: ['Ms. Divya Singh', 'Tech. Rajesh'],
    status: 'in-use', color: '#0369a1',
    placed: false, position: [0, 0, 0], width: 3, depth: 3, rotationY: 0,
  },
  {
    id: 'c6', name: 'Cubicle 6',
    instruments: ['Friability Tester'],
    equipment: ['Stability Chamber'],
    employees: [],
    status: 'available', color: '#7e22ce',
    placed: false, position: [0, 0, 0], width: 3, depth: 3, rotationY: 0,
  },
];
