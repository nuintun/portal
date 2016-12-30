const Benchmark = require('benchmark');
const Portal = require('../dist/portal');
const artTemplate = require('./art-template')

const suite = new Benchmark.Suite;

const art = `
<% for (var i = 0, l = list.length; i < l; i ++) { %>
  <li>用户: <%== list[i].user %>/ 网站：<%== list[i].site %></li>
<% } %>
`;

const prt = `
<% for (var i = 0, l = @list.length; i < l; i ++) { %>
  <li>用户: <%== @list[i].user %>/ 网站：<%== @list[i].site %></li>
<% } %>
`;

const data = {
  list: []
};

for (var i = 0; i < 100; i++) {
  data.list.push({
    index: i,
    user: '<strong style="color:red">糖饼</strong>',
    site: 'http://www.planeart.cn',
    weibo: 'http://weibo.com/planeart',
    QQweibo: 'http://t.qq.com/tangbin'
  });
};

var artRender = artTemplate.compile(art);
var prtRender = new Portal().compile(prt).render;

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
    console.log('  Fastest is ' + this.filter('fastest').map('name').toString().replace(/:.*/, ''));
  })
  .run();
