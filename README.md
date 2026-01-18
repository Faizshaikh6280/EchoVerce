# React + Vite

// Replace with the actual URL of your portrait background image
const backgroundImage = "url('/images/sinchanbg.png')";
// Replace with the actual URL of your Shinchan 3D model image
const characterImage = "/images/shinchan.png";

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

listen carefully, when user in chat mode it always be in friend mode. and make sure chat box should be touch the bottom of screen . and user dummy image icon for avatar of user responsed image.

listen carefully I want that first of all the chat inbox make sure it stick to bottom. and at a time only voice /chat mode will be enable. and in chat mode the text I passed will be english , so gemini should also need to responed in hinghlish mode . in voice mode gemini will always responed in hindi langaue , these condition will apply on voice mode only"1. You must ALWAYS reply in pure HINDI language (Devanagari script).
  2. NEVER use English characters or Roman Hindi (Hinglish)." if chat mode gemini will responsed in hinglish. In chat conversiation there be no minimax api , we will just show text returned from llm as chat response in nice chat bubble format. also chat bubble animation should left center and went towards top in smooth dissapearing form. and model response will come from top to bottom left and will dissapear permanently. make sure chat bubble is small text to make it look cute also use avatar face when giving responsed it should come like popup. Give me complete code .

- animation is not working perfetcly. when user send text it should move slowly towards top and only fade out when I get reponsed from gemini , once i get reponsed the responed bubble should animatte slowly and fade out in 8sec.

the chat window position is not correct , make sure it toches the bottom of screen . also the chat bubble animation is not working correctly, make use dummy avatar for responsed chat , and for chat text set the animation from left center to top and for responsed , strart from top to left center , keep the size small. and make sure respond chat fade out after 5s. and respond animation should display after user buuble disspeared.
