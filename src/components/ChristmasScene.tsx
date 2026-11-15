// Cena de Natal desenhada em SVG: Papai Noel de regata e Rudolph num conversível
// dourado, puxado por dois anões, voando sobre a cidade.

function random(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const rand = random(42);
const stars = Array.from({ length: 46 }, () => ({
  x: Math.round(rand() * 800),
  y: Math.round(rand() * 300),
  r: 0.6 + rand() * 1.2,
  delay: -rand() * 3,
}));
const flakes = Array.from({ length: 34 }, () => ({
  x: Math.round(rand() * 840),
  r: 1 + rand() * 1.8,
  duration: 7 + rand() * 7,
  delay: -rand() * 14,
}));

const backBuildings: [number, number, number][] = [
  [0, 70, 110], [70, 50, 130], [120, 80, 95], [200, 60, 125], [260, 90, 105], [350, 55, 128],
  [405, 75, 92], [480, 60, 122], [540, 85, 100], [625, 50, 126], [675, 70, 96], [745, 55, 120],
];
const frontBuildings: [number, number, number][] = [
  [0, 90, 70], [90, 70, 95], [160, 100, 60], [260, 60, 85], [320, 110, 70],
  [430, 70, 100], [500, 90, 65], [590, 60, 90], [650, 80, 75], [730, 70, 95],
];
const GROUND = 480;

function windows(x: number, w: number, h: number, seed: number) {
  const top = GROUND - h;
  const cols = Math.floor((w - 10) / 12);
  const rows = Math.floor((h - 18) / 16);
  const list: { x: number; y: number; lit: boolean }[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      list.push({ x: x + 7 + c * 12, y: top + 12 + r * 16, lit: (c * 3 + r * 5 + seed) % 4 !== 0 });
    }
  }
  return list;
}

const bulbColors = ["#ff5d5d", "#ffd65a", "#5fd38d", "#6fb7ff"];

function garland(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, count: number) {
  const points = Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    const u = 1 - t;
    return {
      x: u * u * x1 + 2 * u * t * cx + t * t * x2,
      y: u * u * y1 + 2 * u * t * cy + t * t * y2,
      color: bulbColors[i % bulbColors.length],
    };
  });
  return { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, points };
}

const garlands = [
  garland(160, 386, 210, 418, 260, 396, 7),
  garland(500, 381, 545, 408, 590, 391, 6),
  garland(710, 406, 720, 418, 730, 386, 2),
];

const skin = "#f3c29b";
const skinLine = "#b8764f";
const fur = "#8b5a36";

// Mão fazendo "paz e amor" (✌️): dois dedos em V saindo do punho.
function PeaceHand({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(0.8)`}>
      <rect x="-5" y="-17" width="4.6" height="14" rx="2.3" fill={skin} stroke={skinLine} strokeWidth="1" transform="rotate(-16 -2.7 -3)" />
      <rect x="0.4" y="-17" width="4.6" height="14" rx="2.3" fill={skin} stroke={skinLine} strokeWidth="1" transform="rotate(16 2.7 -3)" />
      <rect x="-6" y="-5" width="12" height="11" rx="4" fill={skin} stroke={skinLine} strokeWidth="1" />
      <path d="M-4 1.5 Q0 3.5 4 0.5" stroke={skinLine} strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Elf({ className }: { className: string }) {
  return (
    <g className={className}>
      <g className="kick">
        <path d="M24 2 L2 -6" stroke="#c4202b" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 2 L2 -6" stroke="#fff" strokeWidth="6" strokeDasharray="3 3" />
        <path d="M24 6 L4 12" stroke="#c4202b" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 6 L4 12" stroke="#fff" strokeWidth="6" strokeDasharray="3 3" />
        <path d="M4 -9 Q-6 -10 -10 -15 Q-8 -6 2 -3 Z" fill="#1f8a46" />
        <path d="M6 9 Q-4 9 -8 4 Q-7 13 4 15 Z" fill="#1f8a46" />
        <circle cx="-10" cy="-15" r="1.8" fill="#ffd65a" />
        <circle cx="-8" cy="4" r="1.8" fill="#ffd65a" />
      </g>
      <path d="M56 -4 L78 -22" stroke="#17703a" strokeWidth="6" strokeLinecap="round" />
      <PeaceHand x={81} y={-26} rotate={30} />
      <path d="M20 -8 L56 -10 Q65 -9 66 0 Q65 10 56 12 L20 10 Q14 1 20 -8 Z" fill="#1f8a46" />
      <path d="M20 -8 L26 -4 L32 -9 L38 -4 L44 -10 L50 -4 L56 -10" stroke="#ffd65a" strokeWidth="1.6" fill="none" />
      <rect x="38" y="-10" width="6" height="22" fill="#2a1a10" />
      <rect x="38.5" y="-1" width="5" height="5" fill="none" stroke="#ffd65a" strokeWidth="1.3" />
      <path d="M58 4 L89 15" stroke="#1f8a46" strokeWidth="6" strokeLinecap="round" />
      <PeaceHand x={94} y={16} rotate={65} />
      <circle cx="76" cy="0" r="11" fill={skin} />
      <path d="M67 -3 L55 -10 L68 3 Z" fill={skin} />
      <path d="M65 -5 Q75 -16 87 -7 Q66 -13 42 -21 Q56 -10 65 -5 Z" fill="#c4202b" />
      <path d="M65 -5 Q75 -13 87 -7" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="-21" r="3" fill="#ffd65a" />
      <ellipse cx="81" cy="-1.5" rx="1.6" ry="2.2" fill="#1d1712" />
      <path d="M78 -6 L84.5 -4.5" stroke="#1d1712" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="79" cy="4.5" r="2.6" fill="#f08a8a" opacity="0.6" />
      <circle cx="87.5" cy="1" r="2.4" fill="#e8957a" />
      <path d="M76 7.5 L88 6.5" stroke="#7a4b1a" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="84" y="4.2" width="3.2" height="3" rx="0.8" fill="#fff" />
    </g>
  );
}

function ReindeerBadge() {
  return (
    <>
      <ellipse cx="18" cy="15" rx="11" ry="5" />
      <path d="M25 12 L31 6 L37 7 L38 9.5 L33 10.5 L28 17 Z" />
      <path
        d="M31 6 L29 0 M30 3 L27 1.5 M33 6 L35 0.5 M34 3 L37 2"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M26 17 L34 21 L37 19 M24 18 L30 24 M11 18 L4 23 M13 19 L9 26 M7.5 13 L4 10.5"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Wheel({ cx }: { cx: number }) {
  const spokes = [0, 72, 144, 216, 288].map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.sin(rad) * 13, y: -Math.cos(rad) * 13 };
  });
  return (
    <g transform={`translate(${cx} 86)`}>
      <circle r="24" fill="#161210" />
      <circle r="21" fill="none" stroke="#2f2622" strokeWidth="2" />
      <g className="spin">
        <circle r="15" fill="#25232a" stroke="url(#gold)" strokeWidth="2.5" />
        {spokes.map((point) => (
          <line
            key={`${point.x}`}
            x1="0"
            y1="0"
            x2={point.x}
            y2={point.y}
            stroke="url(#gold)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ))}
        <circle r="4.5" fill="#ffd65a" stroke="#7a5418" strokeWidth="1" />
      </g>
    </g>
  );
}

export function ChristmasScene() {
  return (
    <svg
      viewBox="0 0 800 480"
      role="img"
      aria-labelledby="scene-title"
      className="scene block h-auto w-full"
    >
      <title id="scene-title">
        Papai Noel de regata, óculos escuros e corrente de ouro fazendo o L, num conversível dourado com uma
        rena no emblema. Ao lado dele, Rudolph com o nariz brilhando e uma blusa verde escrito MALVEADÃO. Dois
        anões puxam o carro com as cordas na boca, voando sobre a cidade.
      </title>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081230" />
          <stop offset="0.6" stopColor="#142a5c" />
          <stop offset="1" stopColor="#2d2f6e" />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.35" stopColor="#f5c84c" />
          <stop offset="0.72" stopColor="#c8922c" />
          <stop offset="1" stopColor="#7a5416" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1a6" />
          <stop offset="0.5" stopColor="#e6b33a" />
          <stop offset="1" stopColor="#9a6b1c" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#c7cfdb" />
          <stop offset="1" stopColor="#7d8794" />
        </linearGradient>
        <linearGradient id="shades" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3f6b" />
          <stop offset="1" stopColor="#07070d" />
        </linearGradient>
        <radialGradient id="noseFill" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ff8f8f" />
          <stop offset="1" stopColor="#d80f1c" />
        </radialGradient>
        <radialGradient id="noseGlow">
          <stop offset="0" stopColor="#ff4d4d" stopOpacity="0.8" />
          <stop offset="0.45" stopColor="#ff2a2a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff2a2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff4c2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff4c2" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="480" fill="url(#sky)" />

      {stars.map((star) => (
        <circle
          key={`${star.x}-${star.y}`}
          className="twinkle"
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#fdf8ef"
          style={{ animationDelay: `${star.delay}s` }}
        />
      ))}

      <circle cx="480" cy="72" r="70" fill="url(#moonGlow)" />
      <circle cx="480" cy="72" r="32" fill="#fff6d8" />
      <circle cx="470" cy="64" r="6" fill="#efe3bd" />
      <circle cx="492" cy="82" r="4.5" fill="#efe3bd" />
      <circle cx="488" cy="60" r="2.5" fill="#efe3bd" />

      {/* cidade */}
      {backBuildings.map(([x, w, h]) => (
        <rect key={`b${x}`} x={x} y={GROUND - h} width={w} height={h} fill="#1b2d5e" />
      ))}
      {frontBuildings.map(([x, w, h], index) => (
        <g key={`f${x}`}>
          <rect x={x} y={GROUND - h} width={w} height={h} fill="#0f1937" />
          <rect x={x - 2} y={GROUND - h - 3} width={w + 4} height="5" rx="2.5" fill="#e8f0ff" />
          {windows(x, w, h, index).map((win) => (
            <rect
              key={`${win.x}-${win.y}`}
              x={win.x}
              y={win.y}
              width="6"
              height="8"
              rx="1"
              fill={win.lit ? "#ffd36e" : "#1f2d55"}
              opacity={win.lit ? 0.9 : 1}
            />
          ))}
        </g>
      ))}
      {garlands.map((item) => (
        <g key={item.d}>
          <path d={item.d} stroke="#0a1024" strokeWidth="1.2" fill="none" />
          {item.points.map((point) => (
            <circle
              key={`${point.x}`}
              className="twinkle"
              cx={point.x}
              cy={point.y + 2}
              r="2.6"
              fill={point.color}
              style={{ animationDelay: `${(point.x % 7) * -0.3}s` }}
            />
          ))}
        </g>
      ))}
      <g>
        <rect x="371" y="404" width="8" height="8" fill="#5a3418" />
        <path d="M375 364 L404 406 L346 406 Z" fill="#1d6b3e" />
        <path d="M375 348 L396 382 L354 382 Z" fill="#228048" />
        <path
          d="M375 336 l3 6.5 7 0.8 -5.2 4.8 1.5 7 -6.3 -3.6 -6.3 3.6 1.5 -7 -5.2 -4.8 7 -0.8 Z"
          fill="#ffd65a"
        />
        {[
          [366, 376, "#ff5d5d"],
          [384, 372, "#6fb7ff"],
          [360, 400, "#ffd65a"],
          [378, 394, "#ff5d5d"],
          [392, 402, "#5fd38d"],
        ].map(([x, y, color]) => (
          <circle key={`${x}`} className="twinkle" cx={x} cy={y} r="2.4" fill={color as string} />
        ))}
      </g>
      <rect y="474" width="800" height="6" fill="#e8f0ff" />

      {/* rastro de purpurina */}
      <g fill="#ffd65a">
        {[
          [58, 244, 4],
          [36, 266, 3],
          [20, 238, 2.6],
          [8, 262, 2],
          [46, 282, 2.2],
          [26, 290, 1.6],
        ].map(([x, y, r], index) => (
          <path
            key={`${x}`}
            className="twinkle"
            style={{ animationDelay: `${index * -0.35}s` }}
            d={`M${x} ${y - r * 2} Q${x} ${y} ${x + r * 2} ${y} Q${x} ${y} ${x} ${y + r * 2} Q${x} ${y} ${x - r * 2} ${y} Q${x} ${y} ${x} ${y - r * 2} Z`}
          />
        ))}
      </g>
      <path d="M0 256 Q40 246 74 252" stroke="#ffd65a" strokeOpacity="0.35" strokeWidth="3" fill="none" />
      <path d="M0 278 Q36 270 70 274" stroke="#ffd65a" strokeOpacity="0.2" strokeWidth="2" fill="none" />

      <g className="fly">
        <g transform="translate(60 190) rotate(-5) scale(1.2)">
          {/* farol e rédeas */}
          <path d="M338 44 L470 8 L492 92 L338 58 Z" fill="url(#beam)" />
          <path d="M340 48 Q405 50 470 25" stroke="#7a4b1a" strokeWidth="2.4" fill="none" />
          <path d="M340 48 Q450 24 560 -27" stroke="#7a4b1a" strokeWidth="2.4" fill="none" />

          <g transform="translate(392 18)">
            <Elf className="bob-a" />
          </g>
          <g transform="translate(482 -34)">
            <Elf className="bob-b" />
          </g>

          {/* interior */}
          <path d="M28 34 Q28 22 42 22 L200 22 Q208 24 208 34 Z" fill="#4a1015" />

          {/* Rudolph */}
          <g>
            <path
              d="M72 -84 C66 -96 58 -104 52 -116 M64 -98 C56 -98 50 -102 44 -108 M58 -106 L62 -118 M88 -84 C94 -96 102 -104 108 -116 M96 -98 C104 -98 110 -102 116 -108 M102 -106 L98 -118"
              stroke="#c89a5c"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="62" cy="-80" rx="10" ry="4.5" fill={fur} transform="rotate(-25 62 -80)" />
            <ellipse cx="62" cy="-80" rx="6" ry="2.2" fill="#e8a898" transform="rotate(-25 62 -80)" />
            <ellipse cx="98" cy="-80" rx="10" ry="4.5" fill={fur} transform="rotate(25 98 -80)" />
            <ellipse cx="98" cy="-80" rx="6" ry="2.2" fill="#e8a898" transform="rotate(25 98 -80)" />
            <rect x="72" y="-46" width="16" height="22" fill={fur} />
            <path d="M36 40 Q32 4 46 -16 Q60 -27 80 -27 Q100 -27 114 -16 Q128 4 124 40 Z" fill="#1f7a3d" />
            <ellipse cx="80" cy="-25" rx="13" ry="4.5" fill="#17602f" stroke="#0f4a24" />
            <polyline
              points="48,-11 54,-15 60,-11 66,-15 72,-11 78,-15 84,-11 90,-15 96,-11 102,-15 108,-11 113,-14"
              stroke="#fff2d8"
              strokeWidth="1.8"
              fill="none"
            />
            <text
              x="80"
              y="8"
              textAnchor="middle"
              fontFamily="Outfit, 'Avenir Next', sans-serif"
              fontSize="12.5"
              fontWeight="700"
              textLength="72"
              lengthAdjust="spacingAndGlyphs"
              fill="#fff8e8"
              stroke="#0d3d1f"
              strokeWidth="2.4"
              paintOrder="stroke"
            >
              MALVEADÃO
            </text>
            {[48, 60, 72, 84, 96, 108].map((x) => (
              <circle key={x} cx={x} cy="19" r="1.6" fill="#ff6b6b" />
            ))}
            <ellipse cx="80" cy="-70" rx="17" ry="15" fill={fur} />
            <path d="M76 -84 Q80 -92 84 -84 Z" fill="#5c3a22" />
            <ellipse cx="80" cy="-55" rx="13" ry="10" fill="#c89466" />
            <ellipse cx="73" cy="-72" rx="4.5" ry="5" fill="#fff" />
            <ellipse cx="87" cy="-72" rx="4.5" ry="5" fill="#fff" />
            <circle cx="74.6" cy="-71" r="2.2" fill="#1d1712" />
            <circle cx="88.6" cy="-71" r="2.2" fill="#1d1712" />
            <path d="M68.3 -72 A4.7 4.7 0 0 1 77.7 -72 Z" fill={fur} stroke="#4a2d18" strokeWidth="0.8" />
            <path d="M82.3 -72 A4.7 4.7 0 0 1 91.7 -72 Z" fill={fur} stroke="#4a2d18" strokeWidth="0.8" />
            <path d="M84 -81 Q88 -84 92 -80.5" stroke="#4a2d18" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M74 -48.5 Q80 -45.5 87 -50" stroke="#4a2d18" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <circle className="nose-glow" cx="80" cy="-59" r="26" fill="url(#noseGlow)" />
            <circle cx="80" cy="-59" r="7" fill="url(#noseFill)" />
            <ellipse cx="77.8" cy="-61.6" rx="2.2" ry="1.3" fill="#fff" opacity="0.85" />
          </g>

          {/* Papai Noel */}
          <g>
            <path d="M134 40 L134 -6 Q134 -30 158 -32 L176 -32 Q200 -30 200 -6 L200 40 Z" fill={skin} />
            <path
              d="M139 40 Q134 10 140 -10 Q142 -26 150 -31 L155 -31 Q167 -8 179 -31 L184 -31 Q192 -26 194 -10 Q200 10 195 40 Z"
              fill="#c4202b"
            />
            <path d="M155 -31 Q167 -8 179 -31" stroke="#fff" strokeWidth="2.2" fill="none" />
            <circle cx="150" cy="-67" r="6" fill="#fff" />
            <circle cx="184" cy="-67" r="6" fill="#fff" />
            <circle cx="150.5" cy="-58" r="4" fill={skin} />
            <circle cx="183.5" cy="-58" r="4" fill={skin} />
            <ellipse cx="167" cy="-60" rx="17" ry="18" fill={skin} />
            <path
              d="M147 -62 Q140 -36 150 -20 Q158 -10 167 -12 Q176 -10 184 -20 Q194 -36 186 -62 Q176 -44 167 -44 Q158 -44 147 -62 Z"
              fill="#fff"
            />
            {[
              [152, -20],
              [160, -14],
              [168, -12],
              [176, -14],
              [183, -21],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="6" fill="#fff" />
            ))}
            <path d="M150 -30 Q152 -4 167 -2 Q182 -4 184 -30" stroke="#7a5418" strokeWidth="4.6" fill="none" />
            <path
              d="M150 -30 Q152 -4 167 -2 Q182 -4 184 -30"
              stroke="#ffd65a"
              strokeWidth="3"
              strokeDasharray="2.5 1.5"
              fill="none"
            />
            <circle cx="167" cy="2" r="6.5" fill="url(#gold)" stroke="#7a5418" strokeWidth="1.2" />
            <text
              x="167"
              y="5"
              textAnchor="middle"
              fontFamily="Outfit, sans-serif"
              fontSize="8.5"
              fontWeight="700"
              fill="#7a5418"
            >
              $
            </text>
            <circle cx="155" cy="-52" r="4" fill="#f08a7a" opacity="0.5" />
            <circle cx="179" cy="-52" r="4" fill="#f08a7a" opacity="0.5" />
            <ellipse cx="167" cy="-53" rx="4.2" ry="3.6" fill="#e8846c" />
            <path
              d="M167 -50 C160 -53 152 -51 148 -45 C156 -46 162 -46 167 -48 C172 -46 178 -46 186 -45 C182 -51 174 -53 167 -50 Z"
              fill="#fff"
              stroke="#dfe3ee"
              strokeWidth="0.8"
            />
            <path d="M161 -42.5 Q168 -39.5 175 -44" stroke="#8a3b2b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path
              d="M152 -63 L149 -60 M182 -63 L185 -60 M165 -63 Q167 -65 169 -63"
              stroke="#111"
              strokeWidth="1.6"
              fill="none"
            />
            <rect x="152" y="-66" width="13" height="9" rx="3.5" fill="url(#shades)" />
            <rect x="169" y="-66" width="13" height="9" rx="3.5" fill="url(#shades)" />
            <path
              d="M154.5 -60 L158 -64.5 M171.5 -60 L175 -64.5"
              stroke="#fff"
              strokeOpacity="0.7"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M152 -68.5 Q158 -72 164 -69.5 M170 -69.5 Q176 -72 182 -68.5"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M149 -77 C150 -96 164 -108 178 -100 C184 -96 186 -86 186 -77 Z" fill="#c4202b" />
            <path d="M168 -104 C156 -106 140 -100 130 -86 L136 -84 C146 -94 158 -98 172 -96 Z" fill="#c4202b" />
            <circle cx="130" cy="-85" r="6.5" fill="#fff" />
            <rect x="146" y="-82" width="42" height="9" rx="4.5" fill="#fff" />

            {/* braço fazendo o L */}
            <path
              d="M190 -22 L214 -44 L213 -80"
              stroke={skinLine}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M190 -22 L214 -44 L213 -80"
              stroke={skin}
              strokeWidth="11.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <rect x="206" y="-84" width="15" height="6" rx="2" fill="url(#gold)" stroke="#7a5418" strokeWidth="0.8" />
            <rect x="206" y="-122" width="6.5" height="30" rx="3.2" fill={skin} stroke={skinLine} strokeWidth="1.2" />
            <rect x="217" y="-92" width="16" height="6.5" rx="3.2" fill={skin} stroke={skinLine} strokeWidth="1.2" />
            <rect x="205" y="-100" width="16" height="16" rx="5" fill={skin} stroke={skinLine} strokeWidth="1.2" />
            <path d="M212.5 -96 L220 -96 M212.5 -92 L220 -92" stroke={skinLine} strokeWidth="1" />

            {/* braço no volante */}
            <path
              d="M140 -18 Q144 10 170 12 L192 8"
              stroke={skinLine}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M140 -18 Q144 10 170 12 L192 8"
              stroke={skin}
              strokeWidth="11.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          <ellipse
            cx="196"
            cy="12"
            rx="3.5"
            ry="11"
            transform="rotate(-18 196 12)"
            stroke="#24160c"
            strokeWidth="3"
            fill="none"
          />

          {/* carro */}
          <path d="M54 84 A29 29 0 0 1 112 84 Z M232 84 A29 29 0 0 1 290 84 Z" fill="#2a1a08" />
          <path
            d="M8 52 Q6 32 26 30 L150 28 L205 30 L300 38 Q336 42 340 60 L340 74 Q338 84 326 84 L290 84 A29 29 0 0 0 232 84 L112 84 A29 29 0 0 0 54 84 L20 84 Q8 82 8 70 Z"
            fill="url(#carBody)"
            stroke="#6b4812"
            strokeWidth="1.2"
          />
          <path d="M26 30 L150 28 L205 30" stroke="#fff6c8" strokeWidth="2" fill="none" />
          <path d="M210 33 L300 41 Q328 45 334 56" stroke="#fff6c8" strokeOpacity="0.75" strokeWidth="2" fill="none" />
          <path d="M248 35 L256 31 L282 34 L286 38 Z" fill="#b8862b" stroke="#6b4812" strokeWidth="0.8" />
          <path d="M14 58 L334 64" stroke="#5e3f10" strokeWidth="3" />
          <path d="M14 64 L334 70" stroke="#5e3f10" strokeWidth="1.3" />
          <path d="M120 32 L120 80" stroke="#8a5c1a" strokeWidth="1.4" />
          <rect x="126" y="40" width="14" height="3" rx="1.5" fill="url(#chrome)" />
          <g transform="translate(170 38) scale(1.1)">
            <g transform="translate(0.8 0.8)" fill="#fff6c8" stroke="#fff6c8">
              <ReindeerBadge />
            </g>
            <g fill="#4a3108" stroke="#4a3108">
              <ReindeerBadge />
            </g>
          </g>
          <rect x="7" y="42" width="6" height="12" rx="2" fill="#ff3b3b" />
          <circle cx="336" cy="50" r="10" fill="#fff6c8" opacity="0.45" />
          <circle cx="336" cy="50" r="5" fill="#fffbe0" stroke="url(#chrome)" strokeWidth="1.5" />
          <rect x="300" y="78" width="44" height="6" rx="3" fill="url(#chrome)" />
          <rect x="4" y="78" width="40" height="6" rx="3" fill="url(#chrome)" />
          <Wheel cx={83} />
          <Wheel cx={261} />
          <path
            d="M202 30 L216 -4 L224 -4 L212 30 Z"
            fill="#cdeeff"
            fillOpacity="0.4"
            stroke="url(#chrome)"
            strokeWidth="1.8"
          />

          {/* braço do Rudolph na porta */}
          <path d="M40 -10 Q27 10 26 38" stroke="#1f7a3d" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M21 33 L31 35" stroke="#fff2d8" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="26" cy="43" rx="6" ry="4.5" fill="#3a2312" />
        </g>
      </g>

      {flakes.map((flake) => (
        <circle
          key={`${flake.x}-${flake.r}`}
          className="flake"
          cx={flake.x}
          cy="0"
          r={flake.r}
          fill="#fff"
          opacity="0.85"
          style={{ animationDuration: `${flake.duration}s`, animationDelay: `${flake.delay}s` }}
        />
      ))}
    </svg>
  );
}
