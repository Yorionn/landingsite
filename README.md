# 3D Interactive Carousel Module

## 🎯 О проекте
Легко встраиваемый модуль **3D интерактивной карусели** на Three.js с оптимизацией для ПК и мобильных устройств.

### Основные возможности
- 🔄 **Интерактивное вращение** активной 3D модели
- 👆 **Свайп-навигация** для переключения между моделями
- 📱 **Адаптивность** - полная поддержка touch-устройств
- ✨ **Плавные анимации** - масштабирование, прозрачность, переходы
- 🎨 **Легкая кастомизация** - радиус, расстояние камеры, фон
- 🦌 **Поддержка GLB/GLTF** - загрузка реальных 3D моделей

## 🛠 Стек технологий
- **Next.js 14** - React фреймворк
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Three.js** - 3D графика
- **Docker** - контейнеризация

## 📁 Структура проекта
```
site/
├── app/
│   ├── components/
│   │   ├── ThreeCarousel.tsx    # 🎡 Главный компонент карусели
│   │   ├── CarouselDemo.tsx     # 📋 Демо с оленями
│   │   ├── modelLoader.ts       # 📦 Загрузчик GLB/GLTF моделей
│   │   ├── Header.jsx           # Шапка сайта
│   │   ├── Hero.jsx             # Главная секция
│   │   ├── Content.jsx          # Контент
│   │   └── Footer.jsx           # Подвал
│   ├── carousel/
│   │   └── page.tsx             # 🎪 Страница демо карусели
│   ├── layout.tsx               # Корневой layout
│   ├── page.tsx                 # Главная страница
│   └── globalstyle.css          # Глобальные стили
├── public/
│   └── models/
│       └── deer.glb             # 🦌 Пример 3D модели
├── CAROUSEL_MODULE.md           # 📖 Полная документация модуля
├── TROUBLESHOOTING.md           # 🔧 Решение проблем
├── Dockerfile                   # Docker-образ для продакшена
├── Dockerfile.dev               # Docker-образ для разработки
├── docker-compose.yml           # Docker Compose
├── docker-compose.dev.yml       # Docker Compose для разработки
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🎡 Компоненты карусели

### ThreeCarousel
Главный компонент с полной функциональностью:
- Интерактивное вращение активной модели (мышь + touch)
- Свайп для переключения (зоны у краёв экрана)
- Плавные анимации (масштабирование, прозрачность)
- Адаптивные стрелки навигации (скрываются на мобильных)

### CarouselDemo
Демонстрационный пример с загрузкой GLB моделей

### modelLoader
Утилиты для загрузки и обработки 3D моделей

## 🚀 Быстрый старт

### Запуск демо карусели
```bash
# 1. Установите зависимости
npm install

# 2. Запустите dev-сервер
npm run dev

# 3. Откройте в браузере
http://localhost:3000/carousel
```

### Интеграция в свой проект
```tsx
import ThreeCarousel from './components/ThreeCarousel';
import { loadGLBModel } from './components/modelLoader';

// Загрузите модели
const models = await loadGLBModel('/models/your-model.glb');

// Используйте карусель
<ThreeCarousel
  items={models}
  radius={7}
  cameraDistance={16}
  backgroundColor={0x0a0a0a}
  width="100%"
  height="800px"
/>
```

📖 **Подробная документация**: см. `CAROUSEL_MODULE.md`

## 🎮 Управление каруселью

### На десктопе (ПК)
- **🖱️ Drag центр** - вращение активной модели
- **🖱️ Swipe края** - переключение моделей (25% от краёв)
- **⬅️➡️ Стрелки** - переключение моделей

### На мобильных
- **👆 Drag центр** - вращение активной модели
- **👆 Swipe края** - переключение моделей
- Стрелки скрыты для чистоты интерфейса

## 🎨 Параметры настройки

```tsx
<ThreeCarousel
  items={models}              // Массив 3D моделей
  radius={7}                  // Радиус карусели
  cameraDistance={16}         // Расстояние камеры
  backgroundColor={0x0a0a0a}  // Цвет фона (hex)
  width="100%"                // Ширина
  height="800px"              // Высота
/>
```

### Технические характеристики
- **FOV камеры**: 55° (широкий обзор, модели не обрезаются)
- **Чувствительность вращения**: 0.02 (комфортное управление)
- **Плавность анимаций**: 0.05 (медленные переходы)
- **Зоны свайпа**: 25% от краёв экрана
- **Масштаб**: активная 0.7, неактивная 0.5
- **Прозрачность**: активная 1.0, неактивная 0.3

---

## ЛОКАЛЬНЫЙ ДЕПЛОЙ

### Через Node.js

#### 1. Установите зависимости
```bash
npm install
```

#### 2. Запустите dev-сервер
```bash
npm run dev
```

Сайт откроется на `http://localhost:3000`

### Через Docker

#### Требования
- Docker
- Docker Compose

#### 1. Запустите контейнер
```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### 2. Остановите контейнер
```bash
docker-compose -f docker-compose.dev.yml down
```

Сайт откроется `http://localhost:3000`


---

## ДЕПЛОЙ ДЛЯ ПРОДАКШЕНА

### Через Node.js

#### 1. Установите зависимости
```bash
npm install
```

#### 2. Соберите проект
```bash
npm run build
```

#### 3. Запустите production-сервер
```bash
npm start
```

Сайт будет доступен на порту 3000

### Через Docker (рекомендуется)

#### 1. Соберите и запустите контейнер
```bash
docker-compose up -d --build
```

#### 2. Проверьте статус
```bash
docker-compose ps
```

#### 3. Просмотр логов
```bash
docker-compose logs -f web
```

#### 4. Остановка
```bash
docker-compose down
```

Сайт будет доступен на `http://localhost:3000` (или домене)

### Docker без Compose (только сайт)

#### 1. Соберите образ
```bash
docker build -t site:latest .
```

#### 2. Запустите контейнер
```bash
docker run -d -p 3000:3000 --name site site:latest
```

#### 3. Остановите контейнер
```bash
docker stop site
docker rm site
```

---

## 📦 Доступные команды

### NPM команды
- `npm run dev` - запуск dev-сервера (карусель доступна на `/carousel`)
- `npm run build` - сборка проекта
- `npm start` - запуск production-сервера
- `npm run lint` - проверка кода

### Работа с 3D моделями
1. Поместите ваши `.glb` или `.gltf` файлы в `public/models/`
2. Обновите массив `MODEL_PATHS` в `CarouselDemo.tsx`
3. Перезагрузите страницу `/carousel`

### Изменение количества моделей
Отредактируйте `app/components/CarouselDemo.tsx`:
```tsx
const MODEL_PATHS = [
  '/models/model1.glb',
  '/models/model2.glb',
  '/models/model3.glb',
  // Добавьте или удалите пути
];
```

### Docker команды

#### Для разработки
```bash
docker-compose -f docker-compose.dev.yml up --build  # Запуск
docker-compose -f docker-compose.dev.yml down        # Остановка
```

#### Для продакшена
```bash
docker-compose up -d --build    # Запуск в фоне
docker-compose down             # Остановка
docker-compose logs -f          # Просмотр логов
docker-compose restart          # Перезапуск
```

---

##  Настройка для продакшена

### Переменные окружения
Создайте файл `.env.local` для локальных настроек:
```env
NODE_ENV=production
PORT=3000
```

### Изменение порта

**Без Nginx (не рекомендуется для продакшена):**
```yaml
ports:
  - "80:3000"  # Внешний:Внутренний
```

**С Nginx:**
```yaml
ports:
  - "127.0.0.1:3000:3000"  # Только localhost, Nginx будет проксировать
```
Это защищает Next.js от прямого доступа из интернета.

### Настройка домена

#### Как работает домен?
Домен настраивается на уровне:
1. **DNS** - направляет домен на IP вашего сервера
2. **Nginx** - перенаправляет трафик с домена на Next.js

#### Шаги настройки:

##### 0. Убедитесь, что сайт запущен
Перед настройкой домена запустите Docker контейнер:
```bash
docker-compose up -d --build
# Проверьте что сайт работает на порту 3000
curl http://localhost:3000
```

##### 1. Настройка DNS
В панели управления вашего регистратора домена добавьте A-запись:
```
Тип: A
Имя: @ (или оставьте пустым для корневого домена)
Значение: IP-адрес вашего сервера
TTL: 3600 (или по умолчанию)
```

Для поддомена (например, `www`):
```
Тип: A
Имя: www
Значение: IP-адрес вашего сервера
```

##### 2. Откройте порты в firewall
```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Важно:** Также проверьте что порты открыты в облачном провайдере (AWS Security Groups, GCP Firewall, etc.)

##### 3. Установка Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Проверка
sudo systemctl status nginx
```

##### 4. Настройка Nginx (HTTP)
Создайте конфиг `/etc/nginx/sites-available/site`:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

##### 5. Настройка HTTPS (Let's Encrypt)

**ВАЖНО:** Перед этим шагом убедитесь что:
- DNS-записи уже настроены (шаг 1) и домен указывает на ваш сервер
- Можно проверить командой: `ping ваш-домен.ru` (должен показать IP вашего сервера)
- Подождите 5-30 минут после настройки DNS для распространения изменений

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата (автоматически настроит Nginx)
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Проверка авто-обновления
sudo certbot renew --dry-run
```

После этого Nginx автоматически обновит конфиг:
```nginx
server {
    listen 443 ssl http2;
    server_name ваш-домен.ru www.ваш-домен.ru;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.ru/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        # ... остальные proxy_set_header
    }
}

# Редирект HTTP -> HTTPS
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;
    return 301 https://$server_name$request_uri;
}
```

##### 6. Переменные окружения (опционально)
Если вам нужен URL сайта в коде Next.js (для OG-тегов, API и т.д.), создайте `.env.local`:
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru
```

**Примечание:** Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере.

#### Устранение проблем

##### Домен не открывается
```bash
# 1. Проверьте что DNS работает
ping ваш-домен.ru
nslookup ваш-домен.ru

# 2. Проверьте что Next.js запущен
curl http://localhost:3000

# 3. Проверьте статус Nginx
sudo systemctl status nginx
sudo nginx -t

# 4. Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 5. Проверьте что порты открыты
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

##### Certbot не работает
```bash
# Проверьте что домен доступен извне (не с вашего сервера)
# Используйте онлайн-сервисы типа https://ping.eu/ping/

# Если домен не доступен - проблема в DNS или firewall
# Если доступен - попробуйте снова:
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru --debug
```

##### Docker контейнер не отвечает
```bash
# Проверьте статус
docker-compose ps

# Посмотрите логи
docker-compose logs -f

# Перезапустите
docker-compose restart
```

---

## 🔧 Устранение проблем с каруселью

### Карусель не запускается
```bash
# Проверьте установку зависимостей
npm list three

# Если three.js не установлен:
npm install three @types/three
```

### Модели не загружаются (404)
- ✅ Проверьте, что модели лежат в `public/models/`
- ✅ Путь должен начинаться с `/models/` (не `public/models/`)
- ✅ Проверьте расширение файла (`.glb` или `.gltf`)

### Вращение не работает на мобильных
- ✅ Убедитесь, что используете последнюю версию `ThreeCarousel.tsx`
- ✅ Проверьте, что `touchAction: 'none'` установлен на canvas
- ✅ Попробуйте очистить кеш браузера

### Модели обрезаются
- Увеличьте `height` карусели (например, до `"800px"`)
- Увеличьте FOV камеры (в `ThreeCarousel.tsx`, параметр `55`)
- Уменьшите `radius` или увеличьте `cameraDistance`

### Вращение слишком быстрое/медленное
Измените коэффициент в `ThreeCarousel.tsx` (строка ~136):
```tsx
activeModel.rotation.y += deltaX * 0.02; // Увеличьте/уменьшите 0.02
activeModel.rotation.x += deltaY * 0.02;
```

### Анимации слишком быстрые/медленные
Измените коэффициент lerp в `ThreeCarousel.tsx` (строка ~195):
```tsx
model.userData.currentAngle += angleDiff * 0.05; // Уменьшите для медленнее
```

