# [WHAC A MOLE](https://youtu.be/ej8SatOj3V4)
- Coding Tutorial: https://youtu.be/ej8SatOj3V4
- Demo: https://imkennyyip.github.io/whac-a-mole/

In this tutorial, you will learn to create the whac a mole game with html, css, and javascript. Specifically, you will learn how to code the game using html5 canvas. 

While creating this mario themed whac-a-mole game, you will learn how to use javascript to set the game board by editing dom elements, add click handlers to whack the mole, and randomly spawn the mole and piranha plant.

![whac-a-mole-sample](https://user-images.githubusercontent.com/78777681/221445356-31d1e159-9e71-43cb-8d38-a6988b81051d.png)

## Audio files

Create an `audio` folder beside `mole.js`, then add these `.mp3` files:

| File | Effect |
| --- | --- |
| `whack-hit.mp3` | Hit the mole |
| `whack-miss.mp3` | Whack an empty tile |
| `plant-rise.mp3` | Plant appears |
| `mole-dizzy.mp3` | Mole is stunned |
| `mole-appear.mp3` | Mole appears |
| `plant-hit.mp3` | Hit the plant |
| `game-over.mp3` | Game over |
| `background-music.mp3` | Looping background music |

The sound paths and event locations are configured at the top of `mole.js`. Background music starts after the first click because browsers usually block autoplay.
