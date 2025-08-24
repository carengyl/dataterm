(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // 1. Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    
    // 2. Если нет сохранённой - проверяем системные настройки
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 3. Применяем тему (приоритет: savedTheme > systemPrefersDark > Jekyll config)
    if (savedTheme) {
      body.classList.toggle('dark', savedTheme === 'dark');
    } else if (systemPrefersDark) {
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }

    // 4. Обработчик клика
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Обновляем ARIA-атрибут для доступности
        themeToggle.setAttribute('aria-pressed', isDark);
        
        console.log('Theme toggled:', isDark ? 'dark' : 'light');
      });
      
      // Инициализация ARIA-атрибута
      themeToggle.setAttribute('aria-pressed', body.classList.contains('dark'));
    } else {
      console.error('Кнопка theme-toggle не найдена!');
    }
  });
})();