document.addEventListener('DOMContentLoaded', function() {
    loadAllClasses();
    
    // Обработчик для кнопок "Подробнее" (как в index.html)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-secondary') && e.target.textContent === 'Подробнее') {
            e.preventDefault();
            const card = e.target.closest('.class-card');
            const classId = card.dataset.id;
            loadClassDetails(classId);
        }
    });
});

// Функция загрузки списка занятий (аналогичная index.html)
async function loadAllClasses() {
    try {
        const response = await fetch('http://127.0.0.1:8000/allClass', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({count: 20}) // Берем 20 занятий вместо 6
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const result = await response.json();
        const classes = Array.isArray(result) ? result : 
                       (result.answer === "false" ? [] : result);
        
        renderAllClasses(classes);
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('classesContainer').innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-muted">Не удалось загрузить занятия</p>
            </div>
        `;
    }
}




// Функция отображения карточек (адаптированная версия из index.html)
function renderAllClasses(classes) {
    const container = document.getElementById('classesContainer');
    container.innerHTML = classes.map(cls => `
        <div class="col-md-4 mb-4">
            <div class="class-card" data-id="${cls.id}">
                <img src="${cls.image_link || 'https://via.placeholder.com/300x200?text=Нет+изображения'}" 
                     alt="${cls.title}"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Ошибка+загрузки'">
                <h3>${cls.title}</h3>
                <p>${cls.short_description || cls.short_dicsription || 'Описание отсутствует'}</p>
                <div class="card-actions">
                    <a href="#" class="btn btn-secondary">Подробнее</a>
                    <a href="index.html#contact" class="btn btn-primary">Записаться</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Точная копия функции из script.js
async function loadClassDetails(classId) {
    try {
        const response = await fetch('http://127.0.0.1:8000/classId', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: parseInt(classId)})
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const details = await response.json();
        showClassModal(details);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить детали занятия');
    }
}

// Точная копия функции из script.js
function showClassModal(details) {
    const modal = document.getElementById('classModal');
    modal.querySelector('.modal-title').textContent = details.title;
    
    modal.querySelector('.modal-body').innerHTML = `
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-12 text-center">
                    <img src="${details.image_link || 'https://via.placeholder.com/800x400?text=Нет+изображения'}" 
                         alt="${details.title}"
                         class="img-fluid rounded mb-4"
                         style="max-height: 400px; width: auto;">
                </div>
                <div class="col-md-12">
                    <div class="description-box mb-4">
                        ${formatDescription(details.description)}
                    </div>
                    <div class="details-box text-center p-3 mb-4">
                        <div class="date-display mb-2">${details.date}</div>
                        <div class="price-display">${details.cost}</div>
                    </div>
                    <button class="btn btn-primary btn-lg btn-block enroll-btn py-3" onclick="window.location.href = '/index.html#contact';"  data-id="${details.id}" style="font-size: 1.5rem; ">
                        🎨 Записаться на занятие 🎨
                    </button>
                </div>
            </div>
        </div>
    `;
    
    $('#classModal').modal('show');
    
    document.querySelector('.enroll-btn')?.addEventListener('click', function() {
        $('#classModal').modal('hide');
        document.getElementById('lesson').value = this.dataset.id;
        document.getElementById('contact').scrollIntoView({behavior: 'smooth'});
    });
}