# Ludo Webgame
#### Author: Bocaletto Luca

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Anime.js](https://img.shields.io/badge/Anime.js-FF2D20?style=flat-square)

[![Test Online](https://img.shields.io/badge/Test%20Online-Click%20Here-brightgreen?style=for-the-badge)](https://bocaletto-luca.github.io/Ludo/)

---

## Description

**Ludo Webgame** is a complete web-based version of the classic board game Ludo. This project faithfully replicates the original game rules and board layout using a 15×15 grid (each cell 40×40 pixels). 

Key features include:
- **Setup Screen:**  
  Choose the number of players (2 to 4) and specify whether each player is Human or a Bot. Colors are automatically assigned in order: **Red**, **Blue**, **Yellow**, and **Green**.

- **Original Board Layout:**  
  The board is rendered on an HTML5 canvas with a 15×15 grid (600×600 pixels). It includes:
  - **Home Areas:** Located at the four corners for each player's tokens (the Base).
  - **Common Path:** A 52-cell sequence (defined by an array of grid coordinates) forming the main track.
  - **Safe Squares:** Certain positions (indices 0, 13, 26, and 39 on the common path) are designated as safe zones (tokens on these cells cannot be captured).
  - **Finishing Lanes:** Each player has 6 finishing cells that move tokens from the common path to the center (the Final Home at grid cell (7,7)).

- **Gameplay Mechanics:**  
  - **Token Movement:**  
    Tokens start with a progress value of **–1** (in the Base). A token can only enter the board (progress becomes 0) if a 6 is rolled. As tokens move, their progress updates:
    - **0 to 51:** Token is on the common path.
    - **52 to 56:** Token is in the finishing lane.
    - **57:** Token has reached the goal.
  - **Dice and Turns:**  
    Rolling a die (1–6) determines token movement. A roll of 6 lets the player either bring a token out of the Base (if available) or move an already–active token; plus, rolling a 6 awards an extra turn.
  - **Captures:**  
    When a token lands on a cell occupied by an opponent (and that cell is not a safe square), the opponent’s token is sent back to its Base.
  - **Turn Management:**  
    If no valid moves are available, the turn is skipped. Bots execute their turn automatically.

- **Multiplayer & Bot Support :robot:**  
  Both human players and bots are supported. Bots automatically roll the die and choose a random valid move after a short delay. The control panel notifies you of whose turn it is, the die outcome, and logs game events.

---

## Technical Details

- **Technologies Used:**
  - **HTML5, CSS3 & JavaScript** – Build the user interface and game logic.
  - **Canvas API** – Render the board, grid, and tokens dynamically.
  - **Bootstrap 5** – Provide a responsive layout and UI components (setup screen, modals, control panel).
  - **Anime.js** – Add subtle animations (e.g., token movement effects).

- **Code Structure:**
  - The global `game` object tracks players, the current turn, die result, and token states.
  - The board is drawn on a 15×15 grid:
    - `basePositions` defines the coordinates for each player’s Base.
    - `pathCoordinates` defines the 52 cells in the common path.
    - `finishingLanes` define the 6 finishing cells leading to the center.
  - A continuous game loop updates the canvas in real time.
  - The control panel displays the current turn, die result, and a log of events.

---

## How to Play

1. **Setup the Game:**
   - Open the `index.html` file in your web browser.
   - In the **Setup Screen**, choose the number of players (2–4) and select whether each player is **Human** or **Bot**.
   - Click **"Start Game"** to begin.

2. **Game Play:**
   - The board shows the Base areas, common path, finishing lanes, and the Final Home at the center.
   - Use the control panel on the right:
     - **Roll Dice:** Click to roll the die.
     - If a valid move is available (for example, if you roll a 6 and a token in the Base can move out), eligible tokens will be highlighted (with a golden border).
     - As a human player, click on a highlighted token to move it. Bots will move automatically.
     - If no valid moves exist, the turn is skipped.
   - The game continues until one player moves all four tokens to the Final Home (progress 57), at which point a victory modal is displayed.

3. **Feedback and Messages:**
   - All game events (dice rolls, token moves, captures, extra turns, turn changes) are logged in the control panel.
   - Use the **"Instructions"** button to view the game rules at any time.

---

## Usage

To play the Ludo Webgame locally:

1. Clone this repository:

   ```bash
   git clone https://github.com/bocaletto-luca/ludo.git
2. Start Webserver Example Apache 2 and open index.html in Browser Web

#### Enjoy Game - By Bocaletto Luca

#### License: GPLv3
