import { DEMO_DEFAULT_USER_ID, DEMO_STORAGE_KEYS, IS_DEMO_MODE } from '@/lib/demo-mode';

export interface UserProfile {
  userId: string;
  createdAt: string;
  email: string;
  avatar?: string;
  nombres: string;
  apellidos: string;
  dpi: string;
  tel: string;
  fechaNacimiento: string;
  departamento: string;
  municipio: string;
  genero: string;
}

export const GENERO_OPTIONS = ['Masculino', 'Femenino'] as const;

type EditableProfileFields = Pick<
  UserProfile,
  'nombres' | 'apellidos' | 'dpi' | 'tel' | 'fechaNacimiento' | 'departamento' | 'municipio' | 'genero'
>;

export interface ProfileValidationResult {
  valid: boolean;
  error?: string;
  normalized?: EditableProfileFields;
}

const REQUIRED_FIELDS: (keyof UserProfile)[] = [
  'nombres',
  'apellidos',
  'dpi',
  'tel',
  'fechaNacimiento',
  'departamento',
  'municipio',
  'genero',
];

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return REQUIRED_FIELDS.every((field) => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== '';
  });
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'SessionExpiredError';
  }
}

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  if (IS_DEMO_MODE) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_STORAGE_KEYS.profile, JSON.stringify(profile));
    }
    return;
  }

  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.includes('expired') || error.error?.includes('ExpiredToken')) {
      throw new SessionExpiredError();
    }
    throw new Error(error.error || 'Error al guardar perfil');
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (IS_DEMO_MODE) {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(DEMO_STORAGE_KEYS.profile);
    if (raw) {
      try {
        return JSON.parse(raw) as UserProfile;
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEYS.profile);
      }
    }

    return {
      userId: userId || DEMO_DEFAULT_USER_ID,
      createdAt: new Date().toISOString(),
      email: 'demo@quiniela.local',
      avatar: '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg',
      nombres: 'Usuario',
      apellidos: 'Demo',
      dpi: '',
      tel: '',
      fechaNacimiento: '',
      departamento: '',
      municipio: '',
      genero: '',
    };
  }

  const response = await fetch(`/api/profile?userId=${userId}`);

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.includes('expired') || error.error?.includes('ExpiredToken')) {
      throw new SessionExpiredError();
    }
    throw new Error(error.error || 'Error al obtener perfil');
  }

  const data = await response.json();
  return data.profile;
};

export const DEPARTAMENTOS_GT = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa',
] as const;

// Fuente base: INE Guatemala (Censo 2018), consolidada en:
// https://github.com/JuanPabloBC7/Guatemala/blob/main/js/departamentos-municipios.js
export const MUNICIPIOS_GT_POR_DEPARTAMENTO: Record<(typeof DEPARTAMENTOS_GT)[number], readonly string[]> = {
  'Alta Verapaz': [
    'Cobán', 'Santa Cruz Verapaz', 'San Cristóbal Verapaz', 'Tactic', 'Tamahú', 'San Miguel Tucurú',
    'Panzós', 'Senahú', 'San Pedro Carchá', 'San Juan Chamelco', 'Lanquín', 'Cahabón', 'Chisec',
    'Chahal', 'Fray Bartolomé de las Casas', 'Santa Catalina La Tinta', 'Raxruhá',
  ],
  'Baja Verapaz': [
    'Salamá', 'San Miguel Chicaj', 'Rabinal', 'Cubulco', 'Granados', 'El Chol', 'San Jerónimo', 'Purulhá',
  ],
  Chimaltenango: [
    'Chimaltenango', 'San José Poaquil', 'San Martín Jilotepeque', 'Comalapa', 'Santa Apolonia',
    'Tecpán Guatemala', 'Patzún', 'Pochuta', 'Patzicía', 'Santa Cruz Balanyá', 'Acatenango', 'Yepocapa',
    'San Andrés Itzapa', 'Parramos', 'Zaragoza', 'El Tejar',
  ],
  Chiquimula: [
    'Chiquimula', 'San José La Arada', 'San Juan Ermita', 'Jocotán', 'Camotán', 'Olopa', 'Esquipulas',
    'Concepción Las Minas', 'Quezaltepeque', 'San Jacinto', 'Ipala',
  ],
  'El Progreso': [
    'Guastatoya', 'Morazán', 'San Agustín Acasaguastlán', 'San Cristóbal Acasaguastlán', 'El Jícaro',
    'Sansare', 'Sanarate', 'San Antonio La Paz',
  ],
  Escuintla: [
    'Escuintla', 'Santa Lucía Cotzumalguapa', 'La Democracia', 'Siquinalá', 'Masagua', 'Tiquisate',
    'La Gomera', 'Guanagazapa', 'San José', 'Iztapa', 'Palín', 'San Vicente Pacaya',
    'Nueva Concepción', 'Sipacate',
  ],
  Guatemala: [
    'Guatemala', 'Santa Catarina Pinula', 'San José Pinula', 'San José del Golfo', 'Palencia',
    'Chinautla', 'San Pedro Ayampuc', 'Mixco', 'San Pedro Sacatepéquez', 'San Juan Sacatepéquez',
    'San Raymundo', 'Chuarrancho', 'Fraijanes', 'Amatitlán', 'Villa Nueva', 'Villa Canales', 'San Miguel Petapa',
  ],
  Huehuetenango: [
    'Huehuetenango', 'Chiantla', 'Malacatancito', 'Cuilco', 'Nentón', 'San Pedro Necta', 'Jacaltenango',
    'Soloma', 'San Ildefonso Ixtahuacán', 'Santa Bárbara', 'La Libertad', 'La Democracia', 'San Miguel Acatán',
    'San Rafael La Independencia', 'Todos Santos Cuchumatán', 'San Juan Atitán', 'Santa Eulalia',
    'San Mateo Ixtatán', 'Colotenango', 'San Sebastián Huehuetenango', 'Tectitán', 'Concepción Huista',
    'San Juan Ixcoy', 'San Antonio Huista', 'San Sebastián Coatán', 'Barillas', 'Aguacatán',
    'San Rafael Petzal', 'San Gaspar Ixchil', 'Santiago Chimaltenango', 'Santa Ana Huista', 'Unión Cantinil', 'Petatán',
  ],
  Izabal: ['Puerto Barrios', 'Livingston', 'El Estor', 'Morales', 'Los Amates'],
  Jalapa: [
    'Jalapa', 'San Pedro Pinula', 'San Luis Jilotepeque', 'San Manuel Chaparrón', 'San Carlos Alzatate',
    'Monjas', 'Mataquescuintla',
  ],
  Jutiapa: [
    'Jutiapa', 'El Progreso', 'Santa Catarina Mita', 'Agua Blanca', 'Asunción Mita', 'Yupiltepeque',
    'Atescatempa', 'Jerez', 'El Adelanto', 'Zapotitlán', 'Comapa', 'Jalpatagua', 'Conguaco', 'Moyuta',
    'Pasaco', 'San José Acatempa', 'Quesada',
  ],
  Petén: [
    'Flores', 'San José', 'San Benito', 'San Andrés', 'La Libertad', 'San Francisco', 'Santa Ana',
    'Dolores', 'San Luis', 'Sayaxché', 'Melchor de Mencos', 'Poptún', 'Las Cruces', 'El Chal',
  ],
  Quetzaltenango: [
    'Quetzaltenango', 'Salcajá', 'Olintepeque', 'San Carlos Sija', 'Sibilia', 'Cabricán', 'Cajolá',
    'San Miguel Sigüilá', 'Ostuncalco', 'San Mateo', 'Concepción Chiquirichapa', 'San Martín Sacatepéquez',
    'Almolonga', 'Cantel', 'Huitán', 'Zunil', 'Colomba', 'San Francisco La Unión', 'El Palmar',
    'Coatepeque', 'Génova', 'Flores Costa Cuca', 'La Esperanza', 'Palestina de Los Altos',
  ],
  Quiché: [
    'Santa Cruz del Quiché', 'Chiché', 'Chinique', 'Zacualpa', 'Chajul', 'Chichicastenango', 'Patzité',
    'San Antonio Ilotenango', 'San Pedro Jocopilas', 'Cunén', 'San Juan Cotzal', 'Joyabaj', 'Nebaj',
    'San Andrés Sajcabajá', 'Uspantán', 'Sacapulas', 'San Bartolomé Jocotenango', 'Canillá',
    'Chicamán', 'Ixcán', 'Pachalum',
  ],
  Retalhuleu: [
    'Retalhuleu', 'San Sebastián', 'Santa Cruz Muluá', 'San Martín Zapotitlán', 'San Felipe',
    'San Andrés Villa Seca', 'Champerico', 'Nuevo San Carlos', 'El Asintal',
  ],
  Sacatepéquez: [
    'Antigua Guatemala', 'Jocotenango', 'Pastores', 'Sumpango', 'Santo Domingo Xenacoj',
    'Santiago Sacatepéquez', 'San Bartolomé Milpas Altas', 'San Lucas Sacatepéquez', 'Santa Lucía Milpas Altas',
    'Magdalena Milpas Altas', 'Santa María de Jesús', 'Ciudad Vieja', 'San Miguel Dueñas', 'Alotenango',
    'San Antonio Aguas Calientes', 'Santa Catarina Barahona',
  ],
  'San Marcos': [
    'San Marcos', 'San Pedro Sacatepéquez', 'San Antonio Sacatepéquez', 'Comitancillo', 'San Miguel Ixtahuacán',
    'Concepción Tutuapa', 'Tacaná', 'Sibinal', 'Tajumulco', 'Tejutla', 'San Rafael Pie de La Cuesta',
    'Nuevo Progreso', 'El Tumbador', 'El Rodeo', 'Malacatán', 'Catarina', 'Ayutla', 'Ocós', 'San Pablo',
    'El Quetzal', 'La Reforma', 'Pajapita', 'Ixchiguán', 'San José Ojetenam', 'San Cristóbal Cucho',
    'Sipacapa', 'Esquipulas Palo Gordo', 'Río Blanco', 'San Lorenzo', 'La Blanca',
  ],
  'Santa Rosa': [
    'Cuilapa', 'Barberena', 'Santa Rosa de Lima', 'Casillas', 'San Rafael Las Flores', 'Oratorio',
    'San Juan Tecuaco', 'Chiquimulilla', 'Taxisco', 'Santa María Ixhuatán', 'Guazacapán',
    'Santa Cruz Naranjo', 'Pueblo Nuevo Viñas', 'Nueva Santa Rosa',
  ],
  Sololá: [
    'Sololá', 'San José Chacayá', 'Santa María Visitación', 'Santa Lucía Utatlán', 'Nahualá',
    'Santa Catarina Ixtahuacán', 'Santa Clara La Laguna', 'Concepción', 'San Andrés Semetabaj', 'Panajachel',
    'Santa Catarina Palopó', 'San Antonio Palopó', 'San Lucas Tolimán', 'Santa Cruz La Laguna',
    'San Pablo La Laguna', 'San Marcos La Laguna', 'San Juan La Laguna', 'San Pedro La Laguna', 'Santiago Atitlán',
  ],
  Suchitepéquez: [
    'Mazatenango', 'Cuyotenango', 'San Francisco Zapotitlán', 'San Bernardino', 'San José El Ídolo',
    'Santo Domingo Suchitepéquez', 'San Lorenzo', 'Samayac', 'San Pablo Jocopilas', 'San Antonio Suchitepéquez',
    'San Miguel Panán', 'San Gabriel', 'Chicacao', 'Patulul', 'Santa Bárbara', 'San Juan Bautista',
    'Santo Tomás La Unión', 'Zunilito', 'Pueblo Nuevo', 'Río Bravo', 'San José La Máquina',
  ],
  Totonicapán: [
    'Totonicapán', 'San Cristóbal Totonicapán', 'San Francisco El Alto', 'San Andrés Xecul',
    'Momostenango', 'Santa María Chiquimula', 'Santa Lucía La Reforma', 'San Bartolo',
  ],
  Zacapa: [
    'Zacapa', 'Estanzuela', 'Río Hondo', 'Gualán', 'Teculután', 'Usumatlán', 'Cabañas', 'San Diego',
    'La Unión', 'Huité', 'San Jorge',
  ],
} as const;

export const normalizarTexto = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

export const getDepartamentoCanonico = (departamento: string): string => {
  const departamentoNormalizado = normalizarTexto(departamento);
  return DEPARTAMENTOS_GT.find((dep) => normalizarTexto(dep) === departamentoNormalizado) || '';
};

export const getMunicipioCanonico = (departamento: string, municipio: string): string => {
  const municipios = MUNICIPIOS_GT_POR_DEPARTAMENTO[
    departamento as keyof typeof MUNICIPIOS_GT_POR_DEPARTAMENTO
  ] || [];
  const municipioNormalizado = normalizarTexto(municipio);
  return municipios.find((m) => normalizarTexto(m) === municipioNormalizado) || '';
};

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ');

const isValidDateOnly = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

export const validateAndNormalizeProfileFields = (
  values: EditableProfileFields
): ProfileValidationResult => {
  const nombres = normalizeName(values.nombres);
  const apellidos = normalizeName(values.apellidos);
  const dpi = String(values.dpi || '').replace(/\D/g, '');
  const tel = String(values.tel || '').replace(/\D/g, '');
  const fechaNacimiento = String(values.fechaNacimiento || '').trim();
  const departamentoCanonico = getDepartamentoCanonico(values.departamento || '');
  const municipioCanonico = getMunicipioCanonico(departamentoCanonico, values.municipio || '');
  const genero = String(values.genero || '').trim();

  const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
  if (nombres.length < 2 || !namePattern.test(nombres)) {
    return { valid: false, error: 'Ingresa nombres válidos' };
  }
  if (apellidos.length < 2 || !namePattern.test(apellidos)) {
    return { valid: false, error: 'Ingresa apellidos válidos' };
  }
  if (!/^\d{13}$/.test(dpi)) {
    return { valid: false, error: 'El DPI debe tener exactamente 13 dígitos' };
  }
  if (!/^\d{8}$/.test(tel)) {
    return { valid: false, error: 'El teléfono debe tener exactamente 8 dígitos' };
  }
  if (tel.startsWith('0')) {
    return { valid: false, error: 'El número de teléfono no puede empezar con 0' };
  }
  if (!isValidDateOnly(fechaNacimiento)) {
    return { valid: false, error: 'La fecha de nacimiento no es válida' };
  }

  const today = new Date();
  const todayDateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const birthDate = new Date(`${fechaNacimiento}T00:00:00.000Z`);
  if (birthDate > todayDateOnly) {
    return { valid: false, error: 'La fecha de nacimiento no puede ser futura' };
  }

  if (!departamentoCanonico) {
    return { valid: false, error: 'Selecciona un departamento válido' };
  }
  if (!municipioCanonico) {
    return { valid: false, error: 'El municipio no corresponde al departamento seleccionado' };
  }
  if (!GENERO_OPTIONS.includes(genero as (typeof GENERO_OPTIONS)[number])) {
    return { valid: false, error: 'Selecciona un género válido' };
  }

  return {
    valid: true,
    normalized: {
      nombres,
      apellidos,
      dpi,
      tel,
      fechaNacimiento,
      departamento: departamentoCanonico,
      municipio: municipioCanonico,
      genero,
    },
  };
};
