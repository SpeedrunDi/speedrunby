import type { L } from '../i18n/types';

export interface Project {
  id: string;
  name: string;
  category: L;
  years: string;
  flagship?: true;
  status: 'production' | 'in-dev';
  description: L;
  tags: string[];
  links?: { github?: string; live?: string };
  /** hard-suppresses link rendering for company work */
  confidential?: true;
}

export const projects: Project[] = [
  {
    id: 'banking-platform',
    name: 'Digital Business Banking Platform',
    category: { ru: 'Финтех', en: 'Fintech' },
    years: '2024 — 2026',
    flagship: true,
    status: 'production',
    confidential: true,
    description: {
      ru: 'Комплексная цифровая платформа для бизнес-клиентов банка: встроенная HR-система, веб-личный кабинет (Smart Учёт), микросервисный костяк на Spring Cloud (API-шлюз, авторизация, service discovery) и интеграция с госорганами для ЭСФ, ЭТТН, ОЭЦП и налоговой отчётности.',
      en: 'End-to-end digital banking platform for SME clients: an embedded HR system, web & mobile personal cabinets, a Spring Cloud microservice backbone (API gateway, auth, service discovery), and government-integrated fiscal services for e-invoices, e-waybills, OTP e-signature and tax filing.',
    },
    tags: ['Java', 'Spring Cloud', 'Next.js', 'Microservices', 'Govtech'],
  },
  {
    id: 'evo-fiscal',
    name: 'EVO — Fiscal & Cloud Services',
    category: { ru: 'Финтех', en: 'Fintech' },
    years: '2024 — 2026',
    flagship: true,
    status: 'production',
    confidential: true,
    description: {
      ru: 'Набор fintech/govtech-микросервисов и универсальный корпоративный личный кабинет для фискальной системы Кыргызстана: ЭСФ, ЭТТН, подача налоговых деклараций в ГНС, регистрация ИП через X-Road Тундук/Salyk и централизованный мониторинг платформы.',
      en: "A suite of fintech/govtech microservices and a universal enterprise personal cabinet for Kyrgyzstan's fiscal system: electronic invoices, transport waybills, tax declaration filing, entrepreneur registration via the Tunduk X-Road, and centralized monitoring.",
    },
    tags: ['Java', 'Spring Boot', 'React', 'Tax Integration', 'PostgreSQL'],
  },
  {
    id: 'petro-sales',
    name: 'Petro Sales — Fuel Retail Platform',
    category: { ru: 'Финтех', en: 'Fintech' },
    years: '2025',
    flagship: true,
    status: 'production',
    confidential: true,
    description: {
      ru: 'Full-stack платформа управления продажами сети АЗС: декомпозиция месячных планов в дневные по станциям, аналитика продаж в реальном времени по WebSocket и отдельный read-only сервис интеграции данных станций с 1С.',
      en: 'Full-stack sales-management platform for a fuel-station network: monthly targets decomposed into daily station plans, real-time sales analytics over WebSocket, and a dedicated read-only 1C accounting integration service.',
    },
    tags: ['Java', 'Spring Boot', 'Next.js', '1C Integration', 'WebSocket'],
  },
  {
    id: 'devpulse',
    name: 'DevPulse — DORA Metrics & AI Code Review',
    category: { ru: 'AI', en: 'AI' },
    years: '2026',
    flagship: true,
    status: 'production',
    confidential: true,
    description: {
      ru: 'Внутренняя платформа аналитики разработки: собирает активность в GitHub, показывает метрики DORA, дашборды для менеджеров (bus factor, нагрузка, узкие места) и автоматические код-ревью на базе Claude с оценкой качества 0–100 и еженедельными отчётами.',
      en: 'Internal engineering-analytics platform: ingests GitHub activity to surface the four DORA metrics, manager dashboards (bus factor, workload, bottlenecks), and Claude-powered automated code reviews with 0–100 quality scoring and weekly reports.',
    },
    tags: ['Next.js', 'React', 'Prisma', 'Claude API', 'DORA'],
  },
  {
    id: 'enterprise-erp',
    name: 'Enterprise ERP Platform',
    category: { ru: 'ERP', en: 'ERP' },
    years: '2025 — н.в.',
    status: 'in-dev',
    confidential: true,
    description: {
      ru: 'Корпоративная ERP-платформа, которую я инициировал и проектирую: бэкенд-микросервисы на Java/Spring, веб-клиент на TypeScript и нативное десктоп-приложение (Tauri/Rust), поставка фазами по спринтам.',
      en: 'An enterprise resource-planning platform I initiated and am architecting: a Java/Spring microservice backend, a TypeScript web client and a native desktop app (Tauri/Rust), delivered in phased sprints.',
    },
    tags: ['Java', 'Spring', 'TypeScript', 'Tauri / Rust', 'ERP'],
  },
  {
    id: 'evo-agent',
    name: 'Evo Agent — Claude-Powered CRM Bot',
    category: { ru: 'AI', en: 'AI' },
    years: '2025',
    status: 'production',
    confidential: true,
    description: {
      ru: 'Telegram-бот на базе Claude для работы с данными CRM в диалоговом режиме: агентный tool-use цикл поверх Playwright-скрапера с circuit-breaker и таймаут-защитой.',
      en: 'A Claude-powered Telegram bot that lets internal teams query and manage CRM project data conversationally, running an agentic tool-use loop backed by a Playwright scraper with circuit-breaker and timeout resilience.',
    },
    tags: ['Python', 'Claude Haiku', 'Agentic Tool-Use', 'aiogram', 'Playwright'],
  },
  {
    id: 'infra-monitoring',
    name: 'Infrastructure Monitoring & On-Call Bot',
    category: { ru: 'Платформа', en: 'Platform' },
    years: '2025',
    status: 'production',
    confidential: true,
    description: {
      ru: 'Платформа мониторинга инфраструктуры на Spring Boot: real-time дашборд на WebSocket, проверки Proxmox/iLO/Docker, видеонаблюдение, Telegram-уведомления и подсистема графика дежурств (замены, отсутствия, календарь праздников).',
      en: 'Spring Boot infrastructure-monitoring platform: a real-time WebSocket dashboard, Proxmox/iLO/Docker health checks, camera streaming, Telegram alerting, and a full on-call duty-roster subsystem.',
    },
    tags: ['Java', 'Spring Boot', 'WebSocket', 'Proxmox / iLO', 'DevOps'],
  },
  {
    id: 'ifarmer',
    name: 'iFarmer — Agriculture Platform',
    category: { ru: 'AgriTech', en: 'AgriTech' },
    years: '2023',
    status: 'production',
    description: {
      ru: 'Двуязычная (KG/RU) аграрная платформа: каталог фермерской продукции с карточками товаров, раздел агроновостей, страница «О нас» и форма обратной связи — SPA на React/MUI с анимированными переходами страниц и галереями.',
      en: 'A bilingual (KG/RU) agriculture platform: a catalog of farm products with detail pages, an agri-news section, an about page and a feedback form — a React/MUI SPA with animated page transitions and image galleries.',
    },
    tags: ['React', 'MUI', 'React Router', 'AgriTech'],
  },
  {
    id: 'akkuu-landing',
    name: 'Ak-Kuu — Corporate Landing Site',
    category: { ru: 'Веб', en: 'Web' },
    years: '2026',
    status: 'production',
    description: {
      ru: 'Премиальный корпоративный лендинг на Astro (SSG) с React-островами, 3D-визуализацией продукта (Three.js / R3F), GSAP-анимациями, пайплайном оптимизации изображений и защищённым PHP-эндпоинтом формы.',
      en: 'A premium corporate marketing site built as an Astro static site with React islands, 3D WebGL product visuals (Three.js / R3F), GSAP scroll animation, an image-optimization pipeline, and a hardened contact endpoint.',
    },
    tags: ['Astro', 'React', 'Three.js', 'GSAP', 'Tailwind CSS'],
    links: { github: 'https://github.com/SpeedrunDi/akkuu-landing' },
  },
  {
    id: 'eduspace',
    name: 'EduSpace — Online Learning Platform',
    category: { ru: 'Fullstack', en: 'Fullstack' },
    years: '2022 — 2023',
    status: 'production',
    description: {
      ru: 'Полноценная платформа онлайн-обучения под ключ: каталог курсов, модули и уроки с rich-text и видео, тесты, сертификаты и отзывы, админ-панель — SPA на React/Redux-saga поверх Node/Express + MongoDB с OAuth-входом.',
      en: 'A complete e-learning platform owned end-to-end: course catalog, modules and lessons with rich-text and video, tests, certificates and reviews, plus an admin panel — a React/Redux-saga SPA on a Node/Express + MongoDB backend with social OAuth login.',
    },
    tags: ['React', 'Redux-Saga', 'Node.js', 'Express', 'MongoDB'],
  },
  {
    id: 'meeting-app',
    name: 'Meeting App — Video Conferencing',
    category: { ru: 'Fullstack', en: 'Fullstack' },
    years: '2024',
    status: 'production',
    description: {
      ru: 'Веб-приложение для видеоконференций в стиле Zoom: запланированные и мгновенные встречи, личные комнаты, записи и авторизация на Next.js App Router с Stream video SDK и Clerk.',
      en: 'A Zoom-style video-conferencing web app with scheduled and instant meetings, personal rooms, recordings and authentication, built on the Next.js App Router with the Stream video SDK and Clerk auth.',
    },
    tags: ['Next.js', 'React', 'TypeScript', 'Stream SDK', 'Clerk'],
    links: { github: 'https://github.com/SpeedrunDi/meeting-app' },
  },
  {
    id: 'autocanada',
    name: 'AutoCanada — Car Import & Auction Platform',
    category: { ru: 'Fullstack', en: 'Fullstack' },
    years: '2023',
    status: 'production',
    description: {
      ru: 'Платформа импорта и растаможки авто с торгами в реальном времени: подбор автомобилей, живые аукционы и таможенное оформление в интерактивном full-stack приложении.',
      en: 'A car-import and customs platform with real-time bidding — users track vehicle sourcing, live auctions and customs clearance through an interactive full-stack web application.',
    },
    tags: ['React', 'Node.js', 'Real-Time Bidding', 'WebSocket'],
  },
  {
    id: 'erudit',
    name: 'Erudit — School Online Journal',
    category: { ru: 'Fullstack', en: 'Fullstack' },
    years: '2023 — 2024',
    status: 'production',
    description: {
      ru: 'Электронный школьный журнал для частной школы — веб-приложение для управления классами, учениками, оценками и расписанием.',
      en: 'An electronic school journal (online grade book) for a private school — a web application for managing classes, students, grades and schedules.',
    },
    tags: ['React', 'Node.js', 'Education'],
  },
  {
    id: 'job-search',
    name: 'Job Search Service — Elasticsearch',
    category: { ru: 'Бэкенд', en: 'Backend' },
    years: '2024',
    status: 'production',
    description: {
      ru: 'Бэкенд-сервис поиска вакансий на Java/Spring Boot с Elasticsearch и гексагональной архитектурой.',
      en: 'A job-search backend service on Java/Spring Boot with Elasticsearch and a hexagonal architecture.',
    },
    tags: ['Java', 'Spring Boot', 'Elasticsearch', 'Hexagonal'],
    links: { github: 'https://github.com/Amanfiscale/Search-Service-Elasticsearch' },
  },
  {
    id: 'vtb-group',
    name: 'VTB Group — Construction Company Landing',
    category: { ru: 'Веб', en: 'Web' },
    years: '2026',
    status: 'production',
    description: {
      ru: 'Одностраничный сайт-визитка строительной компании с GSAP-анимациями и формой заявки, отправляющей лиды в Telegram через защищённый serverless Cloudflare Worker (rate limiting, CORS-lock, CSP/HSTS).',
      en: 'A single-page marketing site for a construction company with GSAP scroll animations and a contact form relaying leads to Telegram through a hardened serverless Cloudflare Worker (rate limiting, CORS lock, CSP/HSTS).',
    },
    tags: ['JavaScript', 'GSAP', 'Cloudflare Workers', 'Serverless'],
    links: { github: 'https://github.com/SpeedrunDi/vtb-group' },
  },
];
