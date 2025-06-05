// Configuración de Firebase (REEMPLAZA con tus datos)
const firebaseConfig = {
    apiKey: "AIzaSyB8bEzxsdi6gNLXeUrqYPHK1B1VsP5RoqM",
    authDomain: "calendario-jorge-finanzas.firebaseapp.com",
    projectId: "calendario-jorge-finanzas",
    storageBucket: "calendario-jorge-finanzas.appspot.com",
    messagingSenderId: "62034991024",
    appId: "1:62034991024:web:4e0adad933ecc89e93e875"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    async function getAvailableDates(year, month) {
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
                
                if (!dates[dateStr]) {
                    dates[dateStr] = [];
                }
                dates[dateStr].push(data.time);
            });
            
            return dates;
        } catch (error) {
            console.error("Error obteniendo citas: ", error);
            return {};
        }
    }
    
    async function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        document.getElementById('current-month').textContent = 
            `${monthNames[month]} ${year}`;
        
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Obtener fechas disponibles desde Firestore
        const availableDates = await getAvailableDates(year, month);
        
        // Días vacíos para el inicio del mes
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDay);
        }
        
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = day;
            
            // Marcar hoy
            if (day === currentDate.getDate() && 
                month === currentDate.getMonth() && 
                year === currentDate.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            // Verificar disponibilidad
            if (availableDates[dateStr] && availableDates[dateStr].length > 0) {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', function() {
                    window.open(`horarios.html?date=${dateStr}`, '_blank');
                });
            } else {
                dayElement.classList.add('unavailable');
            }
            
            calendarDays.appendChild(dayElement);
        }
    }
    
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [year, month, day].join('-');
    }
    
    // Navegación del calendario
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    // Renderizar calendario inicial
    renderCalendar(currentMonth, currentYear);
});
