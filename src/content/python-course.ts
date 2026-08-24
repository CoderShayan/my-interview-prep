export type Lesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  minutes: number;
  content: string;
  code: string;
};

export const PYTHON_COURSE: Lesson[] = [
  {
    id: "intro",
    title: "Python kya hai & kaise chalta hai",
    level: "Beginner",
    minutes: 6,
    summary: "Interpreter, bytecode aur Python ka execution model.",
    code: `print("Hello, Python!")\nprint(2 ** 10)\nname = "Prep"\nprint(f"Welcome {name}, len={len(name)}")`,
    content: `## Python kya hai

Python ek **high-level, interpreted, dynamically typed** language hai. Aap code likhte ho, aur Python ka interpreter use line-by-line (actually bytecode me compile karke) chalata hai — alag se compile step ki zarurat nahi.

### Execution pipeline (theory)

\`\`\`text
  your_code.py
       |
       v
  [ Lexer/Parser ]  --->  AST (Abstract Syntax Tree)
       |
       v
  [ Compiler ]      --->  Bytecode (.pyc)
       |
       v
  [ PVM: Python Virtual Machine ]  ---> Output
\`\`\`

- **Lexer/Parser**: text ko tokens aur tree me todta hai.
- **Compiler**: AST ko *bytecode* banata hai (machine code nahi).
- **PVM**: bytecode ko ek loop me evaluate karta hai.

### Key properties

| Property | Matlab |
| --- | --- |
| Interpreted | Run karne se pehle manual compile nahi |
| Dynamically typed | Variable ka type runtime pe decide hota hai |
| Garbage collected | Memory khud free hoti hai (refcount + GC) |
| Everything is object | int, function, class — sab object hain |

> Interview tip: "Python compiled hai ya interpreted?" — jawab: dono. Source pehle bytecode me compile hota hai, phir PVM use interpret karta hai.`,
  },
  {
    id: "variables",
    title: "Variables, Types aur Memory model",
    level: "Beginner",
    minutes: 8,
    summary: "Names vs objects, mutability, id() aur reference semantics.",
    code: `a = [1, 2, 3]\nb = a          # same object\nc = a.copy()   # new object\nb.append(4)\nprint("a =", a)\nprint("c =", c)\nprint(a is b, a is c)`,
    content: `## Variables = naam, dabba nahi

Python me variable ek **name tag** hai jo kisi object ko point karta hai.

\`\`\`text
   a ────────┐
             v
        ┌──────────┐
        │ list     │  [1, 2, 3]
        └──────────┘
             ^
   b ────────┘        (b = a  -> same object)

   c ──> [1, 2, 3]    (c = a.copy() -> naya object)
\`\`\`

### Built-in types

| Category | Types | Mutable? |
| --- | --- | --- |
| Numbers | \`int\`, \`float\`, \`complex\` | No |
| Text | \`str\` | No |
| Sequence | \`list\`, \`tuple\`, \`range\` | list only |
| Mapping | \`dict\` | Yes |
| Set | \`set\`, \`frozenset\` | set only |
| Bool/None | \`bool\`, \`NoneType\` | No |

### Mutability kyu matter karti hai
- Immutable object badalne par **naya object** banta hai.
- Mutable object function me pass karo to caller ko bhi change dikhta hai.

> \`is\` identity check karta hai (same memory), \`==\` value check karta hai.`,
  },
  {
    id: "operators",
    title: "Operators & Expressions",
    level: "Beginner",
    minutes: 6,
    summary: "Arithmetic, comparison, logical, walrus aur precedence.",
    code: `print(7 / 2, 7 // 2, 7 % 2, 7 ** 2)\nprint(3 < 5 <= 7)          # chaining\nprint(True and False, not 0)\nnums = [1, 2, 3, 4]\nif (n := len(nums)) > 3:\n    print("walrus n =", n)`,
    content: `## Operators

\`\`\`text
Precedence (upar sabse strong)
  **                exponent
  +x -x ~x          unary
  * / // %          multiplicative
  + -               additive
  << >>  &  ^  |    bitwise
  == != < > <= >= is in   comparison
  not  ->  and  ->  or    logical
\`\`\`

- \`/\` hamesha float deta hai, \`//\` floor division.
- Comparison **chain** ho sakta hai: \`1 < x < 10\`.
- \`and\`/\`or\` **short-circuit** karte hain aur *operand* return karte hain, bool nahi: \`0 or "x"  ->  "x"\`.
- Walrus \`:=\` expression ke andar assign karta hai (Python 3.8+).`,
  },
  {
    id: "control-flow",
    title: "Control Flow: if / loops / match",
    level: "Beginner",
    minutes: 8,
    summary: "Branching, for/while, else-on-loop aur match-case.",
    code: `for i in range(1, 6):\n    if i % 2 == 0:\n        print(i, "even")\n    else:\n        print(i, "odd")\n\nn = 3\nwhile n:\n    n -= 1\nelse:\n    print("loop finished cleanly")\n\ndef kind(x):\n    match x:\n        case 0: return "zero"\n        case int(): return "int"\n        case [a, b]: return f"pair {a},{b}"\n        case _: return "other"\nprint(kind([1, 2]), kind(5))`,
    content: `## Flow diagram

\`\`\`text
        ┌──────────┐
        │  start   │
        └────┬─────┘
             v
        ╱ cond? ╲── False ──> else-block ──┐
        ╲       ╱                          │
          True                             │
            v                              │
        if-block ──────────────────────────┤
                                           v
                                        continue
\`\`\`

### Loops
- \`for x in iterable\` — iterator protocol use karta hai.
- \`while cond\` — condition-based.
- **\`else\` on loop**: tab chalta hai jab loop \`break\` ke bina complete ho — search patterns me useful.
- \`break\`, \`continue\`, \`pass\`.

### match-case (3.10+)
Structural pattern matching — sirf switch nahi, **shape** match karta hai (lists, dicts, classes, guards \`case x if x > 5\`).`,
  },
  {
    id: "data-structures",
    title: "Lists, Tuples, Dicts, Sets",
    level: "Beginner",
    minutes: 10,
    summary: "Kaunsa structure kab, aur unki time complexity.",
    code: `nums = [5, 3, 9, 1]\nnums.sort()\nprint(nums, nums[::-1], nums[1:3])\n\nuser = {"name": "Aarav", "role": "dev"}\nuser["city"] = "Pune"\nprint(user.get("age", "N/A"), list(user.items()))\n\nprint(set([1,2,2,3]) & {2,3,4})\nprint({k: v.upper() for k, v in user.items()})`,
    content: `## Choose the right structure

\`\`\`text
 list  [ ] ordered, mutable, duplicates ok      -> sequence of items
 tuple ( ) ordered, immutable, hashable         -> fixed record / dict key
 dict  { } key -> value, insertion ordered      -> lookup by name
 set   { } unordered unique                     -> membership / dedupe
\`\`\`

### Complexity cheat-sheet

| Operation | list | dict | set |
| --- | --- | --- | --- |
| index / key lookup | O(1) | O(1) | — |
| \`in\` membership | O(n) | O(1) | O(1) |
| append / add | O(1)* | O(1) | O(1) |
| insert/delete at front | O(n) | O(1) | O(1) |

\\* amortized

### Slicing
\`seq[start:stop:step]\` — \`stop\` exclusive, negative step reverse karta hai.

### Comprehensions
\`[f(x) for x in xs if cond]\`, dict/set versions bhi. Loop se fast aur readable.`,
  },
  {
    id: "strings",
    title: "Strings & Formatting",
    level: "Beginner",
    minutes: 6,
    summary: "Immutability, f-strings, common methods, encoding.",
    code: `s = "  Python Interview  "\nprint(s.strip().lower().replace(" ", "_"))\nprint("-".join(["a", "b", "c"]), "a,b,c".split(","))\npi = 3.14159\nprint(f"{pi:.2f} | {42:>6} | {0.256:.1%}")\nprint("héllo".encode("utf-8"))`,
    content: `## Strings

String **immutable** hai — har "change" naya object banata hai. Isliye loop me \`s += x\` slow hai; \`"".join(parts)\` use karo.

\`\`\`text
  "PYTHON"
   P Y T H O N
   0 1 2 3 4 5      <- positive index
  -6-5-4-3-2-1      <- negative index
\`\`\`

### f-string mini-format

| Spec | Result |
| --- | --- |
| \`{x:.2f}\` | 2 decimal float |
| \`{x:>10}\` | right align width 10 |
| \`{x:,}\` | thousands separator |
| \`{x:.1%}\` | percentage |
| \`{x!r}\` | repr() |

### str vs bytes
\`str\` = Unicode text, \`bytes\` = raw. \`encode()\` str→bytes, \`decode()\` bytes→str.`,
  },
  {
    id: "functions",
    title: "Functions, Scope aur Closures",
    level: "Intermediate",
    minutes: 10,
    summary: "args/kwargs, default trap, LEGB rule, closures.",
    code: `def stats(*nums, precision=2, **meta):\n    avg = sum(nums) / len(nums)\n    return round(avg, precision), meta\n\nprint(stats(1, 2, 3, precision=3, source="test"))\n\ndef counter():\n    n = 0\n    def inc():\n        nonlocal n\n        n += 1\n        return n\n    return inc\n\nc = counter()\nprint(c(), c(), c())`,
    content: `## Scope: LEGB rule

\`\`\`text
  ┌──────────────── Builtins (len, print) ────────────────┐
  │  ┌───────────── Global (module level) ─────────────┐  │
  │  │  ┌────────── Enclosing (outer function) ─────┐  │  │
  │  │  │   ┌────── Local (current function) ────┐  │  │  │
  │  │  │   └───────────────────────────────────┘  │  │  │
  │  │  └───────────────────────────────────────────┘  │  │
  │  └─────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────┘
  Lookup order: Local -> Enclosing -> Global -> Builtins
\`\`\`

### Parameters
\`def f(pos, /, normal, *args, kw_only, **kwargs)\`
- \`*args\` extra positional tuple, \`**kwargs\` extra keyword dict.
- \`/\` se pehle positional-only, \`*\` ke baad keyword-only.

### Mutable default trap
\`\`\`python
def bad(items=[]):   # SAME list har call me!
    items.append(1); return items
def good(items=None):
    items = [] if items is None else items
\`\`\`

### Closure
Inner function outer ke variables ko **yaad** rakhta hai. Rebind karne ke liye \`nonlocal\` chahiye.`,
  },
  {
    id: "oop",
    title: "OOP: Classes, Inheritance, Dunder methods",
    level: "Intermediate",
    minutes: 12,
    summary: "Class model, MRO, properties aur magic methods.",
    code: `class Account:\n    bank = "PrepBank"          # class attribute\n\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self._balance = balance\n\n    @property\n    def balance(self):\n        return self._balance\n\n    def deposit(self, amt):\n        self._balance += amt\n        return self\n\n    def __repr__(self):\n        return f"Account({self.owner!r}, {self._balance})"\n\nclass Savings(Account):\n    def add_interest(self, rate=0.05):\n        return self.deposit(self._balance * rate)\n\na = Savings("Aarav", 1000).add_interest()\nprint(a, Savings.__mro__[:2])`,
    content: `## Object model

\`\`\`text
        object
          ^
          │
        Account          <- __init__, __repr__, @property
          ^
          │
        Savings          <- add_interest()

  instance ──> class ──> parent ──> object     (attribute lookup path = MRO)
\`\`\`

### Pillars
- **Encapsulation**: \`_private\` convention, \`__name\` name-mangling.
- **Inheritance**: reuse; \`super().__init__()\` zaruri.
- **Polymorphism**: same method naam, alag behaviour (duck typing).
- **Abstraction**: \`abc.ABC\` + \`@abstractmethod\`.

### Useful dunders

| Dunder | Kab chalta hai |
| --- | --- |
| \`__init__\` | object banate waqt |
| \`__repr__\` / \`__str__\` | debug / print |
| \`__eq__\`, \`__hash__\` | == aur set/dict key |
| \`__len__\`, \`__getitem__\` | len(), obj[i] |
| \`__iter__\`, \`__next__\` | for loop |
| \`__enter__\`, \`__exit__\` | with block |
| \`__call__\` | obj() |

### Method types
\`self\` → instance method, \`@classmethod (cls)\` → alternate constructors, \`@staticmethod\` → plain helper.`,
  },
  {
    id: "errors",
    title: "Exceptions & Error Handling",
    level: "Intermediate",
    minutes: 8,
    summary: "try/except/else/finally, custom exceptions, EAFP.",
    code: `class LowBalance(Exception):\n    pass\n\ndef withdraw(bal, amt):\n    try:\n        if amt > bal:\n            raise LowBalance(f"need {amt-bal} more")\n        return bal - amt\n    except LowBalance as e:\n        print("Error:", e)\n        return bal\n    else:\n        print("ok")\n    finally:\n        print("audit log written")\n\nprint(withdraw(100, 250))`,
    content: `## try / except / else / finally

\`\`\`text
  try:      <- risky code
   │  no error ─────────────> else:      (optional)
   │  error ──> except:  matching handler
   └──────────────────────────> finally:  ALWAYS runs (cleanup)
\`\`\`

### Hierarchy (chhota sa)
\`\`\`text
BaseException
 └── Exception
      ├── ArithmeticError -> ZeroDivisionError
      ├── LookupError     -> KeyError, IndexError
      ├── ValueError, TypeError
      └── OSError -> FileNotFoundError
\`\`\`

### Best practices
- Specific exception pakdo, bare \`except:\` nahi.
- **EAFP** (try/except) Python me LBYL (pehle check) se zyada idiomatic hai.
- Context chain: \`raise NewError(...) from e\`.
- Cleanup ke liye \`with\` ya \`finally\`.`,
  },
  {
    id: "modules",
    title: "Modules, Packages & Virtual environments",
    level: "Intermediate",
    minutes: 7,
    summary: "import system, __name__, venv aur project layout.",
    code: `import math, json\nfrom datetime import datetime\n\nprint(math.sqrt(144), math.pi)\nprint(json.dumps({"ok": True, "n": [1,2]}))\nprint(datetime(2026, 1, 1).strftime("%d %b %Y"))\nprint(__name__)`,
    content: `## Package layout

\`\`\`text
myapp/
├── pyproject.toml
├── myapp/
│   ├── __init__.py      <- package marker
│   ├── core.py
│   └── utils/
│       ├── __init__.py
│       └── text.py
└── tests/
\`\`\`

### import kaise resolve hota hai
\`\`\`text
import x  ->  sys.modules cache?  --yes--> reuse
                    |no
                    v
             sys.path folders me dhundo  ->  compile -> execute once
\`\`\`

- \`if __name__ == "__main__":\` — file directly chale tabhi block chale.
- **venv**: \`python -m venv .venv\` → isolated dependencies, \`pip freeze > requirements.txt\`.
- Absolute imports prefer karo; circular imports se bacho.`,
  },
  {
    id: "iterators",
    title: "Iterators, Generators & Lazy evaluation",
    level: "Advanced",
    minutes: 10,
    summary: "Iterator protocol, yield, generator expressions, memory wins.",
    code: `def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ngen = fib()\nprint([next(gen) for _ in range(10)])\n\nsquares = (x * x for x in range(1_000_000))   # lazy\nprint(sum(x for x in squares if x % 7 == 0) % 1000)\n\nfrom itertools import islice, count\nprint(list(islice(count(10, 5), 5)))`,
    content: `## Iterator protocol

\`\`\`text
  for x in obj:
        │
        v
   iter(obj) ──> iterator ──┐
        ^                   │
        └── next(it) ───────┘  ... until StopIteration
\`\`\`

- **Iterable**: \`__iter__\` rakhta hai (list, str, dict).
- **Iterator**: \`__iter__\` + \`__next__\` rakhta hai; ek baar consume hota hai.

### Generators
\`yield\` wala function call par **generator** return karta hai — state pause/resume hoti hai.

\`\`\`text
 list comprehension  [x*x for x in big]   -> poori memory
 generator expr      (x*x for x in big)   -> ek time pe ek value
\`\`\`

| | list | generator |
| --- | --- | --- |
| Memory | O(n) | O(1) |
| Re-iterate | Yes | No |
| Infinite sequences | No | Yes |

\`itertools\` (chain, islice, groupby, product) generators ke saath best combo hai.`,
  },
  {
    id: "decorators",
    title: "Decorators & Context managers",
    level: "Advanced",
    minutes: 10,
    summary: "Higher-order functions, functools.wraps, with-statement.",
    code: `import functools, time\n\ndef timed(fn):\n    @functools.wraps(fn)\n    def wrapper(*a, **kw):\n        t = time.perf_counter()\n        out = fn(*a, **kw)\n        print(f"{fn.__name__} took {(time.perf_counter()-t)*1000:.2f} ms")\n        return out\n    return wrapper\n\n@timed\ndef slow_sum(n):\n    return sum(range(n))\n\nprint(slow_sum(200000))\n\nfrom contextlib import contextmanager\n@contextmanager\ndef section(name):\n    print("->", name)\n    yield\n    print("<-", name)\n\nwith section("work"):\n    print("doing work")`,
    content: `## Decorator = function wrapper

\`\`\`text
   @timed
   def slow_sum(n): ...

   equals:  slow_sum = timed(slow_sum)

   call ──> wrapper ──> original fn ──> result
              │  (before)      │ (after)
              └── logging/timing/auth/cache
\`\`\`

- \`functools.wraps\` original ka \`__name__\`/docstring preserve karta hai.
- Arguments wale decorator = teen level nesting (\`deco(arg) -> deco -> wrapper\`).
- Built-ins: \`@property\`, \`@staticmethod\`, \`@lru_cache\`, \`@dataclass\`.

## Context manager

\`\`\`text
 with open(f) as fh:      __enter__()  -> resource
     use(fh)              body
                          __exit__()   -> cleanup (exception me bhi)
\`\`\`

Class based (\`__enter__/__exit__\`) ya \`@contextmanager\` + \`yield\`.`,
  },
  {
    id: "concurrency",
    title: "Concurrency: threads, async, processes & GIL",
    level: "Advanced",
    minutes: 12,
    summary: "GIL kya hai, kab thread, kab async, kab process.",
    code: `import asyncio\n\nasync def task(name, delay):\n    await asyncio.sleep(delay)\n    return f"{name} done in {delay}s"\n\nasync def main():\n    res = await asyncio.gather(\n        task("A", 0.2), task("B", 0.1), task("C", 0.3)\n    )\n    for r in res:\n        print(r)\n\nawait main()   # notebook-style top-level await`,
    content: `## GIL (Global Interpreter Lock)

CPython me ek time par **ek hi thread** Python bytecode chala sakta hai.

\`\`\`text
  CPU-bound  ──> threads help NAHI karte (GIL)   -> multiprocessing
  I/O-bound  ──> threads / asyncio badhiya       -> wait time overlap
\`\`\`

### Teen models

| Model | Best for | Parallel CPU? | Cost |
| --- | --- | --- | --- |
| \`threading\` | I/O wait (files, net) | No | Light |
| \`asyncio\` | Hazaaron I/O tasks | No | Sabse light |
| \`multiprocessing\` | CPU heavy math | Yes | Heavy (alag process) |

### async ka mental model
\`\`\`text
 event loop
   ├── task A ── await io ──╮ (paused, loop free)
   ├── task B ── await io ──┤
   └── task C ────────────  ┘  jo pehle ready -> resume
\`\`\`

- \`async def\` coroutine banata hai; \`await\` control loop ko wapas deta hai.
- \`asyncio.gather\` concurrent run karta hai, \`asyncio.run(main())\` entry point (yahan interpreter me top-level \`await\` chal jata hai).
- Blocking call async code me poora loop rok deta hai — \`run_in_executor\` use karo.`,
  },
  {
    id: "pythonic",
    title: "Pythonic patterns, typing & performance",
    level: "Advanced",
    minutes: 10,
    summary: "dataclasses, type hints, caching aur optimisation checklist.",
    code: `from dataclasses import dataclass, field\nfrom functools import lru_cache\nfrom typing import Optional\n\n@dataclass(frozen=True, slots=True)\nclass Candidate:\n    name: str\n    skills: list[str] = field(default_factory=list)\n    score: Optional[float] = None\n\n@lru_cache(maxsize=None)\ndef fib(n: int) -> int:\n    return n if n < 2 else fib(n-1) + fib(n-2)\n\nc = Candidate("Aarav", ["python", "sql"], 8.5)\nprint(c)\nprint("fib(80) =", fib(80))`,
    content: `## Pythonic checklist

- Loop + index ki jagah \`enumerate\`, \`zip\`, comprehension.
- \`with\` se resources, \`pathlib\` se paths, \`collections\` (Counter, defaultdict, deque).
- Data holders ke liye \`@dataclass\` — \`__init__\`, \`__repr__\`, \`__eq__\` free.
- \`slots=True\` memory bachata hai, \`frozen=True\` immutable + hashable.

### Type hints
Runtime pe enforce nahi hote, par \`mypy\`/editor ke liye contract hain.
\`\`\`python
def top(names: list[str], k: int = 3) -> list[str]: ...
\`\`\`

### Performance order
\`\`\`text
 1. Sahi algorithm/data structure   (O(n^2) -> O(n))
 2. Built-ins & comprehensions      (C speed)
 3. Caching (lru_cache)             (repeat work hatao)
 4. NumPy / vectorisation           (bulk numeric)
 5. Tabhi: C extension / PyPy
\`\`\`

Pehle **measure** karo: \`timeit\`, \`cProfile\`. Guess mat lagao.`,
  },
];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
