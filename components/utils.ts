import * as path from "path";
import { App, PluginManifest } from "obsidian";
import { StyleManager } from "./styles";

// forReadinfがtrueなら読み取り用、falseなら書き込み用のパスを取得
function getAssetPath(
	app: App,
	manifest: PluginManifest,
	filename: string,
	forReading: boolean = true
): Promise<string> {
	const fullPath = `skin/${filename}`;

	if (forReading) {
		return Promise.resolve(
			app.vault.adapter.getResourcePath(`${manifest.dir}/${fullPath}`)
		);
	} else {
		return Promise.resolve(
			path.join(".obsidian", "plugins", manifest.id, fullPath)
		);
	}
}

async function saveCustomCSS(
	app: App,
	manifest: PluginManifest,
	styleManager: StyleManager,
	reload = false
) {
	const cssText = await styleManager.generateCustomStyles();
	await saveStylesheet(app, manifest, "color.css", cssText);
	if (reload) {
		await loadStylesheet(app, manifest, "color.css");
	}
}

async function loadCSSFiles(
	app: App,
	manifest: PluginManifest,
	styleEl: HTMLStyleElement
) {
	await loadStylesheet(app, manifest, "color.css");
	styleEl.id = "dialogue-custom-style";
}

async function saveStylesheet(
	app: App,
	manifest: PluginManifest,
	filename: string,
	cssText: string
): Promise<void> {
	const pluginPath = await getAssetPath(app, manifest, filename, false);

	try {
		const dirPath = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
		const dirExists = await app.vault.adapter.exists(dirPath);
		if (!dirExists) {
			await app.vault.adapter.mkdir(dirPath);
		}

		await app.vault.adapter.write(pluginPath, cssText);
	} catch (err) {
		console.error(`Failed to save ${filename}:`, err);
	}
}

async function loadStylesheet(
	app: App,
	manifest: PluginManifest,
	filename: string
): Promise<void> {
	const cssPath = await getAssetPath(app, manifest, filename, true);

	try {
		const response = await fetch(cssPath, { cache: "no-store" });
		if (!response.ok) {
			console.error(`Failed to load ${filename}:`, response.statusText);
			return;
		}

		const cssText = await response.text();

		// 既存の <style> タグを探す（前回のもの）
		let styleTag = document.querySelector(`style[data-filename="${filename}"]`);

		if (!styleTag) {
			// ない場合は新しく作成
			styleTag = document.createElement("style");
			styleTag.setAttribute("data-filename", filename); // 識別用に属性を追加
			document.head.appendChild(styleTag);
		}

		// CSSを更新
		styleTag.textContent = cssText;
	} catch (err) {
		console.error(`Failed to fetch ${filename}:`, err);
	}
}


export {
	getAssetPath,
	saveCustomCSS,
	loadCSSFiles,
	saveStylesheet,
	loadStylesheet,
};
