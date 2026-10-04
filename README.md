# dsh-workspace-folders

A DSH plugin that adds **folders to the Workspaces sidebar**: collect workspaces
into collapsible, nestable folders, drag them around with the mouse, rename and
delete them — while the product's own workspace registry, session history and
file system stay untouched.

Folders are pure grouping metadata on top of the Workspaces list. They reference
workspaces by id; nothing is moved on disk.

> **Requires dsh v0.2.0-rc.2** (installed as a profile bundle). The rc.1-era
> file://-row flow is retired; the installer migrates it away automatically.

## Features

- **New folder** button in the Workspaces header — next to search / view
  options / add workspace.
- Folders **collapse and expand** (the folder icon turns into a chevron on
  hover); expanded/collapsed state is remembered per browser.
- **Nesting** up to 8 levels. Chats cannot be created inside a folder — folders
  contain other folders and workspaces; chats live inside workspaces.
- The tree shows **all workspaces**: filed ones inside their folders, unfiled
  ones at the tree root. The product's own group sections for those workspaces
  are hidden (the "ungrouped chats" bucket stays product-rendered).
- **Move to folder…** dialog in every row menu: pick any folder or
  "Root (no folder)"; the folder's own subtree is excluded for folder moves;
  the target folder auto-expands after the move.

### Row menus (three-dot button)

| Row | Menu items |
| --- | --- |
| Folder | Rename · New subfolder · Move to folder… · Delete folder |
| Workspace | New chat · Rename · Move to folder… · Unfile (only when filed) · Delete workspace |
| Chat | Rename · Fork · Archive |

- **Delete folder** never destroys content: nested folders and workspaces move
  one level up.
- **Delete workspace** removes only the list entry — the workspace directory
  and its chat history on disk remain.

## Drag & drop rules

**Folder dragged onto a folder row** — three zones on the target row:

| Zone | Result |
| --- | --- |
| Top quarter (insertion line above) | Seat the dragged folder **before** the target |
| Middle half (outline around the row) | Drop **inside** the target folder |
| Bottom quarter (insertion line below) | Seat the dragged folder **after** the target |

- Seating a folder **beside** a root folder (top/bottom edge) pulls the dragged
  subtree out **to the root** — that is the "extract to root" gesture. At the
  root the edges seat the folder in the **mixed root sequence**, so its new
  neighbours may be workspaces.
- A folder is never seated inside its own subtree; such a drop is ignored.

**Workspace dragged onto a folder row:**

| Zone | Result |
| --- | --- |
| Top quarter of a **root** folder (insertion line above) | Unfile the workspace and seat it **right before that folder** in the root |
| Everything else | File the workspace **into** that folder |

**Folder dragged onto a root workspace row:** seats the folder before/after
that workspace in the mixed root sequence.

**Workspace dragged onto a workspace row:** seats before/after the target on
its level — dropping a filed workspace onto a root (unfiled) workspace extracts
it to the root as well.

The root keeps one **mixed sequence** of folders and workspaces (stored in
`folders.json` as `root`), so a project folder can sit between two folders.
Items you never positioned fall back to the tail: folders first, then
workspaces in registry order.

**Chat dragged onto a chat row:** seats before/after the target within the same
workspace. The order is persisted through the product's own contract
(`insertSessionBefore`), so it survives restarts.

Menu-based fallbacks cover everything: **Move to folder…** and **Unfile**.

While a drag is in progress the plugin's UI reacts one tick late and reserves no
layout space, so the product's own native reordering drag is never disturbed.

## How it works

| File | Role |
| --- | --- |
| `host.mjs` | Node-side half: REST routes under `/workspace-folders/*` on the DSH web server, the tree storage, and the exported `Config` schema (the Plugins-page form). |
| `client.js` | Browser half: the tree in the Workspaces list, header button, dialogs, drag & drop — with plugin-owned fallbacks for every harness primitive it touches. |
| `cordis.patch.yml` | The bundle patch the harness loads as an overlay row (`id: workspace-folders`, config defaults). |
| `install.ps1` / `install.bat` | Install and update (official `dsh plugin add` of a packed tarball). |
| `uninstall.ps1` / `uninstall.bat` | Uninstall (official CLI removal plus legacy cleanup). |
| `deps/` | Vendored schemastery + cosmokit so the config schema loads outside the harness tree. |
| `package.json` | Plugin manifest (`dsh.bundle` + `dsh.client` metadata). |

REST endpoints (host half): `GET /workspace-folders/tree`,
`POST /workspace-folders/folders | /rename | /move | /assign | /delete | /root`.
Every mutation answers with the fresh normalized tree.

Settings live on the **Plugins page** (the row's own form, native enable
switch included). The schema is the plugin's exported `Config`
(schemastery, volatile fields):

- `enabled` — parks the REST routes while the bundle stays loaded;
- `chatSorting` — when off, the chat reorder gestures are disabled (dragging
  chats, and the durable reorder through the workspace controller).

The tree data lives **separately from the code**, in
`%DSH_HOME%\plugin-data\dsh-workspace-folders\folders.json`:

- `folders` — id, name, parentId, order;
- `assignments` — workspace id → folder id (with ordering inside a folder);
- `root` — the mixed root sequence (ids of root folders and unfiled
  workspaces in display order).

Install and uninstall **never touch** this file. The native Plugins-page
switch (or `enabled: false`) switches the REST routes off and the UI goes
dormant; the product list reappears as-is.

## Install

Double-click `install.bat`, or run from the plugin folder:

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

The installer uses the harness's own install path and performs, in order:

1. vendors the config-schema library into `deps\` (from the harness checkout);
2. removes the legacy file:// row a pre-rc.2 installer wrote into the profile
   patch and the legacy copy under `%DSH_HOME%\plugins` (both idempotent —
   they simply do nothing on a clean machine);
3. packs this folder — from a staging copy without `*.tgz` — into the
   profile's artifact store `%DSH_HOME%\profiles\web\.artifacts\` and runs
   `pnpm dsh plugin --profile web add <that tarball>` from the harness
   checkout: the package is registered as a profile bundle, the profile gets
   a REAL COPY in its `node_modules` (so this master folder can be moved or
   deleted freely), and the manifest references the tarball in `.artifacts`;
4. after a successful add, deletes only OUTDATED versions of its own tarball
   (in `.artifacts` and in this folder), pointwise; the current artifact
   stays — the profile manifest references it, and a missing artifact would
   break every other bundle's install.

Re-running the installer refreshes everything — it is idempotent.
Then restart `pnpm dsh web` and refresh the page (F5).

## Move to another computer

The plugin folder is self-contained. Copy it whole to another machine that
runs the harness (the checkout provides the CLI) and execute `install.bat`
there. The web profile (`%DSH_HOME%\profiles\web`) must already exist — it is
created by the first `pnpm dsh web` run.

To bring the current layout along, also copy
`%DSH_HOME%\plugin-data\dsh-workspace-folders\folders.json` into the same
relative path on the target machine (or just re-create folders by hand — the
tree is small).

## Uninstall

Run `uninstall.bat` from the master folder (or run `uninstall.ps1` directly).
Removal is surgical, no masks:

- the official CLI removal (`pnpm dsh plugin --profile web remove
  dsh-workspace-folders`);
- the legacy managed row in `%DSH_HOME%\profiles\web\cordis.patch.yml`
  (pre-rc.2 installs, removed only if present);
- the legacy folder `%DSH_HOME%\plugins\dsh-workspace-folders` (old-flow
  installs only).

The saved tree stays — reinstalling later restores the layout.
`uninstall.ps1 -PurgeData` additionally deletes the single file `folders.json`.
Restart `pnpm dsh web` afterwards.

## Limits

- Folder name: up to 80 characters; unique among siblings.
- Nesting depth: up to 8 levels.
- Workspace identity inside the tree is matched by title to hide the product's
  duplicate rows; the registry rejects duplicate workspace names, which keeps
  the mapping unambiguous.

## Troubleshooting

- **Sidebar looks unchanged** — restart `pnpm dsh web`, then refresh (F5).
- **Folders gone but workspaces visible** — the host half is not answering
  (disabled row or stopped server). The plugin hides product rows only after a
  successful tree fetch, so the plain product list always stays intact.
- **Drop landed differently than expected** — check the zone: an insertion
  line above/below a row means sibling placement, an outline around the row
  means "into the folder". The top quarter of a root folder's row is the
  "extract to root" zone for both folders (edges) and workspaces (top edge).

---

# dsh-workspace-folders — Русская версия

Плагин DSH, добавляющий **папки в боковую панель Workspaces**: собирайте
рабочие области в сворачиваемые вложенные папки, перетаскивайте их мышью,
переименовывайте и удаляйте — при этом реестр рабочих областей, история чатов
и файловая система остаются нетронутыми.

Папки — чисто группировка поверх списка Workspaces: они ссылаются на рабочие
области по id и ничего не перемещают на диске.

> **Требуется dsh v0.2.0-rc.2** (установка профилем-бандлом). Старая схема с
> file://-строкой времён rc.1 выведена из эксплуатации; установщик сам
> переносит следы старой установки.

## Возможности

- Кнопка **«Новая папка»** в шапке Workspaces — рядом с search / view options /
  add workspace.
- Папки **сворачиваются и разворачиваются** (при наведении пиктограмма папки
  превращается в шеврон); состояние запоминается в браузере.
- **Вложенность** до 8 уровней. Внутри папки чат создать нельзя — папки
  содержат папки и рабочие области, чаты живут в рабочих областях.
- Дерево показывает **все рабочие области**: вложенные — внутри своих папок,
  корневые — в корне дерева. Штатные групповые секции продукта для них
  скрываются (корзина «чатов без рабочей области» остаётся штатной).
- Диалог **Move to folder…** в меню каждой строки: выберите любую папку или
  «Корень (без папки)»; при переносе папки её собственное поддерево исключено;
  папка-приёмник после переноса раскрывается автоматически.

### Меню строк (кнопка трёх точек)

| Строка | Пункты меню |
| --- | --- |
| Папка | Rename · New subfolder · Move to folder… · Delete folder |
| Рабочая область | New chat · Rename · Move to folder… · Unfile (только у вложенной) · Delete workspace |
| Чат | Rename · Fork · Archive |

- **Delete folder** никогда не удаляет содержимое: вложенные папки и рабочие
  области поднимаются на уровень выше.
- **Delete workspace** удаляет только запись из списка — каталог рабочей
  области и история чатов на диске остаются.

## Правила перетаскивания

**Папка, брошенная на строку папки** — три зоны на строке-приёмнике:

| Зона | Результат |
| --- | --- |
| Верхняя четверть (линия вставки сверху) | Поставить папку **перед** целью |
| Средняя половина (контур вокруг строки) | Вложить **внутрь** папки-цели |
| Нижняя четверть (линия вставки снизу) | Поставить папку **после** цели |

- Бросок **на край** корневой папки вытаскивает переносимое поддерево
  **в корень** — это жест «извлечь в корень». В корне края ставят папку в
  **общий перемешанный порядок**, где соседями могут быть и рабочие области.
- Папку нельзя вложить в её собственное поддерево — такая попытка
  игнорируется.

**Рабочая область, брошенная на строку папки:**

| Зона | Результат |
| --- | --- |
| Верхняя четверть **корневой** папки (линия вставки сверху) | Вынимается в корень и встаёт **прямо перед этой папкой** |
| Всё остальное | Вкладывается **внутрь** этой папки |

**Папка, брошенная на строку корневой рабочей области:** встаёт перед/после
неё в общем перемешанном порядке корня.

**Рабочая область на строку рабочей области:** встаёт перед/после цели на её
уровне — бросок вложенной на корневую (невложенную) тоже вытаскивает её
в корень.

Корень хранит **один перемешанный список** папок и рабочих областей
(поле `root` в `folders.json`), поэтому рабочую область можно зажать между
двумя папками. Элементы, которые вы никогда не позиционировали, уходят в
хвост: сначала папки, затем рабочие области в реестровом порядке.

**Чат на строку чата:** встаёт перед/после цели в пределах той же рабочей
области. Порядок сохраняется через штатный контракт продукта
(`insertSessionBefore`), поэтому переживает перезапуски.

Всё то же самое доступно без мыши: **Move to folder…** и **Unfile** в меню.

Во время перетаскивания интерфейс плагина реагирует с задержкой в один тик и
не резервирует место в раскладке, поэтому штатное перетаскивание продукта
никогда не нарушается.

## Как это устроено

| Файл | Роль |
| --- | --- |
| `host.mjs` | Половина для Node-процесса: REST-маршруты `/workspace-folders/*` на веб-сервере DSH, хранилище дерева и экспорт схемы `Config` (форма на странице Plugins). |
| `client.js` | Половина для браузера: дерево в списке Workspaces, кнопка в шапке, диалоги, drag & drop — с собственными фолбэками на каждый используемый примитив харнесса. |
| `cordis.patch.yml` | Патч бандла, который harness подключает оверлеем (`id: workspace-folders`, дефолты конфига). |
| `install.ps1` / `install.bat` | Установка и обновление (официальный `dsh plugin add` запакованного tarball). |
| `uninstall.ps1` / `uninstall.bat` | Удаление (официальный CLI плюс чистка легаси). |
| `deps/` | Вендоренные schemastery + cosmokit, чтобы схема конфига грузилась вне дерева harness. |
| `package.json` | Манифест плагина (метаданные `dsh.bundle` + `dsh.client`). |

REST-маршруты (host-половина): `GET /workspace-folders/tree`,
`POST /workspace-folders/folders | /rename | /move | /assign | /delete | /root`.
Каждая мутация в ответ отдаёт свежее нормализованное дерево.

Настройки живут на **странице Plugins** (собственная форма ряда, включая
штатный тумблер включения). Схема — это экспорт `Config` самого плагина
(schemastery, volatile-поля):

- `enabled` — паркует REST-маршруты, пока бандл остаётся загруженным;
- `chatSorting` — в положении «выкл» отключает жесты сортировки чатов
  (перетаскивание и живой порядок через контроллер рабочих областей).

Данные дерева хранятся **отдельно от кода**, в
`%DSH_HOME%\plugin-data\dsh-workspace-folders\folders.json`:

- `folders` — id, имя, parentId, порядок;
- `assignments` — id рабочей области → id папки (с порядком внутри папки);
- `root` — общий перемешанный порядок корня (id корневых папок и невложенных
  рабочих областей в порядке отображения).

Установка и удаление этот файл **не трогают**. Штатный тумблер на странице
Plugins (или `enabled: false`) выключает REST-маршруты, интерфейс засыпает,
а штатный список возвращается как был.

## Установка

Двойной клик по `install.bat`, или из папки плагина:

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Установщик идёт штатным путём самого harness и выполняет по порядку:

1. вендорит библиотеку конфиг-схемы в `deps\` (из чекаута harness);
2. убирает легаси: file://-строку, оставленную до-rc.2-установщиком в патче
   профиля, и старую копию в `%DSH_HOME%\plugins` (оба шага идемпотентны —
   на чистой машине просто ничего не делают);
3. упаковывает эту папку — из staging-копии без `*.tgz` — в хранилище
   артефактов профиля `%DSH_HOME%\profiles\web\.artifacts\` и запускает из
   чекаута harness `pnpm dsh plugin --profile web add <этот tarball>`:
   пакет регистрируется бандлом профиля, профиль получает **настоящую копию**
   в своём `node_modules` (поэтому папку-мастер можно свободно переносить и
   удалять), а манифест ссылается на tarball в `.artifacts`;
4. после успешной установки удаляет только УСТАРЕВШИЕ версии своего tarball
   (в `.artifacts` и в этой папке), точечно; текущий артефакт остаётся — на
   него ссылается манифест профиля, а отсутствующий артефакт ломает установку
   любого другого бандла.

Повторный запуск обновляет всё — скрипт идемпотентен.
Затем перезапустите `pnpm dsh web` и обновите страницу (F5).

## Перенос на другой компьютер

Папка плагина самодостаточна. Скопируйте её целиком на машину с harness
(чекаут даёт CLI) и запустите там `install.bat`. Профиль веб-сервера
(`%DSH_HOME%\profiles\web`) должен уже существовать — он создаётся первым
запуском `pnpm dsh web`.

Чтобы перевезти текущую раскладку, скопируйте также
`%DSH_HOME%\plugin-data\dsh-workspace-folders\folders.json` в тот же
относительный путь на целевой машине (или просто создайте папки заново —
дерево компактное).

## Удаление

Запустите `uninstall.bat` из папки-мастера (или `uninstall.ps1` напрямую).
Удаление точечное, без масок:

- официальное удаление CLI (`pnpm dsh plugin --profile web remove
  dsh-workspace-folders`);
- легаси-строка в `%DSH_HOME%\profiles\web\cordis.patch.yml` (от установок
  до-rc.2, удаляется только если найдена);
- легаси-папка `%DSH_HOME%\plugins\dsh-workspace-folders` (только у старой
  схемы установки).

Сохранённое дерево остаётся — повторная установка восстановит раскладку.
`uninstall.ps1 -PurgeData` дополнительно удаляет единственный файл `folders.json`.
После удаления перезапустите `pnpm dsh web`.

## Ограничения

- Имя папки: до 80 символов; уникально среди соседей.
- Глубина вложенности: до 8 уровней.
- Рабочая область сопоставляется с деревом по названию, чтобы скрыть
  дублирующие штатные строки; реестр запрещает одинаковые имена рабочих
  областей, поэтому соответствие однозначное.

## Если что-то не так

- **Сайдбар не изменился** — перезапустите `pnpm dsh web`, затем F5.
- **Папки пропали, но рабочие области видны** — host-половина не отвечает
  (строка отключена или сервер остановлен). Плагин скрывает штатные строки
  только после успешного ответа `/tree`, поэтому простой список продукта
  всегда остаётся на месте.
- **Бросок сработал не так, как ожидали** — проверьте зону: линия вставки
  сверху/снизу строки означает «рядом с папкой», контур вокруг строки —
  «внутрь папки». Верхняя четверть строки корневой папки — зона «вытаскивания
  в корень»: края — для папок, верхний край — для рабочих областей.
