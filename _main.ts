import {
	Plugin,
	PluginSettingTab,
	Setting,
	MarkdownPostProcessorContext,
	TextComponent,
	ButtonComponent,
	App,
} from "obsidian";
import * as path from "path";
import { nanoid } from "nanoid";

const id = nanoid();

const DEFAULT_SETTINGS: PluginSettings = {
	characters: [],
};

interface CharacterSettings {
	name: string;
	color: string;
	id: string;
}

interface PluginSettings {
	characters: CharacterSettings[];
}

export default class MangaDialoguePlugin extends Plugin {
	settings: PluginSettings;
	styleEl: HTMLStyleElement;

	async onload() {
		console.log("Manga-Dialogue-Render Loaded");
		this.styleEl = document.createElement("style");
		await this.loadSettings();
		document.head.appendChild(this.styleEl);
		await this.loadCSSFiles();
		await this.updateStyles();
		this.setupMarkdownProcessor();
		this.addSettingTab(new MangaDialogueSettingTab(this.app, this));
	}

	onunload() {
		console.log("Manga-Dialogue-Render Unloaded");
		this.saveCustomCSS();
		document.head.removeChild(this.styleEl);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateStyles();
	}

	// color.cssの保存とコンテナの再生成
	async updateStyles() {
		await this.saveCustomCSS(false);
		this.updateCharacterClasses();
	}

	async loadCustomColorCSS() {
		await this.loadStylesheet("color.css");
	}

	// color.cssの保存＋リロードはtrue
	async saveCustomCSS(reload = false) {
		const cssText = await this.generateCustomStyles();
		await this.saveStylesheet("color.css", cssText);
		if (reload) {
			await this.loadCustomColorCSS();
		}
	}

	async loadCSSFiles() {
		await this.loadStylesheet("font.css");
		await this.loadStylesheet("color.css");
		this.styleEl.id = "dialogue-color";
	}

	async loadStylesheet(filename: string) {
		const cssPath = await this.getAssetPath(filename, true);

		try {
			const response = await fetch(cssPath, { cache: "no-store" });
			if (!response.ok) {
				console.error(`Failed to load ${filename}:`, response.statusText);
				return;
			}

			const cssText = await response.text();
			const style = document.createElement("style");
			style.textContent = cssText;
			document.head.appendChild(style);
      
		} catch (err) {
			console.error(`Failed to fetch ${filename}:`, err);
		}
	}

	async saveStylesheet(filename: string, cssText: string) {
		const pluginPath = await this.getAssetPath(filename, false);

		try {
			const dirPath = path.dirname(pluginPath);
			const dirExists = await this.app.vault.adapter.exists(dirPath);
			if (!dirExists) {
				await this.app.vault.adapter.mkdir(dirPath);
			}

			await this.app.vault.adapter.write(pluginPath, cssText);
		} catch (err) {
			console.error(`Failed to save ${filename}:`, err);
		}
	}
	
	async generateCustomStyles(): Promise<string> {
		let rootCss = ":root {\n";
		let customCss = "";
		const uniqueIds = new Set<string>();
	
		const templatePath = await this.getAssetPath("_color.tpl", true);
		let template = "";
	
		try {
			const response = await fetch(templatePath);
			template = response.ok ? await response.text() : "";
		} catch (err) {
			console.error("Error loading template:", err);
		}
	
		if (!template) {
			console.warn("Template is empty or could not be loaded.");
			return "";
		}

		this.settings.characters.forEach((char) => {
			if (uniqueIds.has(char.id)) return;
			uniqueIds.add(char.id);

			rootCss += `  --${char.id}-color: ${char.color}; /* ${char.name} */ \n`;
			customCss += template
				.replace(/{{id}}/g, char.id)
				.replace(/{{name}}/g, char.name);
		});

		return `${rootCss}}\n${customCss}`;
	}

	updateCharacterClasses() {
		document
			.querySelectorAll("[class^='character-container-']")
			.forEach((container) => {
				container.classList.forEach((cls) => {
					if (cls.startsWith("characterID-")) {
						container.classList.remove(cls);
					}
				});

				const characterName = container
					.querySelector(".serihu-char")
					?.textContent?.trim();
				if (!characterName) return;

				const characterID = this.getCharacterID(characterName);
				if (characterID) {
					container.classList.add(characterID);
				}
			});
	}

	getCharacterID(name: string): string | null {
		return this.settings.characters.find((c) => c.name === name)?.id || null;
	}
	
	// trueで読み取り用　falseで書き込み用　のパスを取得
	async getAssetPath(
		filename: string,
		forReading: boolean = true
	): Promise<string> {
		const fullPath = `skin/${filename}`;

		if (forReading) {
			return this.app.vault.adapter.getResourcePath(
				`${this.manifest.dir}/${fullPath}`
			);
		} else {
			return path.join(
				".obsidian",
				"plugins",
				this.manifest.id,
				fullPath
			);
		}
	}

	addPluginSettings() {
		this.addSettingTab(new MangaDialogueSettingTab(this.app, this));
	}

	setupMarkdownProcessor() {
		this.registerMarkdownCodeBlockProcessor("serihu", (source, el, ctx) => {
			const dialogueContainer = document.createElement("div");
			dialogueContainer.classList.add("serihu-container");

			let leftCharacter = "";
			let rightCharacter = "";
			let lastCharacter = "";
			let currentContainer: HTMLElement | null = null;

			source.split("\n").forEach((line) => {
				if (line.trim() === "") return;

				if (line.trim().startsWith("#")) {
					this.renderComment(line, dialogueContainer);
					currentContainer = null;
					return;
				}

				const charMatch = line.match(/^(left|right):\s*(.*)$/);
				if (charMatch) {
					[leftCharacter, rightCharacter] = this.updateCharacter(
						charMatch,
						leftCharacter,
						rightCharacter
					);
					return;
				}

				const dialogueData = this.parseDialogue(line);
				if (!dialogueData) return;

				const { position, bubbleTypeClass, fontType, dialogue } =
					dialogueData;
				const character =
					position === "right" ? rightCharacter : leftCharacter;
				const characterID = this.getCharacterID(character);

				currentContainer = this.getOrCreateCharacterContainer(
					dialogueContainer,
					currentContainer,
					character,
					lastCharacter,
					position,
					characterID
				);
				this.createBubble(
					currentContainer,
					character,
					dialogue,
					fontType,
					bubbleTypeClass,
					lastCharacter
				);
				lastCharacter = character;
			});

			el.appendChild(dialogueContainer);
		});
	}

	renderComment(line: string, parent: HTMLElement) {
		const commentText = line.trim().substring(1).trim();
		const commentSection = document.createElement("div");
		commentSection.classList.add("serihu-comment");

		const commentContent = document.createElement("div");
		commentContent.classList.add("serihu-comment-text");
		commentContent.textContent = commentText;

		commentSection.appendChild(commentContent);
		parent.appendChild(commentSection);
	}

	updateCharacter(
		charMatch: RegExpMatchArray,
		left: string,
		right: string
	): [string, string] {
		const [, position, character] = charMatch;
		return position === "left" ? [character, right] : [left, character];
	}

	parseDialogue(line: string) {
		const match = line.match(
			/^([<>]{1,2}|\(|\))\s*(?::([a-zA-Z0-9_-]+))?\s(.+)$/
		);
		if (!match) return null;

		const [, prefix, fontType, dialogue] = match;
		const position = this.getPositionFromPrefix(prefix);
		const bubbleTypeClass = this.getBubbleTypeClass(prefix);

		return { position, bubbleTypeClass, fontType, dialogue };
	}

	private getPositionFromPrefix(prefix: string): "left" | "right" {
		switch (prefix) {
			case ">":
			case ">>":
			case ")":
				return "right";
			default:
				return "left";
		}
	}
	
	private getBubbleTypeClass(prefix: string): string {
		switch (prefix) {
			case "<<":
			case ">>":
				return "rough";
			case "(":
			case ")":
				return "thought";
			default:
				return "";
		}
	}

	getOrCreateCharacterContainer(
		parent: HTMLElement,
		container: HTMLElement | null,
		character: string,
		lastCharacter: string,
		position: "left" | "right",
		characterID: string | null
	) {
		if (container && character === lastCharacter) return container;

		const newContainer = document.createElement("div");
		newContainer.classList.add(`character-container-${position}`);

		if (characterID) newContainer.classList.add(characterID);
		parent.appendChild(newContainer);

		return newContainer;
	}

	createBubble(
		container: HTMLElement,
		character: string,
		dialogue: string,
		fontType: string | undefined,
		bubbleTypeClass: string,
		lastCharacter: string
	) {
		const bubble = document.createElement("div");
		bubble.classList.add(
			"serihu-bubble",
			container.classList.contains("character-container-right")
				? "right"
				: "left"
		);

		if (bubbleTypeClass) bubble.classList.add(bubbleTypeClass);

		character !== lastCharacter &&
		(() => {
			const charName = document.createElement("div");
			charName.classList.add("serihu-char");
			charName.textContent = character;
			bubble.appendChild(charName);
		})();

		const text = document.createElement("div");
		text.classList.add("serihu-text");
		if (fontType) text.classList.add(`type-${fontType}`);
		text.textContent = dialogue;
		bubble.appendChild(text);

		container.appendChild(bubble);
	}
}

class MangaDialogueSettingTab extends PluginSettingTab {
	plugin: MangaDialoguePlugin;

	constructor(app: App, plugin: MangaDialoguePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.createCharacterInput(containerEl);

		containerEl.createEl("h4", { text: "Character List" });
		this.createCharacterList(containerEl);
	}

	private createCharacterInput(containerEl: HTMLElement): void {
		let inputValue = "";
		let textInput: TextComponent;

		new Setting(containerEl)
			.setName("Add New Character")
			.setDesc("Type character name and press add button")
			.addText((text) => {
				textInput = text;
				text.setPlaceholder("New Character Name").onChange(
					(value) => (inputValue = value)
				);
			})
			.addButton((button) =>
				button
					.setIcon("user-plus")
					.setTooltip("Add character")
					.onClick(async () => {
						if (inputValue.trim() === "") return;
						if (
							this.plugin.settings.characters.some(
								(char) => char.name === inputValue
							)
						)
							return;

						const newID = `characterID-${nanoid(6)}`;

						this.plugin.settings.characters.push({
							name: inputValue,
							color: "#ffffff",
							id: newID,
						});

						await this.plugin.saveSettings();
						textInput.setValue("");
						this.display();
					})
			);
	}

	private createCharacterList(containerEl: HTMLElement): void {
		this.plugin.settings.characters.forEach((char, index) => {
			this.createCharacterSetting(containerEl, char, index);
		});
	}

	private createCharacterSetting(
		containerEl: HTMLElement,
		char: { name: string; color: string; id: string },
		index: number
	): void {
		const setting = new Setting(containerEl);

		const nameSpan = setting.nameEl.createEl("span", { text: char.name });

		setting.addColorPicker((picker) =>
			picker.setValue(char.color).onChange(async (value) => {
				const oldColor = this.plugin.settings.characters[index].color;
				if (oldColor !== value) {
					this.plugin.settings.characters[index].color = value;
					this.updateCharacterColor([
						this.plugin.settings.characters[index],
					]);
					await this.plugin.saveSettings();
				}
			})
		);

		const textComponent = new TextComponent(setting.controlEl);
		textComponent.inputEl.style.display = "none";

		const editButton = new ButtonComponent(setting.controlEl)
			.setIcon("pencil")
			.setTooltip("Edit Name")
			.onClick(() => {
				if (textComponent.inputEl.style.display === "none") {
					nameSpan.style.display = "none";
					textComponent.inputEl.style.display = "";
					textComponent.setValue(nameSpan.textContent || "");
					editButton.setIcon("check").setTooltip("Confirm!");
				} else {
					const newName = textComponent.getValue().trim();
					if (newName !== "") {
						nameSpan.textContent = newName;
						this.plugin.settings.characters[index].name = newName;
						this.plugin.saveSettings();
					}
					textComponent.inputEl.style.display = "none";
					nameSpan.style.display = "";
					editButton.setIcon("pencil").setTooltip("Edit Name");
				}
			});

		setting.addButton((button) =>
			button
				.setIcon("user-round-x")
				.setTooltip("Remove Character")
				.setWarning()
				.onClick(async () => {
					this.plugin.settings.characters.splice(index, 1);
					await this.plugin.saveSettings();
					this.display();
				})
		);
	}

	updateCharacterColor(updatedCharacters: CharacterSettings[]) {
		let styleEl = document.getElementById(
			"dialogue-color"
		) as HTMLStyleElement;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = "dialogue-color";
			document.head.appendChild(styleEl);
			styleEl.textContent = ":root {\n\n}";
		}

		const rootCssStart = ":root {\n";
		const rootCssEnd = "\n}";
		let rootCss =
			styleEl.textContent?.slice(
				rootCssStart.length,
				-rootCssEnd.length
			) || "";

		updatedCharacters.forEach((char) => {
			const colorVarName = `--${char.id}-color`;
			const colorVariable = `${colorVarName}: ${char.color} !important; /* ${char.name} */`;

			rootCss = rootCss.includes(colorVarName)
				? rootCss.replace(
						new RegExp(`(${colorVarName}:)[^;]*`),
						`$1 ${char.color} !important;`
				  )
				: rootCss + `  ${colorVariable}\n`;
		});

		styleEl.textContent = `${rootCssStart}${rootCss}${rootCssEnd}`;
	}
}
