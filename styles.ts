import { MangaDialogueSettings } from "./settings";

export function updateCharacterStyles(settings: MangaDialogueSettings) {
  const styleElement = document.getElementById("manga-dialogue-styles") || createStyleElement();
  
  let styles = `:root {\n`;
  settings.characters.forEach((char) => {
    styles += `  --characterID-${char.id}-color: ${char.color};\n`;
  });
  styles += `}\n`;

  settings.characters.forEach((char) => {
    styles += `
    .character-container-left.characterID-${char.id} .serihu-bubble,
    .character-container-right.characterID-${char.id} .serihu-bubble {
      background-color: var(--characterID-${char.id}-color);
    }
    .character-container-left.characterID-${char.id} .serihu-char,
    .character-container-right.characterID-${char.id} .serihu-char {
      color: var(--characterID-${char.id}-color);
    }
    `;
  });

  styleElement.textContent = styles;
}

function createStyleElement(): HTMLStyleElement {
  const style = document.createElement("style");
  style.id = "manga-dialogue-styles";
  document.head.appendChild(style);
  return style;
}
