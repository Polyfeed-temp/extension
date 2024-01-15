import {AnnotationTag} from "../types";

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
const strengthIcon =
  require("../assets/tag_icons/inverted/Strength_Col_Inv.svg")
    .default as string;
const weaknessIcon =
  require("../assets/tag_icons/inverted/Weakness_Col_Inv.svg")
    .default as string;
const actionItemIcon =
  require("../assets/tag_icons/inverted/Action_Col_Inv.svg").default as string;
const confusedIcon =
  require("../assets/tag_icons/inverted/Confused_Col_Inv.svg")
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

export const annotationTagsIcons: {[key in AnnotationTag]: string} = {
  Strength: strengthIcon,
  Weakness: weaknessIcon,
  "Action Item": actionItemIcon,
  Confused: confusedIcon,
  Other: otherIcon,
  ChatGPT: otherIcon,
};

const green = require("../assets/emoticons/Green.svg").default as string;

const yellow = require("../assets/emoticons/Yellow.svg").default as string;
const red = require("../assets/emoticons/Red.svg").default as string;
const orange = require("../assets/emoticons/Orange.svg").default as string;

const greenGrey = require("../assets/emoticons/Grey_Green.svg")
  .default as string;
const yellowGrey = require("../assets/emoticons/Grey_Yellow.svg")
  .default as string;
const redGrey = require("../assets/emoticons/Grey_Red.svg").default as string;
const orangeGrey = require("../assets/emoticons/Grey_Orange.svg")
  .default as string;

export const emoticons: {[key: string]: string} = {
  red: red,
  orange: orange,

  yellow: yellow,
  green: green,
};

export const emoticonsInversed: {[key: string]: string} = {
  red: redGrey,
  orange: orangeGrey,
  yellow: yellowGrey,
  green: greenGrey,
};
export const chevronIconDown = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);
export const chevronIconUp = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);
export const leftChevron = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

export const rightChevron = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

export const xMarkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const DeleteIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

export const EditIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    />
  </svg>
);

export const CancelIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);
