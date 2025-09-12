const toggle = document.getElementById('toggleDark');
const body = document.body;

function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark-mode', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  // localStorage.setItem('theme', 'dark');

  // Toggle icon if present
  if (toggle) {
    toggle.classList.toggle('bi-moon', !isDark);
    toggle.classList.toggle('bi-brightness-high-fill', isDark);
  }

  // Footer link colors
  document.querySelectorAll('.footer-link').forEach(link => {
    link.style.color = isDark ? '#DCDDDE' : '#23272A';
    link.style.transition = 'color 2s';
  });
}

// === On load ===
window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("theme") === "dark";
  applyTheme(isDark);
  
  const toggleDesktop = document.getElementById('toggleDark');
  const toggleMobile = document.getElementById('toggleDarkMobile');
  if (toggleDesktop) {
    toggleDesktop.addEventListener('click', () => {
      const darkNow = document.documentElement.classList.contains('dark-mode');
      applyTheme(!darkNow);
    });
  }
  if (toggleMobile) {
    toggleMobile.addEventListener('click', () => {
      const darkNow = document.documentElement.classList.contains('dark-mode');
      applyTheme(!darkNow);
    });
  }

  const currentPath = window.location.pathname.replace(/\/$/, ""); // removes trailing slash
  const links = document.querySelectorAll(".nav-bar nav ul li a");

  links.forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "");
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });

  const codeSelector = document.getElementById("codeSelector");
  if (codeSelector) {
    codeSelector.dispatchEvent(new Event("change"));
  }

  const docsContainer = document.getElementById("docs-container");
  if (docsContainer) {
    if (typeof marked === 'undefined') {
      docsContainer.innerHTML = "<p>❌ Marked library not loaded. Please check your internet connection.</p>";
      return;
    }

    docsContainer.innerHTML = "<p>Loading documentation...</p>";

    // ✅ Custom Admonition Block Support
    const admonitionExtension = {
      extensions: [{
        name: 'admonition',
        level: 'block',
        start(src) {
          return src.match(/^\[!\w+\]/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^\[!(\w+)\][ \t]*(.*?)\n((?:.+\n?)*)/);
          if (match) {
            return {
              type: 'admonition',
              raw: match[0],
              kind: match[1].toLowerCase(),
              title: match[2].trim(),
              text: match[3].trim()
            };
          }
        },
        renderer(token) {
          const title = token.title || token.kind.toUpperCase();
          return `
            <div class="admonition admonition-${token.kind}">
              <div class="admonition-title">${title}</div>
              <div class="admonition-body">${marked.parse(token.text)}</div>
            </div>
          `;
        }
      }]
    };
    marked.use(admonitionExtension);

    const url = `https://raw.githubusercontent.com/PiCake314/Pie/refs/heads/main/README.md?t=${Date.now()}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then(md => {
        docsContainer.innerHTML = marked.parse(md);

        // Auto-link and scroll to headings
        docsContainer.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
          const id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          heading.id = id;
          heading.innerHTML = `<a href="#${id}" class="anchor-link">${heading.innerHTML}</a>`;
          heading.style.scrollBehavior = 'smooth';
          heading.style.cursor = 'pointer';
          heading.addEventListener('click', () => {
            window.location.hash = `#${id}`;
          });
        });

        Prism.highlightAll();
      })
      .catch(err => {
        docsContainer.innerHTML = "<p>❌ Failed to load docs. Try again later.</p>";
        console.error("Error loading docs:", err);
      });
  }

  // ✅ Fetch latest GitHub release version and update DOM
  // fetch("https://api.github.com/repos/PiCake314/Pie/releases/latest")
  fetch("https://api.github.com/repos/PiCake314/Pie")
    .then(res => res.json())
    .then(data => {
      let versionRaw = data.tag_name || data.name || "";
      let versionClean = versionRaw.replace(/^Release-/, ''); // Remove 'Release-' prefix
      versionClean = versionClean.split('-')[0];
      if (!versionClean) {
        console.warn("⚠️ No valid version found in GitHub release data.");  
        return;
      }

      const heading = document.getElementById("version-heading");
      const versionSpan = heading?.querySelector(".version-number");
      if (versionSpan && versionClean) {
        versionSpan.textContent = versionClean;
      }

      versionSpan.textContent = "v1.0.0";
    })
    .catch(err => {
      console.warn("⚠️ Failed to fetch GitHub release version:", err);
    });
});

// === HAMBURGER MENU TOGGLE ===
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    hamburger.innerHTML = navLinks.classList.contains("active")
      ? '<i class="bi bi-x"></i>'
      : '<i class="bi bi-list"></i>';
  });
}

// === CODE SELECTOR ===
const selector = document.getElementById('codeSelector');
const examples = document.querySelectorAll('.code-example');

if (selector && examples.length > 0) {
  selector.addEventListener('change', function () {
    examples.forEach(el => el.style.display = 'none');
    const selected = document.getElementById(this.value);
    if (selected) selected.style.display = 'block';
  });
}

// ====== CODE SAMPLE DATA AND PRISM HIGHLIGHTING ======
const codeSamples = {
"Hello-There": [`  print = __builtin_print;

  print("Hello, World!");`,

  "All builtin functions start with \"__builtin_\"."
],

  // !
"Variables-and-Types": [`
  x: Any = 1;
  x = "Hello";

  y: Int = 1;
  y = 4;

  z = 5.5;
  z = "hi";
  `,
  "Variables declared without type annotations posses the \"Any\" type!"
],

  // !
"Functions": [`  print = __builtin_print;

  add: (Int, Int): Int = (a: Int, b: Int): Int => __builtin_add(a, b);

  print(x);
  `,
],

// !
  "Control-Flow":  [`  print = __builtin_print;

  x = __builtin_conditional(__builtin_lt(1, 2), "yay", "nay");

  print(x);
  `,

  "Pie only has \"__builtin_conditional\" :).Other control-flow primitives can be made with custom operator."
],

"Structs": [`  print = __builtin_print;

  Human: Type = class {
    name: String = "";
    age: Int = 0;

    pet = "Cat"
  };

  h: Human = Human("Pie", 3);

  print(h);
  `,
  "Members are required to be assigned a value. Constructors are provided automatically."
],

"Operators": [`  print = __builtin_print;

  prefix(LOW +) force = (s: Syntax) => __builtin_eval(__builtin_eval(s));

  infix(SUM)   - = (a: Int, b: Int): Int => __builtin_sub(a, b);
  infix(SUM)   * = (a: Int, b: Int): Int => __builtin_mul(a, b);
  infix(INFIX) < = (a: Int, b: Int): Bool => __builtin_lt(a, b);

  operator(CALL -) if : : else : = (cond: Bool, thn: Syntax, els: Syntax)
    => __builtin_eval(__builtin_conditional(cond, thn, els));

  fact = (n) => if (n < 2) { 1; } else { n * fact(n - 1); };

  suffix(POSTFIX) ! = (x: Int): Int => fact(x);


  print(5 !);
    `,
    ""
],

"Quirks": [`  print = __builtin_print;
  infix(SUM) + = (a: Int, b: Int) => __builtin_add(a, b);

  1 = 2;
  6 + 1 = 5;

  "Hello" = 1;
  0 = "Hi";

  print(1);
  print(6 + 1);
  print(1 + 6);
  print("Hello");
  print(0);
  __builtin_reset(0);
  print(0);
  `,
  "Guess what the output should be!"
],

};

const codeSelector = document.getElementById("codeSelector");
if (codeSelector) {
  codeSelector.addEventListener("change", (e) => {
    const selected = e.target.value;
    const sample = codeSamples[selected];

    const codeElement = document.getElementById("codeOutput");
    if (!codeElement) return;

    // Handle string or [code, note]
    const isTuple = Array.isArray(sample);
    const codeText = isTuple ? sample[0] : (sample || "");
    const noteText = isTuple ? (sample[1] || "") : "";

    // Update code
    codeElement.textContent = codeText;
    codeElement.className = "language-pie";
    Prism.highlightElement(codeElement);

    // Update note
    let noteEl = document.getElementById("codeNote");
    if (!noteEl) {
      noteEl = document.createElement("div");
      noteEl.id = "codeNote";
      noteEl.className = "code-note";
      codeElement.parentElement.insertAdjacentElement("afterend", noteEl);
    }

    if (noteText) {
      noteEl.textContent = noteText; // plain text on purpose
      noteEl.style.display = "block";
    } else {
      noteEl.textContent = "";
      noteEl.style.display = "none";
    }
  });
}


const copyBtn = document.getElementById("copyCodeBtn");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    const codeElement = document.getElementById("codeOutput");
    if (!codeElement) return;

    const codeText = codeElement.textContent;
    navigator.clipboard.writeText(codeText).then(() => {
      copyBtn.textContent = "✔️";
      copyBtn.classList.add("copied");

      setTimeout(() => {
        copyBtn.textContent = "📋";
        copyBtn.classList.remove("copied");
      }, 1500);
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  });
}
