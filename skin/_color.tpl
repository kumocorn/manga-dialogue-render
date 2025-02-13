/* {{name}} - characterID-{{id}} */
.character-container-left.characterID-{{id}} .serihu-bubble,
.character-container-left.characterID-{{id}} .serihu-bubble.thought::before,
.character-container-left.characterID-{{id}} .serihu-bubble.thought::after,
.character-container-right.characterID-{{id}} .serihu-bubble,
.character-container-right.characterID-{{id}} .serihu-bubble.thought::before,
.character-container-right.characterID-{{id}} .serihu-bubble.thought::after {
  background-color: var(--characterID-{{id}}-color);
}

.character-container-left.characterID-{{id}} .serihu-bubble.uniflash,
.character-container-right.characterID-{{id}} .serihu-bubble.uniflash {
  background: radial-gradient(var(--characterID-{{id}}-color), var(--characterID-{{id}}-color) 55% 50%,transparent 65%);
}

.character-container-left.characterID-{{id}} .serihu-bubble.uniflash::before,
.character-container-right.characterID-{{id}} .serihu-bubble.uniflash::before {
  background: radial-gradient(var(--characterID-{{id}}-color), var(--characterID-{{id}}-color) 50%,transparent 65%);
}

.character-container-left.characterID-{{id}} .serihu-bubble::after,
.character-container-right.characterID-{{id}} .serihu-bubble::after {
  border-color: var(--characterID-{{id}}-color) transparent transparent;
}

.character-container-left.characterID-{{id}} .serihu-char,
.character-container-right.characterID-{{id}} .serihu-char {
  color: var(--characterID-{{id}}-color);
}

