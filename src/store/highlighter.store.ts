// import Highlighter from 'web-highlighter';
// import { RenderPop } from '../components/Toolbar';

// // won't highlight pre&code elements
// export const highlighter = new Highlighter({
//     exceptSelectors: ['pre', 'code']
// });

// // add some listeners to handle interaction, such as hover
// highlighter
//     .on('selection:hover', ({ id }) => {
//         // display different bg color when hover
//         highlighter.addClass('highlight-wrap-hover', id);
//     })
//     .on('selection:hover-out', ({ id }) => {
//         // remove the hover effect when leaving
//         highlighter.removeClass('highlight-wrap-hover', id);
//     })
//     .on('selection:create', ({ sources }) => {
//         // sources = sources.map(hs => ({ hs }));
//         // // save to backend
//         // store.save(sources);
//     })
//     .on(Highlighter.event.CLICK, ({ id }) => {
//         console.log('click', id)
//     });



// // retrieve data from store, and display highlights on the website
// // store.getAll().forEach(
// //     // hs is the same data saved by 'store.save(sources)'
// //     ({ hs }) => highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
// // );


