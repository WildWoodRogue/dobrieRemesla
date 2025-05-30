document.addEventListener('DOMContentLoaded', function() {
    loadClasses();
    loadClassesForForm();
    
    // Обработчик для кнопок "Подробнее"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-secondary') && e.target.textContent === 'Подробнее') {
            e.preventDefault();
            const card = e.target.closest('.class-card');
            const classId = card.dataset.id;
            loadClassDetails(classId);
        }
    });
});

async function loadClasses() {
    try {
        const response = await fetch('http://127.0.0.1:8000/allClass', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({count: 6})
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const classes = await response.json();
        renderClasses(classes);
    } catch (error) {
        console.error('Ошибка:', error);
        document.querySelector('#classes .row').innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-muted">Не удалось загрузить занятия</p>
            </div>
        `;
    }
}

// Функция отображения карточек занятий
function renderClasses(classes) {
    const container = document.querySelector('#classes .row');
    container.innerHTML = classes.map(cls => `
        <div class="col-md-4 mb-4">
            <div class="class-card" data-id="${cls.id}">
                <img src="${cls.image_link || 'https://via.placeholder.com/300x200?text=Нет+изображения'}" 
                     alt="${cls.title}"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Ошибка+загрузки'">
                <h3>${cls.title}</h3>
                <p>${cls.short_description || 'Описание отсутствует'}</p>
                <a href="#" class="btn btn-secondary">Подробнее</a>
            </div>
        </div>
    `).join('');
}

// Функция загрузки деталей занятия
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

// Функция отображения модального окна с деталями занятия
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
                    <button class="btn btn-primary btn-lg btn-block enroll-btn py-3" data-id="${details.id}" style="font-size: 1.5rem; ">
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

// Загрузка занятий для формы
async function loadClassesForForm() {
    try {
        const response = await fetch('http://127.0.0.1:8000/allClass', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({count: 20})
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки занятий');
        const classes = await response.json();
        
        const select = document.getElementById('lesson');
        select.innerHTML = '<option value="" disabled selected>-- Выберите занятие --</option>';
        
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки занятий:', error);
    }
}

// Обработка отправки формы
document.getElementById('applicationForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const phoneInput = form.phone;
    const phoneValue = phoneInput.value.trim();
    
    // Проверка номера телефона (минимум 10 цифр)
    const phoneDigits = phoneValue.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        document.getElementById('formMessage').innerHTML = `
            <div class="alert alert-danger">
                Пожалуйста, введите корректный номер телефона (минимум 10 цифр)
            </div>
        `;
        phoneInput.focus();
        return;
    }
    
    const formData = {
        name: form.name.value.trim(),
        phone: phoneValue,
        lesson: parseInt(form.lesson.value),
        message: form.message.value.trim()
    };
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('formMessage');
    
    submitBtn.disabled = true;
    formMessage.innerHTML = '<div class="alert alert-info">Отправка заявки...</div>';
    
    try {
        const response = await fetch('http://127.0.0.1:8000/getPhone', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Ошибка отправки');
        
        formMessage.innerHTML = '<div class="alert alert-success">Заявка успешно отправлена!</div>';
        form.reset();
    } catch (error) {
        console.error('Ошибка:', error);
        formMessage.innerHTML = `
            <div class="alert alert-danger">
                Ошибка отправки: ${error.message || 'Попробуйте позже'}
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
    }
});

// Форматирование описания
function formatDescription(text) {
    if (!text) return '<p class="mb-3">Описание отсутствует</p>';
    return text.replace(/\n/g, '</p><p class="mb-3">')
               .replace(/^/, '<p class="mb-3">')
               .replace(/$/, '</p>');
}