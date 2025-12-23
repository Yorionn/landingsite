# Макет лендинга с поддержкой Node.js

## О проекте
Макет лендинг-сайта, реализованный на Next.js. На данный момент содержит лишь структуру и базовую функциональность.

## Стек технологий
- Next.js 14
- React 18
- TypeScript
- Docker

## Структура проекта
```
site/
├── app/
│   ├── components/
│   │   ├── Header.jsx      # Шапка сайта с навигацией
│   │   ├── Hero.jsx        # Главная секция
│   │   ├── Content.jsx     # Основной контент
│   │   └── Footer.jsx      # Подвал
│   ├── layout.tsx          # Корневой layout
│   ├── page.tsx            # Главная страница
│   └── globalstyle.css     # Глобальные стили
├── Dockerfile              # Docker-образ для продакшена
├── Dockerfile.dev          # Docker-образ для разработки
├── docker-compose.yml      # Docker Compose для продакшена
├── docker-compose.dev.yml  # Docker Compose для разработки
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Компоненты
- **Header** - шапка сайта с заголовком и навигацией
- **Hero** - главная секция с кнопкой и медиа-контентом
- **Content** - основной контент
- **Footer** - подвал с навигацией

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

Сайт будет доступен на `http://localhost:3000` (или вашем домене)

### Docker без Compose (только сайт)

#### 1. Соберите образ
```bash
docker build -t sitenikolai:latest .
```

#### 2. Запустите контейнер
```bash
docker run -d -p 3000:3000 --name sitenikolai sitenikolai:latest
```

#### 3. Остановите контейнер
```bash
docker stop sitenikolai
docker rm sitenikolai
```

---

## Доступные команды

### NPM команды
- `npm run dev` - запуск dev-сервера
- `npm run build` - сборка проекта
- `npm start` - запуск production-сервера
- `npm run lint` - проверка кода

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
Отредактируйте `docker-compose.yml`:
```yaml
ports:
  - "80:3000"  # Внешний:Внутренний
```

### Nginx 
Для продакшена рекомендуется использовать Nginx как reverse proxy:
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

