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
  * return: { inject: Function, eject: Function, compile: Function }
    * inject(name: string, helper: Function): inject helper
      * name: the name of helper
      * helper: helper method
    * eject(name: string): eject helper
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

// Inject helper
portal.inject('link', function(href, text) {
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

// Eject helper
portal.eject('link');
```

### Benchmark

> [speed](https://nuintun.github.io/portal/tests/speed.html)
>
> [render](https://nuintun.github.io/portal/tests/render.html)
>
> [compile](https://nuintun.github.io/portal/tests/compile.html)

### License

[MIT](LICENSE)

[david-image]: http://img.shields.io/david/dev/nuintun/portal.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/portal?type=dev
