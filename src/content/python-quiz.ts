/**
 * Auto-test bank: technical questions per lesson.
 * `q` / `explain` are Hinglish, `qEn` / `explainEn` are simple English.
 * Options stay technical (same in both languages).
 */

export type QuizQ = {
  q: string;
  qEn: string;
  options: string[];
  answer: number; // index of correct option
  explain: string;
  explainEn: string;
};

export const PYTHON_QUIZ: Record<string, QuizQ[]> = {
  intro: [
    {
      q: "Python source code sabse pehle kis cheez me convert hota hai?",
      qEn: "What is Python source code turned into first?",
      options: ["Machine code", "Bytecode", "Assembly", "Binary executable"],
      answer: 1,
      explain: "Source pehle bytecode banta hai, phir PVM use interpret karta hai.",
      explainEn: "The source is compiled to bytecode, and the PVM then interprets that bytecode.",
    },
    {
      q: "'Dynamically typed' ka matlab kya hai?",
      qEn: "What does 'dynamically typed' mean?",
      options: [
        "Type compile time pe fix hota hai",
        "Type runtime pe decide hota hai",
        "Har variable ka type likhna padta hai",
        "Type kabhi change nahi hota",
      ],
      answer: 1,
      explain: "Variable ka type program chalte waqt object se decide hota hai.",
      explainEn: "The type is decided while the program runs, from the object the name points to.",
    },
    {
      q: ".pyc file me kya store hota hai?",
      qEn: "What is stored inside a .pyc file?",
      options: ["Encrypted source", "Cached bytecode", "Machine code", "Logs"],
      answer: 1,
      explain: "Compiled bytecode cache hota hai taaki agli baar import fast ho.",
      explainEn: "It caches compiled bytecode so the next import is faster.",
    },
  ],

  variables: [
    {
      q: "`a = [1,2]; b = a; b.append(3)` ke baad `a` kya hoga?",
      qEn: "After `a = [1,2]; b = a; b.append(3)`, what is `a`?",
      options: ["[1, 2]", "[1, 2, 3]", "Error", "None"],
      answer: 1,
      explain: "b aur a same object ko point karte hain, isliye dono me change dikhta hai.",
      explainEn: "Both names point to the same list object, so the change is visible through both.",
    },
    {
      q: "In me se kaunsa immutable hai?",
      qEn: "Which one of these is immutable?",
      options: ["list", "dict", "tuple", "set"],
      answer: 2,
      explain: "tuple immutable hai — banne ke baad change nahi hota.",
      explainEn: "A tuple cannot be changed after it is created.",
    },
    {
      q: "`is` aur `==` me farq kya hai?",
      qEn: "What is the difference between `is` and `==`?",
      options: [
        "Koi farq nahi",
        "`is` identity check karta hai, `==` value",
        "`==` identity check karta hai, `is` value",
        "`is` sirf numbers ke liye hai",
      ],
      answer: 1,
      explain: "`is` same object hone ka check hai, `==` values barabar hone ka.",
      explainEn: "`is` checks whether it is the same object; `==` checks whether the values are equal.",
    },
  ],

  operators: [
    {
      q: "`7 // 2` ka result?",
      qEn: "What is the result of `7 // 2`?",
      options: ["3.5", "3", "4", "1"],
      answer: 1,
      explain: "`//` floor division hai, decimal hata deta hai (neeche ki taraf).",
      explainEn: "`//` is floor division, so the result is rounded down to 3.",
    },
    {
      q: "`0 or 'guest'` kya return karega?",
      qEn: "What does `0 or 'guest'` return?",
      options: ["True", "0", "'guest'", "False"],
      answer: 2,
      explain: "`or` pehla truthy value return karta hai; 0 falsy hai.",
      explainEn: "`or` returns the first truthy value, and 0 is falsy, so 'guest' is returned.",
    },
    {
      q: "Walrus operator `:=` kya karta hai?",
      qEn: "What does the walrus operator `:=` do?",
      options: [
        "Sirf compare karta hai",
        "Expression ke andar assign karke value return karta hai",
        "Variable delete karta hai",
        "Type convert karta hai",
      ],
      answer: 1,
      explain: "Ek hi expression me assign + use dono ho jaate hain.",
      explainEn: "It assigns a value and returns it inside the same expression.",
    },
  ],

  "control-flow": [
    {
      q: "Loop ka `else` block kab chalta hai?",
      qEn: "When does a loop's `else` block run?",
      options: [
        "Hamesha",
        "Jab loop `break` se nahi ruka",
        "Jab loop `break` se ruka",
        "Kabhi nahi",
      ],
      answer: 1,
      explain: "`break` na hone par hi loop-else chalta hai.",
      explainEn: "The loop `else` runs only when the loop finished without hitting `break`.",
    },
    {
      q: "In me se kaunsa falsy NAHI hai?",
      qEn: "Which of these is NOT falsy?",
      options: ["[]", "0", "'0'", "None"],
      answer: 2,
      explain: "Non-empty string '0' truthy hoti hai.",
      explainEn: "A non-empty string like '0' is truthy.",
    },
    {
      q: "`match-case` kis version se aaya?",
      qEn: "From which version is `match-case` available?",
      options: ["3.6", "3.8", "3.10", "2.7"],
      answer: 2,
      explain: "Structural pattern matching Python 3.10 me aaya.",
      explainEn: "Structural pattern matching arrived in Python 3.10.",
    },
  ],

  "data-structures": [
    {
      q: "Bade data me membership test (`x in ...`) ke liye best kya hai?",
      qEn: "For membership tests (`x in ...`) on big data, what is best?",
      options: ["list", "set", "tuple", "string"],
      answer: 1,
      explain: "set/dict hashing use karte hain — average O(1) lookup.",
      explainEn: "Sets and dicts use hashing, so lookup is O(1) on average instead of O(n).",
    },
    {
      q: "Dict key ke liye kaunsa valid hai?",
      qEn: "Which one is valid as a dict key?",
      options: ["list", "dict", "tuple of ints", "set"],
      answer: 2,
      explain: "Key hashable honi chahiye; tuple (immutable) hashable hai.",
      explainEn: "A key must be hashable, and an immutable tuple of ints is hashable.",
    },
    {
      q: "`{n for n in range(5)}` kis type ka object banata hai?",
      qEn: "What type does `{n for n in range(5)}` create?",
      options: ["list", "dict", "set", "generator"],
      answer: 2,
      explain: "Curly braces with single values = set comprehension.",
      explainEn: "Curly braces with single values make a set comprehension.",
    },
  ],

  strings: [
    {
      q: "Loop me bade string banane ka best tarika?",
      qEn: "What is the best way to build a large string in a loop?",
      options: ["`+=` har baar", "`\"\".join(parts)`", "`str()` call", "`%` formatting"],
      answer: 1,
      explain: "String immutable hai, isliye `+=` har baar naya object banata hai; join fast hai.",
      explainEn: "Strings are immutable, so `+=` creates a new object each time; `join` is much faster.",
    },
    {
      q: "`f\"{score:.2f}\"` kya karta hai?",
      qEn: "What does `f\"{score:.2f}\"` do?",
      options: [
        "Score ko int banata hai",
        "2 decimal places tak format karta hai",
        "2 se multiply karta hai",
        "Error deta hai",
      ],
      answer: 1,
      explain: "`.2f` fixed-point format hai 2 decimals ke saath.",
      explainEn: "`.2f` formats the number as fixed point with two decimal places.",
    },
    {
      q: "`str` ko network par bhejne se pehle kya karna hota hai?",
      qEn: "What must you do before sending a `str` over a network?",
      options: [".decode()", ".encode()", ".strip()", ".format()"],
      answer: 1,
      explain: "Text ko bytes me badalne ke liye `.encode()` (UTF-8 default).",
      explainEn: "Use `.encode()` to turn text into bytes (UTF-8 is the usual choice).",
    },
  ],

  functions: [
    {
      q: "`def f(x, bucket=[])` me problem kya hai?",
      qEn: "What is the problem with `def f(x, bucket=[])`?",
      options: [
        "Syntax error hai",
        "Default list saare calls me share hoti hai",
        "Bahut slow hai",
        "Koi problem nahi",
      ],
      answer: 1,
      explain: "Default ek hi baar banta hai (function definition par), isliye state leak hoti hai.",
      explainEn: "The default is created once at definition time, so every call shares the same list.",
    },
    {
      q: "LEGB rule ka sahi order?",
      qEn: "What is the correct LEGB order?",
      options: [
        "Global → Enclosing → Local → Builtin",
        "Local → Enclosing → Global → Builtin",
        "Builtin → Global → Local → Enclosing",
        "Local → Global → Builtin → Enclosing",
      ],
      answer: 1,
      explain: "Local, phir Enclosing, phir Global, aur last me Builtin.",
      explainEn: "Python searches Local, then Enclosing, then Global, then Built-in.",
    },
    {
      q: "Outer function ki variable ko inner se likhne ke liye?",
      qEn: "Which keyword lets an inner function write to the outer function's variable?",
      options: ["global", "nonlocal", "static", "extern"],
      answer: 1,
      explain: "`nonlocal` enclosing scope ki variable ko rebind karta hai.",
      explainEn: "`nonlocal` rebinds a variable from the enclosing function scope.",
    },
  ],

  oop: [
    {
      q: "`__repr__` kyun likhna chahiye?",
      qEn: "Why should you write `__repr__`?",
      options: [
        "Performance ke liye",
        "Debugging me object ka clear representation milta hai",
        "Inheritance ke liye zaruri hai",
        "Memory bachata hai",
      ],
      answer: 1,
      explain: "Debug/log me object clearly dikhta hai.",
      explainEn: "It gives a clear, developer-facing view of the object while debugging or logging.",
    },
    {
      q: "Multiple inheritance me method kaun decide karta hai?",
      qEn: "In multiple inheritance, what decides which method is used?",
      options: ["Random", "MRO (C3 linearisation)", "Alphabetical order", "Last parent"],
      answer: 1,
      explain: "`Class.__mro__` order follow hota hai.",
      explainEn: "Python follows the MRO, which you can inspect with `Class.__mro__`.",
    },
    {
      q: "`@property` ka kaam?",
      qEn: "What does `@property` do?",
      options: [
        "Method ko static banata hai",
        "Method ko attribute ki tarah access karne deta hai",
        "Class attribute banata hai",
        "Object freeze karta hai",
      ],
      answer: 1,
      explain: "Computed value ko normal attribute jaise expose karta hai.",
      explainEn: "It exposes a computed value as if it were a normal attribute.",
    },
  ],

  errors: [
    {
      q: "`finally` block kab chalta hai?",
      qEn: "When does a `finally` block run?",
      options: [
        "Sirf error par",
        "Sirf success par",
        "Dono case me hamesha",
        "Kabhi nahi agar return ho",
      ],
      answer: 2,
      explain: "Cleanup ke liye `finally` hamesha chalta hai.",
      explainEn: "`finally` always runs, which makes it right for cleanup.",
    },
    {
      q: "`try/except/else` me `else` kab chalta hai?",
      qEn: "When does `else` run in `try/except/else`?",
      options: [
        "Jab exception aaye",
        "Jab koi exception na aaye",
        "Hamesha",
        "Sirf finally ke baad",
      ],
      answer: 1,
      explain: "`else` tabhi chalta hai jab try block bina error complete ho.",
      explainEn: "`else` runs only when the try block completed without an exception.",
    },
    {
      q: "EAFP style ka matlab?",
      qEn: "What does the EAFP style mean?",
      options: [
        "Pehle har condition check karo",
        "Try karo, fail hone par handle karo",
        "Errors ignore karo",
        "Sirf assert use karo",
      ],
      answer: 1,
      explain: "Easier to Ask Forgiveness than Permission — Pythonic approach.",
      explainEn: "Easier to Ask Forgiveness than Permission: try the operation and handle the failure.",
    },
  ],

  modules: [
    {
      q: "`if __name__ == \"__main__\":` kyun likhte hain?",
      qEn: "Why do we write `if __name__ == \"__main__\":`?",
      options: [
        "Speed badhane ke liye",
        "Import par script code na chale isliye",
        "Module private karne ke liye",
        "Type check ke liye",
      ],
      answer: 1,
      explain: "File direct run par hi wo code chalega, import par nahi.",
      explainEn: "The block runs only when the file is executed directly, not when it is imported.",
    },
    {
      q: "Ek module kitni baar execute hota hai per program?",
      qEn: "How many times is a module executed per program run?",
      options: ["Har import par", "Sirf ek baar", "Do baar", "Kabhi nahi"],
      answer: 1,
      explain: "Pehle import par chalta hai, phir `sys.modules` se cache milta hai.",
      explainEn: "It runs on the first import; later imports come from the `sys.modules` cache.",
    },
    {
      q: "Project-specific dependencies isolate karne ke liye?",
      qEn: "What isolates dependencies per project?",
      options: ["pip", "venv", "PYTHONPATH", "__init__.py"],
      answer: 1,
      explain: "`python -m venv .venv` alag environment banata hai.",
      explainEn: "`python -m venv .venv` creates a separate virtual environment.",
    },
  ],

  iterators: [
    {
      q: "Iterator khatam hone par kya raise hota hai?",
      qEn: "What is raised when an iterator is exhausted?",
      options: ["IndexError", "StopIteration", "ValueError", "EOFError"],
      answer: 1,
      explain: "`__next__` khatam hone par `StopIteration` raise karta hai.",
      explainEn: "`__next__` raises `StopIteration` when there are no more values.",
    },
    {
      q: "Generator ka main faayda?",
      qEn: "What is the main benefit of a generator?",
      options: [
        "Hamesha fast hota hai",
        "Memory kam lagti hai (lazy)",
        "Type safe hota hai",
        "Parallel chalta hai",
      ],
      answer: 1,
      explain: "Values ek-ek karke banti hain, poori list RAM me nahi aati.",
      explainEn: "Values are produced one at a time, so the whole list never sits in memory.",
    },
    {
      q: "Ek generator ko dobara loop karne par?",
      qEn: "What happens if you loop over the same generator twice?",
      options: [
        "Wapas se saari values milti hain",
        "Kuch nahi milta, wo exhaust ho chuka hai",
        "Error aata hai",
        "Reverse order milta hai",
      ],
      answer: 1,
      explain: "Generator sirf ek baar consume hota hai.",
      explainEn: "A generator can be consumed only once; a second loop yields nothing.",
    },
  ],

  decorators: [
    {
      q: "`@timed` likhna kis ke barabar hai?",
      qEn: "Writing `@timed` above `work` is the same as what?",
      options: ["`timed(work())`", "`work = timed(work)`", "`work.timed()`", "`timed = work`"],
      answer: 1,
      explain: "Decorator function ko wrap karke naam rebind karta hai.",
      explainEn: "A decorator wraps the function and rebinds the original name to the wrapper.",
    },
    {
      q: "`functools.wraps` kyun use karte hain?",
      qEn: "Why use `functools.wraps`?",
      options: [
        "Speed ke liye",
        "Original function ka naam/docstring preserve karne ke liye",
        "Errors catch karne ke liye",
        "Caching ke liye",
      ],
      answer: 1,
      explain: "Warna wrapper ka `__name__` aur `__doc__` lag jaata hai.",
      explainEn: "Without it, the wrapper's own `__name__` and `__doc__` replace the original ones.",
    },
    {
      q: "`with` statement ka fayda?",
      qEn: "What is the benefit of the `with` statement?",
      options: [
        "Loop fast karta hai",
        "Cleanup guarantee karta hai, error me bhi",
        "Memory allocate karta hai",
        "Threads banata hai",
      ],
      answer: 1,
      explain: "`__exit__` hamesha chalta hai, isliye resource close ho jaata hai.",
      explainEn: "`__exit__` always runs, so the resource is released even when an error occurs.",
    },
  ],

  concurrency: [
    {
      q: "GIL ki wajah se kya nahi hota?",
      qEn: "Because of the GIL, what cannot happen?",
      options: [
        "I/O parallel nahi hota",
        "Ek process me threads se true CPU parallelism nahi milta",
        "Threads bante hi nahi",
        "asyncio kaam nahi karta",
      ],
      answer: 1,
      explain: "Ek time par ek hi thread Python bytecode chalata hai.",
      explainEn: "Only one thread runs Python bytecode at a time inside one process.",
    },
    {
      q: "CPU-heavy kaam ke liye best choice?",
      qEn: "What is the best choice for CPU-heavy work?",
      options: ["threading", "asyncio", "multiprocessing", "time.sleep"],
      answer: 2,
      explain: "Har process ka apna GIL aur core hota hai.",
      explainEn: "Each process has its own GIL and can use a separate CPU core.",
    },
    {
      q: "Async code me `time.sleep(5)` call karne par?",
      qEn: "What happens if you call `time.sleep(5)` inside async code?",
      options: [
        "Sirf wahi task rukega",
        "Poora event loop block ho jayega",
        "Error aayega",
        "Automatically await ho jayega",
      ],
      answer: 1,
      explain: "Blocking call event loop ko freeze kar deti hai; `asyncio.sleep` use karo.",
      explainEn: "A blocking call freezes the whole event loop; use `asyncio.sleep` instead.",
    },
  ],

  pythonic: [
    {
      q: "Index aur value dono chahiye — best tarika?",
      qEn: "You need both index and value. What is best?",
      options: ["`range(len(x))`", "`enumerate(x)`", "`zip(x)`", "`while` loop"],
      answer: 1,
      explain: "`enumerate` Pythonic aur readable hai.",
      explainEn: "`enumerate` is the Pythonic and most readable option.",
    },
    {
      q: "`@dataclass` se free me kya milta hai?",
      qEn: "What does `@dataclass` give you for free?",
      options: [
        "Threads",
        "`__init__`, `__repr__`, `__eq__`",
        "Type checking at runtime",
        "Caching",
      ],
      answer: 1,
      explain: "Boilerplate methods auto-generate ho jaate hain.",
      explainEn: "It generates the boilerplate `__init__`, `__repr__` and `__eq__` methods.",
    },
    {
      q: "Optimisation ka pehla step kya hona chahiye?",
      qEn: "What should be the first step of optimisation?",
      options: [
        "Code ko C me likho",
        "Pehle measure/profile karo",
        "Threads add karo",
        "Loops unroll karo",
      ],
      answer: 1,
      explain: "Bina profile kiye guess karna time waste hai.",
      explainEn: "Profile first — guessing where the time goes is usually wrong.",
    },
  ],
};
