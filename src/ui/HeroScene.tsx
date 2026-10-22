import { cn } from '@/lib/cn'

/**
 * Заставка первого экрана: два крыла из световых нитей, сходящихся к центру.
 *
 * Рисуется вектором, а не картинкой. Картинка была растром 1280×720: на
 * мониторе шире она растягивалась и мылилась, а её заголовок был вшит в
 * пиксели — из-за чего настоящий `<h1>` приходилось держать отдельной скрытой
 * строкой. Здесь сцена — только фон, а весь текст лежит поверх живой разметкой.
 *
 * Инлайном, а не файлом `.svg`: через `<img>` нельзя ни анимировать слои по
 * отдельности, ни подкрасить их темой — а крылья должны медленно дышать.
 *
 * `preserveAspectRatio="xMidYMid slice"` заполняет любую пропорцию — от 21:9 до
 * узкого телефона, — обрезая края, а не композицию: нити к краям и так уходят
 * в прозрачность, и обрезать там нечего.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none overflow-hidden bg-[#050b17]', className)} aria-hidden="true">
      <svg
        className="size-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/*
            Нить разгорается к центру и гаснет к краю: яркость идёт оттуда, где
            сходятся крылья, иначе пучок читается как провод поперёк экрана.
          */}
          <linearGradient id="hs-blue" x1="800" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#dbeeff" stopOpacity="0.95" />
            <stop offset="0.18" stopColor="#6fb6ff" stopOpacity="0.9" />
            <stop offset="0.55" stopColor="#2e86de" stopOpacity="0.55" />
            <stop offset="1" stopColor="#2e86de" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="hs-gold" x1="800" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffe9c2" stopOpacity="0.85" />
            <stop offset="0.25" stopColor="#f0b35a" stopOpacity="0.75" />
            <stop offset="0.6" stopColor="#c8832c" stopOpacity="0.4" />
            <stop offset="1" stopColor="#c8832c" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="hs-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#2e86de" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#1f5fa8" stopOpacity="0.22" />
            <stop offset="1" stopColor="#050b17" stopOpacity="0" />
          </radialGradient>

          {/* Подложка под текстом. Нити сходятся за логотипом, но дальше идут
              подпись, кнопка и направления — по голому пучку читать их нельзя.
              Градиент гасит свет ровно под строкой логотипа и ниже. */}
          <linearGradient id="hs-veil" x1="0" y1="330" x2="0" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#050b17" stopOpacity="0" />
            <stop offset="0.3" stopColor="#050b17" stopOpacity="0.72" />
            <stop offset="1" stopColor="#050b17" stopOpacity="0.92" />
          </linearGradient>

          {/*
            Крыло описано один раз и ставится зеркально: композиция симметрична,
            а две независимые копии разъезжаются при первой же правке.

            Три ступени мягкости задаются снаружи, классами: ядро пучка остаётся
            читаемым, дальние нити превращаются в свет. Один общий blur дал бы
            туман без рисунка.
          */}
          <g id="hs-wing-near">
            <path d="M800 332C664 322 520 276 236 214" stroke="url(#hs-blue)" strokeWidth="7" fill="none" />
            <path d="M800 334C656 356 508 414 214 470" stroke="url(#hs-blue)" strokeWidth="5.5" fill="none" />
            <path d="M800 330C668 296 524 230 206 150" stroke="url(#hs-blue)" strokeWidth="3.5" fill="none" />
            <path d="M800 336C650 382 486 452 160 512" stroke="url(#hs-gold)" strokeWidth="4" fill="none" />
            <path d="M800 329C662 288 498 206 188 122" stroke="url(#hs-gold)" strokeWidth="2.5" fill="none" />
            <path d="M800 332C690 332 566 326 300 310" stroke="url(#hs-blue)" strokeWidth="2" fill="none" />
          </g>

          <g id="hs-wing-mid">
            <path d="M800 331C654 310 492 250 184 178" stroke="url(#hs-blue)" strokeWidth="22" fill="none" />
            <path d="M800 334C648 368 482 436 136 496" stroke="url(#hs-blue)" strokeWidth="17" fill="none" />
            <path d="M800 337C634 398 446 486 56 538" stroke="url(#hs-gold)" strokeWidth="14" fill="none" />
            <path d="M800 328C658 284 476 190 140 96" stroke="url(#hs-gold)" strokeWidth="11" fill="none" />
          </g>

          <g id="hs-wing-far">
            <path d="M800 332C644 296 462 212 112 136" stroke="url(#hs-blue)" strokeWidth="46" fill="none" />
            <path d="M800 336C622 404 414 512 64 566" stroke="url(#hs-gold)" strokeWidth="38" fill="none" />
          </g>
        </defs>

        <rect width="1600" height="900" fill="#050b17" />

        {/* Свечение в центре — то, из-за чего нити кажутся источником света, а
            не рисунком поверх фона. Лежит под крыльями. */}
        <ellipse cx="800" cy="450" rx="760" ry="330" fill="url(#hs-core)" className="hero-pulse" />

        <g className="hero-wing">
          <Wing />
        </g>
        {/* Зеркало — на вложенной группе: на внешней его перетёрла бы анимация,
            у CSS-трансформа приоритет над атрибутом, и правое крыло прыгнуло бы
            на место левого. */}
        <g className="hero-wing hero-wing-right">
          <g transform="translate(1600 0) scale(-1 1)">
            <Wing />
          </g>
        </g>

        <rect x="0" y="330" width="1600" height="570" fill="url(#hs-veil)" />
      </svg>
    </div>
  )
}

/**
 * Три плана одного крыла, размытые по возрастанию.
 *
 * Размытие — классом CSS, а не фильтром SVG. `feGaussianBlur` считается
 * процессором и пересчитывается на каждой перерисовке содержимого, а крылья
 * как раз движутся без остановки; `filter: blur()` браузер отдаёт видеокарте
 * и кэширует слоем. На первом экране это разница между плавным движением и
 * рваной прокруткой на среднем ноутбуке.
 *
 * Отсюда правило сцены: внутри размытой группы не анимируется ничего —
 * движется сама группа.
 */
function Wing() {
  return (
    <>
      <use href="#hs-wing-far" className="opacity-55 blur-[22px]" />
      <use href="#hs-wing-mid" className="opacity-85 blur-[9px]" />
      <use href="#hs-wing-near" className="blur-[2.5px]" />
    </>
  )
}
