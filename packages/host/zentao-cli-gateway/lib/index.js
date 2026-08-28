import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
//#region lib/types/index.js
/** Loopback RPC gateway from the Web shell to the ZenTao REST API v2. */
const name = "zentao-rest-gateway";
const inject = ["connection", "subprocess"];
const CONFIG_PATH = join(homedir(), ".zentao-sidebar-config.json");
const OUTPUT_CAP = 2 * 1024 * 1024;
function failure(message) {
	return {
		ok: false,
		error: {
			code: "internal",
			message,
			details: {}
		}
	};
}
function object(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function normalizeUrl(input) {
	let url = input.trim();
	if (url === "") return "";
	url = url.replace(/\/+$/, "");
	url = url.replace(/\/api\.php(\/v[0-9]+)?$/i, "");
	if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = `https://${url}`;
	return url;
}
function loginPayload(value) {
	const row = object(value);
	if (row === void 0) throw new Error("登录参数缺失");
	const server = row.server;
	const account = row.account;
	if (typeof server !== "string" || typeof account !== "string") throw new Error("服务器地址和账号均为必填项");
	const password = typeof row.password === "string" && row.password !== "" ? row.password : void 0;
	const token = typeof row.token === "string" && row.token.trim() !== "" ? row.token : void 0;
	if (token === void 0 && password === void 0) throw new Error("需要提供密码或 Token");
	const normalized = normalizeUrl(server);
	if (normalized === "") throw new Error("服务器地址格式不正确");
	return {
		server: normalized,
		account: account.trim(),
		password,
		token
	};
}
function respError(data) {
	const status = data.status;
	if (status === "fail" || status === "failed" || status === "error") {
		const message = data.message ?? data.reason ?? data.error;
		return typeof message === "string" ? message : "请求失败";
	}
}
function extractList(data, getter) {
	const direct = data[getter];
	if (Array.isArray(direct)) return direct;
	const inner = object(data.data);
	if (inner !== void 0 && Array.isArray(inner[getter])) return inner[getter];
	return [];
}
function dedupe(list) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const candidate of list) {
		const row = object(candidate);
		const id = row === void 0 ? void 0 : row.id;
		if (id === void 0 || id === null) {
			out.push(candidate);
			continue;
		}
		const key = String(id);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(candidate);
	}
	return out;
}
async function runWithLimit(items, limit, worker) {
	const results = new Array(items.length);
	let next = 0;
	const runOne = async () => {
		while (true) {
			const index = next;
			next += 1;
			if (index >= items.length) return;
			const item = items[index];
			if (item === void 0) return;
			results[index] = await worker(item);
		}
	};
	const runners = [];
	const count = Math.min(limit, items.length);
	for (let i = 0; i < count; i += 1) runners.push(runOne());
	await Promise.all(runners);
	return results;
}
/** Register the loopback-only ZenTao REST RPC channel. */
function apply(ctx) {
	const state = {
		url: "",
		account: "",
		token: ""
	};
	try {
		const cfg = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
		if (typeof cfg.url === "string") state.url = cfg.url;
		if (typeof cfg.account === "string") state.account = cfg.account;
		if (typeof cfg.token === "string") state.token = cfg.token;
	} catch {}
	const persist = () => {
		try {
			writeFileSync(CONFIG_PATH, JSON.stringify({
				url: state.url,
				account: state.account,
				token: state.token
			}));
		} catch {}
	};
	const curl = async (method, path, body, signal) => {
		const url = `${state.url}/api.php/v2${path}`;
		const args = [
			"curl",
			"-sS",
			"--max-time",
			"25"
		];
		if (method !== "GET") args.push("-X", method);
		if (body !== void 0) {
			args.push("-H", "Content-Type: application/json");
			args.push("--data-binary", JSON.stringify(body));
		}
		if (state.token !== "") args.push("-H", `Token: ${state.token}`);
		args.push(url);
		const executable = await ctx.subprocess.resolveExecutable("curl", void 0, signal);
		const handle = ctx.subprocess.spawn({
			argv: [executable, ...args],
			cwd: process.cwd(),
			signal: AbortSignal.any([signal, AbortSignal.timeout(3e4)]),
			graceMs: 3e3,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: OUTPUT_CAP },
				stderr: { maxBytes: 64 * 1024 }
			}
		});
		const outcome = await handle.done;
		const stdout = handle.collected.stdout?.readFrom(0).text ?? "";
		const stderr = handle.collected.stderr?.readFrom(0).text ?? "";
		if (outcome.exitCode !== 0) throw new Error(stderr.trim() || stdout.trim() || "curl 执行失败");
		return JSON.parse(stdout);
	};
	const httpGet = async (path, signal) => {
		const data = await curl("GET", path, void 0, signal);
		const error = respError(data);
		if (error !== void 0) throw new Error(error);
		return data;
	};
	const list = async (path, getter, signal) => {
		return extractList(await httpGet(path, signal), getter);
	};
	const doLogin = async (request, signal) => {
		if (request.token !== void 0) state.token = request.token;
		else {
			const data = await curl("POST", "/users/login", {
				account: request.account,
				password: request.password ?? ""
			}, signal);
			if (data.status !== "success" || typeof data.token !== "string") {
				const reason = typeof data.reason === "string" ? data.reason : "登录失败，请检查账号密码";
				throw new Error(reason);
			}
			state.token = data.token;
			const user = object(data.user);
			if (user !== void 0 && typeof user.account === "string") state.account = user.account;
		}
		state.url = request.server;
		state.account = request.account;
		persist();
		return {
			profile: {
				server: state.url,
				account: state.account
			},
			tasks: [],
			bugs: [],
			stories: [],
			fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	};
	const doFetchMine = async (signal) => {
		if (state.url === "") throw new Error("未配置禅道地址");
		if (state.token === "") throw new Error("未登录，请先配置账号");
		const account = state.account;
		const products = await list("/products?recPerPage=1000&pageID=1", "products", signal);
		const executions = await list("/executions?recPerPage=1000&pageID=1", "executions", signal);
		const jobs = [];
		for (const candidate of products) {
			const id = object(candidate)?.id;
			if (id !== void 0) {
				jobs.push({
					kind: "story",
					id
				});
				jobs.push({
					kind: "bug",
					id
				});
			}
		}
		for (const candidate of executions) {
			const row = object(candidate);
			if (row === void 0 || row.status === "closed") continue;
			if (row.id !== void 0) jobs.push({
				kind: "task",
				id: row.id
			});
		}
		const results = await runWithLimit(jobs, 6, async (job) => {
			let base;
			let browse;
			let getter;
			if (job.kind === "task") {
				base = `/executions/${String(job.id)}/tasks`;
				browse = "unclosed";
				getter = "tasks";
			} else if (job.kind === "bug") {
				base = `/products/${String(job.id)}/bugs`;
				browse = "assigntome";
				getter = "bugs";
			} else {
				base = `/products/${String(job.id)}/stories`;
				browse = "assignedtome";
				getter = "stories";
			}
			return await list(`${base}?browseType=${browse}&recPerPage=200&pageID=1`, getter, signal);
		});
		const tasks = [];
		const bugs = [];
		const stories = [];
		for (let index = 0; index < jobs.length; index += 1) {
			const job = jobs[index];
			if (job === void 0) continue;
			const rows = results[index] ?? [];
			const target = job.kind === "task" ? tasks : job.kind === "bug" ? bugs : stories;
			for (const row of rows) {
				if (object(row)?.assignedTo !== account) continue;
				target.push(row);
			}
		}
		return {
			profile: {
				server: state.url,
				account: state.account
			},
			tasks: dedupe(tasks),
			bugs: dedupe(bugs),
			stories: dedupe(stories),
			fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	};
	const refresh = async (signal) => {
		if (state.token === "") throw new Error("请先登录禅道账户");
		return await doFetchMine(signal);
	};
	ctx.effect(() => ctx.connection.rpc.handle("/zentao", async (endpoint, payload, signal) => {
		try {
			if (endpoint === "getConfig") return {
				ok: true,
				value: {
					server: state.url,
					account: state.account,
					hasToken: state.token !== ""
				}
			};
			if (endpoint === "login") return {
				ok: true,
				value: await doLogin(loginPayload(payload), signal)
			};
			if (endpoint === "refresh") return {
				ok: true,
				value: await refresh(signal)
			};
			if (endpoint === "fetchDetail") {
				const row = object(payload);
				const kind = row?.kind;
				const id = row?.id;
				if (typeof kind !== "string") return failure("未知类型");
				const map = {
					task: "/tasks",
					bug: "/bugs",
					story: "/stories"
				};
				const getter = {
					task: "task",
					bug: "bug",
					story: "story"
				};
				const base = map[kind];
				const key = getter[kind];
				if (base === void 0 || key === void 0) return failure("未知类型");
				const data = await httpGet(`${base}/${String(id)}`, signal);
				return {
					ok: true,
					value: { item: object(data)?.[key] ?? data }
				};
			}
			if (endpoint === "clearConfig") {
				state.url = "";
				state.account = "";
				state.token = "";
				try {
					writeFileSync(CONFIG_PATH, JSON.stringify({
						url: "",
						account: "",
						token: ""
					}));
				} catch {}
				return {
					ok: true,
					value: null
				};
			}
			return failure(`未知禅道操作：${endpoint}`);
		} catch (error) {
			return failure(error instanceof Error ? error.message : String(error));
		}
	}, { authority: "loopback" }));
}
//#endregion
export { apply, inject, name };
