# portal

>A micro html template engine

>[![Dependencies][david-image]][david-url]

### API

* new Portal(options: Object)
  * params: options { open: Boolean, open: String }
    * open: template open tag
    * close: template close tag
  * return: { addHelper: Function, removeHelper: Function, compile: Function }
    * addHelper(name: String, helper: Function): add helper
      * name: the name of helper
      * helper: helper method
    * removeHelper(name: String): remove helper of the name
      * name: the name of helper
    * compile(template: String): compile a template string
      * template: template string
        * ```:``` call helper
        * ```@``` read variable
        * ```=``` output html escape variable
        * ```==``` output origin variable
      * return: { render: Function }
        * render(data: Object): render function
          * data: the template data

### Example

template:
```html
<% @items.forEach(function(item) { %>
  <img src="@item.src" alt="image" />
  <%== :link(item.href, 'download') %>
<% } %>
```

usage:
```js
// Create a new instance
var portal = new Portal();

// Add helper
portal.addHelper('link', function(href, text) {
  return '<a href="' + href + '" title="' + text + '">' + text + '</a>';
});

// Compile template string
var view = portal.compile(template);

// Render view
console.log(view.render({
  items: [
    { src: 'a.jpg', href: '/download/a.jpg' },
    { src: 'b.jpg', href: '/download/b.jpg' },
    { src: 'c.jpg', href: '/download/c.jpg' }
  ]
}));
```

### License

[MIT](LICENSE)

[david-image]: http://img.shields.io/david/nuintun/portal.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/portal
