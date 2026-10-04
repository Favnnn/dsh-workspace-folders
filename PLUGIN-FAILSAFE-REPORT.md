# Отчёт: порт dsh-workspace-folders на dsh v0.2.0-rc.2 и fail-safe схема

Файл-справка из проекта dsh-workspace-folders (по образцу отчёта
dsh-agents-board). Раздел 1 — что сломалось бы при прямом переносе и как
это закрыто. Раздел 2 — как плагин сам деградирует при поломке. Раздел 3 —
схема доставки. Раздел 4 — чем проверялся порт.

---

## 1. Ловушки rc.1 → rc.2 в этом плагине

### 1а. Переименование иконок primitives (React #130)

В rc.2 пакет `@deepseek-ai/dsh-client-ui-primitives` переименовал ВСЕ иконки
вида `IconXxx16` в `IconXxx{Regular,Medium}`. Голая деструктуризация или
обращение `primitives.IconEditOutline16` даёт `undefined`,
`createElement(undefined)` поднимает React #130, и граница ошибки слота
гасит весь entry — дерево не появляется вовсе.

Фикс (правило «критичное — своё»):
- `require('@deepseek-ai/dsh-client-ui-primitives')` обёрнут в try/catch
  (пакет может пропасть из статических внешних модулей целиком);
- каждая иконка резолвится по цепочке кандидатов
  (`IconXxxRegular` → `IconXxxMedium` → легаси-имя) и при пустом результате
  берёт СОБСТВЕННЫЙ SVG-глиф из бандла (`localGlyph`, stroke `currentColor`,
  токены темы не нужны — цвет наследуется);
- `StateDot`, `Menu`, `Tooltip`, `Modal`, `Button` тоже имеют собственные
  фолбэки (простые, но работоспособные: локальное меню — якорь + список
  пунктов, локальный диалог — слой + панель на токенах
  `--dsw-specific-menu` поверх `--dsw-alias-bg-layer-1` — полупрозрачные
  панельные поверхности rc.2 учитаны);
- примитивы harness остаются ПЕРВЫМ выбором (тема-точность), фолбэк — только
  при исчезновении/переименовании экспорта.

### 1б. Хук `useSessionPendingInteraction` удалён

Состояние «агент ждёт ответа» теперь живёт в сервисе `uiSession`:
- в рендере — стандартный root-хук `useSessionStatus(selector)` (он приходит
  всем слот-компонентам через `slots.provideRoot`); вызов обёрнут
  `typeof props.useSessionStatus === 'function'`, старый хук остался
  guarded-фолбэком для старого рантайма;
- карта собирается из `pendingInteraction` каждой записи
  `Map<sessionId, {running, pendingInteraction, completionUnread}>` — тот же
  интерфейс `.get(id)`, что был у rc.1-хука, поэтому весь путь отрисовки
  точки «ждёт ответа» не изменился.

### 1в. Бит `completed` у строки сессии удалён

Зелёная подсветка «завершил и не просмотрен» читается из той же
sessionStatus-карты: флаг `completionUnread`. Сервис сам ставит его при
завершении вне просматриваемой сессии и снимает при открытии.

### 1г. Поле `current` у SessionListState удалено

Текущий чат определяется по retain-счётчику строки: главный просмотр
удерживает сессию (`row.retainedBy.mainView > 0`) — тот же признак, которым
продукт сам вычисляет текущую строку дерева.

### 1д. `sessions.open` / `openSubagent` удалены

Открытие чата — `uiWorkspace.openSession(sessionId)`. В `apply` построен
помощник `openSessionId`: сначала `uiWorkspace.openSession` (сервис в
`inject`), затем — только при его отсутствии — легаси-вербы старого
рантайма. Все четыре точки открытия (клик по строке, новый чат, форк,
повторное использование blank-чата) идут через него.

### 1е. `uiWorkspace.insertSessionBefore` ушел из контракта слотов

Сортировка чатов переехала на уровень контроллера: durable-перенос порядка
остался в клиентском сервисе `workspaces` — `ctx.get('workspaces')
.insertSessionBefore(workspaceId, sessionId, beforeSessionId)`. Вызов
защищён `typeof`-проверкой; при отсутствии контроллера жест просто ничего
не делает.

### 1ж. Настройки: `settings.installSection` не существует

Экспортирована схема `Config` (schemastery, оба поля `.volatile()`):
`enabled` и `chatSorting`. schemastery грузится синхронно через
`createRequire`: голый `@deepseek-ai/schemastery`, при неудаче —
вендоренная копия `./deps/schemastery.cjs` (+ cosmokit рядом);
top-level await запрещён. Клиент читает volatile-значения через
`ctx.configForms.get('workspace-folders')` (guarded): при
`chatSorting === false` жесты сортировки чатов отключаются целиком
(draggable убирается), остальное дерево работает.

---

## 2. Fail-safe внутри плагина (harness не правится)

### Host (host.mjs)
1. `inject = ['webServer']` — волокно само дождётся сервиса, чтение
   свойства `ctx.webServer` в `apply` легально при любом порядке загрузки
   (гонка «cannot get property without inject» исключена).
2. Всё тело `apply` в try/catch; регистрация маршрутов — через `ctx.effect`
   (корректно снимается при stop/update). Падение = строка в консоли
   `workspace-folders: tree routes failed...`, сервер живёт без маршрутов.
3. `enabled: false` в конфиге паркует маршруты; клиент засыпает сам (его
   `/tree` отвечает 404), штатный список остаётся как был.
4. schemastery недоступен → нет схемы → нет формы на странице Plugins;
   дерево работает на внутренних дефолтах.
5. Хранилище `folders.json` атомарно (tmp+rename); битый файл нормализуется,
   состояние по умолчанию — пустое дерево (загрузка harness не блокируется
   в принципе).

### Client (client.js)
1. Обёртка `apply → applyBody` в try/catch: упавший клиентский модуль не
   срывает активацию entry (иначе page.fail) — дерево просто остаётся
   выключенным.
2. Единственная регистрация слота — через contained-обёртку: падение
   регистрации даёт строку в консоли и выключенное дерево, entry жив.
3. Все обращения к dispatch-хукам (`useSessions`, `useWorkspaces`,
   `useSessionStatus`, `useConfig`) — после `typeof`-проверки: оболочка
   вправе менять состав hooks между версиями.
4. Мягкие зависимости — через `ctx.get(name)` с undefined-check
   (`workspaces`, `uiWorkspace` при недоступности в get), жёсткие — в
   `inject` (`sessions`, `slots`, `locale`, `configForms`, `uiWorkspace`).
5. DOM-интеграция (порталы в штатный список) обёрнута: любая
   DOM-неожиданность продукта держит плагин спящим, но не шумит и не роняет
   страницу.

---

## 3. Доставка через официальный бандл

- `install.ps1` только запускает официальный установщик: `pnpm pack` в
  папке-мастере → `pnpm dsh plugin --profile web add <tarball>` из чекаута.
  Профиль держит РЕАЛЬНУЮ КОПИЮ пакета (tarball-путь, не junction) в своём
  `node_modules`; папку-мастер можно переносить и удалять.
- `cordis.patch.yml` бандла — настоящий overlay-ряд (`id: workspace-folders`,
  `name: dsh-workspace-folders`, `config:` с дефолтами). `id` обязателен:
  под ним сервис настроек публикует схему, а клиент читает configForms.
- Легаси (маркерованный file://-ряд в патче профиля, копия в
  `%DSH_HOME%\plugins`) install.ps1 зачищает идемпотентно: дубль-регистрация
  ломает rc.2-сканер клиентских модулей.
- АРТЕФАКТЫ (безопасность профиля): манифест профиля держит file:-ссылку на
  tarball, а `dsh plugin add` ЛЮБОГО бандла прогоняет полный pnpm install и
  резолвит ВСЕ зависимости — один отсутствующий артефакт валит чужие
  установки (и даже remove). Поэтому:
  - артефакты живут в `<DSH_HOME>\profiles\web\.artifacts\` (создаётся при
    установке), и ТЕКУЩИЙ артефакт, на который ссылается манифест, —
    ХРАНИТСЯ (никогда не удаляется);
  - pack идёт из staging-копии папки БЕЗ `*.tgz` на любой глубине
    (robocopy /XF), иначе старый архив вкладывается внутрь нового tarball;
  - после успешного add удаляются точечно ТОЛЬКО устаревшие версии СВОЕГО
    пакета (в `.artifacts` и в папке мастера);
  - перед add сверяется и собственная ссылка: если она указывает на
    отсутствующий путь вне `.artifacts` (переход со старой схемы), туда
    кладётся спасательная копия свежего артефакта, а после add — удаляется
    как устаревшая;
  - висячая ссылка ЧУЖОГО бандла чинится перепаковкой его мастер-папки
    (артефакт ложится точно по пути из манифеста); если мастер не
    восстанавливается — официальное remove с сохранением живых значений
    конфига в патч бандла.

---

## 4. Как проверялся порт

1. `node --check host.mjs` / `node --check client.js`.
2. Node-симуляция (`sim/client-sim.mjs`): стаб `window.__ModuleLoader__`,
   evaluate client.js, factory(require-стаб), apply(стаб-ctx: effect /
   locale / configForms / slots / sessions.list / uiSession.sessionStatus /
   workspaces), затем ГЛУБОКИЙ рендер зарегистрированного seat-компонента
   мини-рендерером (локальные useState/useEffect/useMemo) — на четырёх
   вариантах primitives (rc.2-имена / пусто / rc.1-имена / частично
   отсутствуют), плюс края статус-карты (pending появление/снятие,
   completionUnread) и `chatSorting: false`. Все проверки зелёные.
3. `pnpm dsh --profile web --dump-config` — ряд с id/name/config на месте.
4. Сервер отдаёт бандл: rev = sha1("plugin-artifact"+"\0"+len(mtime)+...
   от client.js), `GET /plugins/??dsh-workspace-folders/client.js&rev=<rev>`
   → 200.
5. Живое: консоль браузера без «slot entry crashed»;
   `cordis_inspect_query` (client, Slots.listSubTree) показывает
   регистрацию в `shell.overlay`.
