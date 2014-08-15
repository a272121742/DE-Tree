DE-Tree使用说明
=============

## TreeManager

引入了全局管理类TreeManager，可以通过他预定义叔以及查找树。对应的API有：

0. TreeManager.defined(treeName);
0. TreeManager.get(treeName);

## Tree-Helper

定义了全局的Tree-Helper，使用的时候需要参数`name`:

```html
{{#Tree name="mytree"}}

{{/Tree}}
<!--或者-->
{{> Tree name="othertree"}}
```

## 使用步骤

### 先配置

配置的内容从内存中定义、存储和获取，因此Tree-Helper依赖配置的先定义。

#### 定义树

```javascript
var mytree = TreeManager.defined('mytree');
```

#### 绑定数据源

接着我们就可以绑定数据源了，数据源是可变动的，因此我们可以使用此API切换数据源。

```javascript
mytree.bindSource({
  name : 'root',
  expand : true,
  children : [
    {name : 'node1'},
    {name : 'node2'}
  ]
});
```

#### 启用超链接

默认的，我们的树形控件是不启用超链接的，除非你手动启用。

```javascript
mytree.enabledLink();
```

只有启用超链接后，才能绑定单击事件：

```javascript
mytree.link = function(event, template){
  console.log('this指向每一个节点对象',this);
  console.log('event指向jQuery.Event对象');
  console.log('template指向当前模版的实例');
};
```

#### 启用复选框

默认的树形控件不具备复选框功能，我们可以启用它。

```javascript
mytree.enabledCheckbox();
```

#### 选择插件

目前，给树形控件提供了三个插件：`search`、`expand`、`collapse`，你可以通过配置选择性启用，默认全部不启用：

```javascript
mytree.usePlugins(['search','expand','collapse']);
```

### 再使用

配置完成后，我们就可以直接在模版中使用此树形控件了：

```html
{{> Tree name="mytree"}}
```

值得注意的是，这里的name必须和你定义过的一致，否则将无法渲染。

### Node属性

节点的基本属性就是`name`和`children`，name提供了节点的展示名称，而children提供了是否存在子节点。除此之外，节点还拥有如下属性：

#### expand

如果希望节点默认是展开的，那么可以配置`expand : true`在你的节点对象中。当然，这种配置必须是连续的，如果你的子节点配置了展开，但父亲节点没有配置展开，你依然没办法看到展示的全部。

#### id

`id`因为具备着唯一性，所以他将成为节点复选框的`value`值，如果希望选中的复选框有意义，你需要配置此项然后找到他。

#### href

如果配置此项并且启用过链接，那么他将替换到`a`标签的`href`属性上，这个含义非常容易理解。

#### 其他属性

你可以在节点上附带其他属性，但至少目前为止以上属性都是有程序意义的。你所添加的属性仅仅具备程序意义，在`linkClick`函数中的`this`对象上都可以获取。