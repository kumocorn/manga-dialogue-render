import type { PluginSettings, CharacterSettings } from "./types";
import {
	App,
	PluginManifest,
} from "obsidian";

export class MangaDialogueRenderer {
	private plugin: any;
	private source: string;
	private el: HTMLElement;
	private settings: PluginSettings;

  constructor(plugin: any, source: string, el: HTMLElement) {
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.source = source;
    this.el = el;
    this.render();
  }
  
	private render() {
		const dialogueContainer = document.createElement("div");
		dialogueContainer.classList.add("serihu-container");

		let leftCharacter = "";
		let rightCharacter = "";
		let lastCharacter = "";
		let currentContainer: HTMLElement | null = null;

		this.source.split("\n").forEach((line: string) => {

			if (line.trim() === "") return;

			if (line.trim().startsWith("# ")) {
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

		this.el.appendChild(dialogueContainer);
	}

	private renderComment(line: string, parent: HTMLElement) {
		const commentText = line.trim().substring(1).trim();
		const commentSection = document.createElement("div");
		commentSection.classList.add("serihu-comment");

		const commentContent = document.createElement("div");
		commentContent.classList.add("serihu-comment-text");
		commentContent.textContent = commentText;

		commentSection.appendChild(commentContent);
		parent.appendChild(commentSection);
	}

	private updateCharacter(
		charMatch: RegExpMatchArray,
		left: string,
		right: string
	): [string, string] {
		const [, position, character] = charMatch;
		return position === "left" ? [character, right] : [left, character];
	}

	private parseDialogue(line: string) {
		const match = line.match(/^([<>]{1,2}|\(\(|\)\)|\(|\))\s*(?::([a-zA-Z0-9_-]+))?\s(.+)$/);

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
      case "))":
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
      case "((":
      case "))":
        return "uniflash";
			default:
				return "";
		}
	}

	private getOrCreateCharacterContainer(
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

		if (characterID) newContainer.classList.add(`characterID-${characterID}`);
		parent.appendChild(newContainer);

		return newContainer;
	}

	private createBubble(
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

	// コンテナへのクラスの再付与
	updateCharacterClasses() {
		document
			.querySelectorAll("[class^='character-container-']")
			.forEach((container) => {
        const classListArray = Array.from(container.classList);
        classListArray.forEach((cls) => {
            if (cls.startsWith("characterID-")) {
                container.classList.remove(cls);
            }
        });

				const characterName = container
					.querySelector(".serihu-char")
					?.textContent?.trim();
				if (!characterName) return;

        const characterID = this.getCharacterID(characterName);
        console.log(`Character name: ${characterName}, Character ID: ${characterID}`);
        if (characterID) {
            container.classList.add(`characterID-${characterID}`);
        } else {
            console.warn(`No character ID found for: ${characterName}`);
        }
    });
	}

	getCharacterID(name: string): string | null {
		return this.plugin.settings.characters.find((c: CharacterSettings) => c.name === name)?.id || null;
	}
}
