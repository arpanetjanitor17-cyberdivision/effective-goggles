# Effective Goggles — Hangman site

This branch (gh-pages) contains a small Hangman game.

- index.html — the Hangman front page
- css/styles.css — styles
- js/app.js — game logic
- images/hangman1.svg … hangman8.svg — placeholder images

Behavior implemented per your request:
- Words in the list cannot contain letters h, t, c, b, i (validated when adding)
- Players may still guess those letters
- If the player consecutively guesses the letters b → i → t → c → h the game shows hangman6.svg and redirects to /pictogrammer.html
- 5 wrong guesses cause a normal loss (shows hangman6.svg)

Notes: pictogrammer.html is not modified. The redirect goes to /pictogrammer.html — ensure that file exists in the repository root or update the path in js/app.js if needed.
