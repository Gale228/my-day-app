"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, CircleHelp, Search, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageTransition } from "@/components/page-transition";

type FaqItem = { question: string; answer: string };
type FaqSection = { title: string; description: string; items: FaqItem[] };

const sections: FaqSection[] = [
  {
    title: "Аккаунт и синхронизация",
    description: "Регистрация, вход и работа на нескольких устройствах.",
    items: [
      { question: "Как зарегистрироваться?", answer: "Открой страницу регистрации, укажи имя, email и пароль. Если в Supabase включено подтверждение почты, после регистрации открой письмо и подтверди адрес. После этого можно входить с любого устройства." },
      { question: "Почему мои данные видны на другом устройстве?", answer: "Задачи, расходы, категории, цели, привычки и заметки сохраняются в Supabase. Поэтому достаточно войти в тот же аккаунт на другом устройстве — данные загрузятся из облака автоматически." },
      { question: "Может ли другой пользователь увидеть мои данные?", answer: "Нет. Все личные записи связаны с user_id текущего аккаунта. В Supabase включён Row Level Security, поэтому пользователь получает доступ только к своим данным." },
      { question: "Что делать, если данные не обновились?", answer: "Сначала обнови страницу и проверь интернет-соединение. Если изменения всё ещё не появились, выйди из аккаунта и войди снова. При локальной разработке также убедись, что npm run dev продолжает работать." },
    ],
  },
  {
    title: "Задачи",
    description: "Планирование дел и приоритетов.",
    items: [
      { question: "Как создать задачу?", answer: "Перейди в раздел «Дела» и нажми кнопку добавления. Укажи название, дату и при необходимости отметь задачу как важную." },
      { question: "Что означает важная задача?", answer: "Это обычная задача с повышенным приоритетом. Она визуально выделяется, чтобы важные дела было проще заметить среди остальных." },
      { question: "Как отметить задачу выполненной?", answer: "Нажми на чекбокс рядом с задачей. Статус сразу сохранится в облаке и синхронизируется с другими устройствами." },
    ],
  },
  {
    title: "Расходы и аналитика",
    description: "Учёт денег, категории и графики.",
    items: [
      { question: "Как добавить расход?", answer: "Открой раздел «Расходы», нажми добавление расхода, укажи название, сумму, дату и категорию. После сохранения запись попадёт в историю и аналитику." },
      { question: "Можно ли создать свою категорию расходов?", answer: "Да. В настройках можно создать собственную категорию и выбрать для неё эмодзи. Новая категория сразу станет доступна при добавлении расходов." },
      { question: "Что будет, если удалить категорию?", answer: "Старые расходы не удалятся. Они сохранятся в истории, но останутся без привязки к удалённой категории." },
      { question: "Где посмотреть графики расходов?", answer: "Открой раздел «Аналитика». Там показывается динамика расходов за последние дни и распределение трат по категориям за текущий месяц." },
    ],
  },
  {
    title: "Цели",
    description: "Личные и финансовые цели с прогрессом.",
    items: [
      { question: "Как создать цель?", answer: "Перейди в раздел «Цели», добавь название, описание и при необходимости дедлайн. Для финансовой цели можно задать сумму, к которой хочешь прийти." },
      { question: "Как меняется прогресс цели?", answer: "В карточке цели можно постепенно увеличивать или уменьшать прогресс. Когда цель выполнена, её можно отметить завершённой." },
    ],
  },
  {
    title: "Привычки",
    description: "Недельный трекер повторяющихся действий.",
    items: [
      { question: "Как работает трекер привычек?", answer: "Для каждой привычки задаётся цель по количеству выполнений в неделю. Каждый выполненный день отмечается в недельной шкале, а прогресс сохраняется в аккаунте." },
      { question: "Можно ли снять отметку за день?", answer: "Да. Повторное нажатие на отмеченный день отменит выполнение за эту дату." },
    ],
  },
  {
    title: "Заметки",
    description: "Быстрые записи и важная информация.",
    items: [
      { question: "Как создать заметку?", answer: "Открой раздел «Заметки» и создай новую запись. Заголовок и текст можно редактировать позже — изменения сохраняются в твоём аккаунте." },
      { question: "Для чего нужно закрепление?", answer: "Закреплённые заметки удобно использовать для важной информации, к которой нужно возвращаться чаще. Они остаются заметнее в списке." },
    ],
  },
  {
    title: "Тема и PWA",
    description: "Оформление и установка приложения на телефон.",
    items: [
      { question: "Как включить тёмную тему?", answer: "Используй переключатель темы в боковом меню или в настройках. Выбранная тема запоминается на текущем устройстве." },
      { question: "Как установить «Мой день» на iPhone?", answer: "После публикации сайта по HTTPS открой его в Safari, нажми «Поделиться» и выбери «На экран Домой». Приложение появится среди обычных иконок." },
      { question: "Как установить приложение на Android?", answer: "Открой сайт в Chrome. В меню браузера выбери «Установить приложение» или воспользуйся предложением установки, если оно появится автоматически." },
      { question: "Почему PWA не устанавливается с локального адреса на телефоне?", answer: "Для полноценной установки PWA на телефоне нужен защищённый HTTPS-адрес. localhost подходит для разработки на компьютере, а на телефоне лучше использовать уже опубликованный домен." },
    ],
  },
  {
    title: "Безопасность",
    description: "Как защищены аккаунт и личные записи.",
    items: [
      { question: "Где хранятся пароли?", answer: "Паролями управляет Supabase Auth. Приложение не хранит пароль в таблицах и не может показать его в открытом виде." },
      { question: "Где хранятся мои данные?", answer: "Данные приложения хранятся в PostgreSQL-базе проекта Supabase. Доступ к строкам ограничивается политиками Row Level Security." },
    ],
  },
];

function questionWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "вопрос";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "вопроса";
  return "вопросов";
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru-RU");
    if (!normalized) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          `${section.title} ${section.description} ${item.question} ${item.answer}`
            .toLocaleLowerCase("ru-RU")
            .includes(normalized),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  const questionCount = filteredSections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <PageTransition>
      <header className="page-header faq-header">
        <div>
          <span className="eyebrow">Помощь</span>
          <h1>FAQ</h1>
          <p>Короткие ответы о возможностях «Моего дня», синхронизации и безопасности.</p>
        </div>
      </header>

      <section className="panel faq-hero">
        <div className="faq-hero-icon"><CircleHelp size={28} /></div>
        <div className="faq-hero-copy">
          <span className="eyebrow">Быстрый поиск</span>
          <h2>Что хочешь узнать?</h2>
          <p>Начни вводить слово — останутся только подходящие вопросы.</p>
        </div>
        <label className="faq-search">
          <Search size={18} />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: расходы, iPhone, пароль..." aria-label="Поиск по FAQ" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"><X size={17} /></button>}
        </label>
      </section>

      <div className="faq-mini-grid">
        <article className="panel faq-mini-card"><Smartphone size={20} /><div><strong>PWA готово</strong><span>Установка на телефон после публикации по HTTPS</span></div></article>
        <article className="panel faq-mini-card"><ShieldCheck size={20} /><div><strong>Личные данные защищены</strong><span>Каждый аккаунт видит только свои записи</span></div></article>
        <article className="panel faq-mini-card"><Sparkles size={20} /><div><strong>{questionCount} {questionWord(questionCount)} найдено</strong><span>{query ? "По текущему запросу" : "Во всех разделах FAQ"}</span></div></article>
      </div>

      <div className="faq-sections">
        {filteredSections.map((section) => (
          <section className="panel faq-section" key={section.title}>
            <div className="faq-section-head"><div><span className="eyebrow">{section.items.length} {questionWord(section.items.length)}</span><h2>{section.title}</h2><p>{section.description}</p></div></div>
            <div className="faq-list">
              {section.items.map((item) => {
                const id = `${section.title}-${item.question}`;
                const open = openItem === id;
                return (
                  <article className={`faq-item ${open ? "open" : ""}`} key={item.question}>
                    <button type="button" className="faq-question" aria-expanded={open} onClick={() => setOpenItem(open ? null : id)}>
                      <span>{item.question}</span>
                      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={19} /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && <motion.div className="faq-answer-wrap" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}><p className="faq-answer">{item.answer}</p></motion.div>}
                    </AnimatePresence>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {filteredSections.length === 0 && <section className="panel faq-empty"><CircleHelp size={30} /><h2>Ничего не нашлось</h2><p>Попробуй более короткий запрос или другое слово.</p><button type="button" className="button button-secondary" onClick={() => setQuery("")}>Показать все вопросы</button></section>}
    </PageTransition>
  );
}
