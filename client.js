window.__ModuleLoader__.load({
	id: "dsh-workspace-folders",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let react = require("react");
		let reactDom = require("react-dom");
		/** Contained: a missing primitives package must cost the tree its
		 * themed bits, not the whole bundle (the static externals table is
		 * harness-owned and may change — it did between rc.1 and rc.2). */
		let primitives = {};
		try {
			primitives = require("@deepseek-ai/dsh-client-ui-primitives") || {};
		} catch {
			// Fall through to the plugin-owned fallbacks below.
		}

		//#region stylesheet
		const css = ".wsf-tree{margin:2px 0 6px}.wsf-tree:empty{margin:0}.wsf-row{position:relative;display:flex;align-items:center;gap:6px;border-radius:8px;padding:0 8px;cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary);box-sizing:border-box}.wsf-folderRow{height:34px}.wsf-sessionRow{height:32px;gap:0;animation:wsf-row-in 150ms var(--ds-ease-in-out)}.wsf-row:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsf-row.wsf-selected{background:var(--dsw-alias-interactive-bg-hover)}.wsf-slot{flex:none;width:16px;height:20px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary)}.wsf-chevron{display:none;color:var(--dsw-alias-label-caption)}.wsf-row:hover .wsf-chevron{display:inline-flex}.wsf-row:hover .wsf-folderGlyph{display:none}.wsf-arrow{transition:transform 150ms var(--ds-ease-in-out)}.wsf-arrowOpen{transform:rotate(90deg)}.wsf-folderActive{color:var(--dsw-alias-state-business-primary)}.wsf-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:20px}.wsf-time{flex:none;font-size:12px;line-height:20px;color:var(--dsw-alias-label-tertiary)}.wsf-rowActions{flex:none;display:none;align-items:center;gap:12px}.wsf-row:hover .wsf-rowActions,.wsf-row.wsf-menuOpen .wsf-rowActions{display:inline-flex}.wsf-row.wsf-menuOpen{background:var(--dsw-alias-interactive-bg-hover)}.wsf-sessionRow:hover .wsf-time,.wsf-sessionRow.wsf-menuOpen .wsf-time{display:none}.wsf-iconBtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:none;border-radius:4px;padding:0;background:transparent;cursor:pointer;color:var(--dsw-alias-label-tertiary)}.wsf-iconBtn:hover{color:var(--dsw-alias-label-primary)}.wsf-children{margin-left:14px}.wsf-rootStrip{display:none;position:relative;height:22px;margin:2px 0;border:1px dashed transparent;border-radius:8px;align-items:center;justify-content:center;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.wsf-tree.wsf-dragActive .wsf-rootStrip{display:flex}.wsf-rootStrip.wsf-dropTarget{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent)}.wsf-dropInside{outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:-1.5px;background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,transparent)}.wsf-dropBefore::before,.wsf-dropAfter::after{content:'';position:absolute;z-index:1;left:0;right:4px;height:12px;background:linear-gradient(55deg,transparent calc(50% - 1px),var(--dsw-alias-state-business-primary) calc(50% - 1px) calc(50% + 1px),transparent calc(50% + 1px)) 0 0/5px 7px no-repeat,linear-gradient(125deg,transparent calc(50% - 1px),var(--dsw-alias-state-business-primary) calc(50% - 1px) calc(50% + 1px),transparent calc(50% + 1px)) 0 5px/5px 7px no-repeat,linear-gradient(var(--dsw-alias-state-business-primary) 0 0) 4px 5px/calc(100% - 4px) 2px no-repeat;pointer-events:none}.wsf-dropBefore::before{top:-7px}.wsf-dropAfter::after{bottom:-7px}.wsf-hidden{display:none!important}.wsf-headerSlot{flex:none;display:inline-flex}.wsf-headerBtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:50%;padding:0;background:transparent;cursor:pointer;color:var(--dsw-alias-label-secondary)}.wsf-headerBtn:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsf-headerBtn.wsf-rail{width:36px;height:36px;color:var(--dsw-alias-label-primary)}.wsf-renameInput{box-sizing:border-box;width:100%;height:44px;padding:7px 14px;border:0.5px solid var(--dsw-alias-border-l4);border-radius:22px;outline:none;background:transparent;font-size:14px;font-weight:400;line-height:22px;color:var(--dsw-alias-label-primary)}.wsf-renameInput:disabled{color:var(--dsw-alias-label-dimmed)}.wsf-errorText{margin-top:8px;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary)}.wsf-errorNote{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);margin-top:4px}.wsf-errorStatus{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}.wsf-dangerAction:not(:disabled){color:var(--dsw-alias-state-error-primary)}@keyframes wsf-row-in{from{opacity:0}}@media (prefers-reduced-motion:reduce){.wsf-sessionRow,.wsf-arrow{animation:none;transition:none}}.wsf-moveList{display:flex;flex-direction:column;gap:2px;max-height:260px;overflow:auto;margin:2px 0 4px}.wsf-moveOption{display:flex;align-items:center;gap:6px;width:100%;border:none;border-radius:8px;padding:7px 8px;background:transparent;cursor:pointer;color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px;text-align:left}.wsf-moveOption:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsf-moveSelected{background:var(--dsw-alias-interactive-bg-hover);outline:1.5px solid var(--dsw-alias-state-business-primary);outline-offset:-1.5px}.wsf-modalLayer{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-mask-3,rgba(0,0,0,0.48))}.wsf-modalPanel{display:flex;flex-direction:column;gap:6px;box-sizing:border-box;min-width:320px;max-width:440px;padding:16px 18px;border-radius:16px;border:1px solid var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);background:linear-gradient(var(--dsw-specific-menu),var(--dsw-specific-menu)) var(--dsw-alias-bg-layer-1,#f8f9fa)}.wsf-modalTitle{margin:0;font-size:14px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-primary)}.wsf-modalDesc{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}.wsf-modalFooter{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}.wsf-btn{border:none;border-radius:999px;padding:6px 16px;font-size:13px;line-height:20px;cursor:pointer;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-l2)}.wsf-btn:disabled{opacity:0.5;cursor:default}.wsf-btn-primary{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-on-business,#fff)}.wsf-btn-outline{background:transparent;border:1px solid var(--dsw-alias-border-l2)}.wsf-menuLayer{position:fixed;inset:0;z-index:90}.wsf-menuPanel{position:absolute;min-width:180px;padding:4px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);background:linear-gradient(var(--dsw-specific-menu),var(--dsw-specific-menu)) var(--dsw-alias-bg-layer-1,#f8f9fa)}.wsf-menuItem{display:flex;align-items:center;gap:8px;width:100%;border:none;border-radius:8px;padding:7px 10px;background:transparent;cursor:pointer;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;text-align:left}.wsf-menuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsf-menuItemDanger{color:var(--dsw-alias-state-error-primary)}.wsf-menuItemLabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}";
		const tagId = "dsh-workspace-folders/board.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-workspace-folders";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region lib/components/fallbacks.js
		/** rc.2 renamed every primitives icon (IconXxx16 → IconXxx{Regular,Medium});
		 * the old destructure yielded undefined, createElement(undefined) raised
		 * React #130 and the error boundary dropped the whole slot entry. Rule:
		 * critical UI parts (icons, dots, menu, dialog) are plugin-owned — the
		 * harness primitives stay only a first choice, resolved per name. */
		function iconOf(candidates, fallback) {
			for (const name of candidates) {
				const candidate = primitives[name];
				if (typeof candidate === "function") return candidate;
			}
			return fallback;
		}

		/** One stroke glyph from a local path list (16×16 viewBox). */
		function localGlyph(defaultSize, elements) {
			return function LocalGlyph(props) {
				const size = props && typeof props.size === "number" ? props.size : defaultSize;
				return react.createElement("svg", {
					width: size,
					height: size,
					viewBox: "0 0 16 16",
					fill: "none",
					"aria-hidden": true,
					focusable: false,
					className: props && props.className,
					style: { display: "block", flex: "none" }
				}, elements);
			};
		}
		function stroke(d, width) {
			return react.createElement("path", { d, stroke: "currentColor", strokeWidth: width || 1.2, strokeLinecap: "round", strokeLinejoin: "round" });
		}
		function fill(d) {
			return react.createElement("path", { d, fill: "currentColor" });
		}
		const LocalIconFolderOpen = localGlyph(16, [
			fill("M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.5 1.5H13A1.5 1.5 0 0 1 14.5 6v5A1.5 1.5 0 0 1 13 12.5H3.5A1.5 1.5 0 0 1 2 11V4.5Z"),
			stroke("M2 7h12", 1.2),
		]);
		const LocalIconFolderClose = localGlyph(16, [
			stroke("M2 11.5V4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.5 1.5H13A1.5 1.5 0 0 1 14.5 6v5.5A1.5 1.5 0 0 1 13 13H3.5A1.5 1.5 0 0 1 2 11.5Z", 1.2),
		]);
		const LocalIconChevron = localGlyph(14, [
			fill("M5.5 3.5 11 8l-5.5 4.5v-9Z"),
		]);
		const LocalIconEdit = localGlyph(16, [
			stroke("M11.1 2.6a1.4 1.4 0 0 1 2 2L5.6 12.1l-2.7.7.7-2.7 7.5-7.5Z", 1.2),
		]);
		const LocalIconPlus = localGlyph(16, [
			stroke("M8 3v10M3 8h10", 1.2),
		]);
		const LocalIconRightUp = localGlyph(16, [
			stroke("M5 11 11 5M6 4.5h5.5V10", 1.2),
		]);
		const LocalIconTrash = localGlyph(16, [
			stroke("M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5 5 13h6l.5-8.5M6.8 7v3.5M9.2 7v3.5", 1.2),
		]);
		const LocalIconEllipsis = localGlyph(16, [
			fill("M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM14 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"),
		]);
		const LocalIconBranch = localGlyph(16, [
			stroke("M5 3v4M5 13v-2M11 6a3 3 0 0 0-3 3c0 1.7-1.3 2-3 2", 1.2),
			fill("M6.5 3A1.5 1.5 0 1 1 3.5 3a1.5 1.5 0 0 1 3 0ZM12.5 6A1.5 1.5 0 1 1 9.5 6a1.5 1.5 0 0 1 3 0ZM6.5 13A1.5 1.5 0 1 1 3.5 13a1.5 1.5 0 0 1 3 0Z"),
		]);
		const LocalIconArchive = localGlyph(20, [
			stroke("M2.5 5.5h11M3.5 5.5V12A1.5 1.5 0 0 0 5 13.5h6A1.5 1.5 0 0 0 12.5 12V5.5M6.5 8h3", 1.1),
		]);
		/** Resolved icon components: rc.2 names first, then rc.1 legacy, then local. */
		const ICON = {
			folderOpen: iconOf(["IconFolderOpenRegular", "IconFolderOpenMedium", "IconFolderOpen16"], LocalIconFolderOpen),
			folderClose: iconOf(["IconFolderCloseRegular", "IconFolderCloseMedium", "IconFolderClose16"], LocalIconFolderClose),
			chevron: iconOf(["IconTriangleRightFillRegular", "IconTriangleRightFillMedium", "IconTriangleRightFill14"], LocalIconChevron),
			edit: iconOf(["IconEditOutlineRegular", "IconEditOutlineMedium", "IconEditOutline16"], LocalIconEdit),
			plus: iconOf(["IconPlusOutlineRegular", "IconPlusOutlineMedium", "IconPlusOutline16"], LocalIconPlus),
			rightUp: iconOf(["IconRightUpOutlineRegular", "IconRightUpOutlineMedium", "IconRightUpOutline16"], LocalIconRightUp),
			trash: iconOf(["IconTrashOutlineRegular", "IconTrashOutlineMedium", "IconTrashOutline16"], LocalIconTrash),
			ellipsis: iconOf(["IconEllipsisOutlineRegular", "IconEllipsisOutlineMedium", "IconEllipsisOutline16"], LocalIconEllipsis),
			branch: iconOf(["IconBranchOutlineRegular", "IconBranchOutlineMedium", "IconBranchOutline16"], LocalIconBranch),
			archive: iconOf(["IconArchiveOutlineRegular", "IconArchiveOutlineMedium", "IconArchiveOutline20"], LocalIconArchive),
		};
		/** Plugin-owned state dot, used only when the harness primitives stop
		 * exporting StateDot (rename protection). Colors carry token fallbacks;
		 * the shipped StateDot stays the first choice because it is theme-exact. */
		const LOCAL_DOT_COLORS = {
			done: "var(--dsw-state-dot-success, #2e9e63)",
			warning: "var(--dsw-state-dot-warning, #d9a514)",
			ongoing: "var(--dsw-state-dot-info, #4c9aff)",
			error: "var(--dsw-state-dot-error, #d64550)",
			idle: "var(--dsw-state-dot-idle, #9898a3)",
		};
		function LocalStateDot(props) {
			const size = props && props.size ? props.size : 10;
			return react.createElement("span", {
				"aria-hidden": true,
				style: {
					display: "inline-block",
					flex: "none",
					width: size + "px",
					height: size + "px",
					borderRadius: "50%",
					background: LOCAL_DOT_COLORS[props.state] || LOCAL_DOT_COLORS.idle,
				},
			});
		}
		/** Minimal tooltip fallback: the label is decoration, the button must
		 * survive without it, so the fallback just renders the child. */
		function LocalTooltip(props) {
			return props.children;
		}
		/** Minimal modal fallback over the shared overlay styles: open-gated
		 * fixed layer with a titled panel and the footer row. */
		function LocalModal(props) {
			if (props.open !== true) return null;
			return react.createElement("div", {
				className: "wsf-modalLayer",
				onMouseDown: (event) => { if (event.target === event.currentTarget && typeof props.onClose === "function") props.onClose(); },
			},
				react.createElement("div", { className: "wsf-modalPanel", role: "dialog", "aria-modal": true },
					react.createElement("h2", { className: "wsf-modalTitle" }, props.title),
					typeof props.description === "string" ? react.createElement("p", { className: "wsf-modalDesc" }, props.description) : null,
					props.children,
					Array.isArray(props.footer)
						? react.createElement("div", { className: "wsf-modalFooter" }, props.footer)
						: null,
				),
			);
		}
		/** Minimal button fallback (variant classes come from the plugin CSS). */
		function LocalButton(props) {
			return react.createElement("button", {
				type: "button",
				className: "wsf-btn wsf-btn-" + (props.variant || "primary") + (props.className ? " " + props.className : ""),
				disabled: props.disabled === true,
				onClick: props.onClick,
			}, props.children);
		}
		/** Minimal menu fallback: anchor element plus an absolutely positioned
		 * item list; closes on outside mousedown and Escape. The shipped Menu
		 * stays the first choice — this only guards a future rename. */
		function LocalMenu(props) {
			const [open, setOpen] = react.useState(props.open === true);
			react.useEffect(() => { setOpen(props.open === true); }, [props.open]);
			react.useEffect(() => {
				if (!open) return undefined;
				const onDown = (event) => {
					const anchor = react_dom_anchor(props);
					if (anchor !== null && anchor.contains(event.target)) return;
					setOpen(false);
					if (typeof props.onClose === "function") props.onClose();
				};
				const onKey = (event) => {
					if (event.key === "Escape") { setOpen(false); if (typeof props.onClose === "function") props.onClose(); }
				};
				document.addEventListener("mousedown", onDown, true);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("mousedown", onDown, true);
					document.removeEventListener("keydown", onKey);
				};
			}, [open, props]);
			return react.createElement(react.Fragment, null,
				props.anchor,
				open && Array.isArray(props.items)
					? react.createElement("div", { className: "wsf-menuLayer" },
						react.createElement("div", { className: "wsf-menuPanel", role: "menu" },
							props.items.map((item) => react.createElement("button", {
								key: item.id,
								type: "button",
								role: "menuitem",
								className: "wsf-menuItem" + (item.danger === true ? " wsf-menuItemDanger" : ""),
								onClick: () => {
									setOpen(false);
									if (typeof props.onSelect === "function") props.onSelect(item.id);
								},
							}, item.icon !== undefined ? item.icon : null, react.createElement("span", { className: "wsf-menuItemLabel" }, item.label))),
						))
					: null,
			);
		}
		/** The anchor is an element, not a ref: resolve it through the DOM. */
		function react_dom_anchor(props) {
			try {
				const node = props.anchor;
				return node instanceof Element ? node : null;
			} catch {
				return null;
			}
		}
		/** Guarded primitive access: plugin-owned fallbacks keep the tree alive
		 * when the harness package drops or renames an export. */
		const P = {
			StateDot: typeof primitives.StateDot === "function" ? primitives.StateDot : LocalStateDot,
			Menu: typeof primitives.Menu === "function" ? primitives.Menu : LocalMenu,
			Tooltip: typeof primitives.Tooltip === "function" ? primitives.Tooltip : LocalTooltip,
			Modal: typeof primitives.Modal === "function" ? primitives.Modal : LocalModal,
			Button: typeof primitives.Button === "function" ? primitives.Button : LocalButton,
		};
		//#endregion

		//#region lib/locales.js
		const NS = "workspace-folders";
		const en = {
			"folders.add": "New folder",
			"folders.add.aria": "Create folder",
			"folders.new.title": "New folder",
			"folders.rename.title": "Rename folder",
			"folders.rename.workspace.title": "Rename workspace",
			"folders.field.name": "Folder name",
			"folders.field.workspaceName": "Workspace name",
			"folders.delete.title": "Delete folder",
			"folders.delete.desc": "Delete folder \u00ab{name}\u00bb?",
			"folders.delete.note": "Its contents move one level up \u2014 folders and workspaces stay.",
			"folders.delete.contents": "Inside: {folders} folder(s), {workspaces} workspace(s)",
			"folders.deleteWorkspace.title": "Delete workspace",
			"folders.deleteWorkspace.desc": "Remove workspace \u00ab{name}\u00bb from the list? The directory and chat logs stay on disk.",
			"folders.delete.pending": "Deleting\u2026",
			"folders.menu.rename": "Rename",
			"folders.menu.newSubfolder": "New subfolder",
			"folders.menu.move": "Move to folder\u2026",
			"folders.move.title": "Move to folder",
			"folders.move.root": "Root (no folder)",
			"folders.move.confirm": "Move",
			"folders.menu.delete": "Delete folder",
			"folders.menu.newChat": "New chat",
			"folders.menu.unfile": "Remove from folder",
			"folders.menu.deleteWorkspace": "Delete workspace",
			"folders.menu.fork": "Fork",
			"folders.menu.archive": "Archive",
			"folders.newChat": "New chat",
			"folders.drop.unfile": "Drop here to unfile",
			"folders.drop.hint": "Drop to move into the folder",
			"folders.conflict.named": "A folder named \u00ab{name}\u00bb already exists",
			"folders.error.generic": "The last action failed. Try again.",
			"folders.time.now": "now",
			"folders.time.min": "{n}m",
			"folders.time.hour": "{n}h",
			"folders.time.day": "{n}d",
			"folders.cancel": "Cancel",
			"folders.close": "Close",
			"folders.create": "Create",
			"folders.rename": "Rename",
			"folders.delete": "Delete",
		};
		const ru = {
			"folders.add": "\u041d\u043e\u0432\u0430\u044f \u043f\u0430\u043f\u043a\u0430",
			"folders.add.aria": "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043f\u0430\u043f\u043a\u0443",
			"folders.new.title": "\u041d\u043e\u0432\u0430\u044f \u043f\u0430\u043f\u043a\u0430",
			"folders.rename.title": "\u041f\u0435\u0440\u0435\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u0442\u044c \u043f\u0430\u043f\u043a\u0443",
			"folders.rename.workspace.title": "\u041f\u0435\u0440\u0435\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0447\u0443\u044e \u043e\u0431\u043b\u0430\u0441\u0442\u044c",
			"folders.field.name": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u0430\u043f\u043a\u0438",
			"folders.field.workspaceName": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0440\u0430\u0431\u043e\u0447\u0435\u0439 \u043e\u0431\u043b\u0430\u0441\u0442\u0438",
			"folders.delete.title": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0430\u043f\u043a\u0443",
			"folders.delete.desc": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0430\u043f\u043a\u0443 \u00ab{name}\u00bb?",
			"folders.delete.note": "\u0421\u043e\u0434\u0435\u0440\u0436\u0438\u043c\u043e\u0435 \u043f\u043e\u0434\u043d\u0438\u043c\u0435\u0442\u0441\u044f \u043d\u0430 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0432\u044b\u0448\u0435 \u2014 \u043f\u0430\u043f\u043a\u0438 \u0438 \u0440\u0430\u0431\u043e\u0447\u0438\u0435 \u043e\u0431\u043b\u0430\u0441\u0442\u0438 \u043e\u0441\u0442\u0430\u043d\u0443\u0442\u0441\u044f.",
			"folders.delete.contents": "\u0412\u043d\u0443\u0442\u0440\u0438: \u043f\u0430\u043f\u043e\u043a \u2014 {folders}, \u0440\u0430\u0431\u043e\u0447\u0438\u0445 \u043e\u0431\u043b\u0430\u0441\u0442\u0435\u0439 \u2014 {workspaces}",
			"folders.deleteWorkspace.title": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0447\u0443\u044e \u043e\u0431\u043b\u0430\u0441\u0442\u044c",
			"folders.deleteWorkspace.desc": "\u0423\u0431\u0440\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0447\u0443\u044e \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u00ab{name}\u00bb \u0438\u0437 \u0441\u043f\u0438\u0441\u043a\u0430? \u041f\u0430\u043f\u043a\u0430 \u043d\u0430 \u0434\u0438\u0441\u043a\u0435 \u0438 \u0438\u0441\u0442\u043e\u0440\u0438\u044f \u0447\u0430\u0442\u043e\u0432 \u043e\u0441\u0442\u0430\u043d\u0443\u0442\u0441\u044f.",
			"folders.delete.pending": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435\u2026",
			"folders.menu.rename": "\u041f\u0435\u0440\u0435\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u0442\u044c",
			"folders.menu.newSubfolder": "\u041d\u043e\u0432\u0430\u044f \u0432\u043b\u043e\u0436\u0435\u043d\u043d\u0430\u044f \u043f\u0430\u043f\u043a\u0430",
			"folders.menu.move": "\u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u0432 \u043f\u0430\u043f\u043a\u0443\u2026",
			"folders.move.title": "\u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u0432 \u043f\u0430\u043f\u043a\u0443",
			"folders.move.root": "\u041a\u043e\u0440\u0435\u043d\u044c (\u0431\u0435\u0437 \u043f\u0430\u043f\u043a\u0438)",
			"folders.move.confirm": "\u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c",
			"folders.menu.delete": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0430\u043f\u043a\u0443",
			"folders.menu.newChat": "\u041d\u043e\u0432\u044b\u0439 \u0447\u0430\u0442",
			"folders.menu.unfile": "\u0423\u0431\u0440\u0430\u0442\u044c \u0438\u0437 \u043f\u0430\u043f\u043a\u0438",
			"folders.menu.deleteWorkspace": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0447\u0443\u044e \u043e\u0431\u043b\u0430\u0441\u0442\u044c",
			"folders.menu.fork": "\u0424\u043e\u0440\u043a",
			"folders.menu.archive": "\u0412 \u0430\u0440\u0445\u0438\u0432",
			"folders.newChat": "\u041d\u043e\u0432\u044b\u0439 \u0447\u0430\u0442",
			"folders.drop.unfile": "\u041e\u0442\u043f\u0443\u0441\u0442\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0443\u0431\u0440\u0430\u0442\u044c \u0438\u0437 \u043f\u0430\u043f\u043a\u0438",
			"folders.drop.hint": "\u041e\u0442\u043f\u0443\u0441\u0442\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u0432 \u043f\u0430\u043f\u043a\u0443",
			"folders.conflict.named": "\u041f\u0430\u043f\u043a\u0430 \u00ab{name}\u00bb \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442",
			"folders.error.generic": "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
			"folders.time.now": "\u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u043e",
			"folders.time.min": "{n}\u043c",
			"folders.time.hour": "{n}\u0447",
			"folders.time.day": "{n}\u0434",
			"folders.cancel": "\u041e\u0442\u043c\u0435\u043d\u0430",
			"folders.close": "\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
			"folders.create": "\u0421\u043e\u0437\u0434\u0430\u0442\u044c",
			"folders.rename": "\u041f\u0435\u0440\u0435\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u0442\u044c",
			"folders.delete": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
		};
		//#endregion

		//#region lib/helpers.js
		/** Whole-snapshot selector for the standard root hooks. */
		function identity(value) { return value; }

		/** Safe translate: a missing key never throws, it echoes. */
		function tt(t, key, params) {
			try {
				const out = t(key, params);
				return typeof out === "string" ? out : key;
			} catch {
				return key;
			}
		}

		/** JSON GET against the plugin's own prefix; null on any failure. */
		async function apiGet(path) {
			try {
				const res = await fetch("/workspace-folders" + path, { method: "GET" });
				if (!res.ok) return null;
				return await res.json();
			} catch {
				return null;
			}
		}

		/** JSON POST; resolves the parsed envelope, null on transport failure. */
		async function apiPost(path, body) {
			try {
				const res = await fetch("/workspace-folders" + path, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body || {}),
				});
				if (!res.ok) return { ok: false, error: "http-" + res.status };
				return await res.json();
			} catch {
				return { ok: false, error: "network" };
			}
		}

		/** localStorage read of one string-array key. */
		function readIdList(key) {
			try {
				const raw = localStorage.getItem(key);
				if (!raw) return [];
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return [];
				return parsed.filter((entry) => typeof entry === "string");
			} catch {
				return [];
			}
		}

		/** localStorage write of one string-array key. */
		function writeIdList(key, ids) {
			try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* session-only */ }
		}

		const EXPANDED_KEY = "workspace-folders.expanded";
		const WS_EXPANDED_KEY = "workspace-folders.workspaces";

		/** Compact relative label for session rows. */
		function relativeLabel(t, ms) {
			const diff = Date.now() - (ms || 0);
			if (!(diff >= 0)) return "";
			const minutes = Math.floor(diff / 60000);
			if (minutes < 1) return tt(t, "folders.time.now");
			if (minutes < 60) return tt(t, "folders.time.min", { n: minutes });
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return tt(t, "folders.time.hour", { n: hours });
			const days = Math.floor(hours / 24);
			if (days < 30) return tt(t, "folders.time.day", { n: days });
			const date = new Date(ms);
			try { return date.toLocaleDateString(); } catch { return ""; }
		}

		/** Wait one animation frame (or a timeout in exotic embeds). */
		function nextFrame(run) {
			if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
			else setTimeout(run, 16);
		}

		/** Tree summary counts for the delete dialog. */
		function countSubtree(tree, rootId) {
			let folders = 0;
			let workspaces = 0;
			const walk = (parentId) => {
				for (const folder of tree.folders) {
					if (folder.parentId !== parentId) continue;
					folders += 1;
					walk(folder.id);
				}
				for (const entry of tree.assignments) {
					if (entry.folderId === parentId) workspaces += 1;
				}
			};
			walk(rootId);
			return { folders, workspaces };
		}
		//#endregion

		//#region lib/anchors.js
		/**
		 * Find the Workspaces browsing region and its two seams. The slot outlet
		 * anchor `[data-slot="sidebar.workspaces"]` is the renderer's own stable
		 * contract; inside, the structure is the product's (browser root →
		 * section header → headerActions; treeBody → list[role=tree]). Only the
		 * grouped tree qualifies: flat/search trees render `flatList`/`searchTree`
		 * local class names.
		 * @returns {{root: Element, rail: boolean, list: Element|null, headerActions: Element|null}|null}
		 */
		function detectAnchors() {
			const region = document.querySelector('[data-slot="sidebar.workspaces"]');
			if (region === null) return null;
			const root = region.firstElementChild;
			if (root === null) return null;
			const rootClass = typeof root.className === "string" ? root.className : "";
			const rail = rootClass.split(/\s+/).some((name) => /rail$/.test(name));
			// The grouped list: a role=tree that is neither the flat nor the search tree.
			let list = null;
			for (const candidate of root.querySelectorAll('div[role="tree"]')) {
				const cls = typeof candidate.className === "string" ? candidate.className : "";
				if (cls.includes("flatList") || cls.includes("searchTree")) continue;
				list = candidate;
				break;
			}
			// headerActions: the last div child of the section header (the first
			// element child of the browser root).
			let headerActions = null;
			const sectionHeader = root.firstElementChild;
			if (sectionHeader !== null) {
				for (let index = sectionHeader.children.length - 1; index >= 0; index--) {
					const child = sectionHeader.children[index];
					if (child.tagName === "DIV") { headerActions = child; break; }
				}
			}
			return { root, rail, list, headerActions };
		}

		/**
		 * Hide the product's group sections whose workspace title is filed into a
		 * folder. Workspace titles are unique in the registry, so the title text
		 * is a safe DOM identity; the ungrouped bucket has no row menu (one
		 * button) and is never hidden.
		 * @param {Element} listEl - the grouped list element.
		 * @param {Set<string>} hiddenTitles - filed workspace titles.
		 */
		function applyGroupHides(listEl, hiddenTitles) {
			for (const section of Array.from(listEl.children)) {
				if (!(section instanceof Element)) continue;
				if (section.dataset.wsfTree === "1") continue;
				let hide = false;
				const row = section.querySelector('[role="treeitem"]');
				if (row !== null) {
					const cls = typeof row.className === "string" ? row.className : "";
					if (cls.includes("projectRow") && row.querySelectorAll("button").length > 1) {
						const titleEl = row.querySelector('[class*="projectText"]');
						const title = titleEl !== null ? (titleEl.textContent || "").trim() : "";
						hide = hiddenTitles.has(title);
					}
				}
				section.classList.toggle("wsf-hidden", hide);
			}
		}

		/** Undo every hide this plugin applied inside one list. */
		function clearGroupHides(listEl) {
			for (const section of Array.from(listEl.children)) {
				if (section instanceof Element) section.classList.remove("wsf-hidden");
			}
		}
		//#endregion

		//#region lib/components/host.js
		/**
		 * Always-mounted overlay seat: finds the Workspaces region, keeps our two
		 * DOM seams alive (the tree container inside the product list and the
		 * header button slot), and renders the real UI through portals. All React
		 * state lives above the portals, so rail/wide toggles and view switches
		 * never reset it.
		 */
		function WorkspaceFoldersHost(props) {
			const [mount, setMount] = react.useState(null);
			react.useEffect(() => {
				let disposed = false;
				let scheduled = false;
				const containers = { list: null, header: null };
				let signature = "";
				const reconcile = () => {
					if (disposed) return;
					try {
						const anchors = detectAnchors();
						if (anchors === null) {
							if (containers.list !== null) { containers.list.remove(); containers.list = null; }
							if (containers.header !== null) { containers.header.remove(); containers.header = null; }
							if (signature !== "off") { signature = "off"; setMount(null); }
							return;
						}
						if (anchors.list !== null) {
							if (containers.list === null || !containers.list.isConnected || containers.list.parentElement !== anchors.list) {
								if (containers.list !== null) containers.list.remove();
								const created = document.createElement("div");
								created.className = "wsf-tree";
								created.dataset.wsfTree = "1";
								anchors.list.insertBefore(created, anchors.list.firstChild);
								containers.list = created;
							}
						} else if (containers.list !== null) {
							containers.list.remove();
							containers.list = null;
						}
						if (anchors.headerActions !== null) {
							if (containers.header === null || !containers.header.isConnected || containers.header.parentElement !== anchors.headerActions) {
								if (containers.header !== null) containers.header.remove();
								const created = document.createElement("span");
								created.className = "wsf-headerSlot";
								const anchor = anchors.headerActions.lastElementChild;
								anchors.headerActions.insertBefore(created, anchor);
								containers.header = created;
							}
						} else if (containers.header !== null) {
							containers.header.remove();
							containers.header = null;
						}
						const next = JSON.stringify([anchors.rail, containers.list !== null, containers.header !== null]);
						if (next !== signature) {
							signature = next;
							setMount({ rail: anchors.rail, listEl: anchors.list, listContainer: containers.list, headerContainer: containers.header });
						}
					} catch {
						// A product DOM surprise keeps the plugin dormant instead of noisy.
					}
				};
				const schedule = () => {
					if (scheduled || disposed) return;
					scheduled = true;
					nextFrame(() => { scheduled = false; reconcile(); });
				};
				const observer = new MutationObserver(schedule);
				observer.observe(document.documentElement, { childList: true, subtree: true });
				reconcile();
				return () => {
					disposed = true;
					observer.disconnect();
					try {
						if (containers.list !== null) { clearGroupHides(containers.list.parentElement); containers.list.remove(); }
						if (containers.header !== null) containers.header.remove();
					} catch { /* page is going away anyway */ }
				};
			}, []);
			if (mount === null) return null;
			return react.createElement(FolderTree, {
				t: props.t,
				actions: props.actions,
				useWorkspaces: props.useWorkspaces,
				useSessions: props.useSessions,
				useSessionStatus: props.useSessionStatus,
				useSessionPendingInteraction: props.useSessionPendingInteraction,
				useConfig: props.useConfig,
				mount,
			});
		}
		//#endregion

		//#region lib/components/folder-tree.js
		const NO_PENDING = { get: () => undefined };

		/** rc.2 pending source: the standard `sessionStatus` root hook returns
		 * Map<id, {running, pendingInteraction, completionUnread}> maintained by
		 * the uiSession service. Collect the entries carrying an interaction —
		 * the same `.get(id) !== undefined` face the rc.1 dispatch hook had. */
		function pendingFromStatus(status) {
			const map = new Map();
			if (status instanceof Map) {
				for (const [id, entry] of status) {
					if (entry && entry.pendingInteraction) map.set(id, entry.pendingInteraction);
				}
			}
			return map;
		}

		/**
		 * State owner: the folder tree data, expansion sets, drag state, and
		 * dialogs. Renders nothing itself; its content portals into the product
		 * list and the section header.
		 */
		function FolderTree(props) {
			const { mount, actions } = props;
			const workspaces = props.useWorkspaces ? (props.useWorkspaces(identity) || null) : null;
			const sessions = props.useSessions ? (props.useSessions(identity) || null) : null;
			// rc.2 status facts: pending interactions AND completionUnread (the
			// green "finished while unviewed" flag — the manager's per-row
			// completed bit no longer exists). The rc.1 hook stays a fallback.
			const statusMap = typeof props.useSessionStatus === "function" ? props.useSessionStatus(identity) : null;
			const pending = statusMap instanceof Map
				? pendingFromStatus(statusMap)
				: typeof props.useSessionPendingInteraction === "function"
					? (props.useSessionPendingInteraction(identity) || NO_PENDING)
					: NO_PENDING;
			// Volatile plugin config (plugins page): `chatSorting === false`
			// disables the session reorder gestures entirely.
			const config = props.useConfig ? props.useConfig(identity) : null;
			const chatSorting = !(config !== null && config !== undefined && config.value && config.value.chatSorting === false);

			const [tree, setTree] = react.useState({ folders: [], assignments: [], root: [] });
			const [ready, setReady] = react.useState(false);
			const [expandedFolders, setExpandedFolders] = react.useState(() => new Set(readIdList(EXPANDED_KEY)));
			const [expandedWorkspaces, setExpandedWorkspaces] = react.useState(() => new Set(readIdList(WS_EXPANDED_KEY)));
			const [dragActive, setDragActive] = react.useState(null);
			const [marker, setMarker] = react.useState(null);
			const [dialog, setDialog] = react.useState(null);
			const [, setTick] = react.useState(0);
			const dragRef = react.useRef(null);
			const titleToIdRef = react.useRef(new Map());

			react.useEffect(() => {
				const timer = setInterval(() => setTick((value) => value + 1), 30000);
				return () => { clearInterval(timer); };
			}, []);

			const refresh = react.useCallback(async () => {
				const res = await apiGet("/tree");
				if (res !== null && res.ok === true && res.data) {
					setTree({
						folders: res.data.folders || [],
						assignments: res.data.assignments || [],
						root: Array.isArray(res.data.root) ? res.data.root : [],
					});
					setReady(true);
				}
			}, []);
			react.useEffect(() => { void refresh(); }, [refresh]);

			/** Apply one mutation verb and adopt the returned fresh tree. */
			const mutate = react.useCallback(async (verb, body) => {
				const res = await apiPost(verb, body);
				if (res !== null && res.ok === true && res.data) {
					setTree({
						folders: res.data.folders || [],
						assignments: res.data.assignments || [],
						root: Array.isArray(res.data.root) ? res.data.root : [],
					});
					return { ok: true };
				}
				return { ok: false, error: res !== null && res.error ? res.error : "network" };
			}, []);

			const toggleFolder = react.useCallback((id) => {
				setExpandedFolders((prev) => {
					const next = new Set(prev);
					if (next.has(id)) next.delete(id);
					else next.add(id);
					writeIdList(EXPANDED_KEY, Array.from(next));
					return next;
				});
			}, []);
			const expandFolder = react.useCallback((id) => {
				setExpandedFolders((prev) => {
					if (prev.has(id)) return prev;
					const next = new Set(prev);
					next.add(id);
					writeIdList(EXPANDED_KEY, Array.from(next));
					return next;
				});
			}, []);
			const toggleWorkspace = react.useCallback((id) => {
				setExpandedWorkspaces((prev) => {
					const next = new Set(prev);
					if (next.has(id)) next.delete(id);
					else next.add(id);
					writeIdList(WS_EXPANDED_KEY, Array.from(next));
					return next;
				});
			}, []);

			// Workspace identity: title → id (the registry rejects duplicate names).
			const workspacesById = react.useMemo(() => {
				const map = new Map();
				if (workspaces !== null && Array.isArray(workspaces.items)) {
					for (const view of workspaces.items) map.set(view.workspaceId, view);
				}
				return map;
			}, [workspaces]);
			react.useMemo(() => {
				const map = new Map();
				for (const [id, view] of workspacesById) map.set(view.title, id);
				titleToIdRef.current = map;
				return map;
			}, [workspacesById]);

			// Shared drag cleanup: stable identity, so the document effect and the
			// rows can all call the same closer.
			const endDrag = react.useCallback(() => {
				dragRef.current = null;
				setDragActive(null);
				setMarker(null);
			}, []);

			// Document-level tracking has ONE remaining job: recognizing a PRODUCT
			// row drag (product rows carry the workspace id only through their DOM),
			// so a product workspace can be dropped into one of our folders. Our own
			// rows start their drags through React onDragStart below — the same
			// per-row pattern the product itself uses.
			react.useEffect(() => {
				const onDragStart = (event) => {
					try {
						const target = event.target && event.target.closest ? event.target : null;
						if (target === null) return;
						if (target.closest("[data-wsf-id]") !== null) return; // our own row
						const row = target.closest('[role="treeitem"]');
						if (row === null) return;
						const cls = typeof row.className === "string" ? row.className : "";
						if (!cls.includes("projectRow")) return;
						const titleEl = row.querySelector('[class*="projectText"]');
						const title = titleEl !== null ? (titleEl.textContent || "").trim() : "";
						const id = titleToIdRef.current.get(title);
						if (id === undefined) return;
						if (row.querySelectorAll("button").length < 2) return; // ungrouped bucket
						dragRef.current = { kind: "workspace", id };
						// Defer the visual state: a synchronous React flush inside the
						// dragstart window re-lays-out the list (root strip) and aborts
						// the drag at initiation — the regression that disabled the
						// product's own folder reordering while this plugin ran.
						const started = dragRef.current;
						setTimeout(() => { if (dragRef.current === started) setDragActive(started); }, 0);
					} catch { /* never break a product drag */ }
				};
				// While our drag is active the whole page accepts the drop — the same
				// acceptance pattern the product ships (useNativeDragAcceptance). A
				// bubble-phase listener runs after every React handler, so it can only
				// widen acceptance; it never touches drags we did not start.
				const onDocDragOver = (event) => {
					if (dragRef.current === null) return;
					event.preventDefault();
					try { event.dataTransfer.dropEffect = "move"; } catch { /* */ }
				};
				const onDocDrop = (event) => {
					if (dragRef.current === null) return;
					event.preventDefault();
					try {
						const target = event.target && event.target.closest ? event.target : null;
						if (target === null || target.closest(".wsf-tree") === null) endDrag();
					} catch { endDrag(); }
				};
				document.addEventListener("dragstart", onDragStart, true);
				document.addEventListener("dragover", onDocDragOver);
				document.addEventListener("drop", onDocDrop);
				document.addEventListener("dragend", endDrag, true);
				return () => {
					document.removeEventListener("dragstart", onDragStart, true);
					document.removeEventListener("dragover", onDocDragOver);
					document.removeEventListener("drop", onDocDrop);
					document.removeEventListener("dragend", endDrag, true);
				};
			}, []);

			// Filed workspace titles → hide their product group sections. Re-applied
			// on every data change and on every product row mutation (the scoped
			// observer); cleared when the list goes away.
			const hiddenTitles = react.useMemo(() => {
				// The tree renders every workspace (filed under folders, unfiled at
				// the root), so every product group section with a mapped title is
				// hidden; the ungrouped bucket (rows without a menu) stays
				// product-made. Until the tree fetch answers, hide nothing — a dead
				// host half must never blank the product list.
				if (!ready) return new Set();
				const titles = new Set();
				for (const view of workspacesById.values()) titles.add(view.title);
				return titles;
			}, [ready, workspacesById]);
			const hiddenKey = Array.from(hiddenTitles).join("\u0000");
			react.useEffect(() => {
				const listEl = mount.listEl;
				if (listEl === null || listEl === undefined) return undefined;
				let scheduled = false;
				const run = () => {
					scheduled = false;
					try { applyGroupHides(listEl, hiddenTitles); } catch { /* next mutation retries */ }
				};
				const schedule = () => {
					if (scheduled) return;
					scheduled = true;
					nextFrame(run);
				};
				run();
				const observer = new MutationObserver(schedule);
				observer.observe(listEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
				return () => {
					observer.disconnect();
					try { clearGroupHides(listEl); } catch { /* detached */ }
				};
				// hiddenKey summarises hiddenTitles without re-subscribing per render.
			}, [mount.listEl, hiddenKey]);

			// Ready gate: without a server answer the plugin stays invisible.
			if (!ready) return null;

			const children = [];
			// The root is ONE mixed sequence of folders and project workspaces,
			// stored in tree.root (ids of root folders and unfiled workspaces).
			// Items without a stored position fall back to the tail: folders
			// first, then unfiled workspaces in registry order.
			const rootSequence = [];
			const listed = new Set();
			for (const id of tree.root) {
				if (typeof id !== "string" || listed.has(id)) continue;
				const folder = tree.folders.find((entry) => entry.id === id && entry.parentId === "");
				if (folder !== undefined) { rootSequence.push({ kind: "folder", folder }); listed.add(id); continue; }
				if (folderIdOf(id) === "" && workspacesById.has(id)) { rootSequence.push({ kind: "workspace", id }); listed.add(id); }
			}
			for (const folder of tree.folders) {
				if (folder.parentId === "" && !listed.has(folder.id)) { rootSequence.push({ kind: "folder", folder }); listed.add(folder.id); }
			}
			for (const [workspaceId] of workspacesById) {
				if (!listed.has(workspaceId) && folderIdOf(workspaceId) === "") { rootSequence.push({ kind: "workspace", id: workspaceId }); listed.add(workspaceId); }
			}
			for (const item of rootSequence) {
				children.push(item.kind === "folder" ? renderFolder(item.folder, 1) : renderWorkspace(workspacesById.get(item.id), 1));
			}

			const treeContent = react.createElement("div", {
				className: "wsf-tree" + (dragActive !== null ? " wsf-dragActive" : ""),
				"aria-label": tt(props.t, "folders.add"),
			}, children);

			const headerContent = mount.headerContainer !== null && mount.headerContainer !== undefined
				? react.createElement(HeaderButton, {
					key: "header-button",
					t: props.t,
					rail: mount.rail === true,
					onClick: () => { setDialog({ kind: "new-folder", parentId: "", name: "" }); },
				})
				: null;

			return [
				mount.listContainer !== null && mount.listContainer !== undefined
					? reactDom.createPortal(treeContent, mount.listContainer)
					: null,
				mount.headerContainer !== null && mount.headerContainer !== undefined
					? reactDom.createPortal(headerContent, mount.headerContainer)
					: null,
				react.createElement(Dialogs, {
					key: "dialogs",
					t: props.t,
					dialog,
					tree,
					close: () => { setDialog(null); },
					mutate,
					actions,
					expandFolder,
				}),
			];

			/** Recursive folder subtree renderer (closes over current state). */
			function renderFolder(folder, depth) {
				const expanded = expandedFolders.has(folder.id);
				const subFolders = tree.folders.filter((entry) => entry.parentId === folder.id);
				const filed = tree.assignments
					.filter((entry) => entry.folderId === folder.id && workspacesById.has(entry.workspaceId))
					.map((entry) => ({ entry, view: workspacesById.get(entry.workspaceId) }));
				const rowChildren = [];
				if (expanded) {
					const kids = [];
					for (const child of subFolders) kids.push(renderFolder(child, depth + 1));
					for (const { view } of filed) kids.push(renderWorkspace(view, depth + 1));
					rowChildren.push(react.createElement("div", { key: "kids", className: "wsf-children" }, kids));
				}
				return react.createElement(react.Fragment, { key: folder.id },
					react.createElement(FolderRow, {
						t: props.t,
						folder,
						depth,
						expanded,
						marker,
						dragActive,
						onDragStart: () => {
							dragRef.current = { kind: "folder", id: folder.id };
							const started = dragRef.current;
							setTimeout(() => { if (dragRef.current === started) setDragActive(started); }, 0);
						},
						onDragEnd: endDrag,
						onToggle: () => { toggleFolder(folder.id); },
						onMenu: (verb) => {
							if (verb === "rename") setDialog({ kind: "rename-folder", folderId: folder.id, name: folder.name });
							else if (verb === "new-subfolder") setDialog({ kind: "new-folder", parentId: folder.id, name: "" });
							else if (verb === "move") setDialog({ kind: "move-to", what: "folder", id: folder.id, name: folder.name });
							else if (verb === "delete") setDialog({ kind: "delete-folder", folder });
						},
						onDragOver: (event) => {
							const drag = dragRef.current;
							if (drag === null || drag.kind === "session") return;
							if (drag.kind === "folder" && drag.id === folder.id) return;
							event.preventDefault();
							try { event.dataTransfer.dropEffect = "move"; } catch { /* */ }
							// Classic three-zone drop: the top quarter inserts BEFORE the
							// folder, the bottom quarter AFTER it — both seat the dragged
							// folder beside it, so a drop on a root folder's edge pulls a
							// nested subtree out to the root. The middle half drops INTO
							// the folder. Workspace drops keep their agreed rule: the top
							// quarter of a ROOT folder extracts the workspace to the root.
							let mode = "inside";
							if (drag.kind === "folder") {
								const rect = event.currentTarget.getBoundingClientRect();
								const y = event.clientY - rect.top;
								if (y < rect.height * 0.25) mode = "before";
								else if (y > rect.height * 0.75) mode = "after";
							} else if (folder.parentId === "") {
								const rect = event.currentTarget.getBoundingClientRect();
								if (event.clientY - rect.top < rect.height * 0.25) mode = "before";
							}
							setMarker((prev) => (prev !== null && prev.id === folder.id && prev.mode === mode ? prev : { id: folder.id, mode }));
						},
						onDragLeave: () => {
							setMarker((prev) => (prev !== null && prev.id === folder.id ? null : prev));
						},
						onDrop: (event) => {
							event.preventDefault();
							const drag = dragRef.current;
							if (drag !== null && drag.kind === "session") return;
							let mode = "inside";
							if (drag !== null && drag.kind === "folder") {
								const rect = event.currentTarget.getBoundingClientRect();
								const y = event.clientY - rect.top;
								if (y < rect.height * 0.25) mode = "before";
								else if (y > rect.height * 0.75) mode = "after";
							}
							setMarker(null);
							if (drag === null) return;
							if (drag.kind === "workspace") {
								const rect = event.currentTarget.getBoundingClientRect();
								if (folder.parentId === "" && event.clientY - rect.top < rect.height * 0.25) {
									// Top edge of a root folder: unfile the workspace and
									// seat it right before this folder in the mixed root
									// sequence.
									void (async () => {
										await mutate("/assign", { workspaceId: drag.id, folderId: "" });
										placeAtRoot(drag.id, folder.id, "before");
									})();
									return;
								}
								expandFolder(folder.id);
								void mutate("/assign", { workspaceId: drag.id, folderId: folder.id });
								return;
							}
							if (drag.id === folder.id) return;
							// Refuse any placement that would seat a folder inside its
							// own subtree.
							let ancestor = folder;
							while (ancestor !== undefined) {
								if (ancestor.id === drag.id) return;
								ancestor = tree.folders.find((entry) => entry.id === ancestor.parentId);
							}
							if (mode === "inside") {
								expandFolder(folder.id);
								void mutate("/move", { id: drag.id, parentId: folder.id });
								return;
							}
							if (folder.parentId === "") {
								// Root folder target: the edges seat the dragged folder in
								// the mixed root sequence (its neighbours may be
								// workspaces).
								placeAtRoot(drag.id, folder.id, mode);
								return;
							}
							const siblings = tree.folders.filter((entry) => entry.parentId === folder.parentId && entry.id !== drag.id);
							let index = siblings.findIndex((entry) => entry.id === folder.id);
							if (mode === "after") index += 1;
							void mutate("/move", { id: drag.id, parentId: folder.parentId, index: index < 0 ? siblings.length : index });
						},
					}),
					rowChildren,
				);
			}

			/** One filed workspace with its expandable chat list. */
			function renderWorkspace(view, depth) {
				const expanded = expandedWorkspaces.has(view.workspaceId);
				const archived = workspaces !== null && Array.isArray(workspaces.archivedSessionIds) ? workspaces.archivedSessionIds : [];
				const sessionRows = [];
				if (expanded) {
					const kids = [];
					for (const id of view.sessionIds) {
						if (archived.includes(id)) continue;
						kids.push(renderSession(view, id));
					}
					sessionRows.push(react.createElement("div", { key: "sessions", className: "wsf-children" }, kids));
				}
				return react.createElement(react.Fragment, { key: view.workspaceId },
					react.createElement(WorkspaceRow, {
						t: props.t,
						view,
						depth,
						expanded,
						marker,
						dragActive,
						filed: folderIdOf(view.workspaceId) !== "",
						onDragStart: () => {
							dragRef.current = { kind: "workspace", id: view.workspaceId };
							const started = dragRef.current;
							setTimeout(() => { if (dragRef.current === started) setDragActive(started); }, 0);
						},
						onDragEnd: endDrag,
						onToggle: () => { toggleWorkspace(view.workspaceId); },
						onNewChat: () => { actions.startChat(view.workspaceId); },
						onMenu: (verb) => {
							if (verb === "rename") setDialog({ kind: "rename-workspace", workspaceId: view.workspaceId, name: view.title });
							else if (verb === "move") setDialog({ kind: "move-to", what: "workspace", id: view.workspaceId, name: view.title });
							else if (verb === "unfile") void mutate("/assign", { workspaceId: view.workspaceId, folderId: "" });
							else if (verb === "delete") setDialog({ kind: "delete-workspace", workspaceId: view.workspaceId, title: view.title });
						},
						onDragOver: (event) => {
							const drag = dragRef.current;
							if (drag === null || drag.kind === "session") return;
							if (drag.kind === "workspace" && drag.id === view.workspaceId) return;
							event.preventDefault();
							try { event.dataTransfer.dropEffect = "move"; } catch { /* */ }
							const rect = event.currentTarget.getBoundingClientRect();
							const mode = event.clientY - rect.top < rect.height / 2 ? "before" : "after";
							setMarker((prev) => (prev !== null && prev.id === view.workspaceId && prev.mode === mode ? prev : { id: view.workspaceId, mode }));
						},
						onDragLeave: () => {
							setMarker((prev) => (prev !== null && prev.id === view.workspaceId ? null : prev));
						},
						onDrop: (event) => {
							event.preventDefault();
							const drag = dragRef.current;
							const rect = event.currentTarget.getBoundingClientRect();
							const mode = event.clientY - rect.top < rect.height / 2 ? "before" : "after";
							setMarker(null);
							if (drag === null || drag.kind === "session") return;
							if (drag.kind === "workspace" && drag.id === view.workspaceId) return;
							if (drag.kind === "folder") {
								// A folder seats around ROOT workspace rows in the mixed
								// root sequence; inside folders the layout stays
								// folders-first, so filed targets ignore folder drops.
								if (folderIdOf(view.workspaceId) !== "") return;
								placeAtRoot(drag.id, view.workspaceId, mode);
								return;
							}
							const targetFolderId = folderIdOf(view.workspaceId);
							if (targetFolderId === "") {
								// Root target: seat the dragged workspace around it in
								// the mixed root sequence.
								placeAtRoot(drag.id, view.workspaceId, mode);
								return;
							}
							const list = tree.assignments.filter((entry) => entry.folderId === targetFolderId && entry.workspaceId !== drag.id);
							let index = list.findIndex((entry) => entry.workspaceId === view.workspaceId);
							if (mode === "after") index += 1;
							void mutate("/assign", { workspaceId: drag.id, folderId: targetFolderId, index: index < 0 ? list.length : index });
						},
					}),
					sessionRows,
				);
			}

			/** Current folder of one workspace ("" when unfiled). */
			function folderIdOf(workspaceId) {
				const entry = tree.assignments.find((item) => item.workspaceId === workspaceId);
				return entry !== undefined ? entry.folderId : "";
			}

			/** Seat one item before/after `targetId` in the mixed root sequence. */
			function placeAtRoot(dragId, targetId, mode) {
				const seq = [];
				for (const item of rootSequence) {
					const id = item.kind === "folder" ? item.folder.id : item.id;
					if (id !== dragId) seq.push(id);
				}
				let at = seq.indexOf(targetId);
				if (at === -1) return;
				if (mode === "after") at += 1;
				seq.splice(at, 0, dragId);
				void mutate("/root", { order: seq });
			}

			/** One chat row under a filed workspace. */
			function renderSession(view, sessionId) {
				const byId = sessions !== null && sessions.byId ? sessions.byId : {};
				const row = byId[sessionId];
				// rc.2: the viewed session is the one the main view retains — the
				// SessionListState no longer carries a `current` field.
				const current = row !== undefined && row.retainedBy !== null && typeof row.retainedBy === "object"
					&& typeof row.retainedBy.mainView === "number" && row.retainedBy.mainView > 0;
				const statusRow = statusMap instanceof Map ? statusMap.get(sessionId) : undefined;
				const running = statusRow !== undefined && typeof statusRow.running === "boolean"
					? statusRow.running
					: (row !== undefined && row.running === true);
				// Green "finished and not seen yet": the service-maintained flag
				// (rc.1 read the manager's per-row completed bit, removed in rc.2).
				const completed = statusRow !== undefined && statusRow.completionUnread === true;
				const blank = row !== undefined && row.blank === true;
				const waiting = pending.get(sessionId) !== undefined;
				const title = blank
					? tt(props.t, "folders.newChat")
					: (row !== undefined && typeof row.displayTitle === "string" && row.displayTitle !== ""
						? row.displayTitle
						: (row !== undefined && typeof row.title === "string" && row.title !== "" ? row.title : sessionId));
				const updatedAt = row !== undefined && typeof row.updatedAt === "number" ? row.updatedAt : 0;
				return react.createElement(SessionRow, {
					key: sessionId,
					t: props.t,
					sessionId,
					title,
					updatedAt,
					current,
					state: waiting ? "warning" : running ? "ongoing" : completed ? "done" : "idle",
					showDot: waiting || running || completed,
					marker,
					draggable: chatSorting === true,
					onOpen: () => { actions.openSession(sessionId); },
					onDragStart: () => {
						dragRef.current = { kind: "session", id: sessionId, accountKey: view.workspaceId };
					},
					onDragEnd: endDrag,
					onDragOver: (event) => {
						const drag = dragRef.current;
						if (drag === null || drag.kind !== "session" || drag.id === sessionId || drag.accountKey !== view.workspaceId) return;
						event.preventDefault();
						try { event.dataTransfer.dropEffect = "move"; } catch { /* */ }
						const rect = event.currentTarget.getBoundingClientRect();
						const mode = event.clientY - rect.top < rect.height / 2 ? "before" : "after";
						setMarker((prev) => (prev !== null && prev.id === sessionId && prev.mode === mode ? prev : { id: sessionId, mode }));
					},
					onDragLeave: () => {
						setMarker((prev) => (prev !== null && prev.id === sessionId ? null : prev));
					},
					onDrop: (event) => {
						event.preventDefault();
						const drag = dragRef.current;
						const rect = event.currentTarget.getBoundingClientRect();
						setMarker(null);
						if (drag === null || drag.kind !== "session" || drag.id === sessionId || drag.accountKey !== view.workspaceId) return;
						const archivedIds = workspaces !== null && Array.isArray(workspaces.archivedSessionIds) ? workspaces.archivedSessionIds : [];
						const order = (Array.isArray(view.sessionIds) ? view.sessionIds : []).filter((id) => !archivedIds.includes(id));
						const targetIndex = order.indexOf(sessionId);
						if (targetIndex === -1) return;
						const mode = event.clientY - rect.top < rect.height / 2 ? "before" : "after";
						const anchor = mode === "before" ? sessionId : order[targetIndex + 1];
						if (anchor === drag.id) return;
						actions.moveSessionBefore(view.workspaceId, drag.id, anchor);
					},
					onMenu: (verb) => {
						if (verb === "rename") setDialog({ kind: "rename-session", sessionId, name: title });
						else if (verb === "fork") actions.forkSession(sessionId);
						else if (verb === "archive") actions.archiveSession(sessionId);
					},
				});
			}
		}
		//#endregion

		//#region lib/components/rows.js
		/** Root drop strip: visible only during a drag; unfiles what it catches. */
		function RootStrip(props) {
			const active = props.marker !== null && props.marker.id === "<root>";
			return react.createElement("div", {
				className: "wsf-rootStrip" + (active ? " wsf-dropTarget" : ""),
				onDragOver: props.onDragOver,
				onDragLeave: props.onDragLeave,
				onDrop: props.onDrop,
			}, tt(props.t, "folders.drop.unfile"));
		}

		/** Shared row drag wiring: marker class per mode. */
		function markerClass(marker, id) {
			if (marker === null || marker.id !== id) return {};
			if (marker.mode === "before") return { "wsf-dropBefore": true };
			if (marker.mode === "after") return { "wsf-dropAfter": true };
			return { "wsf-dropInside": true };
		}

		/** One folder row: folder glyph ↔ chevron on hover, 3-dot menu. */
		function FolderRow(props) {
			const { folder, expanded, depth, marker, dragActive } = props;
			const [menuOpen, setMenuOpen] = react.useState(false);
			const marks = markerClass(marker, folder.id);
			const classes = ["wsf-row", "wsf-folderRow"];
			for (const [name, on] of Object.entries(marks)) if (on) classes.push(name);
			if (menuOpen) classes.push("wsf-menuOpen");
			const menuItems = [
				{ id: "rename", label: tt(props.t, "folders.menu.rename"), icon: react.createElement(ICON.edit) },
				{ id: "new-subfolder", label: tt(props.t, "folders.menu.newSubfolder"), icon: react.createElement(ICON.plus) },
				{ id: "move", label: tt(props.t, "folders.menu.move"), icon: react.createElement(ICON.folderOpen) },
				{ id: "delete", label: tt(props.t, "folders.menu.delete"), icon: react.createElement(ICON.trash), danger: true },
			];
			return react.createElement("div", {
				className: classes.join(" "),
				role: "treeitem",
				"aria-expanded": expanded,
				"data-wsf-id": folder.id,
				"data-wsf-kind": "folder",
				draggable: true,
				onDragStart: (event) => {
					try {
						event.dataTransfer.effectAllowed = "move";
						event.dataTransfer.setData("text/plain", "wsf-folder:" + folder.id);
					} catch { /* dataTransfer unavailable mid-drag */ }
					props.onDragStart();
				},
				onDragEnd: props.onDragEnd,
				onClick: props.onToggle,
				onDragOver: props.onDragOver,
				onDragEnter: props.onDragOver,
				onDragLeave: props.onDragLeave,
				onDrop: props.onDrop,
			},
				react.createElement("span", { className: "wsf-slot wsf-folderGlyph" + (expanded ? " wsf-folderActive" : "") },
					react.createElement(expanded ? ICON.folderOpen : ICON.folderClose)),
				react.createElement("span", { className: "wsf-slot wsf-chevron" },
					react.createElement(ICON.chevron, { className: "wsf-arrow" + (expanded ? " wsf-arrowOpen" : "") })),
				react.createElement("span", { className: "wsf-title" }, folder.name),
				react.createElement("span", { className: "wsf-rowActions" },
					react.createElement(P.Menu, {
						open: menuOpen,
						onClose: () => { setMenuOpen(false); },
						items: menuItems,
						onSelect: (id) => {
							setMenuOpen(false);
							props.onMenu(id);
						},
						portal: true,
						closeOnPointerLeave: true,
						anchor: react.createElement("button", {
							type: "button",
							className: "wsf-iconBtn",
							"aria-label": folder.name,
							onClick: (event) => { event.stopPropagation(); setMenuOpen((value) => !value); },
						}, react.createElement(ICON.ellipsis)),
					})),
			);
		}

		/** One filed workspace row: folder glyph, new-chat plus, 3-dot menu. */
		function WorkspaceRow(props) {
			const { view, expanded, depth, marker } = props;
			const [menuOpen, setMenuOpen] = react.useState(false);
			const marks = markerClass(marker, view.workspaceId);
			const classes = ["wsf-row", "wsf-folderRow"];
			for (const [name, on] of Object.entries(marks)) if (on) classes.push(name);
			if (menuOpen) classes.push("wsf-menuOpen");
			const menuItems = [
				{ id: "new-chat", label: tt(props.t, "folders.menu.newChat"), icon: react.createElement(ICON.plus) },
				{ id: "rename", label: tt(props.t, "folders.menu.rename"), icon: react.createElement(ICON.edit) },
				{ id: "move", label: tt(props.t, "folders.menu.move"), icon: react.createElement(ICON.folderClose) },
				props.filed === true ? { id: "unfile", label: tt(props.t, "folders.menu.unfile"), icon: react.createElement(ICON.rightUp) } : null,
				{ id: "delete", label: tt(props.t, "folders.menu.deleteWorkspace"), icon: react.createElement(ICON.trash), danger: true },
			].filter((item) => item !== null);
			return react.createElement("div", {
				className: classes.join(" "),
				role: "treeitem",
				"aria-expanded": expanded,
				"data-wsf-id": view.workspaceId,
				"data-wsf-kind": "workspace",
				"data-wsf-workspace-id": view.workspaceId,
				draggable: true,
				onDragStart: (event) => {
					try {
						event.dataTransfer.effectAllowed = "move";
						event.dataTransfer.setData("text/plain", String(view.workspaceId || ""));
					} catch { /* dataTransfer unavailable mid-drag */ }
					props.onDragStart();
				},
				onDragEnd: props.onDragEnd,
				onClick: props.onToggle,
				onDragOver: props.onDragOver,
				onDragEnter: props.onDragOver,
				onDragLeave: props.onDragLeave,
				onDrop: props.onDrop,
			},
				react.createElement("span", { className: "wsf-slot wsf-folderGlyph" + (expanded ? " wsf-folderActive" : "") },
					react.createElement(expanded ? ICON.folderOpen : ICON.folderClose)),
				react.createElement("span", { className: "wsf-slot wsf-chevron" },
					react.createElement(ICON.chevron, { className: "wsf-arrow" + (expanded ? " wsf-arrowOpen" : "") })),
				react.createElement("span", { className: "wsf-title" }, view.title),
				react.createElement("span", { className: "wsf-rowActions" },
					react.createElement("button", {
						type: "button",
						className: "wsf-iconBtn",
						"aria-label": tt(props.t, "folders.menu.newChat"),
						onClick: (event) => { event.stopPropagation(); props.onNewChat(); },
					}, react.createElement(ICON.plus)),
					react.createElement(P.Menu, {
						open: menuOpen,
						onClose: () => { setMenuOpen(false); },
						items: menuItems,
						onSelect: (id) => {
							setMenuOpen(false);
							if (id === "new-chat") props.onNewChat();
							else props.onMenu(id);
						},
						portal: true,
						closeOnPointerLeave: true,
						anchor: react.createElement("button", {
							type: "button",
							className: "wsf-iconBtn",
							"aria-label": view.title,
							onClick: (event) => { event.stopPropagation(); setMenuOpen((value) => !value); },
						}, react.createElement(ICON.ellipsis)),
					})),
			);
		}

		/** One chat row: status dot, title, relative time, 3-dot menu. */
		function SessionRow(props) {
			const [menuOpen, setMenuOpen] = react.useState(false);
			const classes = ["wsf-row", "wsf-sessionRow"];
			if (props.current) classes.push("wsf-selected");
			if (menuOpen) classes.push("wsf-menuOpen");
			const marks = markerClass(props.marker, props.sessionId);
			for (const [name, on] of Object.entries(marks)) if (on) classes.push(name);
			const menuItems = [
				{ id: "rename", label: tt(props.t, "folders.menu.rename"), icon: react.createElement(ICON.edit) },
				{ id: "fork", label: tt(props.t, "folders.menu.fork"), icon: react.createElement(ICON.branch) },
				{ id: "archive", label: tt(props.t, "folders.menu.archive"), icon: react.createElement(ICON.archive, { size: 16 }) },
			];
			return react.createElement("div", {
				className: classes.join(" "),
				role: "treeitem",
				"aria-selected": props.current === true,
				draggable: props.draggable === true,
				onClick: props.onOpen,
				onDragStart: (event) => {
					if (props.onDragStart === undefined) return;
					try {
						event.dataTransfer.effectAllowed = "move";
						event.dataTransfer.setData("text/plain", "wsf-session:" + props.sessionId);
					} catch { /* dataTransfer unavailable mid-drag */ }
					props.onDragStart();
				},
				onDragEnd: props.onDragEnd,
				onDragOver: props.onDragOver,
				onDragEnter: props.onDragOver,
				onDragLeave: props.onDragLeave,
				onDrop: props.onDrop,
			},
				react.createElement("span", { className: "wsf-slot" },
					props.showDot ? react.createElement(P.StateDot, { state: props.state }) : null),
				react.createElement("span", { className: "wsf-title", style: { margin: "0 6px 0 4px" } }, props.title),
				react.createElement("span", { className: "wsf-time" }, relativeLabel(props.t, props.updatedAt)),
				react.createElement("span", { className: "wsf-rowActions" },
					react.createElement(P.Menu, {
						open: menuOpen,
						onClose: () => { setMenuOpen(false); },
						items: menuItems,
						onSelect: (id) => {
							setMenuOpen(false);
							props.onMenu(id);
						},
						portal: true,
						closeOnPointerLeave: true,
						anchor: react.createElement("button", {
							type: "button",
							className: "wsf-iconBtn",
							"aria-label": props.title,
							onClick: (event) => { event.stopPropagation(); setMenuOpen((value) => !value); },
						}, react.createElement(ICON.ellipsis)),
					})),
			);
		}

		/** The header "new folder" button, portaled next to the product buttons. */
		function HeaderButton(props) {
			return react.createElement(P.Tooltip, {
				label: tt(props.t, "folders.add"),
				side: "bottom",
				delayMs: 500,
			}, react.createElement("button", {
				type: "button",
				className: "wsf-headerBtn" + (props.rail ? " wsf-rail" : ""),
				"aria-label": tt(props.t, "folders.add.aria"),
				onClick: props.onClick,
			}, react.createElement(ICON.folderClose, { size: props.rail ? 18 : 16 })));
		}
		//#endregion

		//#region lib/components/dialogs.js
		/** Name-field dialog core shared by create and rename flows. */
		function NameDialog(props) {
			const { t, open, title, initialName, confirmLabel, busy, error, fieldLabel, onClose, onConfirm } = props;
			const [draft, setDraft] = react.useState(initialName);
			const composing = react.useRef(false);
			react.useEffect(() => { setDraft(initialName); }, [initialName, open]);
			const trimmed = draft.trim();
			const blocked = busy === true || trimmed === "";
			return react.createElement(P.Modal, {
				open: open === true,
				onClose,
				closeLabel: tt(t, "folders.close"),
				title,
				footer: [
					react.createElement(P.Button, { key: "cancel", variant: "outline", disabled: busy === true, onClick: onClose }, tt(t, "folders.cancel")),
					react.createElement(P.Button, { key: "ok", variant: "primary", disabled: blocked, onClick: () => { onConfirm(trimmed); } }, confirmLabel),
				],
			},
				react.createElement("input", {
					className: "wsf-renameInput",
					value: draft,
					"aria-label": fieldLabel,
					autoFocus: true,
					disabled: busy === true,
					onFocus: (event) => { event.target.select(); },
					onChange: (event) => { setDraft(event.target.value); },
					onCompositionStart: () => { composing.current = true; },
					onCompositionEnd: () => { composing.current = false; },
					onKeyDown: (event) => {
						if (event.key === "Enter" && !composing.current) {
							event.preventDefault();
							if (!blocked) onConfirm(trimmed);
						}
					},
				}),
				error !== null && error !== undefined && error !== "" && react.createElement("div", { className: "wsf-errorText", role: "alert" }, error),
			);
		}

		/**
		 * "Move to folder" picker: menu-driven move, no drag required. For folder
		 * moves the moved folder's own subtree is excluded from the targets.
		 */
		function MoveToDialog(props) {
			const { t, tree, dialog, close, mutate, expandFolder } = props;
			const movingFolder = dialog.what === "folder";
			const excluded = react.useMemo(() => {
				const set = new Set();
				if (movingFolder) {
					set.add(dialog.id);
					const collect = (parentId) => {
						for (const f of tree.folders) {
							if (f.parentId === parentId) { set.add(f.id); collect(f.id); }
						}
					};
					collect(dialog.id);
				}
				return set;
			}, [movingFolder, dialog.id, tree]);
			const byParent = react.useMemo(() => {
				const map = new Map();
				for (const f of tree.folders) {
					const list = map.get(f.parentId);
					if (list === undefined) map.set(f.parentId, [f]);
					else list.push(f);
				}
				return map;
			}, [tree]);
			const rows = [];
			const walk = (parentId, depth) => {
				for (const f of byParent.get(parentId) || []) {
					if (!excluded.has(f.id)) rows.push({ folder: f, depth });
					walk(f.id, depth + 1);
				}
			};
			walk("", 0);
			const current = movingFolder
				? ((tree.folders.find((f) => f.id === dialog.id) || {}).parentId || "")
				: ((tree.assignments.find((a) => a.workspaceId === dialog.id) || {}).folderId || "");
			const [selected, setSelected] = react.useState(current);
			react.useEffect(() => { setSelected(current); }, [current, dialog]);
			const [busy, setBusy] = react.useState(false);
			const [error, setError] = react.useState(null);
			const confirm = async () => {
				setBusy(true);
				setError(null);
				const result = movingFolder
					? await mutate("/move", { id: dialog.id, parentId: selected })
					: await mutate("/assign", { workspaceId: dialog.id, folderId: selected });
				setBusy(false);
				if (!result.ok) { setError(tt(t, "folders.error.generic")); return; }
				if (selected !== "") expandFolder(selected);
				close();
			};
			const optionRow = (key, label, icon, value, depth) => react.createElement("button", {
				key,
				type: "button",
				className: "wsf-moveOption" + (selected === value ? " wsf-moveSelected" : ""),
				style: depth > 0 ? { paddingLeft: (8 + depth * 14) + "px" } : undefined,
				onClick: () => { setSelected(value); },
			},
				react.createElement("span", { className: "wsf-slot" }, icon),
				react.createElement("span", { className: "wsf-title" }, label));
			return react.createElement(P.Modal, {
				open: true,
				onClose: close,
				closeLabel: tt(t, "folders.close"),
				title: tt(t, "folders.move.title"),
				footer: [
					react.createElement(P.Button, { key: "cancel", variant: "outline", disabled: busy === true, onClick: close }, tt(t, "folders.cancel")),
					react.createElement(P.Button, { key: "ok", variant: "primary", disabled: busy === true, onClick: () => { void confirm(); } }, tt(t, "folders.move.confirm")),
				],
			},
				react.createElement("div", { className: "wsf-moveList" },
					optionRow("wsf-move-root", tt(t, "folders.move.root"), react.createElement(ICON.rightUp), "", 0),
					rows.map((row) => optionRow(row.folder.id, row.folder.name, react.createElement(ICON.folderClose), row.folder.id, row.depth))),
				error !== null && error !== undefined && error !== "" && react.createElement("div", { className: "wsf-errorText", role: "alert" }, error),
			);
		}

		/** All plugin dialogs, one switch by dialog.kind. */
		function Dialogs(props) {
			const { t, dialog, tree, close, mutate, actions, expandFolder } = props;
			const [busy, setBusy] = react.useState(false);
			const [error, setError] = react.useState(null);
			react.useEffect(() => { setBusy(false); setError(null); }, [dialog]);
			if (dialog === null) return null;
			if (dialog.kind === "move-to") {
				return react.createElement(MoveToDialog, { t, tree, dialog, close, mutate, expandFolder });
			}
			const runMutation = async (verb, body) => {
				setBusy(true);
				setError(null);
				const result = await mutate(verb, body);
				setBusy(false);
				if (!result.ok) {
					setError(result.error === "name-conflict" ? tt(t, "folders.conflict.named", { name: body.name || "" }) : tt(t, "folders.error.generic"));
					return;
				}
				close();
			};
			if (dialog.kind === "new-folder" || dialog.kind === "rename-folder") {
				const renaming = dialog.kind === "rename-folder";
				const current = renaming ? tree.folders.find((folder) => folder.id === dialog.folderId) : null;
				const title = renaming ? tt(t, "folders.rename.title") : tt(t, "folders.new.title");
				return react.createElement(NameDialog, {
					t,
					open: true,
					title,
					initialName: renaming && current !== undefined ? current.name : "",
					confirmLabel: renaming ? tt(t, "folders.rename") : tt(t, "folders.create"),
					busy,
					error,
					fieldLabel: tt(t, "folders.field.name"),
					onClose: close,
					onConfirm: (name) => {
						if (renaming) void runMutation("/rename", { id: dialog.folderId, name });
						else {
							void mutate("/folders", { name, parentId: dialog.parentId }).then((result) => {
								if (result.ok) {
									expandFolder(dialog.parentId);
									close();
								} else {
									setError(result.error === "name-conflict" ? tt(t, "folders.conflict.named", { name }) : tt(t, "folders.error.generic"));
								}
							});
						}
					},
				});
			}
			if (dialog.kind === "rename-workspace") {
				return react.createElement(NameDialog, {
					t,
					open: true,
					title: tt(t, "folders.rename.workspace.title"),
					initialName: dialog.name,
					confirmLabel: tt(t, "folders.rename"),
					busy,
					error,
					fieldLabel: tt(t, "folders.field.workspaceName"),
					onClose: close,
					onConfirm: (name) => {
						setBusy(true);
						actions.renameWorkspace(dialog.workspaceId, name)
							.then(() => { setBusy(false); close(); })
							.catch((reason) => {
								setBusy(false);
								setError(reason instanceof Error ? reason.message : tt(t, "folders.error.generic"));
							});
					},
				});
			}
			if (dialog.kind === "rename-session") {
				return react.createElement(NameDialog, {
					t,
					open: true,
					title: tt(t, "folders.menu.rename"),
					initialName: dialog.name,
					confirmLabel: tt(t, "folders.rename"),
					busy,
					error,
					fieldLabel: tt(t, "folders.field.workspaceName"),
					onClose: close,
					onConfirm: (name) => {
						setBusy(true);
						actions.renameSession(dialog.sessionId, name)
							.then(() => { setBusy(false); close(); })
							.catch((reason) => {
								setBusy(false);
								setError(reason instanceof Error ? reason.message : tt(t, "folders.error.generic"));
							});
					},
				});
			}
			if (dialog.kind === "delete-folder") {
				const counts = countSubtree(tree, dialog.folder.id);
				return react.createElement(P.Modal, {
					open: true,
					onClose: close,
					closeLabel: tt(t, "folders.close"),
					title: tt(t, "folders.delete.title"),
					description: tt(t, "folders.delete.desc", { name: dialog.folder.name }),
					footer: [
						react.createElement(P.Button, { key: "cancel", variant: "outline", disabled: busy, onClick: close }, tt(t, "folders.cancel")),
						react.createElement(P.Button, {
							key: "ok",
							variant: "outline",
							className: "wsf-dangerAction",
							disabled: busy,
							onClick: () => { void runMutation("/delete", { id: dialog.folder.id }); },
						}, tt(t, "folders.delete")),
					],
				},
					react.createElement("div", { className: "wsf-errorNote" }, tt(t, "folders.delete.note")),
					react.createElement("div", { className: "wsf-errorNote" },
						tt(t, "folders.delete.contents", { folders: counts.folders, workspaces: counts.workspaces })),
					busy && react.createElement("div", { className: "wsf-errorStatus", role: "status" }, tt(t, "folders.delete.pending")),
					error !== null && error !== undefined && error !== "" && react.createElement("div", { className: "wsf-errorText", role: "alert" }, error),
				);
			}
			if (dialog.kind === "delete-workspace") {
				return react.createElement(P.Modal, {
					open: true,
					onClose: close,
					closeLabel: tt(t, "folders.close"),
					title: tt(t, "folders.deleteWorkspace.title"),
					description: tt(t, "folders.deleteWorkspace.desc", { name: dialog.title }),
					footer: [
						react.createElement(P.Button, { key: "cancel", variant: "outline", disabled: busy, onClick: close }, tt(t, "folders.cancel")),
						react.createElement(P.Button, {
							key: "ok",
							variant: "outline",
							className: "wsf-dangerAction",
							disabled: busy,
							onClick: () => {
								setBusy(true);
								actions.deleteWorkspace(dialog.workspaceId)
									.then(() => { setBusy(false); close(); })
									.catch((reason) => {
										setBusy(false);
										setError(reason instanceof Error ? reason.message : tt(t, "folders.error.generic"));
									});
							},
						}, tt(t, "folders.deleteWorkspace.title")),
					],
				},
					busy && react.createElement("div", { className: "wsf-errorStatus", role: "status" }, tt(t, "folders.delete.pending")),
					error !== null && error !== undefined && error !== "" && react.createElement("div", { className: "wsf-errorText", role: "alert" }, error),
				);
			}
			return null;
		}
		//#endregion

		//#region lib/apply.js
		const inject = ["sessions", "slots", "locale", "configForms", "uiWorkspace"];

		/**
		 * Client plugin body: dictionaries plus one always-mounted overlay seat
		 * that hosts the whole integration (tree portal + header button portal).
		 * @param {object} ctx - client plugin context.
		 */
		function applyBody(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { en, ru }), "workspace-folders: dictionaries");
			// rc.2 settings domain: the volatile Config schema is published under
			// this row id; the same reactive store face as the board's scope. A
			// missing configForms (older runtime, absent schema) degrades to the
			// defaults instead of breaking the tree.
			let configScope = null;
			try {
				const forms = typeof ctx.get === "function" ? ctx.get("configForms") : undefined;
				if (forms !== undefined && forms !== null && typeof forms.get === "function") {
					configScope = forms.get(NS);
				}
			} catch (error) {
				console.error("workspace-folders: config scope unavailable; the defaults apply.", error);
			}
			/**
			 * rc.2 open verb: `sessions.open` is gone — the UI open target is
			 * `uiWorkspace.openSession(sessionId)`. The pre-rc.2 verbs stay a
			 * guarded fallback so the tree still opens chats on older runtimes.
			 */
			const openSessionId = (sessionId) => {
				try {
					const ui = ctx.uiWorkspace !== undefined
						? ctx.uiWorkspace
						: (typeof ctx.get === "function" ? ctx.get("uiWorkspace") : undefined);
					if (ui !== undefined && ui !== null && typeof ui.openSession === "function") {
						ui.openSession(sessionId);
						return;
					}
				} catch { /* fall through to the legacy verbs */ }
				try {
					if (typeof ctx.sessions.open === "function") ctx.sessions.open(sessionId);
					else if (typeof ctx.sessions.openSubagent === "function") ctx.sessions.openSubagent(sessionId);
				} catch { /* unknown id */ }
			};
			const actions = {
				/** Open a real session. */
				openSession: (sessionId) => {
					openSessionId(sessionId);
				},
				/** Start (reuse-or-create) a chat inside one workspace. */
				startChat: (workspaceId) => {
					try {
						const ui = ctx.uiWorkspace !== undefined
							? ctx.uiWorkspace
							: (typeof ctx.get === "function" ? ctx.get("uiWorkspace") : undefined);
						if (ui !== undefined && ui !== null && typeof ui.startSession === "function") {
							ui.startSession(workspaceId);
							return;
						}
					} catch { /* fall through to the manual path */ }
					void (async () => {
						const workspaces = ctx.get("workspaces");
						const snapshot = workspaces !== undefined && workspaces !== null && workspaces.list ? workspaces.list.getSnapshot() : null;
						const view = snapshot !== null && Array.isArray(snapshot.items)
							? snapshot.items.find((item) => item.workspaceId === workspaceId)
							: undefined;
						if (view === undefined) return;
						const archived = snapshot !== null && Array.isArray(snapshot.archivedSessionIds) ? snapshot.archivedSessionIds : [];
						const sessionsSnapshot = ctx.sessions.list.getSnapshot();
						for (const id of sessionsSnapshot.ids) {
							const row = sessionsSnapshot.byId[id];
							if (row !== undefined && row.blank === true && row.cwd === view.path
								&& Array.isArray(view.sessionIds) && view.sessionIds.includes(row.id)
								&& !archived.includes(row.id)) {
								openSessionId(row.id);
								return;
							}
						}
						const created = await ctx.sessions.create({ workspaceId });
						openSessionId(created);
					})().catch(() => { /* stay on the current view */ });
				},
				/** Rename a session through its per-session binding. */
				renameSession: async (sessionId, title) => {
					const binding = ctx.sessions.binding(sessionId);
					const session = binding !== undefined ? binding.session : undefined;
					if (session === undefined || session === null) throw new Error("unknown session");
					const result = await session.rename(title);
					if (!result.ok) throw new Error(result.error && result.error.message ? result.error.message : "rename rejected");
				},
				/** Fork a session at its last completed turn and open the child. */
				forkSession: (sessionId) => {
					ctx.sessions.fork({ sessionId, increaseTitle: true })
						.then((childId) => { openSessionId(childId); })
						.catch(() => { /* keep the current selection */ });
				},
				/** Archive a session (registry-global archive set). */
				archiveSession: async (sessionId) => {
					const workspaces = ctx.get("workspaces");
					if (workspaces === undefined || workspaces === null) return;
					try { await workspaces.archiveSession(sessionId); } catch { /* host rejection keeps the row */ }
				},
				/**
				 * Reorder a session inside its workspace (durable registry order).
				 * rc.2 dropped the verb from the uiWorkspace slot contract; the
				 * same durable reorder lives on the workspace controller client
				 * service, which is exactly what the shipped rows use.
				 */
				moveSessionBefore: (workspaceId, sessionId, beforeSessionId) => {
					try {
						const workspaces = typeof ctx.get === "function" ? ctx.get("workspaces") : undefined;
						if (workspaces !== undefined && workspaces !== null && typeof workspaces.insertSessionBefore === "function") {
							return workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId);
						}
					} catch { /* controller unavailable */ }
					return undefined;
				},
				/** Rename a workspace (rejects on name conflicts). */
				renameWorkspace: async (workspaceId, title) => {
					const workspaces = ctx.get("workspaces");
					if (workspaces === undefined || workspaces === null) throw new Error("workspace controller missing");
					const result = await workspaces.rename(workspaceId, title);
					if (!result.ok) throw new Error(result.error && result.error.message ? result.error.message : "rename rejected");
				},
				/** Delete a workspace registration (directory and logs remain). */
				deleteWorkspace: async (workspaceId) => {
					const workspaces = ctx.get("workspaces");
					if (workspaces === undefined || workspaces === null) throw new Error("workspace controller missing");
					const result = await workspaces.delete(workspaceId);
					if (!result.ok) throw new Error(result.error && result.error.message ? result.error.message : "delete rejected");
				},
			};
			const face = () => ({ actions, hooks: { config: configScope } });
			// Every slot registration is contained: a failure must cost the tree
			// its seat, never the whole client entry (whose rejection the web
			// shell treats as fatal).
			ctx.slots.inject("shell.overlay", () => {
				try {
					return ctx.slots.register({
						name: "shell.overlay",
						id: "workspace-folders-root",
						order: 60,
						locale: NS,
						inject: face,
					}, WorkspaceFoldersHost);
				} catch (error) {
					console.error("workspace-folders: slot registration failed (shell.overlay); the tree starts without it.", error);
					return undefined;
				}
			});
		}
		/**
		 * Fail-safe wrapper: a broken tree must never fail the client module
		 * entry — the web shell treats a rejected activation as fatal and would
		 * not mount the application at all. The tree simply stays off.
		 */
		function apply(ctx) {
			try {
				return applyBody(ctx);
			} catch (error) {
				console.error("workspace-folders: client startup failed; the tree stays off.", error);
			}
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
// ported to dsh v0.2.0-rc.2 (bundle delivery, guarded primitives + owned fallbacks, sessionStatus map for pending/completionUnread, retainedBy.mainView current, uiWorkspace.openSession, workspaces.insertSessionBefore, configForms chatSorting)
