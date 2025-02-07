import { MarkdownPostProcessorContext } from "obsidian";
import type { PluginSettings } from "./types";

export class DialogueRenderer {
  constructor(private settings: PluginSettings) {}

  render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const dialogueContainer = document.createElement("div");
    dialogueContainer.classList.add("serihu-container");

    let leftCharacter = "";
    let rightCharacter = "";
    let lastCharacter = "";
    let currentContainer: HTMLElement | null = null;

    source.split("\n").forEach((line) => {
      if (line.trim() === "") return;

      if (this.renderComment(line, dialogueContainer)) {
        currentContainer = null;
        return;
      }

      const charPosition = this.renderCharacterPosition(line);
      if (charPosition) {
        if (charPosition.position === "left") {
          leftCharacter = charPosition.character;
        } else {
          rightCharacter = charPosition.character;
        }
        return;
      }

      this.renderDialogueLine(
        line,
        dialogueContainer,
        leftCharacter,
        rightCharacter,
        lastCharacter,
        currentContainer
      );
    });

    el.appendChild(dialogueContainer);
  }

  private renderComment(line: string, container: HTMLElement): boolean {
    if (!line.trim().startsWith("#")) return false;

    const commentText = line.trim().substring(1).trim();
    const commentBubble = document.createElement("div");
    commentBubble.classList.add("serihu-comment");

    const commentContent = document.createElement("div");
    commentContent.classList.add("serihu-comment-text");
    commentContent.textContent = commentText;

    commentBubble.appendChild(commentContent);
    container.appendChild(commentBubble);
    return true;
  }

  private renderCharacterPosition(line: string): { position: string; character: string } | null {
    const charMatch = line.match(/^(left|right):\s*(.*)$/);
    if (!charMatch) return null;
    return {
      position: charMatch[1],
      character: charMatch[2]
    };
  }

  private renderDialogueLine(
    line: string,
    container: HTMLElement,
    leftCharacter: string,
    rightCharacter: string,
    lastCharacter: string,
    currentContainer: HTMLElement | null
  ) {
    const match = line.match(/^([<>]{1,2}|\(|\))\s*(?::([a-zA-Z0-9_-]+))?\s(.+)$/);
    if (!match) return;

    const [, prefix, fontType, dialogue] = match;
    const position: "left" | "right" = prefix.includes(">") || prefix === ")" ? "right" : "left";
    const character = position === "right" ? rightCharacter : leftCharacter;

    const bubbleTypeClass = this.getBubbleTypeClass(prefix);
    const characterEntry = this.settings.characters.find(c => c.name === character);
    const characterID = characterEntry?.id;

    this.createDialogueBubble(
      container,
      position,
      character,
      characterID,
      bubbleTypeClass,
      fontType,
      dialogue,
      lastCharacter
    );
  }

  private getBubbleTypeClass(prefix: string): string {
    if (prefix === "<<" || prefix === ">>") return "rough";
    if (prefix === "(" || prefix === ")") return "thout";
    return "";
  }

  private createDialogueBubble(
    container: HTMLElement,
    position: "left" | "right",
    character: string,
    characterID: string | undefined,
    bubbleTypeClass: string,
    fontType: string | undefined,
    dialogue: string,
    lastCharacter: string
  ) {
    const containerClass = `character-container-${position}`;
    const dialogueContainer = document.createElement("div");
    dialogueContainer.classList.add(containerClass);
    if (characterID) {
      dialogueContainer.classList.add(characterID);
    }

    const bubble = document.createElement("div");
    bubble.classList.add("serihu-bubble", position);
    if (bubbleTypeClass) {
      bubble.classList.add(bubbleTypeClass);
    }

    if (character !== lastCharacter) {
      const charName = document.createElement("div");
      charName.classList.add("serihu-char");
      charName.textContent = character;
      bubble.appendChild(charName);
    }

    const text = document.createElement("div");
    text.classList.add("serihu-text");
    if (fontType) {
      text.classList.add(`type-${fontType}`);
    }
    text.textContent = dialogue;
    bubble.appendChild(text);

    dialogueContainer.appendChild(bubble);
    container.appendChild(dialogueContainer);
  }
}
