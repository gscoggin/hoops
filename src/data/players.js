import stephImg from '../assets/steph.jpeg';
import lebronImg from '../assets/LeBron.jpeg';
import jordanImg from '../assets/MichaelJordan.jpeg';
import durantImg from '../assets/KevinDurant.jpg';
import kobeImg from '../assets/KobeBryant.jpeg';
import shaqImg from '../assets/shaq.jpeg';
import magicImg from '../assets/MagicJohnson.jpeg';
import birdImg from '../assets/larryBird.jpg';
import kareemImg from '../assets/Kareem.jpeg';
import giannisImg from '../assets/Giannis.jpeg';

export const PLAYERS = [
  {
    id: 'curry',
    name: 'Stephen Curry',
    team: 'Golden State Warriors',
    number: 30,
    color: '#1D428A',
    accentColor: '#FFC72C',
    stats: { speed: 85, accuracy: 99, jump: 80, power: 78 },
    emoji: '🏀',
    image: stephImg,
    skinColor: '#C68642',   // light-medium brown
    heightScale: 1.00,      // 6'3"
    widthScale: 1.00,
  },
  {
    id: 'lebron',
    name: 'LeBron James',
    team: 'Los Angeles Lakers',
    number: 23,
    color: '#552583',
    accentColor: '#FDB927',
    stats: { speed: 90, accuracy: 85, jump: 88, power: 95 },
    emoji: '👑',
    image: lebronImg,
    skinColor: '#7B4A2A',   // medium-dark brown
    heightScale: 1.07,      // 6'9"
    widthScale: 1.10,
  },
  {
    id: 'jordan',
    name: 'Michael Jordan',
    team: 'Chicago Bulls',
    number: 23,
    color: '#CE1141',
    accentColor: '#000000',
    stats: { speed: 92, accuracy: 95, jump: 95, power: 88 },
    emoji: '🐐',
    image: jordanImg,
    skinColor: '#8B4513',   // medium-dark brown
    heightScale: 1.05,      // 6'6"
    widthScale: 1.00,
  },
  {
    id: 'durant',
    name: 'Kevin Durant',
    team: 'Phoenix Suns',
    number: 35,
    color: '#1D1160',
    accentColor: '#E56020',
    stats: { speed: 85, accuracy: 92, jump: 92, power: 90 },
    emoji: '🦢',
    image: durantImg,
    skinColor: '#5C3317',   // dark brown
    heightScale: 1.09,      // 6'10" — slim
    widthScale: 0.88,
  },
  {
    id: 'kobe',
    name: 'Kobe Bryant',
    team: 'Los Angeles Lakers',
    number: 24,
    color: '#552583',
    accentColor: '#FDB927',
    stats: { speed: 88, accuracy: 94, jump: 88, power: 85 },
    emoji: '🐍',
    image: kobeImg,
    skinColor: '#8B5E3C',   // medium brown
    heightScale: 1.05,      // 6'6"
    widthScale: 1.00,
  },
  {
    id: 'shaq',
    name: "Shaquille O'Neal",
    team: 'Los Angeles Lakers',
    number: 34,
    color: '#552583',
    accentColor: '#FDB927',
    stats: { speed: 65, accuracy: 75, jump: 80, power: 99 },
    emoji: '💪',
    image: shaqImg,
    skinColor: '#3D1C02',   // very dark
    heightScale: 1.15,      // 7'1"
    widthScale: 1.30,
  },
  {
    id: 'magic',
    name: 'Magic Johnson',
    team: 'Los Angeles Lakers',
    number: 32,
    color: '#552583',
    accentColor: '#FDB927',
    stats: { speed: 90, accuracy: 88, jump: 82, power: 80 },
    emoji: '✨',
    image: magicImg,
    skinColor: '#5C3317',   // dark brown
    heightScale: 1.07,      // 6'9"
    widthScale: 1.05,
  },
  {
    id: 'bird',
    name: 'Larry Bird',
    team: 'Boston Celtics',
    number: 33,
    color: '#007A33',
    accentColor: '#FFFFFF',
    stats: { speed: 78, accuracy: 96, jump: 80, power: 82 },
    emoji: '🐦',
    image: birdImg,
    skinColor: '#F0C896',   // fair/light
    heightScale: 1.07,      // 6'9"
    widthScale: 1.05,
  },
  {
    id: 'kareem',
    name: 'Kareem Abdul-Jabbar',
    team: 'Los Angeles Lakers',
    number: 33,
    color: '#552583',
    accentColor: '#FDB927',
    stats: { speed: 72, accuracy: 90, jump: 95, power: 88 },
    emoji: '🗼',
    image: kareemImg,
    skinColor: '#3D1C02',   // very dark
    heightScale: 1.16,      // 7'2"
    widthScale: 1.10,
  },
  {
    id: 'giannis',
    name: 'Giannis Antetokounmpo',
    team: 'Milwaukee Bucks',
    number: 34,
    color: '#00471B',
    accentColor: '#EEE1C6',
    stats: { speed: 93, accuracy: 80, jump: 94, power: 97 },
    emoji: '🦌',
    image: giannisImg,
    skinColor: '#3D1C02',   // very dark
    heightScale: 1.11,      // 6'11"
    widthScale: 1.10,
  },
];
