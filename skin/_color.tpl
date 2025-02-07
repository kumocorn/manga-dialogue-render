/* {{name}} - {{id}} */
.character-container-left.{{id}} .serihu-bubble,
.character-container-left.{{id}} .serihu-bubble.thought::before,
.character-container-left.{{id}} .serihu-bubble.thought::after,
.character-container-right.{{id}} .serihu-bubble,
.character-container-right.{{id}} .serihu-bubble.thought::before,
.character-container-right.{{id}} .serihu-bubble.thought::after {
  background-color: var(--{{id}}-color);
}

.character-container-left.{{id}} .serihu-bubble::after,
.character-container-right.{{id}} .serihu-bubble::after {
  border-color: var(--{{id}}-color) transparent transparent;
}

.character-container-left.{{id}} .serihu-char,
.character-container-right.{{id}} .serihu-char {
  color: var(--{{id}}-color);
}