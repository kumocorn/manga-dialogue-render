import { Plugin, PluginSettingTab, Setting, TextComponent, ButtonComponent, setIcon } from "obsidian";
import * as path from "path";
import { nanoid } from "nanoid";

const id = nanoid();
console.log(id);

const DEFAULT_SETTINGS: MyPluginSettings = {
	characters: [],
};

// キャラクターの設定情報の型
interface CharacterSettings {
	name: string;
	color: string;
	id: string; // characterID-xxxxx のようなユニークなID
}

// プラグインの設定全体の型
interface PluginSettings {
	characters: CharacterSettings[];
}

// プラグインのクラス
export default class MangaDialoguePlugin extends Plugin {
	settings: PluginSettings;
	styleEl: HTMLStyleElement;

	generateUniqueID(existingIDs: Set<string>): string {
		let id;
		do {
			id = `characterID-${Math.floor(100000 + Math.random() * 900000)}`; // "characterID-xxxxxx" 形式にする
			console.log(
				`Generated ID: ${id}, Checking if exists in:`,
				existingIDs
			);
		} while (existingIDs.has(id));

		console.log(`Final Unique ID: ${id}`);
		return id;
	}

	addCharacter(name: string, color: string) {
		console.log("Before adding character:", this.settings.characters);

		if (!this.settings.characters) {
			this.settings.characters = []; // 初期化
		}

		if (this.settings.characters.some((c) => c.name === name)) {
			console.warn("This character name already exists.");
			return;
		}

		// 既存のIDリストを作成（形式を統一）
		const existingIDs = new Set(this.settings.characters.map((c) => c.id));
		console.log("Existing IDs before generating new one:", existingIDs);

		// ユニークなIDを生成
		const id = this.generateUniqueID(existingIDs);

		// キャラ情報を追加
		console.log(`Adding Character: ${name}, ID: ${id}, Color: ${color}`);
		this.settings.characters.push({ id, name, color });
		console.log(this.settings.characters);
		this.saveSettings();

		existingIDs.add(id);

		// CSSに追加
		this.updateCharacterStyles();
	}
	removeCharacter(id: string) {
		if (!this.settings.characters) {
			console.warn("Characters list is undefined. Initializing.");
			this.settings.characters = []; // 初期化
		}

		this.settings.characters = this.settings.characters.filter(
			(c) => c.id !== id
		);
		this.saveSettings();
		this.updateCharacterStyles();
		this.updateCharacterListUI();

		console.log(`Removed Character: ${id}`);
	}

	updateCharacterStyles() {
		let css = ":root {\n";

		this.settings.characters.forEach((character) => {
			console.log(
				`Adding CSS variable: --${character.id}-color: ${character.color}`
			);
			css += `  --${character.id}-color: ${character.color};\n`;
		});

		css += "}";
		console.log(
			`Adding CSS variable: --${character.id}-color: ${character.color}`
		);
		// 既存の <style> タグを削除して、新しく適用
		let styleTag = document.getElementById(
			"custom-character-colors"
		) as HTMLStyleElement;
		if (!styleTag) {
			styleTag = document.createElement("style");
			styleTag.id = "custom-character-colors";
			document.head.appendChild(styleTag);
		}
		styleTag.innerText = css;
	}

	async onload() {
		console.log("Manga-Dialogue-Plugin Loaded");
		await this.loadSettings(); // settingsがロードされるまで待つ
		this.loadStylesheet("styles.css");
		this.styleEl = document.createElement("style");
		document.head.appendChild(this.styleEl);
		this.updateStyles(); // settingsがロードされた後に呼び出す
		this.loadStylesheet("custom-color.css"); // custom-color.cssをロード
		this.addSettingTab(new MangaDialogueSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor("serihu", (source, el, ctx) => {
			console.log("Detected serihu block:", source);

			const dialogueContainer = document.createElement("div");
			dialogueContainer.classList.add("serihu-container");

			let leftCharacter = "";
			let rightCharacter = "";
			let lastCharacter = "";
			let currentContainer: HTMLElement | null = null;

			source.split("\n").forEach((line) => {
				if (line.trim() === "") return;

        // コメント行の処理
        if (line.trim().startsWith("#")) {
            const commentText = line.trim().substring(1).trim();
            const commentBubble = document.createElement("div");
            commentBubble.classList.add("serihu-comment");

            const commentContent = document.createElement("div");
            commentContent.classList.add("serihu-comment-text");
            commentContent.textContent = commentText;

            commentBubble.appendChild(commentContent);
            dialogueContainer.appendChild(commentBubble);

            // コメントが入ったら次の台詞を新しいコンテナにする
            currentContainer = null;
            return;
        }

				// キャラクター名の指定
				const charMatch = line.match(/^(left|right):\s*(.*)$/); // 正規表現を修正
				if (charMatch) {
					const [, position, character] = charMatch;
					if (position === "left") {
						leftCharacter = character;
					} else if (position === "right") {
						rightCharacter = character;
					}
					return;
				}

				// 台詞行の処理
				const match = line.match(
					/^([<>]{1,2}|\(|\))\s*(?::([a-zA-Z0-9_-]+))?\s(.+)$/
				);
				if (!match) {
					console.warn(
						`Line does not match expected format: ${line}`
					);
					return;
				}

				const [, prefix, fontType, dialogue] = match;
				console.log(
					`Parsed line - Prefix: "${prefix}", Font: "${fontType}", Dialogue: "${dialogue}"`
				);

				let position: "left" | "right" =
					prefix.includes(">") || prefix === ")" ? "right" : "left";

				// 吹き出しの種類
				let bubbleTypeClass = "";
				if (prefix === "<<" || prefix === ">>") {
					bubbleTypeClass = "rough"; // 荒っぽい吹き出し
				} else if (prefix === "(" || prefix === ")") {
					bubbleTypeClass = "thout"; // 思考中の吹き出し
				}

				// キャラ名を取得
				const character =
					position === "right" ? rightCharacter : leftCharacter;
				const characterEntry = this.settings.characters.find(
					(c) => c.name === character
				);

				let characterID = null;
				if (characterEntry) {
					characterID = characterEntry.id; // 設定画面で生成したcharacterIDを使用
				}

				// コンテナークラスの追加
				const containerClass =
					position === "right"
						? "character-container-right"
						: "character-container-left";
				if (!currentContainer || character !== lastCharacter) {
					currentContainer = document.createElement("div");
					currentContainer.classList.add(containerClass);

					if (characterID) {
						currentContainer.classList.add(characterID); // characterIDをそのまま付与
					}

					dialogueContainer.appendChild(currentContainer);
				}

				// 吹き出し作成
				const bubble = document.createElement("div");
				bubble.classList.add("serihu-bubble", position);
				if (bubbleTypeClass) {
					bubble.classList.add(bubbleTypeClass);
				}

				// キャラ名の表示（最初の発話のみ）
				if (character !== lastCharacter) {
					const charName = document.createElement("div");
					charName.classList.add("serihu-char");
					charName.textContent = character;
					bubble.appendChild(charName);
				}

				// 台詞の追加
				const text = document.createElement("div");
				text.classList.add("serihu-text");
				if (fontType) {
					text.classList.add(`type-${fontType}`);
				}

				text.textContent = dialogue;
				bubble.appendChild(text);
				currentContainer.appendChild(bubble);

				lastCharacter = character;
			});

			el.appendChild(dialogueContainer);
		});
	}

	onunload() {
		console.log("Manga-Dialogue-Plugin Unloaded");
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

	async loadStylesheet(filename: string) {
		const cssPath = this.app.vault.adapter.getResourcePath(
			`${this.manifest.dir}/styles/${filename}`
		);
		console.log("Loading CSS:", cssPath);

		const response = await fetch(cssPath);
		if (!response.ok) {
			console.error("Failed to load CSS:", response.statusText);
			return;
		}
		const cssText = await response.text();

		const style = document.createElement("style");
		style.textContent = cssText;
		document.head.appendChild(style);
	}

	async updateStyles() {
		const cssContent = this.generateCustomStyles();

		const pluginPath = path.join(
			".obsidian",
			"plugins",
			this.manifest.id,
			"styles",
			"custom-color.css"
		);

		try {
			const dirPath = path.dirname(pluginPath);
			const dirExists = await this.app.vault.adapter.exists(dirPath);
			if (!dirExists) {
				await this.app.vault.adapter.mkdir(dirPath);
			}
			await this.app.vault.adapter.write(pluginPath, cssContent);
		} catch (err) {
			console.error("Failed to save CSS", err);
		}

		this.updateCharacterClasses(); // ★ここで呼び出す
	}

	updateCharacterClasses() {
		const characterContainers = document.querySelectorAll(
			".character-container"
		);

		characterContainers.forEach((container) => {
			// 既存の characterID クラスを削除
			container.classList.forEach((cls) => {
				if (cls.startsWith("characterID-")) {
					container.classList.remove(cls);
				}
			});

			// キャラクター名を取得して対応する ID を取得
			const characterName = container.getAttribute("data-character");
			if (!characterName) return;

			const characterID =
				this.settings.characters.find((c) => c.name === characterName)
					?.id || "default";
			container.classList.add(characterID);
		});
	}

	async updateCustomStylesheet() {
		const cssContent = this.generateCustomStyles();

		const pluginPath = path.join(
			".obsidian",
			"plugins",
			this.manifest.id,
			"styles",
			"custom-color.css"
		);

		try {
			const dirPath = path.dirname(pluginPath);

			const dirExists = await this.app.vault.adapter.exists(dirPath);
			if (!dirExists) {
				await this.app.vault.adapter.mkdir(dirPath);
			}

			await this.app.vault.adapter.write(pluginPath, cssContent); // 書き込み処理
			await this.loadCustomColorStylesheet(); // 読み込み処理
		} catch (err) {
			console.error("Failed to save CSS", err);
		}
	}

	async loadCustomColorStylesheet() {
		const cssPath = this.app.vault.adapter.getResourcePath(
			`${this.manifest.dir}/styles/custom-color.css`
		);
		try {
			const response = await fetch(cssPath);
			if (!response.ok) {
				console.error(
					"Failed to load custom-color.css:",
					response.statusText
				);
				return;
			}
			const cssText = await response.text();

			const style = document.createElement("style");
			style.textContent = cssText;
			document.head.appendChild(style);
		} catch (err) {
			console.error("Failed to fetch custom-color.css:", err);
		}
	}

	generateCustomStyles(): string {
		let rootCss = ":root {\n";
		let customCss = "";

		// 重複チェック用のSet
		const uniqueIds = new Set<string>();

		this.settings.characters.forEach((char) => {
			if (uniqueIds.has(char.id)) return; // すでに同じIDがある場合はスキップ
			uniqueIds.add(char.id);

			rootCss += `  --${char.id}-color: ${char.color};\n`;

			customCss += `
/* ${char.name}-${char.id} */
  .character-container-left.${char.id} .serihu-bubble,
  .character-container-left.${char.id} .serihu-bubble.thout::before,
  .character-container-left.${char.id} .serihu-bubble.thout::after,
  .character-container-right.${char.id} .serihu-bubble,
  .character-container-right.${char.id} .serihu-bubble.thout::before,
  .character-container-right.${char.id} .serihu-bubble.thout::after {
	background-color: var(--${char.id}-color);
  }

  .character-container-left.${char.id} .serihu-bubble::after,
  .character-container-right.${char.id} .serihu-bubble::after {
	border-color: var(--${char.id}-color) transparent transparent;
  }
	
  .character-container-left.${char.id} .serihu-char,
  .character-container-right.${char.id} .serihu-char {
	color: var(--${char.id}-color);
  }
			`;
		});

		rootCss += "}\n";
		return rootCss + customCss;
	}

	async saveCustomCSS() {
		const cssText = this.generateCustomStyles(); // generateCustomStylesの結果を取得

		// .obsidian/plugins/<plugin-id>/styles/custom-color.css の相対パス
		const pluginPath = path.join(
			".obsidian",
			"plugins",
			this.manifest.id,
			"styles",
			"custom-color.css"
		);

		try {
			const dirPath = path.dirname(pluginPath);

			// ディレクトリが存在しない場合、手動で作成する
			const dirExists = await this.app.vault.adapter.exists(dirPath);
			if (!dirExists) {
				await this.app.vault.adapter.mkdir(dirPath); // ディレクトリを作成
			}

			// CSSを指定されたパスに書き込む
			await this.app.vault.adapter.write(pluginPath, cssText); // cssTextを書き込む
		} catch (err) {
			console.error("Failed to save CSS", err);
		}
	}
}

// 設定タブのクラス
class MangaDialogueSettingTab extends PluginSettingTab {
	plugin: MangaDialoguePlugin;

	constructor(app: any, plugin: MangaDialoguePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// キャラクター追加
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

				// ランダムなIDを付与
				const newID = `characterID-${nanoid(6)}`;

				this.plugin.settings.characters.push({
					name: inputValue,
					color: "#ffffff",
					id: newID,
				});
				
				await this.plugin.saveSettings();

				// 入力欄をクリア
				textInput.setValue("");

				// 画面を更新
					this.display();
			})
		);

	containerEl.createEl("h4", { text: "Character List" });

		// 編集中のキャラクターの管理用セット
		const editingCharacters: Set<string> = new Set();  // characterIDで管理

		// キャラクターリストの表示
		this.plugin.settings.characters.forEach((char, index) => {
			let setting = new Setting(containerEl);

			// キャラクター名の要素
			let nameSpan = setting.nameEl.createEl("span", { text: char.name });

						// 色変更ボタン
						setting.addColorPicker((picker) =>
							picker
							.setValue(char.color)
							.onChange(async (value) => {
								this.plugin.settings.characters[index].color = value;
								await this.plugin.saveSettings();
							})
						);

			const textComponent = new TextComponent(setting.controlEl);
			textComponent.inputEl.style.display = "none"; // 最初は非表示
			
			const editButton = new ButtonComponent(setting.controlEl)
				.setIcon("pencil")
				.setTooltip("Edit Name")
				.onClick(() => {
					if (textComponent.inputEl.style.display === "none") {
						// 編集モード開始
						nameSpan.style.display = "none";
						textComponent.inputEl.style.display = "";
						textComponent.setValue(nameSpan.textContent || "");
						editButton
						.setIcon("check")
						.setTooltip("Confirm!");
					} else {
						// 編集確定
						const newName = textComponent.getValue().trim();
						if (newName !== "") {
							nameSpan.textContent = newName;
							// 設定データを更新
							this.plugin.settings.characters[index].name = newName;
							this.plugin.saveSettings();
						}
						textComponent.inputEl.style.display = "none";
						nameSpan.style.display = "";
						editButton.setIcon("pencil");
					}
				});
			
			// 削除ボタン
			setting.addButton((button) =>
				button
				.setIcon("user-round-x").setTooltip("Remove Character")
				.setWarning()
				.onClick(async () => {
					this.plugin.settings.characters.splice(index, 1); // キャラクターを削除
					await this.plugin.saveSettings();
					this.display(); // 削除後にリストを更新
				})
			);
				});
		}
	}

