/**
 * Real (SVG) diagrams per lesson — replaces ASCII art for the key topics.
 * Colors come from theme tokens so light/dark both look right.
 */

const stroke = "var(--border)";
const fg = "var(--foreground)";
const mut = "var(--muted-foreground)";
const card = "var(--card)";
const red = "var(--brand-red)";
const blue = "var(--brand-blue)";

function Box({
  x, y, w = 150, h = 46, label, sub, accent,
}: { x: number; y: number; w?: number; h?: number; label: string; sub?: string; accent?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={card} stroke={accent ?? stroke} strokeWidth={accent ? 2 : 1.2} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={fg}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={10.5} fill={mut}>{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mut} strokeWidth={1.6} markerEnd="url(#pd-arrow)" />;
}

function Frame({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <figure className="panel p-3 sm:p-4 my-4 overflow-hidden">
      <figcaption className="mono-label mb-2">{title}</figcaption>
      <svg viewBox={`0 0 640 ${height}`} className="w-full h-auto" role="img" aria-label={title}>
        <defs>
          <marker id="pd-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill={mut} />
          </marker>
        </defs>
        {children}
      </svg>
    </figure>
  );
}

function Intro() {
  return (
    <Frame title="How Python runs your file" height={230}>
      <Box x={20} y={20} label="your_code.py" sub="source text" accent={blue} />
      <Arrow x1={95} y1={66} x2={95} y2={96} />
      <Box x={20} y={100} label="Lexer + Parser" sub="tokens → AST" />
      <Arrow x1={170} y1={123} x2={230} y2={123} />
      <Box x={235} y={100} label="Compiler" sub="AST → bytecode" />
      <Arrow x1={385} y1={123} x2={445} y2={123} />
      <Box x={450} y={100} label="PVM" sub="runs bytecode" accent={red} />
      <Arrow x1={525} y1={146} x2={525} y2={176} />
      <Box x={450} y={180} h={40} label="Output" />
      <rect x={235} y={20} width={150} height={46} rx={10} fill={card} stroke={stroke} strokeDasharray="4 4" />
      <text x={310} y={48} textAnchor="middle" fontSize={12} fill={mut}>cached as .pyc</text>
      <Arrow x1={310} y1={96} x2={310} y2={70} />
    </Frame>
  );
}

function Variables() {
  return (
    <Frame title="Names point to objects (a = [1,2]; b = a)" height={200}>
      <text x={30} y={30} fontSize={12} fill={mut} fontWeight={700}>NAMES</text>
      <text x={400} y={30} fontSize={12} fill={mut} fontWeight={700}>OBJECTS IN MEMORY</text>
      <Box x={20} y={50} w={110} h={40} label="a" accent={blue} />
      <Box x={20} y={110} w={110} h={40} label="b" accent={blue} />
      <Box x={390} y={70} w={200} h={60} label="[1, 2, 3]" sub="id=0x7f... refcount=2" accent={red} />
      <Arrow x1={132} y1={70} x2={386} y2={92} />
      <Arrow x1={132} y1={130} x2={386} y2={110} />
      <text x={200} y={180} fontSize={12} fill={mut}>b.append(3) changes the one shared list, so `a` sees it too.</text>
    </Frame>
  );
}

function ControlFlow() {
  return (
    <Frame title="if / else and the loop-else path" height={250}>
      <Box x={250} y={10} w={140} h={38} label="start" />
      <Arrow x1={320} y1={50} x2={320} y2={72} />
      <polygon points="320,75 420,115 320,155 220,115" fill={card} stroke={blue} strokeWidth={2} />
      <text x={320} y={120} textAnchor="middle" fontSize={13} fontWeight={700} fill={fg}>condition?</text>
      <Arrow x1={218} y1={115} x2={165} y2={115} />
      <text x={185} y={105} textAnchor="middle" fontSize={11} fill={mut}>False</text>
      <Box x={10} y={92} w={150} h={46} label="else block" accent={red} />
      <Arrow x1={422} y1={115} x2={475} y2={115} />
      <text x={452} y={105} textAnchor="middle" fontSize={11} fill={mut}>True</text>
      <Box x={478} y={92} w={150} h={46} label="if block" accent={blue} />
      <Arrow x1={85} y1={140} x2={85} y2={190} />
      <Arrow x1={553} y1={140} x2={553} y2={190} />
      <Box x={240} y={190} w={160} h={44} label="continue" sub="next statement" />
      <Arrow x1={160} y1={212} x2={236} y2={212} />
      <Arrow x1={478} y1={212} x2={404} y2={212} />
    </Frame>
  );
}

function DataStructures() {
  const items = [
    { label: "list [ ]", sub: "ordered • mutable • duplicates", accent: blue },
    { label: "tuple ( )", sub: "ordered • immutable • hashable", accent: undefined },
    { label: "dict { k: v }", sub: "key → value • O(1) lookup", accent: red },
    { label: "set { }", sub: "unique • fast membership", accent: undefined },
  ];
  return (
    <Frame title="Pick the right container" height={240}>
      {items.map((it, i) => (
        <g key={it.label}>
          <rect x={20} y={15 + i * 56} width={600} height={46} rx={10} fill={card} stroke={it.accent ?? stroke} strokeWidth={it.accent ? 2 : 1.2} />
          <text x={40} y={44 + i * 56} fontSize={14} fontWeight={700} fill={fg}>{it.label}</text>
          <text x={220} y={44 + i * 56} fontSize={12} fill={mut}>{it.sub}</text>
        </g>
      ))}
    </Frame>
  );
}

function Functions() {
  return (
    <Frame title="Call stack and scope lookup (LEGB)" height={230}>
      <rect x={20} y={15} width={280} height={200} rx={12} fill="transparent" stroke={stroke} strokeDasharray="4 4" />
      <text x={35} y={35} fontSize={11} fill={mut} fontWeight={700}>CALL STACK</text>
      <Box x={40} y={45} w={240} h={40} label="inner()" sub="Local" accent={red} />
      <Box x={40} y={95} w={240} h={40} label="outer()" sub="Enclosing" />
      <Box x={40} y={145} w={240} h={40} label="module" sub="Global" accent={blue} />
      <Arrow x1={310} y1={110} x2={355} y2={110} />
      <text x={380} y={35} fontSize={11} fill={mut} fontWeight={700}>NAME LOOKUP ORDER</text>
      {["L — Local", "E — Enclosing", "G — Global", "B — Built-in"].map((t, i) => (
        <g key={t}>
          <rect x={365} y={45 + i * 42} width={250} height={34} rx={8} fill={card} stroke={stroke} />
          <text x={385} y={67 + i * 42} fontSize={13} fontWeight={600} fill={fg}>{t}</text>
        </g>
      ))}
    </Frame>
  );
}

function Oop() {
  return (
    <Frame title="Classes, instances and the MRO" height={230}>
      <Box x={240} y={15} w={170} h={46} label="Animal" sub="speak()" accent={blue} />
      <Arrow x1={200} y1={110} x2={290} y2={66} />
      <Arrow x1={450} y1={110} x2={360} y2={66} />
      <Box x={100} y={115} w={170} h={46} label="Dog" sub="speak() override" />
      <Box x={380} y={115} w={170} h={46} label="Cat" sub="speak() override" />
      <Arrow x1={185} y1={163} x2={185} y2={186} />
      <Box x={100} y={188} w={170} h={38} label="dog = Dog()" accent={red} />
      <text x={380} y={205} fontSize={12} fill={mut}>MRO: Dog → Animal → object</text>
    </Frame>
  );
}

function Iterators() {
  return (
    <Frame title="Iterable vs iterator vs generator" height={200}>
      <Box x={20} y={70} w={160} h={52} label="Iterable" sub="__iter__()" accent={blue} />
      <Arrow x1={182} y1={96} x2={238} y2={96} />
      <text x={210} y={84} textAnchor="middle" fontSize={10.5} fill={mut}>iter()</text>
      <Box x={240} y={70} w={160} h={52} label="Iterator" sub="__next__()" />
      <Arrow x1={402} y1={96} x2={458} y2={96} />
      <text x={430} y={84} textAnchor="middle" fontSize={10.5} fill={mut}>next()</text>
      <Box x={460} y={70} w={160} h={52} label="Item" sub="or StopIteration" accent={red} />
      <text x={320} y={165} textAnchor="middle" fontSize={12} fill={mut}>
        A generator function (yield) creates an iterator lazily — one item at a time, low memory.
      </text>
    </Frame>
  );
}

function Decorators() {
  return (
    <Frame title="A decorator wraps your function" height={210}>
      <rect x={40} y={30} width={560} height={110} rx={14} fill="transparent" stroke={red} strokeWidth={2} />
      <text x={60} y={55} fontSize={12} fontWeight={700} fill={red}>wrapper()  — runs before / after</text>
      <Box x={230} y={68} w={180} h={54} label="original func()" sub="your real logic" accent={blue} />
      <Arrow x1={140} y1={95} x2={226} y2={95} />
      <Arrow x1={414} y1={95} x2={500} y2={95} />
      <text x={95} y={88} textAnchor="middle" fontSize={11} fill={mut}>args in</text>
      <text x={545} y={88} textAnchor="middle" fontSize={11} fill={mut}>result out</text>
      <text x={320} y={180} textAnchor="middle" fontSize={12} fill={mut}>@decorator is just: func = decorator(func)</text>
    </Frame>
  );
}

function Concurrency() {
  return (
    <Frame title="Threads vs async vs processes (and the GIL)" height={240}>
      {[
        { t: "Threads", s: "I/O bound • share memory • one GIL", a: blue },
        { t: "Async (asyncio)", s: "I/O bound • one thread • await switches tasks", a: undefined },
        { t: "Processes", s: "CPU bound • own memory • own GIL each", a: red },
      ].map((r, i) => (
        <g key={r.t}>
          <rect x={20} y={20 + i * 70} width={600} height={58} rx={12} fill={card} stroke={r.a ?? stroke} strokeWidth={r.a ? 2 : 1.2} />
          <text x={44} y={46 + i * 70} fontSize={14} fontWeight={700} fill={fg}>{r.t}</text>
          <text x={44} y={65 + i * 70} fontSize={12} fill={mut}>{r.s}</text>
        </g>
      ))}
    </Frame>
  );
}

function Errors() {
  return (
    <Frame title="try / except / else / finally order" height={210}>
      {[
        { t: "try", s: "risky code runs here", a: blue },
        { t: "except", s: "runs only if an error was raised", a: red },
        { t: "else", s: "runs only if there was no error", a: undefined },
        { t: "finally", s: "always runs — cleanup", a: undefined },
      ].map((r, i) => (
        <g key={r.t}>
          <rect x={20 + i * 12} y={15 + i * 46} width={560 - i * 24} height={38} rx={9} fill={card} stroke={r.a ?? stroke} strokeWidth={r.a ? 2 : 1.2} />
          <text x={40 + i * 12} y={39 + i * 46} fontSize={13} fontWeight={700} fill={fg}>{r.t}</text>
          <text x={130 + i * 12} y={39 + i * 46} fontSize={12} fill={mut}>{r.s}</text>
        </g>
      ))}
    </Frame>
  );
}

const MAP: Record<string, () => JSX.Element> = {
  intro: Intro,
  variables: Variables,
  "control-flow": ControlFlow,
  "data-structures": DataStructures,
  functions: Functions,
  oop: Oop,
  errors: Errors,
  iterators: Iterators,
  decorators: Decorators,
  concurrency: Concurrency,
};

export function LessonDiagram({ lessonId }: { lessonId: string }) {
  const D = MAP[lessonId];
  if (!D) return null;
  return <D />;
}
