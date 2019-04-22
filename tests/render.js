/**
 * @module render
 * @license MIT
 * @version 2018/05/12
 */

const Portal = require('../dist/portal');

const template = `
<% @items.forEach(function(item, index) { %>
  <img src="<%= item.src %>" alt="image" />
  <%== :link(item.href, 'download-' + index) %>
<% }) %>
`;

// Create a new instance
const portal = new Portal({ debug: true });

// Inject helper
portal.inject('link', (href, text) => {
  return `<a href="${href}" title="${text}">${text}</a>`;
});

// Compile template string
const view = portal.compile(template);

// Render view
const html = view.render({
  items: [
    { src: 'a.jpg', href: '/download/a.jpg' },
    { src: 'b.jpg', href: '/download/b.jpg' },
    { src: 'c.jpg', href: '/download/c.jpg' }
  ]
});

html && console.log(html);

// Eject helper
portal.eject('link');
