// Simple Drinkmaker application logic

// Elements
const loadingScreen = document.getElementById('loading-screen');
const mainScreen = document.getElementById('main-screen');
const glassesContainer = document.querySelector('.glasses-container');
const setupBtn = document.getElementById('setup-btn');
const startBtn = document.getElementById('start-btn');
const setupOverlay = document.getElementById('setup-overlay');
const ingredientsForm = document.getElementById('ingredients-form');
const saveIngredientsBtn = document.getElementById('save-ingredients');
const cancelSetupBtn = document.getElementById('cancel-setup');
const pouringScreen = document.getElementById('pouring-screen');
const progressBar = document.querySelector('.progress-bar .progress');
const pouringDetail = document.getElementById('pouring-detail');

// Application state
let ingredients = [];
let glassAssignments = new Array(6).fill(null);

// Display the loading screen then show the main screen
window.addEventListener('load', () => {
  // Wait for a second to simulate loading
  setTimeout(() => {
    loadingScreen.classList.remove('active');
    mainScreen.classList.add('active');
    renderGlasses();
  }, 1500);
});

// Render the six glasses on the main screen
function renderGlasses() {
  glassesContainer.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const glass = document.createElement('div');
    glass.className = 'glass';
    // Determine if assigned
    const assigned = glassAssignments[i];
    if (assigned !== null) {
      glass.classList.add('assigned');
    }
    glass.dataset.index = i;

    // plus icon container
    const plus = document.createElement('div');
    plus.className = 'plus';
    glass.appendChild(plus);

    // label
    const label = document.createElement('span');
    label.textContent = assigned !== null ? ingredients[assigned] : 'Přidat';
    glass.appendChild(label);

    // click handler
    glass.addEventListener('click', () => handleGlassClick(i));

    glassesContainer.appendChild(glass);
  }
  updateStartButtonState();
}

// Show setup overlay on setup button click
setupBtn.addEventListener('click', () => {
  openSetup();
});

function openSetup() {
  // Populate form with existing ingredients or empty inputs
  ingredientsForm.innerHTML = '';
  const count = Math.max(ingredients.length, 6);
  for (let i = 0; i < 6; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Ingredience ${i + 1}`;
    input.value = ingredients[i] || '';
    ingredientsForm.appendChild(input);
  }
  setupOverlay.classList.remove('hidden');
}

// Save ingredients from form
saveIngredientsBtn.addEventListener('click', () => {
  const inputs = ingredientsForm.querySelectorAll('input');
  const newIngredients = [];
  inputs.forEach(input => {
    const value = input.value.trim();
    if (value) newIngredients.push(value);
  });
  ingredients = newIngredients;
  // Reset assignments if assigned ingredients no longer exist
  glassAssignments = glassAssignments.map(index => (index !== null && index < ingredients.length ? index : null));
  setupOverlay.classList.add('hidden');
  renderGlasses();
});

// Cancel setup
cancelSetupBtn.addEventListener('click', () => {
  setupOverlay.classList.add('hidden');
});

// Handle click on a glass
function handleGlassClick(index) {
  if (ingredients.length === 0) {
    alert('Nejprve nastavte ingredience pomocí tlačítka Setup.');
    return;
  }
  // Build a simple selection prompt
  const selection = window.prompt(
    `Vyberte ingredienci pro sklenku ${index + 1} (1–${ingredients.length})\n${ingredients
      .map((name, i) => `${i + 1}. ${name}`)
      .join('\n')}`,
    ''
  );
  if (selection === null) return; // cancelled
  const selectedIndex = parseInt(selection) - 1;
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= ingredients.length) {
    alert('Neplatná volba.');
    return;
  }
  glassAssignments[index] = selectedIndex;
  renderGlasses();
}

// Update start button state based on assignments
function updateStartButtonState() {
  const hasAssignment = glassAssignments.some(a => a !== null);
  if (hasAssignment) {
    startBtn.classList.add('enabled');
    startBtn.disabled = false;
  } else {
    startBtn.classList.remove('enabled');
    startBtn.disabled = true;
  }
}

// Start pouring when start button clicked
startBtn.addEventListener('click', () => {
  // Hide main, show pouring screen
  mainScreen.classList.remove('active');
  pouringScreen.classList.add('active');
  startPouringProcess();
});

// Simulate pouring process
function startPouringProcess() {
  const assignedGlasses = glassAssignments
    .map((ingredientIndex, i) => ({ glass: i + 1, ingredientIndex }))
    .filter(item => item.ingredientIndex !== null);
  let step = 0;
  const totalSteps = assignedGlasses.length;
  const duration = 3000; // 3 seconds total
  progressBar.style.width = '0%';
  pouringDetail.textContent = '';
  
  if (totalSteps === 0) {
    finishPouring();
    return;
  }
  function pourNext() {
    if (step >= totalSteps) {
      finishPouring();
      return;
    }
    const current = assignedGlasses[step];
    pouringDetail.textContent = `Nalévá se sklenka ${current.glass}: ${ingredients[current.ingredientIndex]}`;
    const portion = 100 / totalSteps;
    const startWidth = parseFloat(progressBar.style.width) || 0;
    const endWidth = startWidth + portion;
    let progress = 0;
    const stepDuration = duration / totalSteps;
    const interval = 20;
    const increment = (portion) / (stepDuration / interval);
    const timer = setInterval(() => {
      progress += increment;
      const newWidth = Math.min(startWidth + progress, endWidth);
      progressBar.style.width = `${newWidth}%`;
      if (newWidth >= endWidth) {
        clearInterval(timer);
        step++;
        setTimeout(pourNext, 300); // small delay between glasses
      }
    }, interval);
  }
  pourNext();
}

function finishPouring() {
  pouringDetail.textContent = 'Hotovo! Na zdraví!';
  setTimeout(() => {
    // Reset assignments for next round
    glassAssignments = new Array(6).fill(null);
    progressBar.style.width = '0%';
    mainScreen.classList.add('active');
    pouringScreen.classList.remove('active');
    renderGlasses();
  }, 2000);
}

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}