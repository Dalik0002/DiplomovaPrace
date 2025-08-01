// Drinkmaker implemented using a minimal React-like library.
// It provides similar functionality to the vanilla version but uses
// React hooks (useState/useEffect) provided by tiny-react.js.

const h = React.createElement;

function App() {
  // Screen state: 'loading', 'main', 'setup', 'pouring'
  const [screen, setScreen] = React.useState('loading');
  const [ingredients, setIngredients] = React.useState([]);
  const [assignments, setAssignments] = React.useState(Array(6).fill(null));
  // For setup overlay editing
  const [editIngredients, setEditIngredients] = React.useState([]);
  // Pouring progress state: {step: index, progress: float}
  const [pourState, setPourState] = React.useState({ step: 0, progress: 0, current: null });

  // Show main screen after loading
  React.useEffect(() => {
    if (screen === 'loading') {
      const timer = setTimeout(() => setScreen('main'), 1500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Determine if start button should be enabled
  const hasAssignments = assignments.some(a => a !== null);

  // When screen switches to 'pouring', show the pouring screen for a
  // calculated duration based on the number of selected glasses. After
  // completion, reset assignments and return to the main screen.
  React.useEffect(() => {
    if (screen !== 'pouring') return;
    // Count how many glasses are assigned to determine duration
    const count = assignments.filter(idx => idx !== null).length;
    // Fallback: if no glasses are assigned (shouldn't happen), skip quickly
    const duration = Math.max(count * 2000, 1500); // 2 seconds per drink, minimum 1.5s
    const timer = setTimeout(() => {
      // Reset by reloading the page. Reloading ensures the state and hooks
      // are cleanly reinitialised and returns the user to the main screen.
      window.location.reload();
    }, duration);
    return () => clearTimeout(timer);
  }, [screen]);

  // Event handlers
  function openSetup() {
    // Prepopulate edit fields from current ingredients (max 6)
    const arr = [];
    for (let i = 0; i < 6; i++) {
      arr[i] = ingredients[i] || '';
    }
    setEditIngredients(arr);
    setScreen('setup');
  }

  function handleSaveSetup() {
    // Trim empty strings and update ingredients
    const trimmed = editIngredients.filter(item => item && item.trim()).map(s => s.trim());
    setIngredients(trimmed);
    // Reset assignments that reference removed ingredients
    setAssignments(assignments.map(idx => (idx !== null && idx < trimmed.length ? idx : null)));
    setScreen('main');
  }

  function handleCancelSetup() {
    setScreen('main');
  }

  function handleGlassClick(index) {
    if (ingredients.length === 0) {
      alert('Nejprve nastavte ingredience pomocí tlačítka Setup.');
      return;
    }
    const msg = `Vyberte ingredienci pro sklenku ${index + 1} (1–${ingredients.length})\n` +
      ingredients.map((name, i) => `${i + 1}. ${name}`).join('\n');
    const selection = window.prompt(msg, '');
    if (selection === null) return;
    const selectedIndex = parseInt(selection) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= ingredients.length) {
      alert('Neplatná volba.');
      return;
    }
    const newAssignments = assignments.slice();
    newAssignments[index] = selectedIndex;
    setAssignments(newAssignments);
  }

  function handleStart() {
    if (!hasAssignments) return;
    setScreen('pouring');
  }

  // Render functions for different screens
  function renderLoading() {
    return h('div', { className: 'screen active', id: 'loading-screen' },
      h('div', { className: 'loading-content' },
        h('img', { src: './load_screen.png', alt: 'Loading logo', className: 'logo' }),
        h('div', { className: 'spinner' })
      )
    );
  }

  function renderMain() {
    return h('div', { className: 'screen active', id: 'main-screen' },
      // Header
      h('div', { className: 'app-header' },
        h('h1', { className: 'app-title' }, 'PANORAMIX'),
        h('button', { id: 'setup-btn', className: 'header-btn', onClick: openSetup }, 'Setup')
      ),
      // Glasses grid
      h('div', { className: 'glasses-container' },
        Array.from({ length: 6 }).map((_, i) => {
          const assigned = assignments[i];
          const classes = ['glass'];
          if (assigned !== null) classes.push('assigned');
          return h('div', { className: classes.join(' '), onClick: () => handleGlassClick(i) },
            h('div', { className: 'plus' }),
            h('span', null, assigned !== null ? ingredients[assigned] : 'Přidat')
          );
        })
      ),
      // Start button
      h('button', {
        id: 'start-btn',
        className: hasAssignments ? 'start-btn enabled' : 'start-btn',
        disabled: !hasAssignments,
        onClick: handleStart
      }, 'Start')
    );
  }

  function renderSetup() {
    return h('div', { className: 'overlay' },
      h('div', { className: 'overlay-content' },
        h('h2', null, 'Nastavení ingrediencí'),
        h('p', null, 'Zadejte názvy ingrediencí (1–6):'),
        h('form', { id: 'ingredients-form' },
          editIngredients.map((val, i) =>
            h('input', {
              type: 'text',
              value: val,
              onInput: (e) => {
                const newArr = editIngredients.slice();
                newArr[i] = e.target.value;
                setEditIngredients(newArr);
              },
              placeholder: `Ingredience ${i + 1}`
            })
          )
        ),
        h('div', { className: 'overlay-actions' },
          h('button', { className: 'primary', onClick: handleSaveSetup }, 'Uložit'),
          h('button', { onClick: handleCancelSetup }, 'Zrušit')
        )
      )
    );
  }

  function renderPouring() {
    // Build a list of ingredient names for assigned glasses
    const assignedNames = assignments
      .map(idx => (idx !== null && ingredients[idx] ? ingredients[idx] : null))
      .filter(Boolean);
    return h('div', { className: 'screen active', id: 'pouring-screen' },
      h('div', { className: 'pouring-content' },
        h('h2', null, 'Probíhá nalévání…'),
        // Use a larger spinner during pouring instead of a progress bar
        h('div', { className: 'spinner large' }),
        assignedNames.length > 0 ? h('p', { className: 'pouring-names' }, `Ingredience: ${assignedNames.join(', ')}`) : null
      )
    );
  }

  // Decide which screen to render
  if (screen === 'loading') return renderLoading();
  if (screen === 'setup') return renderSetup();
  if (screen === 'pouring') return renderPouring();
  // default: main
  return renderMain();
}

ReactDOM.render(h(App, null), document.getElementById('root'));

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}