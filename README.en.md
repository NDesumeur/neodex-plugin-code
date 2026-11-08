# Code secret (Secret Code)

The colour-code deduction game: the computer hides a combination of 4 colours, and you have 10 tries to find it using the clues given after each guess.

*Version française : [README.md](README.md)*

## How to play

1. Build your guess: **click a colour** in the palette, or press keys **1 to 6**. Pegs fill from left to right.
2. **Click a placed peg** to remove it, or **Backspace** to erase the last one.
3. **Enter** or the Validate button submits the row (it needs 4 pegs).

## The clues

Next to each submitted row:

- a **black peg** for each colour that is right **and in the right place**;
- a **white peg** for each colour that is right but **placed elsewhere**.

The clues do not say which pegs they refer to: you deduce that, row after row. Four black pegs: the code is found.

## Rules

- The code uses 6 possible colours.
- **Duplicate colours allowed** (checked by default): the same colour can appear several times in the code. Uncheck it for an easier game with 4 different colours; changing the option starts a new game.
- After 10 unsuccessful tries, the game is lost. Either way, the code is revealed at the bottom; a click starts again.

## Statistics

The Records panel shows your **games won** out of games played, your **average tries** per win and your **best game** (the fewest tries).

## Data and sync

Your games won, tries and your duplicates choice are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Code secret → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
