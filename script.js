document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Fechas con citas disponibles (simuladas)
    const availableDates = [
        '2023-11-15',
        '2023-11-18',
        '2023-11-20',
        '2023-11-22',
        '2023-11-25',
        '2023-12-05',
        '2023-12-10',
        '2023-12-15'
    ];
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        document.getElementById('current-month').textContent = 
            `${monthNames[month]} ${year}`;
        
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Espacios vacíos para días del mes anterior
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDay);
        }
        
        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = formatDate(date);
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
            if (availableDates.includes(dateString)) {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', function() {
                    window.open(`horarios.html?date=${dateString}`, '_blank');
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
