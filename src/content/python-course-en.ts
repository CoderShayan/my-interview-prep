/**
 * Simple-English version of the Python course.
 * Keyed by the lesson id in `python-course.ts`.
 * Language is written for readers whose first language is not English:
 * short sentences, common words, no idioms.
 */

export type LessonEn = { title: string; summary: string; content: string };

export const PYTHON_COURSE_EN: Record<string, LessonEn> = {
  intro: {
    title: "What Python is and how it runs",
    summary: "The interpreter, bytecode and Python's execution model.",
    content: `## What is Python

Python is a **high-level, interpreted, dynamically typed** language. You write code and the Python interpreter runs it. You do not need a separate compile step like in C or Java.

### How your file becomes output

Python first turns your source code into **bytecode** (small instructions for Python itself, not for the CPU). Then the Python Virtual Machine (PVM) runs that bytecode in a loop.

- **Lexer / Parser** — breaks the text into tokens and builds a tree (AST).
- **Compiler** — turns the tree into bytecode, and can cache it in a \`.pyc\` file.
- **PVM** — reads the bytecode instruction by instruction and produces output.

### Key properties

| Property | What it means |
| --- | --- |
| Interpreted | You do not compile by hand before running |
| Dynamically typed | The type is decided while the program runs |
| Garbage collected | Memory is freed for you (reference counting + GC) |
| Everything is an object | Numbers, functions and classes are all objects |

> Interview tip: "Is Python compiled or interpreted?" The honest answer is **both**. The source is compiled to bytecode, then the bytecode is interpreted.`,
  },

  variables: {
    title: "Variables, types and the memory model",
    summary: "Names vs objects, mutability, id() and reference behaviour.",
    content: `## A variable is a name, not a box

In many languages a variable is a box that holds a value. In Python a variable is only a **name tag** attached to an object that lives in memory. Two names can point to the same object.

\`\`\`python
a = [1, 2, 3]
b = a        # same object, second name
c = a.copy() # a new object
\`\`\`

- \`a is b\` is **True** — one object, two names.
- \`a is c\` is **False** — two different objects with equal content.
- \`id(x)\` shows the identity (address) of the object.

### Mutable vs immutable

| Group | Types | Can you change it in place? |
| --- | --- | --- |
| Immutable | int, float, str, tuple, bool, frozenset | No — you get a new object |
| Mutable | list, dict, set, most custom classes | Yes |

Because lists are mutable, passing a list to a function lets that function change your data. Pass a copy when you do not want that.

### Why this matters

\`==\` compares **values**. \`is\` compares **identity**. Use \`==\` for normal checks and keep \`is\` for \`None\`:

\`\`\`python
if value is None:   # correct
if value == None:   # works, but not idiomatic
\`\`\``,
  },

  operators: {
    title: "Operators and expressions",
    summary: "Arithmetic, comparison, logical, walrus and precedence.",
    content: `## Operators you use every day

| Operator | Meaning | Example |
| --- | --- | --- |
| \`/\` | True division (always float) | \`7 / 2 → 3.5\` |
| \`//\` | Floor division | \`7 // 2 → 3\` |
| \`%\` | Remainder | \`7 % 2 → 1\` |
| \`**\` | Power | \`2 ** 10 → 1024\` |

### Logical operators return values, not just True/False

\`and\` returns the first false value, otherwise the last value. \`or\` returns the first true value. This is called **short-circuit** behaviour, and Python stops as soon as the answer is known.

\`\`\`python
name = user_name or "guest"   # fallback value
\`\`\`

### Chained comparison

Python lets you write \`1 < x < 10\`. It is read as \`1 < x and x < 10\`, and \`x\` is evaluated only once.

### Walrus operator \`:=\`

It assigns a value **and** returns it inside one expression:

\`\`\`python
if (n := len(data)) > 10:
    print(f"too long: {n}")
\`\`\`

### Precedence, from strong to weak

\`**\` → unary \`-\` → \`* / // %\` → \`+ -\` → comparisons → \`not\` → \`and\` → \`or\`.
When you are not sure, add brackets. Clear code beats clever code.`,
  },

  "control-flow": {
    title: "Control flow: if, loops and match",
    summary: "Branching, for/while, else on loops and match-case.",
    content: `## Making decisions

Python uses **indentation** instead of curly braces. Four spaces per level is the standard.

\`\`\`python
if score >= 90:
    grade = "A"
elif score >= 75:
    grade = "B"
else:
    grade = "C"
\`\`\`

### Falsy values

These are treated as false: \`False\`, \`None\`, \`0\`, \`0.0\`, \`""\`, \`[]\`, \`{}\`, \`set()\`. Everything else is true.

### Loops

- \`for\` walks over any iterable (list, string, dict, file, generator).
- \`while\` repeats while a condition stays true.
- \`break\` leaves the loop, \`continue\` skips to the next round.

### The loop \`else\` clause

The \`else\` block of a loop runs **only when the loop was not stopped by \`break\`**. It is useful for search code:

\`\`\`python
for item in items:
    if item.id == target:
        print("found")
        break
else:
    print("not found")
\`\`\`

### match-case (Python 3.10+)

\`match\` compares a value against patterns, and it can unpack structures at the same time:

\`\`\`python
match command.split():
    case ["go", direction]:
        move(direction)
    case ["quit"]:
        stop()
    case _:
        print("unknown command")
\`\`\``,
  },

  "data-structures": {
    title: "Lists, tuples, dicts and sets",
    summary: "Which structure to pick, and how fast each one is.",
    content: `## The four containers

| Type | Ordered | Changeable | Duplicates | Typical use |
| --- | --- | --- | --- | --- |
| \`list\` | Yes | Yes | Yes | A sequence you keep editing |
| \`tuple\` | Yes | No | Yes | A fixed record, a dict key |
| \`dict\` | Yes (insertion) | Yes | Keys unique | Lookup by key |
| \`set\` | No | Yes | No | Uniqueness and membership tests |

### Speed (average case)

| Operation | list | dict / set |
| --- | --- | --- |
| Lookup by key / \`in\` | O(n) | **O(1)** |
| Append / add | O(1) | O(1) |
| Insert or delete in the middle | O(n) | O(1) |

If your code does \`if x in big_list\` inside a loop, convert the list to a \`set\` first. That single change often turns slow code into fast code.

### Comprehensions

\`\`\`python
squares  = [n * n for n in range(10)]
evens    = {n for n in range(20) if n % 2 == 0}
by_name  = {u.name: u for u in users}
\`\`\`

They are shorter and usually faster than building with an empty list and \`append\`. Keep them to one line of logic — if you need more, write a normal loop.`,
  },

  strings: {
    title: "Strings and formatting",
    summary: "Immutability, f-strings, common methods, encoding.",
    content: `## Strings never change

A string is immutable. Every "change" makes a new string:

\`\`\`python
s = "hello"
s = s.upper()   # a new string object
\`\`\`

So building a long text inside a loop with \`+=\` is slow. Collect the parts in a list and use \`"".join(parts)\` at the end.

### f-strings are the modern way

\`\`\`python
name, score = "Asha", 9.256
print(f"{name} scored {score:.2f}")   # Asha scored 9.26
print(f"{name!r} has {len(name)} letters")
print(f"{score=}")                    # score=9.256 — great for debugging
\`\`\`

### Methods you will use often

| Method | What it does |
| --- | --- |
| \`.strip()\` | Removes spaces from both ends |
| \`.split(sep)\` | Splits into a list |
| \`.join(list)\` | Joins a list into one string |
| \`.replace(a, b)\` | Replaces text |
| \`.startswith()\` / \`.endswith()\` | Checks the edges |

### Text vs bytes

\`str\` is text (Unicode). \`bytes\` is raw data. Convert with \`.encode()\` and \`.decode()\`. Files and network sockets carry bytes, so encode before you send and decode after you read. UTF-8 is the safe default.`,
  },

  functions: {
    title: "Functions, scope and closures",
    summary: "args/kwargs, the default-value trap, LEGB rule, closures.",
    content: `## Defining a function

\`\`\`python
def greet(name, greeting="Hi", *args, loud=False, **kwargs):
    ...
\`\`\`

- \`*args\` collects extra positional arguments into a tuple.
- \`**kwargs\` collects extra keyword arguments into a dict.
- Anything written after \`*args\` must be passed by name (keyword-only).

### The mutable default trap

\`\`\`python
def add(item, bucket=[]):   # WRONG
    bucket.append(item)
    return bucket
\`\`\`

The default list is created **once**, when the function is defined, so it is shared by every call. The fix:

\`\`\`python
def add(item, bucket=None):
    bucket = [] if bucket is None else bucket
    bucket.append(item)
    return bucket
\`\`\`

### The LEGB rule

Python looks for a name in this order: **L**ocal → **E**nclosing function → **G**lobal (module) → **B**uilt-in. The first match wins.

### Closures

An inner function that remembers a variable from the outer function is a closure:

\`\`\`python
def counter():
    n = 0
    def step():
        nonlocal n
        n += 1
        return n
    return step
\`\`\`

\`nonlocal\` writes to the outer function's variable. \`global\` writes to the module-level variable — use it rarely.`,
  },

  oop: {
    title: "OOP: classes, inheritance and dunder methods",
    summary: "The class model, MRO, properties and magic methods.",
    content: `## Classes

A class is a template. An instance is one object made from that template.

\`\`\`python
class Account:
    bank = "PrepBank"          # class attribute — shared

    def __init__(self, owner):
        self.owner = owner     # instance attribute — per object
\`\`\`

Attribute lookup goes: instance → class → parent classes → \`object\`.

### Dunder (magic) methods

| Method | Runs when |
| --- | --- |
| \`__init__\` | The object is created |
| \`__repr__\` | You debug or print in the shell |
| \`__str__\` | You call \`print(obj)\` |
| \`__eq__\` | You use \`==\` |
| \`__len__\` | You call \`len(obj)\` |

Always write \`__repr__\`. It saves hours during debugging.

### Inheritance and MRO

With multiple parents, Python uses the **MRO** (method resolution order, C3 linearisation) to decide which method wins. Check it with \`Class.__mro__\`. Always call \`super().__init__(...)\` so the whole chain is initialised.

### Properties

Use \`@property\` to expose a computed value like a normal attribute — no need for Java-style getters:

\`\`\`python
class Circle:
    def __init__(self, r): self.r = r

    @property
    def area(self):
        return 3.14159 * self.r ** 2
\`\`\`

Prefer **composition** (an object holding another object) over deep inheritance trees.`,
  },

  errors: {
    title: "Exceptions and error handling",
    summary: "try/except/else/finally, custom exceptions, EAFP.",
    content: `## The full shape

\`\`\`python
try:
    data = load(path)          # code that may fail
except FileNotFoundError as e:
    log(e)                     # handle one specific problem
except (ValueError, KeyError):
    ...
else:
    use(data)                  # runs only if nothing failed
finally:
    cleanup()                  # always runs
\`\`\`

### Rules that keep code healthy

- Catch the **specific** exception, never a bare \`except:\`. A bare except also swallows \`KeyboardInterrupt\`.
- Do not silence errors with \`pass\`. Log them or re-raise them.
- Use \`raise ... from e\` so the original cause stays in the traceback.

### Your own exception types

\`\`\`python
class PaymentError(Exception):
    """Base error for the payment module."""

class CardDeclined(PaymentError):
    ...
\`\`\`

Callers can then catch the whole family with \`except PaymentError\`.

### EAFP vs LBYL

Python prefers **EAFP** — "easier to ask forgiveness than permission". Try the operation and handle the failure, instead of checking every condition first:

\`\`\`python
try:
    value = config["port"]
except KeyError:
    value = 8080
\`\`\``,
  },

  modules: {
    title: "Modules, packages and virtual environments",
    summary: "The import system, __name__, venv and project layout.",
    content: `## Module vs package

A **module** is one \`.py\` file. A **package** is a folder of modules (usually with an \`__init__.py\`). Import brings names from one file into another.

\`\`\`python
import math                 # whole module
from math import sqrt       # one name
from . import helpers       # relative import inside a package
\`\`\`

A module runs only **once** per program. After that Python serves it from the \`sys.modules\` cache.

### The \`__name__\` guard

\`\`\`python
if __name__ == "__main__":
    main()
\`\`\`

\`__name__\` is \`"__main__"\` when the file is run directly, and the module name when it is imported. The guard stops your test code from running on import.

### Virtual environments

Each project should have its own environment so versions do not clash:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

### A clean layout

\`\`\`text
project/
  src/mypkg/__init__.py
  src/mypkg/core.py
  tests/test_core.py
  pyproject.toml
\`\`\`

Avoid circular imports: if A imports B and B imports A, move the shared code into a third module.`,
  },

  iterators: {
    title: "Iterators, generators and lazy evaluation",
    summary: "The iterator protocol, yield, generator expressions, memory wins.",
    content: `## The iterator protocol

An **iterable** can give you an iterator (\`__iter__\`). An **iterator** gives the next value (\`__next__\`) and raises \`StopIteration\` when it is finished. A \`for\` loop does all of this for you.

### Generators

A function that uses \`yield\` is a generator. It pauses at each \`yield\`, keeps its local state, and continues from that point on the next request:

\`\`\`python
def countdown(n):
    while n > 0:
        yield n
        n -= 1
\`\`\`

### Why it matters: memory

\`\`\`python
sum([n * n for n in range(10_000_000)])   # builds the whole list in RAM
sum(n * n for n in range(10_000_000))     # one value at a time
\`\`\`

The second line uses almost no extra memory. This is **lazy evaluation**: work happens only when a value is requested.

### Useful tools

| Tool | What it gives you |
| --- | --- |
| \`enumerate(x)\` | Index and value together |
| \`zip(a, b)\` | Pairs from two iterables |
| \`itertools.islice\` | A slice of a lazy stream |
| \`itertools.chain\` | Several iterables as one |

Remember: a generator can be consumed **only once**. If you need the data twice, store it in a list.`,
  },

  decorators: {
    title: "Decorators and context managers",
    summary: "Higher-order functions, functools.wraps, the with statement.",
    content: `## Functions are objects

You can pass a function to another function and return a function. A **decorator** uses that idea to wrap extra behaviour around an existing function without editing it.

\`\`\`python
import functools, time

def timed(fn):
    @functools.wraps(fn)          # keeps the name and docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__}: {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timed
def work():
    ...
\`\`\`

\`@timed\` simply means \`work = timed(work)\`. Without \`functools.wraps\`, the wrapped function loses its \`__name__\` and \`__doc__\`.

Common built-in decorators: \`@property\`, \`@staticmethod\`, \`@classmethod\`, \`@functools.lru_cache\`.

### Context managers

\`with\` guarantees cleanup, even if an error happens:

\`\`\`python
with open("data.txt") as f:
    text = f.read()
# the file is closed here, always
\`\`\`

Write your own with \`contextlib\`:

\`\`\`python
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.perf_counter()
    try:
        yield
    finally:
        print(time.perf_counter() - start)
\`\`\`

The code before \`yield\` is the setup (\`__enter__\`), the code in \`finally\` is the cleanup (\`__exit__\`).`,
  },

  concurrency: {
    title: "Concurrency: threads, async, processes and the GIL",
    summary: "What the GIL is, and when to use threads, async or processes.",
    content: `## The GIL in one line

The **Global Interpreter Lock** allows only one thread to run Python bytecode at a time inside one process. So threads do not give you real parallel CPU work in CPython.

But the GIL is **released** while a thread waits for input/output — network calls, disk reads, database queries. That is why threads still help for I/O.

### Choosing the right tool

| Your work is | Use | Why |
| --- | --- | --- |
| Waiting on network or disk (I/O bound) | \`threading\` or \`asyncio\` | The GIL is released while waiting |
| Heavy calculation (CPU bound) | \`multiprocessing\` | Each process has its own GIL and core |
| Thousands of network calls | \`asyncio\` | One thread, very low overhead per task |

### asyncio in short

\`async def\` creates a coroutine. \`await\` gives control back to the event loop while it waits, so other tasks can run.

\`\`\`python
import asyncio

async def fetch(i):
    await asyncio.sleep(1)
    return i

async def main():
    return await asyncio.gather(*(fetch(i) for i in range(100)))
\`\`\`

100 tasks finish in about one second, on a single thread.

Warning: never call a blocking function (like \`time.sleep\` or a synchronous HTTP request) inside async code. It freezes the whole event loop. Use \`asyncio.to_thread(...)\` for such calls.`,
  },

  pythonic: {
    title: "Pythonic patterns, typing and performance",
    summary: "dataclasses, type hints, caching and an optimisation checklist.",
    content: `## Writing Pythonic code

"Pythonic" means using the language the way it was designed, so other developers read your code easily.

\`\`\`python
for i, item in enumerate(items):     # not range(len(items))
for a, b in zip(xs, ys):             # walk two lists together
text = "".join(parts)                # not += in a loop
with open(path) as f: ...            # not manual open/close
\`\`\`

### dataclasses

\`\`\`python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float
\`\`\`

You get \`__init__\`, \`__repr__\` and \`__eq__\` for free. \`frozen=True\` makes it immutable and hashable; \`slots=True\` saves memory.

### Type hints

Hints do not run at runtime, but they document your code and let tools like **mypy** find bugs before your users do.

\`\`\`python
def total(prices: list[float], tax: float = 0.18) -> float: ...
\`\`\`

### Performance checklist

1. **Measure first** — \`time.perf_counter\`, \`timeit\`, \`cProfile\`. Never guess.
2. Pick the right data structure (\`set\` for membership, \`dict\` for lookup).
3. Cache repeated pure work with \`@functools.lru_cache\`.
4. Use generators for large data instead of big lists.
5. Move numeric heavy work to NumPy or a C library.
6. Only then think about processes or another language.

> Rule of thumb: correct code first, readable code second, fast code last — and only where a profiler tells you it matters.`,
  },
};
