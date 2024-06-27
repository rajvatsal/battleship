import populateGrid from "./DisplayGameboard.js";
import pubsub from "./Pubsub.js";

const $ = document.querySelector.bind(document);
const leftBoard = $(".gameboards__left__board");
const rightBoard = $(".gameboards__right__board");

populateGrid(leftBoard);
populateGrid(rightBoard);
