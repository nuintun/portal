# portal

> A micro and fast html template engine
>
> [![Dependencies][david-image]][david-url]

### API

* new Portal(options: Object)
  * params: options { open: string, open: string, debug: boolean, strict: boolean }
    * open: template open tag
    * close: template close tag
    * debug: debug mode
    * strict: strict mode
  * return: { register: Function, unregister: Function, compile: Function }
    * register(name: string, helper: Function): register helper
      * name: the name of helper
      * helper: helper method
    * unregister(name: string): unregister helper
      * name: the name of helper
    * compile(template: string): compile a template string
      * template: template string
        * `:` call helper
        * `@` read template data property
        * `=` output html escape string
        * `==` output origin string
      * return: { render: Function }
        * render(data: Object): render function
          * data: the template data

### Example

template:

```html
<% @items.forEach(function(item, index) { %>
  <img src="<%= item.src %>" alt="image" />
  <%== :link(item.href, 'download-' + index) %>
<% }) %>
```

usage:

```js
// Create a new instance
var portal = new Portal();

// Register helper
portal.register('link', function(href, text) {
  return '<a href="' + href + '" title="' + text + '">' + text + '</a>';
});

// Compile template string
var view = portal.compile(template);

// Render view
console.log(
  view.render({
    items: [
      { src: 'a.jpg', href: '/download/a.jpg' },
      { src: 'b.jpg', href: '/download/b.jpg' },
      { src: 'c.jpg', href: '/download/c.jpg' }
    ]
  })
);

// Unregister helper
portal.unregister('link');
```

### Benchmark

> [compile](https://nuintun.github.io/portal/tests/compile.html)
>
> [speed](https://nuintun.github.io/portal/tests/speed.html)

### License

[MIT](LICENSE)

[david-image]: http://img.shields.io/david/dev/nuintun/portal.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/portal?type=dev
