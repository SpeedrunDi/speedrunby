import type { L } from '../i18n/types';

export interface Testimonial {
  quote: L;
  author: string;
  initials: string;
  role: L;
  source: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: {
      ru: 'Совместно работая над проектом, уверенно рекомендую Аманкелди как проактивного и трудолюбивого разработчика. Он внёс значительный вклад в разработку фронтенда, успешно интегрировав сложные функции, которые играли ключевую роль в конечном продукте. Обладает глубокими знаниями Next.js и стейт-менеджеров, отлично настраивает проект на TypeScript — и быстро, качественно делает вёрстку.',
      en: 'Working together, I can confidently recommend Amankeldi as a proactive and hardworking developer. He made a significant frontend contribution and integrated complex features that were key to the final product. He has deep knowledge of Next.js and state managers, a strong command of TypeScript project setup — and he delivers layout fast and cleanly.',
    },
    author: 'Ilgiz Arykbaev',
    initials: 'IA',
    role: { ru: 'Коллега по проекту', en: 'Project collaborator' },
    source: 'LinkedIn',
  },
  {
    quote: {
      ru: 'С удовольствием рекомендую Аманкелди на позицию Frontend Developer. Работая с ним в Oracle Digital, я убедился в его высоком профессионализме и исключительных навыках. Внимание к деталям и ответственность заметно улучшили функциональность и производительность наших приложений — и он отличный командный игрок, который вдохновляет всех вокруг.',
      en: "I'm glad to recommend Amankeldi for a Frontend Developer role. Working with him at Oracle Digital, I saw real professionalism and exceptional skill. His attention to detail and sense of responsibility markedly improved our applications' functionality and performance — and he's an excellent team player who lifts everyone around him.",
    },
    author: 'Baktiyar Jakshylykov',
    initials: 'BJ',
    role: { ru: 'Oracle Digital', en: 'Oracle Digital' },
    source: 'LinkedIn',
  },
];
