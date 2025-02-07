import {
	Plugin,
	PluginSettingTab,
	Setting,
	TextComponent,
	ButtonComponent,
	setIcon,
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
		await this.loadSettings();
		this.loadStylesheet("font.css");
		this.styleEl = document.createElement("style");
		document.head.appendChild(this.styleEl);
		this.updateStyles();
		this.loadStylesheet("color.css");
		this.addSettingTab(new MangaDialogueSettingTab(this.app, this));
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
					renderComment(line, dialogueContainer);
					currentContainer = null;
					return;
				}

				const charMatch = line.match(/^(left|right):\s*(.*)$/);
				if (charMatch) {
					[leftCharacter, rightCharacter] = updateCharacter(
						charMatch,
						leftCharacter,
						rightCharacter
					);
					return;
				}

				const dialogueData = parseDialogue(line);
				if (!dialogueData) return;

				const { position, bubbleTypeClass, fontType, dialogue } =
					dialogueData;
				const character =
					position === "right" ? rightCharacter : leftCharacter;
				const characterID =
					this.settings.characters.find((c) => c.name === character)
						?.id || null;

				currentContainer = getOrCreateCharacterContainer(
					dialogueContainer,
					currentContainer,
					character,
					lastCharacter,
					position,
					characterID
				);
				createBubble(
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

		function renderComment(line: string, parent: HTMLElement) {
			const commentText = line.trim().substring(1).trim();
			const commentBubble = document.createElement("div");
			commentBubble.classList.add("serihu-comment");

			const commentContent = document.createElement("div");
			commentContent.classList.add("serihu-comment-text");
			commentContent.textContent = commentText;

			commentBubble.appendChild(commentContent);
			parent.appendChild(commentBubble);
		}

		function updateCharacter(
			charMatch: RegExpMatchArray,
			left: string,
			right: string
		): [string, string] {
			const [, position, character] = charMatch;
			if (position === "left") return [character, right];
			return [left, character];
		}

		function parseDialogue(line: string) {
			const match = line.match(
				/^([<>]{1,2}|\(|\))\s*(?::([a-zA-Z0-9_-]+))?\s(.+)$/
			);
			if (!match) return null;

			const [, prefix, fontType, dialogue] = match;
			const position: "left" | "right" =
				prefix.includes(">") || prefix === ")" ? "right" : "left";

			let bubbleTypeClass = "";
			if (prefix === "<<" || prefix === ">>") bubbleTypeClass = "rough";
			else if (prefix === "(" || prefix === ")")
				bubbleTypeClass = "thought";

			return { position, bubbleTypeClass, fontType, dialogue };
		}

		function getOrCreateCharacterContainer(
			parent: HTMLElement,
			container: HTMLElement | null,
			character: string,
			lastCharacter: string,
			position: "left" | "right",
			characterID: string | null
		) {
			if (container && character === lastCharacter) return container;

			const newContainer = document.createElement("div");
			newContainer.classList.add(
				position === "right"
					? "character-container-right"
					: "character-container-left"
			);

			if (characterID) newContainer.classList.add(characterID);
			parent.appendChild(newContainer);

			return newContainer;
		}

		function createBubble(
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

			if (character !== lastCharacter) {
				const charName = document.createElement("div");
				charName.classList.add("serihu-char");
				charName.textContent = character;
				bubble.appendChild(charName);
			}

			const text = document.createElement("div");
			text.classList.add("serihu-text");
			if (fontType) text.classList.add(`type-${fontType}`);
			text.textContent = dialogue;
			bubble.appendChild(text);

			container.appendChild(bubble);
		}
	}

	onunload() {
		console.log("Manga-Dialogue-Render Unloaded");
		this.saveCustomCSS();
		document.head.removeChild(this.styleEl);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{ characters: [] },
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateStyles();
		this.saveCustomCSS();
		this.updateCustomStylesheet();
	}

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

	async loadStylesheet(filename: string) {
		const cssPath = await this.getAssetPath(filename, true); // 読み込み用パス取得

		try {
			const response = await fetch(cssPath);
			if (!response.ok) {
				console.error(
					`Failed to load ${filename}:`,
					response.statusText
				);
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
		const pluginPath = await this.getAssetPath(filename, false); // 保存用パス取得

		try {
			const dirPath = path.dirname(pluginPath);
			const dirExists = await this.app.vault.adapter.exists(dirPath);
			if (!dirExists) {
				await this.app.vault.adapter.mkdir(dirPath);
			}

			await this.app.vault.adapter.write(pluginPath, await cssText);
		} catch (err) {
			console.error(`Failed to save ${filename}:`, err);
		}
	}

	async updateStyles() {
		const cssContent = this.generateCustomStyles();
		await this.saveStylesheet("color.css", await cssContent);
		this.updateCharacterClasses();
	}

	updateCharacterClasses() {
		const characterContainers = document.querySelectorAll(
			".character-container-left, .character-container-right"
		);
		characterContainers.forEach((container) => {
			container.classList.forEach((cls) => {
				if (cls.startsWith("characterID-")) {
					container.classList.remove(cls);
				}
			});

			const characterName = container
				.querySelector(".serihu-char")
				?.textContent?.trim();
			if (!characterName) return;

			const characterID =
				this.settings.characters.find((c) => c.name === characterName)
					?.id || "default";
			container.classList.add(characterID);
		});
	}

	async updateCustomStylesheet() {
		const cssContent = this.generateCustomStyles();
		await this.saveStylesheet("color.css", await cssContent);
		await this.loadCustomColorStylesheet();
	}

	async loadCustomColorStylesheet() {
		await this.loadStylesheet("color.css");
	}

	async generateCustomStyles(): Promise<string> {
		let rootCss = ":root {\n";
		let customCss = "";

		const uniqueIds = new Set<string>();

		const templatePath = await this.getAssetPath("_color.tpl", true);
		const response = await fetch(templatePath);
		if (!response.ok) {
			console.error("Failed to load template:", response.statusText);
			return "";
		}
		const template = await response.text();

		this.settings.characters.forEach((char) => {
			if (uniqueIds.has(char.id)) return;
			uniqueIds.add(char.id);

			rootCss += `  --${char.id}-color: ${char.color}; /* ${char.name} */ \n`;
			customCss += template
				.replace(/{{id}}/g, char.id)
				.replace(/{{name}}/g, char.name);
		});

		rootCss += "}\n";
		return rootCss + customCss;
	}

	async saveCustomCSS() {
		const cssText = await this.generateCustomStyles();
		await this.saveStylesheet("color.css", cssText);
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
				this.plugin.settings.characters[index].color = value;
				await this.plugin.saveSettings();
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
}
