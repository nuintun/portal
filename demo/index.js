var view = `
<!-- 弹窗标题栏 -->
<div class="ui-dialog-header">
  <!-- 弹窗标题 -->
  <div id="<%= @labelledby %>"
    class="ui-dialog-title"
    title="<%= @title.title %>">
    <%== @title.value %>
  </div>
  <!-- 弹窗控制栏 -->
  <div class="ui-dialog-controls">
    <% @controls.forEach(function(control, index) { %>
    <a href="javascript:;"
      class="<%= control.className %>"
      title="<%= control.title || control.value %>"
      data-role="control"
      data-action-id="<%= index %>"
      <%= control.autofocus ? ' autofocus' : '' %>>
      <%== :link(control.value) %>
    </a>
    <% }); %>
  </div>
</div>
<!-- 弹窗内容 -->
<div id="<%= @describedby %>"
  class="ui-dialog-content"
  style="width: <%= @width %>; height: <%= @height %>;">
  <%== @content %>
</div>
<!-- 弹窗按钮 -->
<div class="ui-dialog-buttons">
  <% @buttons.forEach(function(button, index) { %>
  <button type="button"
    class="<%= button.className %>"
    title="<%= button.title || button.value %>"
    data-role="action" data-action-id="<%= index %>"
    <%= button.autofocus ? ' autofocus' : '' %>>
    <%== button.value %>
  </button>
  <% }); %>
</div>

`

var portal = new Portal();

console.log(portal.compile(view).compiler.toString());
