import { App, PluginManifest } from "obsidian";
import { CharacterSettings, PluginSettings } from "./types";
import { getAssetPath } from "./utils";

export class StyleManager {
	private app: App;
	private settings: PluginSettings;
	private manifest: PluginManifest;

	constructor(app: App, settings: PluginSettings, manifest: PluginManifest) {
		this.app = app;
		this.settings = settings;
		this.manifest = manifest;
	}

	private async loadTemplate(): Promise<string> {
		const templatePath = await getAssetPath(
			this.app,
			this.manifest,
			"_color.tpl",
			true
		);
		try {
			const response = await fetch(templatePath);
			return response.ok ? await response.text() : "";
		} catch (err) {
			console.error("Error loading template:", err);
			return "";
		}
	}

	private generateCharacterCss(template: string): {
		rootCss: string;
		customCss: string;
	} {
		const uniqueIds = new Set<string>();
		let rootCss = ":root {\n";
		let customCss = "";

		this.settings.characters.forEach((char) => {
			if (uniqueIds.has(char.id)) return;
			uniqueIds.add(char.id);

			const { varName, variable } = this.generateColorVariable(char, false); // `false` で !important なし
			rootCss += `  ${varName}: ${variable}\n`;
			customCss += this.createCustomCss(char, template);
		});

		return { rootCss, customCss };
	}

	private createCustomCss(char: CharacterSettings, template: string): string {
		return template
			.replace(/{{id}}/g, char.id)
			.replace(/{{name}}/g, char.name);
	}

	async generateCustomStyles(): Promise<string> {
		const template = await this.loadTemplate();

		if (!template) {
			console.warn("Template is empty or could not be loaded.");
			return "";
		}

		const { rootCss, customCss } = this.generateCharacterCss(template);

		return `${rootCss}}\n${customCss}`;
	}

	private generateColorVariable(char: CharacterSettings, withImportant: boolean): { varName: string; variable: string } {
		const varName = `--characterID-${char.id}-color`;
		const colorValue = withImportant ? `${char.color} !important` : char.color; //trueで!important
		const characterName = `/* ${char.name} */`;
		const variable = `${colorValue}; ${characterName}`;

		return { varName, variable };
	}

	applyCustomStyles(updatedCharacters?: CharacterSettings[]) {
		const settings = this.settings;

		let styleEl = document.getElementById(
			"dialogue-custom-style"
		) as HTMLStyleElement;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = "dialogue-custom-style";
			document.head.appendChild(styleEl);
		}

		const setCssVar = (varName: string, value: string) =>
			value && value.trim() !== "" ? `${varName}: ${value};` : "";

		const quoteFont = (font: string) => `"${font}"`;

		const newRootCss = `
    \n     /* Appearance */
    ${[
		setCssVar("--m-d-serihu-text-color", settings.textColor),
		setCssVar("--m-d-serihu-background", settings.backgroundColor),
		setCssVar("--m-d-serihu-border", settings.borderColor),
		setCssVar("--m-d-bubble-height", settings.bubbleHeight),
		setCssVar("--m-d-comment-width", settings.commentWidth),
	]
		.filter(Boolean)
		.join("\n    ")}  

  /* Font */
    --dialogue-font: ${quoteFont(settings.defaultFont || "Shippori Antique")};
    --monologue-font: ${quoteFont(settings.monologueFont || "源柔ゴシック")};
    --pop-font: ${quoteFont(settings.popFont || "Mochiy Pop One")};
    --strong-font: ${quoteFont(settings.strongFont || "源暎エムゴv2")};
    --weak-font: ${quoteFont(settings.weakFont || "851チカラヨワク")};
    --horror-font: ${quoteFont(settings.horrorFont || "g_コミックホラー恐怖-教漢"
	)};

  /* Characters */
  `.trim();

		const characters =
			updatedCharacters && updatedCharacters.length > 0
				? updatedCharacters
				: this.settings.characters;

		const characterColors = characters
			.map(
				(char) =>
					`  --characterID-${char.id}-color: ${char.color} !important; /* ${char.name} */`
			)
			.join("\n  ");

		styleEl.textContent = `:root {\n  ${newRootCss}\n  ${characterColors}\n}`;
	}

	updateCharacterColor(updatedCharacters: CharacterSettings[]) {
		let styleEl = document.getElementById("dialogue-custom-style") as HTMLStyleElement;
    if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = "dialogue-custom-style";
			document.head.appendChild(styleEl);
		}

		const existingStyle = styleEl.textContent || "";

		const rootMatch = existingStyle.match(/:root\s*{([\s\S]*?)}/);
		let rootCss = rootMatch ? rootMatch[1].trim() : "";

		const existingCharacterCssMatches = rootCss.match(/--characterID-[\w-]+-color:\s*#[\da-fA-F]+ !important;\s*\/\*.*?\*\//g) || [];
		const existingCharacterCssMap: Record<string, string> = {};

		existingCharacterCssMatches.forEach((match) => {
			const idMatch = match.match(/--characterID-([\w-]+)-color:/);
			if (idMatch) {
				const charId = idMatch[1];
				existingCharacterCssMap[charId] = match;
			}
		});

		updatedCharacters.forEach((character) => {
			const updatedColor = character.color;

			existingCharacterCssMap[
				character.id
			] = `--characterID-${character.id}-color: ${updatedColor} !important; /* ${character.name} */`;
		});

		const newCharacterCss = Object.values(existingCharacterCssMap).join("\n  ");

		styleEl.textContent = `:root {\n  ${newCharacterCss}\n}`;
	}
}
