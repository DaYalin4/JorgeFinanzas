// Configuración de Firebase (REEMPLAZA CON TUS DATOS)
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "calendario-jorge-finanzas.firebaseapp.com",
  projectId: "calendario-jorge-finanzas",
  storageBucket: "calendario-jorge-finanzas.appspot.com",
  messagingSenderId: "62034991024",
  appId: "1:62034991024:web:4e0adad933ecc89e93e875"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Constantes
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Variables de estado
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Elementos del DOM
const elements = {
  calendarDays: document.getElementById('calendar-days'),
  currentMonth: document.getElementById('current-month'),
  prevMonth: document.getElementById('prev-month'),
  nextMonth: document.getElementById('next-month'),
  loading: document.getElementById('loading')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderCalendar(currentMonth, currentYear);
});

// Configuración de event listeners
function setupEventListeners() {
  elements.prevMonth.addEventListener('click', () => {
    navigateMonth(-1);
  });

  elements.nextMonth.addEventListener('click', () => {
    navigateMonth(1);
  });
}

// Navegación entre meses
function navigateMonth(offset) {
  currentMonth += offset;
  
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  
  renderCalendar(currentMonth, currentYear);
}

// Renderizado principal del calendario
async function renderCalendar(month, year) {
  elements.loading.style.display = 'block';
  elements.calendarDays.innerHTML = '';
  elements.currentMonth.textContent = `${MONTH_NAMES[month]} ${year}`;

  try {
    const availableDates = await fetchAvailableDates(month, year);
    renderCalendarStructure(month, year, availableDates);
  } catch (error) {
    console.error("Error rendering calendar:", error);
    elements.calendarDays.innerHTML = '<div class="error">Error al cargar fechas</div>';
  } finally {
    elements.loading.style.display = 'none';
  }
}
function checkAvailability(dateStr, availableDates) {
  // Verifica si la fecha existe en availableDates
  return availableDates[dateStr] && availableDates[dateStr].length > 0;
}
// Obtener fechas disponibles desde Firestore
async function fetchAvailableDates(month, year) {
  const monthFormatted = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${monthFormatted}-01`;
  const endDate = `${year}-${monthFormatted}-31`;

  try {
    const snapshot = await db.collection('citas')
      .where('date', '>=', new Date(startDate))
      .where('date', '<=', new Date(endDate))
      .where('available', '==', true)
      .get();

    const dates = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateStr = data.date.toDate().toISOString().split('T')[0];
      
      if (!dates[dateStr]) dates[dateStr] = [];
      dates[dateStr].push(data.time);
    });

    return dates;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

// Renderizar estructura del calendario
function renderCalendarStructure(month, year, availableDates) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();

  // Días vacíos iniciales
  for (let i = 0; i < startingDay; i++) {
    elements.calendarDays.appendChild(createDayElement('', 'empty'));
  }

  // Días del mes
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const isAvailable = availableDates[dateStr]?.length > 0;
    const isToday = isSameDay(date, currentDate);

    const dayElement = createDayElement(
      day,
      isAvailable ? 'available' : 'unavailable',
      isToday ? 'today' : ''
    );

    if (isAvailable) {
      dayElement.addEventListener('click', () => {
        window.open(`horarios.html?date=${dateStr}`, '_blank');
      });
    }

    elements.calendarDays.appendChild(dayElement);
  }
}

// Helper Functions
function createDayElement(content, ...classes) {
  const div = document.createElement('div');
  div.className = ['day', ...classes].join(' ');
  div.textContent = content;
  return div;
}

function formatDate(date) {
  const d = new Date(date);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}
