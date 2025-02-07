import type { CharacterSettings } from '../types';

export class DialogueRenderer {
  constructor(private characters: CharacterSettings[]) {}

  render(source: string, el: HTMLElement): void {
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
        const [, position, character] = charMatch;
        if (position === "left") {
          leftCharacter = character;
        } else if (position === "right") {
          rightCharacter = character;
        }
        return;
      }

      this.renderDialogueLine(
        line,
        leftCharacter,
        rightCharacter,
        lastCharacter,
        currentContainer,
        dialogueContainer
      );
    });

    el.appendChild(dialogueContainer);
  }

  private renderComment(line: string, dialogueContainer: HTMLElement) {
    const commentText = line.trim().substring(1).trim();
    const commentBubble = document.createElement("div");
    commentBubble.classList.add("serihu-comment");

    const commentContent = document.createElement("div");
    commentContent.classList.add("serihu-comment-text");
    commentContent.textContent = commentText;

    commentBubble.appendChild(commentContent);
    dialogueContainer.appendChild(commentBubble);
  }

  private renderDialogueLine(
    line: string,
    leftCharacter: string,
    rightCharacter: string,
    lastCharacter: string,
    currentContainer: HTMLElement | null,
    dialogueContainer: HTMLElement
  ): void {
    const match = line.match(/^([<>]{1,2}|\(|\))\s*(?::([a-zA-Z0-9_-]+))?\s(.+)$/);
    if (!match) return;

    const [, prefix, fontType, dialogue] = match;
    const position: "left" | "right" = prefix.includes(">") || prefix === ")" ? "right" : "left";
    const bubbleTypeClass = this.getBubbleTypeClass(prefix);
    const character = position === "right" ? rightCharacter : leftCharacter;
    
    // ... 残りの処理ロジック
  }

  private getBubbleTypeClass(prefix: string): string {
    if (prefix === "<<" || prefix === ">>") return "rough";
    if (prefix === "(" || prefix === ")") return "thout";
    return "";
  }
}