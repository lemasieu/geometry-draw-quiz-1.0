# Geometry Draw Quiz 1.0

An interactive geometry learning tool where users can drag points on a grid to visually construct shapes and verify geometric conditions in real-time. Built with vanilla HTML, CSS, and JavaScript – no external libraries.

## 🚀 Live Demo

[https://xn--msiu-goa8b.vn/github/geometry-draw-quiz-1.0](https://xn--msiu-goa8b.vn/github/geometry-draw-quiz-1.0)

## ✨ Features

- **60+ Geometry Problems** – Covers right triangles, isosceles triangles, right-isosceles triangles, scalene triangles, parallelograms, rectangles, isosceles trapezoids, rhombuses, and squares. Each problem has a unique set of conditions to verify.
- **Interactive Grid** – Points snap to a 10×10 grid. Drag any vertex or midpoint with your mouse.
- **Randomised Labels** – Each time a new question is loaded, vertices are randomly assigned letters from predefined sets (e.g., A,B,C,D or E,F,G,H), making every session feel fresh.
- **Real‑time Verification** – Press “Check” to evaluate all conditions (Pythagorean theorem, equality of sides, midpoint checks, etc.) using squared distances to avoid floating‑point errors.
- **Smart Midpoint Handling** – Midpoints are rounded to the nearest grid cell, so users don’t have to place them exactly on a fractional coordinate.
- **Statistics Dashboard** – Tracks total attempts and correct answers, displaying the success rate as you progress.
- **Lock‑on‑Success** – Once a problem is solved correctly, the “Check” and “Reset” buttons are disabled to prevent tampering. Dragging any point automatically unlocks them.
- **Dark Theme** – Optimised for late‑night study sessions.

## 🛠️ Tech Stack

- **HTML5** – Structure
- **CSS3** – Dark theme, responsive layout, SVG styling
- **Vanilla JavaScript** – All logic, drag‑and‑drop, evaluation engine
- **JSON** – Problem database

No frameworks, no dependencies – just a single‑page application.

## 📁 Project Structure

```
geometry-draw-quiz/
├── index.html        # Main HTML
├── style.css         # Dark theme & grid styling
├── script.js         # Core logic (drag, evaluate, stats)
├── data.json         # 60 geometry questions
└── README.md         # This file
```


## 🧩 How It Works

1. **Load a Problem** – On page load or when you click “New Question”, a random problem is selected from `data.json`.
2. **Place Points** – Four vertices (1,2,3,4) and optional midpoints (M,N) appear on the grid. You can drag any point to a new grid cell.
3. **Verify** – Click “Check”. The engine evaluates all conditions:
   - **Pythagorean checks** using squared distances (`dist2`) for exact integer comparisons.
   - **Equality checks** for sides or diagonals.
   - **Midpoint validation** using `Math.round()` on the average of the two endpoints’ coordinates.
4. **Feedback** – A green message “All correct!” or red error messages pinpoint which condition failed.
5. **Statistics** – Your success rate is updated after every check.
6. **Lock** – On success, both “Check” and “Reset” are disabled until you drag a point or load a new question.

## 🖥️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lemasieu/geometry-draw-quiz-1.0.git
   ```

2. Navigate to the project folder:
   ```bash
   cd geometry-draw-quiz-1.0
   ```
3. Open `index.html` in your browser.
For the best experience, serve it with a local web server (e.g., VS Code Live Server, Python `http.server`, or Node serve).

## 📝 Adding New Questions

You can extend `data.json` by adding new objects with the following structure:
```json
{
  "id": "Q61",
  "label": "Cho tam giác 123 đều, đường trung tuyến 1M",
  "vertices": [1,2,3],
  "medians": [{"point":"M","endpoints":[2,3]}],
  "conditions": [
    {"expr":"dist2(1,2)==dist2(2,3) && dist2(2,3)==dist2(1,3)", "message":"Tam giác không đều"},
    {"expr":"isMidpoint('M',2,3)", "message":"M không phải là trung điểm"}
  ]
}
```

- `vertices`: Array of numbers representing the shape’s corners.
- `medians`: Array of objects, each with a `point` (e.g., `"M"`) and its `endpoints` (two vertices it connects).
- `conditions`: Array of `{expr, message}` pairs. The `expr` is a JavaScript expression that will be evaluated with functions `dist(a,b)`, `dist2(a,b)`, and `isMidpoint(m,a,b)` available in scope.

## 🧪 Evaluation Functions

Inside `data.json`, you can use:

- `dist(a,b)` – Euclidean distance (with Math.hypot).
- `dist2(a,b)` – Squared distance (exact integer arithmetic).
- `isMidpoint(m,a,b)` – Checks if m lies exactly on the rounded midpoint of a and b.

All expressions are evaluated inside a sandboxed function that references the current points array.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more geometry problems.
- Improve the UI/UX.
- Optimise the evaluation engine.
- Translate the interface into other languages.

Please open an issue or submit a pull request.

## 📄 License

This project is open source and available under the MIT License. Made by Deepseek with my idea.
