import { AnnotationTag } from "../types";

// const strengthIcon = require("../assets/tag_icons/coloured/Strength_Col_Pos.svg")
//     .default as string;
// const weaknessIcon = require("../assets/tag_icons/coloured/Weakness_Col_Pos.svg")
//     .default as string;
// const actionItemIcon = require("../assets/tag_icons/coloured/Action_Col_Pos.svg")
//     .default as string;
// const confusedIcon = require("../assets/tag_icons/coloured/Confused_Col_Pos.svg")
//     .default as string;
// const otherIcon = require("../assets/tag_icons/coloured/Other_Col_Pos.svg")
//     .default as string;
const strengthIcon = require("../assets/tag_icons/inverted/Strength_Col_Inv.svg")
    .default as string;
const weaknessIcon = require("../assets/tag_icons/inverted/Weakness_Col_Inv.svg")
    .default as string;
const actionItemIcon = require("../assets/tag_icons/inverted/Action_Col_Inv.svg")
    .default as string;
const confusedIcon = require("../assets/tag_icons/inverted/Confused_Col_Inv.svg")
    .default as string;
const otherIcon = require("../assets/tag_icons/inverted/Other_Col_Inv.svg")
    .default as string;

// const strengthIcon = require("../assets/tag_icons/BlackandWhite/Strength_Mono_Pos.svg")
//     .default as string;
// const weaknessIcon = require("../assets/tag_icons/BlackandWhite/Weakness_Mono_Pos.svg")
//     .default as string;
// const actionItemIcon = require("../assets/tag_icons/BlackandWhite/Action_Mono_Pos.svg")
//     .default as string;
// const confusedIcon = require("../assets/tag_icons/BlackandWhite/Confused_Mono_Pos.svg")
//     .default as string;

// const strengthIcon = require("../assets/tag_icons/Grey/Strength_Grey_Pos.svg")
//     .default as string;
// const weaknessIcon = require("../assets/tag_icons/Grey/Weakness_Grey_Pos.svg")
//     .default as string;
// const actionItemIcon = require("../assets/tag_icons/Grey/Action_Grey_Pos.svg")
//     .default as string;
// const confusedIcon = require("../assets/tag_icons/Grey/Confused_Grey_Pos.svg")
//     .default as string;


export const annotationTagsIcons: { [key in AnnotationTag]: string } = {
    Strength: strengthIcon,
    Weakness: weaknessIcon,
    "Action Item": actionItemIcon,
    Confused: confusedIcon,
    Other: otherIcon,
};

const green = require("../assets/emoticons/Green.svg").default as string;

const yellow = require("../assets/emoticons/Yellow.svg").default as string;
const red = require("../assets/emoticons/Red.svg").default as string;
const orange = require("../assets/emoticons/Orange.svg").default as string;

const greenGrey = require("../assets/emoticons/Grey_Green.svg").default as string;
const yellowGrey = require("../assets/emoticons/Grey_Yellow.svg").default as string;
const redGrey = require("../assets/emoticons/Grey_Red.svg").default as string;
const orangeGrey = require("../assets/emoticons/Grey_Orange.svg").default as string;


export const emoticons: { [key: string]: string } = {
    red: red,
    orange: orange,

    yellow: yellow,
    green: green,
};

export const emoticonsInversed: { [key: string]: string } = {
    red: redGrey,
    orange: orangeGrey,
    yellow: yellowGrey,
    green: greenGrey,
};