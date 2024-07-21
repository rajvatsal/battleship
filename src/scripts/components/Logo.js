import iconSvg from "./LogoIconSvg.js";

const c = document.createElement.bind(document);

export default function getLogo() {
	const text = c("h1");
	text.textContent = "Battleship";
	const icon = c("span");
	icon.innerHTML = iconSvg;

	const logo = c("div");
	logo.classList.add("game-logo");
	logo.append(icon, text);
	return logo;
}
