import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

// Tracés issus de Lucide (licence ISC), réduits aux icônes utilisées par l'app.
type Shape =
  | { d: string }
  | { cx: number; cy: number; r: number }
  | { cx: number; cy: number; rx: number; ry: number }
  | { x: number; y: number; w: number; h: number; rx: number };

const shapes = {
  home: [{ d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }, { d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
  search: [{ cx: 11, cy: 11, r: 8 }, { d: 'm21 21-4.3-4.3' }],
  martini: [{ d: 'M8 22h8' }, { d: 'M12 11v11' }, { d: 'm19 3-7 8-7-8Z' }],
  wine: [{ d: 'M8 22h8' }, { d: 'M7 10h10' }, { d: 'M12 15v7' }, { d: 'M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z' }],
  heart: [{ d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' }],
  settings: [
    { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
    { cx: 12, cy: 12, r: 3 },
  ],
  plus: [{ d: 'M5 12h14' }, { d: 'M12 5v14' }],
  minus: [{ d: 'M5 12h14' }],
  x: [{ d: 'M18 6 6 18' }, { d: 'm6 6 12 12' }],
  check: [{ d: 'M20 6 9 17l-5-5' }],
  chevronLeft: [{ d: 'm15 18-6-6 6-6' }],
  chevronRight: [{ d: 'm9 18 6-6-6-6' }],
  chevronDown: [{ d: 'm6 9 6 6 6-6' }],
  sliders: [{ d: 'M21 4h-7' }, { d: 'M10 4H3' }, { d: 'M21 12h-9' }, { d: 'M8 12H3' }, { d: 'M21 20h-5' }, { d: 'M12 20H3' }, { d: 'M14 2v4' }, { d: 'M8 10v4' }, { d: 'M16 18v4' }],
  star: [{ d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }],
  bookmark: [{ d: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' }],
  pencil: [{ d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' }, { d: 'm15 5 4 4' }],
  trash: [{ d: 'M3 6h18' }, { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }, { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }],
  download: [{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'm7 10 5 5 5-5' }, { d: 'M12 15V3' }],
  upload: [{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'm17 8-5-5-5 5' }, { d: 'M12 3v12' }],
  cart: [{ cx: 8, cy: 21, r: 1 }, { cx: 19, cy: 21, r: 1 }, { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' }],
  refresh: [{ d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }, { d: 'M21 3v5h-5' }, { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }, { d: 'M8 16H3v5' }],
  sparkles: [{ d: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' }],
  image: [{ x: 3, y: 3, w: 18, h: 18, rx: 2 }, { cx: 9, cy: 9, r: 2 }, { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
  info: [{ cx: 12, cy: 12, r: 10 }, { d: 'M12 16v-4' }, { d: 'M12 8h.01' }],
  list: [{ d: 'M3 6h.01' }, { d: 'M3 12h.01' }, { d: 'M3 18h.01' }, { d: 'M8 6h13' }, { d: 'M8 12h13' }, { d: 'M8 18h13' }],
  grid: [{ x: 3, y: 3, w: 7, h: 7, rx: 1 }, { x: 14, y: 3, w: 7, h: 7, rx: 1 }, { x: 14, y: 14, w: 7, h: 7, rx: 1 }, { x: 3, y: 14, w: 7, h: 7, rx: 1 }],
  glass: [{ d: 'M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z' }, { d: 'M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0' }],
  percent: [{ d: 'M19 5 5 19' }, { cx: 6.5, cy: 6.5, r: 2.5 }, { cx: 17.5, cy: 17.5, r: 2.5 }],
  shuffle: [{ d: 'm18 14 4 4-4 4' }, { d: 'm18 2 4 4-4 4' }, { d: 'M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-7.6a4 4 0 0 1 3.3-1.7H22' }, { d: 'M2 6h1.972a4 4 0 0 1 3.6 2.2' }, { d: 'M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45' }],
  leaf: [{ d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z' }, { d: 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12' }],
  sun: [{ cx: 12, cy: 12, r: 4 }, { d: 'M12 2v2' }, { d: 'M12 20v2' }, { d: 'm4.93 4.93 1.41 1.41' }, { d: 'm17.66 17.66 1.41 1.41' }, { d: 'M2 12h2' }, { d: 'M20 12h2' }, { d: 'm6.34 17.66-1.41 1.41' }, { d: 'm19.07 4.93-1.41 1.41' }],
  moon: [{ d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' }],
  book: [{ d: 'M12 7v14' }, { d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z' }],
  database: [{ cx: 12, cy: 5, rx: 9, ry: 3 }, { d: 'M3 5V19A9 3 0 0 0 21 19V5' }, { d: 'M3 12A9 3 0 0 0 21 12' }],
  sort: [{ d: 'm21 16-4 4-4-4' }, { d: 'M17 20V4' }, { d: 'm3 8 4-4 4 4' }, { d: 'M7 4v16' }],
  users: [{ d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }, { cx: 9, cy: 7, r: 4 }, { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }, { d: 'M16 3.13a4 4 0 0 1 0 7.75' }],
  shaker: [{ d: 'M8 2h8l-1 4H9z' }, { d: 'M7 6h10l-1.2 14.4A1.8 1.8 0 0 1 14 22h-4a1.8 1.8 0 0 1-1.8-1.6z' }, { d: 'M7.5 11h9' }],
  flame: [{ d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' }],
  clock: [{ cx: 12, cy: 12, r: 10 }, { d: 'M12 6v6l4 2' }],
  archive: [{ x: 2, y: 3, w: 20, h: 5, rx: 1 }, { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }, { d: 'M10 12h4' }],
  restore: [{ x: 2, y: 3, w: 20, h: 5, rx: 1 }, { d: 'M4 8v11a2 2 0 0 0 2 2h2' }, { d: 'M20 8v11a2 2 0 0 1-2 2h-2' }, { d: 'm9 15 3-3 3 3' }, { d: 'M12 12v9' }],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof shapes;

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number; filled?: boolean };

export function Icon({ name, size = 22, color, strokeWidth = 2, filled = false }: Props) {
  const fill = filled ? color : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {(shapes[name] as Shape[]).map((shape, index) => {
        if ('d' in shape) return <Path key={index} d={shape.d} fill={fill} />;
        if ('w' in shape) return <Rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} />;
        if ('rx' in shape) return <Ellipse key={index} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />;
        return <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />;
      })}
    </Svg>
  );
}
