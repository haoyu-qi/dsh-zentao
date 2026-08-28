window.__ModuleLoader__.load({
	id: "@haoyu-qi/dsh-client-ui-zentao-notifications",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/private/tmp/dsh-zentao-harness-packages-0.1.1-rc.2/packages/client/ui-zentao-notifications/src/client/ZentaoSidebar.module.css.mjs
		const css = ".hOPFUq_root{font-family:system-ui,-apple-system,Segoe UI,PingFang SC,sans-serif}.hOPFUq_fab{z-index:9999;writing-mode:vertical-rl;color:#fff;cursor:pointer;letter-spacing:3px;background:#2563eb;border:none;border-radius:8px 0 0 8px;padding:16px 8px;font-size:13px;font-weight:600;transition:padding .15s;position:fixed;top:50%;right:0;transform:translateY(-50%);box-shadow:-2px 0 10px #0000002e}.hOPFUq_fab:hover{padding-right:12px}.hOPFUq_panel{z-index:10000;background:var(--dsw-alias-bg-layer-1,#fff);border-left:1px solid var(--dsw-alias-border-l1,#e5e7eb);flex-direction:column;width:384px;max-width:92vw;height:100vh;animation:.2s hOPFUq_zentaoPanelIn;display:flex;position:fixed;top:0;right:0;box-shadow:-8px 0 28px #00000024}@keyframes hOPFUq_zentaoPanelIn{0%{transform:translate(100%)}to{transform:translate(0)}}.hOPFUq_head{border-bottom:1px solid var(--dsw-alias-border-l1,#e5e7eb);justify-content:space-between;align-items:center;gap:8px;padding:12px 14px;display:flex}.hOPFUq_title{color:var(--dsw-alias-label-primary,#111);white-space:nowrap;font-size:15px;font-weight:700}.hOPFUq_headBtns{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.hOPFUq_btn{border:1px solid var(--dsw-alias-border-l2,#d1d5db);background:var(--dsw-alias-bg-layer-2,#f3f4f6);color:var(--dsw-alias-label-primary,#111);cursor:pointer;border-radius:7px;align-items:center;padding:5px 10px;font-size:12px;display:inline-flex}.hOPFUq_btn:hover{background:var(--dsw-alias-bg-overlay,#e5e7eb)}.hOPFUq_btn:disabled{opacity:.55;cursor:default}.hOPFUq_primary{color:#fff;background:#2563eb;border-color:#2563eb;font-weight:600}.hOPFUq_primary:hover{background:#1d4ed8;border-color:#1d4ed8}.hOPFUq_select{border:1px solid var(--dsw-alias-border-l2,#d1d5db);background:var(--dsw-alias-bg-layer-2,#f3f4f6);color:var(--dsw-alias-label-primary,#111);cursor:pointer;border-radius:7px;outline:none;padding:4px 5px;font-size:11px}.hOPFUq_body{flex:1;padding:14px;overflow-y:auto}.hOPFUq_tabs{gap:6px;margin-bottom:14px;display:flex}.hOPFUq_tab{text-align:center;border:1px solid var(--dsw-alias-border-l1,#e5e7eb);cursor:pointer;background:var(--dsw-alias-bg-layer-2,#f3f4f6);color:var(--dsw-alias-label-secondary,#555);border-radius:8px;flex:1;padding:8px 4px;font-size:13px}.hOPFUq_tabActive{color:#fff;background:#2563eb;border-color:#0000;font-weight:600}.hOPFUq_cnt{opacity:.8;margin-left:3px;font-size:11px}.hOPFUq_card{border:1px solid var(--dsw-alias-border-l1,#e5e7eb);cursor:grab;background:var(--dsw-alias-bg-layer-2,#fff);border-radius:10px;margin-bottom:10px;padding:10px 12px;transition:box-shadow .15s,border-color .15s}.hOPFUq_card:hover{border-color:var(--dsw-alias-border-l2,#d1d5db);box-shadow:0 2px 10px #00000017}.hOPFUq_card:active{cursor:grabbing}.hOPFUq_cardTitle{color:var(--dsw-alias-label-primary,#111);font-size:13px;font-weight:600;line-height:1.4}.hOPFUq_cardMeta{flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;display:flex}.hOPFUq_badge{background:var(--dsw-alias-bg-layer-2,#f3f4f6);color:var(--dsw-alias-label-secondary,#555);border:1px solid var(--dsw-alias-border-l1,#e5e7eb);border-radius:999px;padding:2px 8px;font-size:11px}.hOPFUq_badgePri1,.hOPFUq_badgeSev1{color:#dc2626;border-color:#fca5a5}.hOPFUq_badgePri2,.hOPFUq_badgeSev2{color:#ea580c;border-color:#fdba74}.hOPFUq_badgeDone{color:#16a34a;border-color:#86efac}.hOPFUq_cardFoot{justify-content:space-between;align-items:center;gap:8px;margin-top:7px;display:flex}.hOPFUq_dragHint{color:var(--dsw-alias-label-secondary,#888);font-size:11px}.hOPFUq_link{color:var(--dsw-alias-brand-primary,#3b82f6);cursor:pointer;white-space:nowrap;font-size:11px;text-decoration:none}.hOPFUq_link:hover{text-decoration:underline}.hOPFUq_empty{text-align:center;color:var(--dsw-alias-label-secondary,#888);padding:32px 0;font-size:13px}.hOPFUq_error{color:var(--dsw-alias-state-error-primary,#dc2626);word-break:break-word;background:#dc262612;border-radius:8px;margin:8px 0;padding:8px 10px;font-size:12px;line-height:1.5}.hOPFUq_field{margin-bottom:11px}.hOPFUq_fieldLabel{color:var(--dsw-alias-label-secondary,#888);margin-bottom:3px;font-size:11px}.hOPFUq_fieldValue{color:var(--dsw-alias-label-primary,#111);white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.55}.hOPFUq_formRow{margin-bottom:11px}.hOPFUq_formRow label{color:var(--dsw-alias-label-secondary,#aaa);margin-bottom:4px;font-size:12px;display:block}.hOPFUq_input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#d1d5db);background:var(--dsw-alias-bg-layer-2,#fff);width:100%;color:var(--dsw-alias-label-primary,#111);border-radius:8px;outline:none;padding:8px 10px;font-size:13px}.hOPFUq_input::placeholder{color:var(--dsw-alias-label-secondary,#999);opacity:1}.hOPFUq_input:focus{border-color:var(--dsw-alias-brand-primary,#3b82f6)}.hOPFUq_actions{flex-wrap:wrap;align-items:center;gap:8px;margin:14px 0;display:flex}.hOPFUq_toast{z-index:10001;background:var(--dsw-alias-bg-overlay,#333);color:var(--dsw-alias-label-primary,#fff);border-radius:9px;padding:10px 15px;font-size:13px;position:fixed;bottom:26px;right:26px;box-shadow:0 6px 20px #00000038}.hOPFUq_hint{color:var(--dsw-alias-label-secondary,#888);margin-top:4px;font-size:11px;line-height:1.6}.hOPFUq_detailTitle{color:var(--dsw-alias-label-primary,#111);word-break:break-word;margin-bottom:4px;font-size:16px;font-weight:700;line-height:1.45}.hOPFUq_spin{border:2px solid var(--dsw-alias-border-l2,#d1d5db);border-top-color:var(--dsw-alias-brand-primary,#3b82f6);vertical-align:-2px;border-radius:50%;width:13px;height:13px;margin-right:6px;animation:.8s linear infinite hOPFUq_zentaoSpin;display:inline-block}@keyframes hOPFUq_zentaoSpin{to{transform:rotate(360deg)}}";
		const tagId = "@haoyu-qi/dsh-client-ui-zentao-notifications/ZentaoSidebar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@haoyu-qi/dsh-client-ui-zentao-notifications";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ZentaoSidebar_module_css_default = {
			"actions": "hOPFUq_actions",
			"badge": "hOPFUq_badge",
			"badgeDone": "hOPFUq_badgeDone",
			"badgePri1": "hOPFUq_badgePri1",
			"badgePri2": "hOPFUq_badgePri2",
			"badgeSev1": "hOPFUq_badgeSev1",
			"badgeSev2": "hOPFUq_badgeSev2",
			"body": "hOPFUq_body",
			"btn": "hOPFUq_btn",
			"card": "hOPFUq_card",
			"cardFoot": "hOPFUq_cardFoot",
			"cardMeta": "hOPFUq_cardMeta",
			"cardTitle": "hOPFUq_cardTitle",
			"cnt": "hOPFUq_cnt",
			"detailTitle": "hOPFUq_detailTitle",
			"dragHint": "hOPFUq_dragHint",
			"empty": "hOPFUq_empty",
			"error": "hOPFUq_error",
			"fab": "hOPFUq_fab",
			"field": "hOPFUq_field",
			"fieldLabel": "hOPFUq_fieldLabel",
			"fieldValue": "hOPFUq_fieldValue",
			"formRow": "hOPFUq_formRow",
			"head": "hOPFUq_head",
			"headBtns": "hOPFUq_headBtns",
			"hint": "hOPFUq_hint",
			"input": "hOPFUq_input",
			"link": "hOPFUq_link",
			"panel": "hOPFUq_panel",
			"primary": "hOPFUq_primary",
			"root": "hOPFUq_root",
			"select": "hOPFUq_select",
			"spin": "hOPFUq_spin",
			"tab": "hOPFUq_tab",
			"tabActive": "hOPFUq_tabActive",
			"tabs": "hOPFUq_tabs",
			"title": "hOPFUq_title",
			"toast": "hOPFUq_toast",
			"zentaoPanelIn": "hOPFUq_zentaoPanelIn",
			"zentaoSpin": "hOPFUq_zentaoSpin"
		};
		//#endregion
		//#region lib/types/client/ZentaoSidebar.js
		/** Personal ZenTao floating work center backed by the Host REST gateway. */
		const TYPE_LABEL = {
			task: "任务",
			bug: "BUG",
			story: "需求"
		};
		const STATUS = {
			task: {
				wait: "未开始",
				doing: "进行中",
				done: "已完成",
				pause: "已暂停",
				cancel: "已取消",
				closed: "已关闭"
			},
			bug: {
				active: "激活",
				resolved: "已解决",
				closed: "已关闭"
			},
			story: {
				draft: "草稿",
				reviewing: "评审中",
				active: "激活",
				changing: "变更中",
				closed: "已关闭"
			}
		};
		const PRI = {
			"1": "P1 最高",
			"2": "P2 高",
			"3": "P3 中",
			"4": "P4 低"
		};
		const SEVERITY = {
			"1": "S1 致命",
			"2": "S2 严重",
			"3": "S3 一般",
			"4": "S4 轻微"
		};
		function stripHtml(value) {
			if (value == null) return "";
			return String(value).replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/\s+\n/g, "\n").trim();
		}
		function lab(map, value) {
			if (value == null || value === "") return "";
			return map?.[String(value)] ?? String(value);
		}
		function str(value) {
			return value == null ? "" : String(value);
		}
		function itemUrl(url, type, id) {
			if (url === "") return "";
			return `${url}/${type}-view-${String(id)}.html`;
		}
		function describeItem(type, item) {
			const fields = [];
			if (type === "task") {
				fields.push(["状态", lab(STATUS.task, item.status)]);
				fields.push(["优先级", lab(PRI, item.pri)]);
				if (item.estimate != null && item.estimate !== "") fields.push([
					"最初预计",
					item.estimate,
					"h"
				]);
				if (item.left != null && item.left !== "") fields.push([
					"预计剩余",
					item.left,
					"h"
				]);
				if (item.consumed != null && item.consumed !== "") fields.push([
					"总计消耗",
					item.consumed,
					"h"
				]);
				fields.push(["截止日期", str(item.deadline)]);
				fields.push(["指派给", str(item.assignedTo)]);
				fields.push(["所属项目", str(item.project)]);
				fields.push(["所属执行", str(item.execution)]);
				fields.push(["任务描述", stripHtml(item.desc)]);
			} else if (type === "bug") {
				fields.push(["状态", lab(STATUS.bug, item.status)]);
				fields.push(["严重程度", lab(SEVERITY, item.severity)]);
				fields.push(["优先级", lab(PRI, item.pri)]);
				fields.push(["指派给", str(item.assignedTo)]);
				fields.push(["由谁创建", str(item.openedBy)]);
				fields.push(["所属产品", str(item.product)]);
				fields.push(["解决方案", str(item.resolution)]);
				fields.push(["重现步骤", stripHtml(item.steps)]);
			} else {
				fields.push(["状态", lab(STATUS.story, item.status)]);
				fields.push(["优先级", lab(PRI, item.pri)]);
				fields.push(["所处阶段", str(item.stage)]);
				if (item.estimate != null && item.estimate !== "") fields.push([
					"预计",
					item.estimate,
					"h"
				]);
				fields.push(["指派给", str(item.assignedTo)]);
				fields.push(["来源", str(item.source)]);
				fields.push(["所属产品", str(item.product)]);
				fields.push(["需求描述", stripHtml(item.spec ?? item.desc)]);
			}
			return fields.filter(([, value]) => value.trim() !== "");
		}
		function buildMarkdown(type, item, url) {
			const title = item.name ?? item.title ?? "(无标题)";
			const lines = [`【禅道${TYPE_LABEL[type]} #${item.id ?? "-"}】${title}`, ""];
			for (const [label, value, unit] of describeItem(type, item)) lines.push(`- ${label}：${value}${unit !== void 0 ? ` ${unit}` : ""}`);
			if (url !== "") lines.push("", `禅道原地址：${itemUrl(url, type, item.id)}`);
			return lines.join("\n");
		}
		async function copyText(text) {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch {
				try {
					const ta = document.createElement("textarea");
					ta.value = text;
					ta.style.position = "fixed";
					ta.style.top = "0";
					ta.style.left = "0";
					ta.style.opacity = "0";
					document.body.appendChild(ta);
					ta.focus();
					ta.select();
					const ok = document.execCommand("copy");
					document.body.removeChild(ta);
					return ok;
				} catch {
					return false;
				}
			}
		}
		/** Render the account login, automatic refresh controls, and personal task/Bug/story lists. */
		function ZentaoSidebar({ rpc }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [view, setView] = (0, react.useState)("list");
			const [tab, setTab] = (0, react.useState)("task");
			const [config, setConfig] = (0, react.useState)({
				server: "",
				account: "",
				hasToken: false
			});
			const [data, setData] = (0, react.useState)({
				tasks: [],
				bugs: [],
				stories: []
			});
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [detail, setDetail] = (0, react.useState)();
			const [toast, setToast] = (0, react.useState)("");
			const [form, setForm] = (0, react.useState)({
				server: "",
				account: "",
				password: "",
				token: ""
			});
			const [formMsg, setFormMsg] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			const [autoRefresh, setAutoRefresh] = (0, react.useState)(0);
			const fetching = (0, react.useRef)(false);
			const toastTimer = (0, react.useRef)();
			const rootRef = (0, react.useRef)(null);
			const call = (0, react.useCallback)(async (endpoint, payload) => {
				const result = await rpc.call("/zentao", endpoint, payload);
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			}, [rpc]);
			const showToast = (0, react.useCallback)((message) => {
				setToast(message);
				if (toastTimer.current !== void 0) window.clearTimeout(toastTimer.current);
				toastTimer.current = window.setTimeout(() => {
					setToast("");
					toastTimer.current = void 0;
				}, 2600);
			}, []);
			const refresh = (0, react.useCallback)(async () => {
				if (fetching.current) return;
				fetching.current = true;
				setLoading(true);
				setError("");
				try {
					const snapshot = await call("refresh", {});
					setData({
						tasks: snapshot.tasks ?? [],
						bugs: snapshot.bugs ?? [],
						stories: snapshot.stories ?? []
					});
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : String(reason));
				} finally {
					setLoading(false);
					fetching.current = false;
				}
			}, [call]);
			(0, react.useEffect)(() => {
				(async () => {
					try {
						const current = await call("getConfig", {});
						setConfig(current);
						setForm({
							server: current.server ?? "",
							account: current.account ?? "",
							password: "",
							token: ""
						});
					} catch {}
				})();
			}, [call]);
			(0, react.useEffect)(() => {
				if (config.hasToken) refresh();
			}, [config.hasToken, refresh]);
			(0, react.useEffect)(() => {
				if (autoRefresh <= 0) return;
				const timer = window.setInterval(() => {
					refresh();
				}, autoRefresh * 1e3);
				return () => {
					window.clearInterval(timer);
				};
			}, [autoRefresh, refresh]);
			(0, react.useEffect)(() => {
				const onMouseDown = (event) => {
					if (!open) return;
					const el = event.target;
					if (!(el instanceof Element)) return;
					if (rootRef.current !== null && rootRef.current.contains(el)) return;
					if (el.tagName === "TEXTAREA" || el instanceof HTMLElement && el.isContentEditable) setOpen(false);
				};
				document.addEventListener("mousedown", onMouseDown);
				return () => {
					document.removeEventListener("mousedown", onMouseDown);
				};
			}, [open]);
			const openDetail = (type, item) => {
				setView("detail");
				setDetail({
					type,
					item,
					loading: true
				});
				(async () => {
					try {
						const result = await call("fetchDetail", {
							kind: type,
							id: item.id
						});
						setDetail(result.item !== void 0 ? {
							type,
							item: result.item,
							loading: false
						} : {
							type,
							item,
							loading: false
						});
					} catch (reason) {
						setDetail({
							type,
							item,
							loading: false,
							error: reason instanceof Error ? reason.message : String(reason)
						});
					}
				})();
			};
			const onDragStart = (event, type, item) => {
				const markdown = buildMarkdown(type, item, config.server);
				event.dataTransfer.effectAllowed = "copy";
				try {
					event.dataTransfer.setData("text/plain", markdown);
				} catch {}
				try {
					event.dataTransfer.setData("application/x-dsh-zentao-item", JSON.stringify({
						type,
						id: item.id
					}));
				} catch {}
				showToast("拖到聊天输入框释放即可附带内容");
			};
			const doCopy = (type, item) => {
				copyText(buildMarkdown(type, item, config.server)).then((ok) => {
					showToast(ok ? "已复制，粘贴到聊天框即可提问" : "复制失败，请手动复制");
				});
			};
			const submitConfig = () => {
				setSaving(true);
				setFormMsg("");
				(async () => {
					try {
						await call("login", {
							server: form.server,
							account: form.account,
							password: form.password,
							token: form.token
						});
						setFormMsg("登录成功");
						setConfig({
							server: form.server,
							account: form.account,
							hasToken: true
						});
						setView("list");
					} catch (reason) {
						setFormMsg(reason instanceof Error ? reason.message : String(reason));
					} finally {
						setSaving(false);
					}
				})();
			};
			const clearConfig = () => {
				(async () => {
					await call("clearConfig", {});
					setConfig({
						server: "",
						account: "",
						hasToken: false
					});
					setData({
						tasks: [],
						bugs: [],
						stories: []
					});
					setError("");
					setFormMsg("已清除配置");
				})();
			};
			const badges = (type, item) => {
				const out = [];
				if (item.id != null) out.push((0, react_jsx_runtime.jsxs)("span", {
					className: ZentaoSidebar_module_css_default.badge,
					children: ["#", item.id]
				}, "id"));
				const st = lab(STATUS[type], item.status);
				if (st !== "") {
					const done = item.status === "done" || item.status === "closed" || item.status === "resolved";
					out.push((0, react_jsx_runtime.jsx)("span", {
						className: done ? `${ZentaoSidebar_module_css_default.badge} ${ZentaoSidebar_module_css_default.badgeDone}` : ZentaoSidebar_module_css_default.badge,
						children: st
					}, "st"));
				}
				if (item.pri === "1") out.push((0, react_jsx_runtime.jsx)("span", {
					className: `${ZentaoSidebar_module_css_default.badge} ${ZentaoSidebar_module_css_default.badgePri1}`,
					children: "P1"
				}, "pri"));
				else if (item.pri === "2") out.push((0, react_jsx_runtime.jsx)("span", {
					className: `${ZentaoSidebar_module_css_default.badge} ${ZentaoSidebar_module_css_default.badgePri2}`,
					children: "P2"
				}, "pri"));
				else if (item.pri != null && item.pri !== "") out.push((0, react_jsx_runtime.jsxs)("span", {
					className: ZentaoSidebar_module_css_default.badge,
					children: ["P", item.pri]
				}, "pri"));
				if (type === "bug" && (item.severity === "1" || item.severity === "2")) out.push((0, react_jsx_runtime.jsxs)("span", {
					className: `${ZentaoSidebar_module_css_default.badge} ${item.severity === "1" ? ZentaoSidebar_module_css_default.badgeSev1 : ZentaoSidebar_module_css_default.badgeSev2}`,
					children: ["S", item.severity]
				}, "sev"));
				else if (type === "bug" && item.severity != null && item.severity !== "") out.push((0, react_jsx_runtime.jsxs)("span", {
					className: ZentaoSidebar_module_css_default.badge,
					children: ["S", item.severity]
				}, "sev"));
				return out;
			};
			const renderTabs = () => {
				const tabs = [
					{
						key: "task",
						label: "任务",
						count: data.tasks.length
					},
					{
						key: "bug",
						label: "BUG",
						count: data.bugs.length
					},
					{
						key: "story",
						label: "需求",
						count: data.stories.length
					}
				];
				return (0, react_jsx_runtime.jsx)("div", {
					className: ZentaoSidebar_module_css_default.tabs,
					children: tabs.map((t) => (0, react_jsx_runtime.jsxs)("button", {
						className: tab === t.key ? `${ZentaoSidebar_module_css_default.tab} ${ZentaoSidebar_module_css_default.tabActive}` : ZentaoSidebar_module_css_default.tab,
						onClick: () => {
							setTab(t.key);
						},
						children: [t.label, (0, react_jsx_runtime.jsx)("span", {
							className: ZentaoSidebar_module_css_default.cnt,
							children: t.count
						})]
					}, t.key))
				});
			};
			const renderList = () => {
				if (!config.hasToken) return (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("div", {
					className: ZentaoSidebar_module_css_default.empty,
					children: "尚未配置禅道账号"
				}), (0, react_jsx_runtime.jsx)("div", {
					className: ZentaoSidebar_module_css_default.actions,
					style: { justifyContent: "center" },
					children: (0, react_jsx_runtime.jsx)("button", {
						className: `${ZentaoSidebar_module_css_default.btn} ${ZentaoSidebar_module_css_default.primary}`,
						onClick: () => {
							setView("config");
						},
						children: "去配置"
					})
				})] });
				const list = tab === "task" ? data.tasks : tab === "bug" ? data.bugs : data.stories;
				return (0, react_jsx_runtime.jsxs)("div", { children: [
					renderTabs(),
					error !== "" && (0, react_jsx_runtime.jsx)("div", {
						className: ZentaoSidebar_module_css_default.error,
						children: error
					}),
					loading && (0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.empty,
						children: [(0, react_jsx_runtime.jsx)("span", { className: ZentaoSidebar_module_css_default.spin }), "加载中…"]
					}),
					!loading && list.length === 0 && error === "" && (0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.empty,
						children: ["暂无指派给我的", TYPE_LABEL[tab]]
					}),
					(0, react_jsx_runtime.jsx)("div", { children: list.map((item) => (0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.card,
						draggable: true,
						onDragStart: (e) => {
							onDragStart(e, tab, item);
						},
						onClick: () => {
							openDetail(tab, item);
						},
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: ZentaoSidebar_module_css_default.cardTitle,
								children: item.name ?? item.title ?? "(无标题)"
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: ZentaoSidebar_module_css_default.cardMeta,
								children: badges(tab, item)
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ZentaoSidebar_module_css_default.cardFoot,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ZentaoSidebar_module_css_default.dragHint,
									children: "⠿ 拖拽 · 点击详情"
								}), (0, react_jsx_runtime.jsx)("a", {
									className: ZentaoSidebar_module_css_default.link,
									href: itemUrl(config.server, tab, item.id),
									target: "_blank",
									rel: "noreferrer",
									onClick: (e) => {
										e.stopPropagation();
									},
									children: "原地址"
								})]
							})
						]
					}, item.id)) })
				] });
			};
			const renderDetail = () => {
				if (detail === void 0) return null;
				const { type, item } = detail;
				const fields = describeItem(type, item);
				const link = itemUrl(config.server, type, item.id);
				return (0, react_jsx_runtime.jsxs)("div", { children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.actions,
						style: { marginTop: 0 },
						children: [(0, react_jsx_runtime.jsx)("button", {
							className: ZentaoSidebar_module_css_default.btn,
							onClick: () => {
								setView("list");
							},
							children: "← 返回列表"
						}), link !== "" && (0, react_jsx_runtime.jsx)("a", {
							className: ZentaoSidebar_module_css_default.btn,
							href: link,
							target: "_blank",
							rel: "noreferrer",
							style: { textDecoration: "none" },
							children: "在禅道打开 ↗"
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", { style: { height: "8px" } }),
					(0, react_jsx_runtime.jsx)("div", {
						className: ZentaoSidebar_module_css_default.detailTitle,
						children: item.name ?? item.title ?? "(无标题)"
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.hint,
						children: [
							"禅道",
							TYPE_LABEL[type],
							" #",
							item.id ?? "-"
						]
					}),
					detail.loading && (0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.empty,
						children: [(0, react_jsx_runtime.jsx)("span", { className: ZentaoSidebar_module_css_default.spin }), "加载详情…"]
					}),
					detail.error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: ZentaoSidebar_module_css_default.error,
						children: detail.error
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.actions,
						children: [(0, react_jsx_runtime.jsx)("button", {
							className: `${ZentaoSidebar_module_css_default.btn} ${ZentaoSidebar_module_css_default.primary}`,
							draggable: true,
							onDragStart: (e) => {
								onDragStart(e, type, item);
							},
							children: "⣿ 拖拽到聊天框"
						}), (0, react_jsx_runtime.jsx)("button", {
							className: ZentaoSidebar_module_css_default.btn,
							onClick: () => {
								doCopy(type, item);
							},
							children: "复制内容"
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.hint,
						children: [
							"按住左侧按钮拖到聊天输入框，即可附带该",
							TYPE_LABEL[type],
							"内容进行提问；或点击「复制内容」后粘贴。"
						]
					}),
					(0, react_jsx_runtime.jsx)("div", { style: { height: "16px" } }),
					(0, react_jsx_runtime.jsx)("div", { children: fields.map(([label, value, unit], index) => (0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: ZentaoSidebar_module_css_default.fieldLabel,
							children: label
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: ZentaoSidebar_module_css_default.fieldValue,
							children: [value, unit !== void 0 ? ` ${unit}` : ""]
						})]
					}, index)) })
				] });
			};
			const renderConfig = () => {
				return (0, react_jsx_runtime.jsxs)("div", { children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: ZentaoSidebar_module_css_default.hint,
						style: { marginBottom: "10px" },
						children: "配置禅道服务地址与账号（基于禅道 REST API v2）。"
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.formRow,
						children: [(0, react_jsx_runtime.jsx)("label", { children: "禅道地址" }), (0, react_jsx_runtime.jsx)("input", {
							className: ZentaoSidebar_module_css_default.input,
							placeholder: "https://zentao.example.com",
							value: form.server,
							onChange: (e) => {
								setForm({
									...form,
									server: e.target.value
								});
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.formRow,
						children: [(0, react_jsx_runtime.jsx)("label", { children: "账号" }), (0, react_jsx_runtime.jsx)("input", {
							className: ZentaoSidebar_module_css_default.input,
							placeholder: "admin",
							value: form.account,
							onChange: (e) => {
								setForm({
									...form,
									account: e.target.value
								});
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.formRow,
						children: [(0, react_jsx_runtime.jsx)("label", { children: "密码" }), (0, react_jsx_runtime.jsx)("input", {
							className: ZentaoSidebar_module_css_default.input,
							type: "password",
							placeholder: "登录密码",
							value: form.password,
							onChange: (e) => {
								setForm({
									...form,
									password: e.target.value
								});
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.formRow,
						children: [(0, react_jsx_runtime.jsx)("label", { children: "或直接粘贴 Token（可选）" }), (0, react_jsx_runtime.jsx)("input", {
							className: ZentaoSidebar_module_css_default.input,
							placeholder: "已有 Token 可跳过密码",
							value: form.token,
							onChange: (e) => {
								setForm({
									...form,
									token: e.target.value
								});
							}
						})]
					}),
					formMsg !== "" && (0, react_jsx_runtime.jsx)("div", {
						className: formMsg.includes("成功") || formMsg.includes("已") ? ZentaoSidebar_module_css_default.hint : ZentaoSidebar_module_css_default.error,
						children: formMsg
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.actions,
						children: [(0, react_jsx_runtime.jsx)("button", {
							className: `${ZentaoSidebar_module_css_default.btn} ${ZentaoSidebar_module_css_default.primary}`,
							onClick: submitConfig,
							disabled: saving,
							children: saving ? "登录中…" : "登录并保存"
						}), config.hasToken && (0, react_jsx_runtime.jsx)("button", {
							className: ZentaoSidebar_module_css_default.btn,
							onClick: clearConfig,
							children: "清除配置"
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ZentaoSidebar_module_css_default.hint,
						children: "账号密码仅用于登录换取 Token；Token 会保存到本地（~/.zentao-sidebar-config.json），不会上传。"
					})
				] });
			};
			const renderBody = () => {
				if (view === "config") return renderConfig();
				if (view === "detail") return renderDetail();
				return renderList();
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ZentaoSidebar_module_css_default.root,
				ref: rootRef,
				children: [
					!open && (0, react_jsx_runtime.jsx)("button", {
						className: ZentaoSidebar_module_css_default.fab,
						onClick: () => {
							setOpen(true);
						},
						children: "禅道"
					}),
					open && (0, react_jsx_runtime.jsxs)("div", {
						className: ZentaoSidebar_module_css_default.panel,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ZentaoSidebar_module_css_default.head,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ZentaoSidebar_module_css_default.title,
								children: "禅道 · 我的工作"
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: ZentaoSidebar_module_css_default.headBtns,
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										className: ZentaoSidebar_module_css_default.btn,
										onClick: () => {
											setView("config");
										},
										children: "设置"
									}),
									view === "list" && (0, react_jsx_runtime.jsx)("button", {
										className: ZentaoSidebar_module_css_default.btn,
										onClick: () => {
											refresh();
										},
										children: "刷新"
									}),
									view === "list" && (0, react_jsx_runtime.jsxs)("select", {
										className: ZentaoSidebar_module_css_default.select,
										value: autoRefresh,
										onChange: (e) => {
											setAutoRefresh(Number(e.target.value));
										},
										title: "自动刷新间隔",
										children: [
											(0, react_jsx_runtime.jsx)("option", {
												value: 0,
												children: "自动:关"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: 30,
												children: "30秒"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: 60,
												children: "1分"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: 300,
												children: "5分"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: 600,
												children: "10分"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: 1800,
												children: "30分"
											})
										]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										className: ZentaoSidebar_module_css_default.btn,
										onClick: () => {
											setOpen(false);
										},
										children: "×"
									})
								]
							})]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: ZentaoSidebar_module_css_default.body,
							children: renderBody()
						})]
					}),
					toast !== "" && (0, react_jsx_runtime.jsx)("div", {
						className: ZentaoSidebar_module_css_default.toast,
						children: toast
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Services required by the ZenTao sidebar plugin. */
		const inject = ["slots", "connection"];
		/** Mount the additive frame overlay entry and enable the DSH theme hook.
		* @param ctx - Client root context.
		*/
		function apply(ctx) {
			const connection = ctx.connection;
			ctx.effect(() => {
				document.body.dataset["zentao"] = "";
				return () => {
					delete document.body.dataset["zentao"];
				};
			});
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "zentao-sidebar",
				order: 10
			}, (props) => (0, react.createElement)(ZentaoSidebar, {
				...props,
				rpc: connection.rpc
			})));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map