const Benchmark = require('benchmark');
const Portal = require('../dist/portal');
const artTemplate = require('./art-template');

const suite = new Benchmark.Suite();

const prt = `
<% for (var i = 0, l = @list.length; i < l; i ++) { %>
  <li>用户: <%== @list[i].user %>/ 网站：<%== @list[i].site %></li>
<% } %>
`;

const art = `
<% for (var i = 0, l = list.length; i < l; i ++) { %>
  <li>用户: <%== list[i].user %>/ 网站：<%== list[i].site %></li>
<% } %>
`;

const data = {
  list: []
};

for (var i = 0; i < 100; i++) {
  data.list.push({
    index: i,
    user: '<strong style="color:red">nuintun</strong>',
    site: 'https://github.com/nuintun',
    weibo: 'http://weibo.com/235679326',
    QQweibo: 'http://t.qq.com/nuintun'
  });
}

var prtRender = new Portal().compile(prt).render;
var artRender = artTemplate.compile(art, { debug: true, cache: false });

// add tests
suite
  .add('Portal:', function() {
    prtRender(data);
  })
  .add('artTemplate:', function() {
    artRender(data);
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log(
      '  Fastest is ' +
        this.filter('fastest')
          .map('name')
          .toString()
          .replace(/:.*/, '')
    );
  })
  .run();
