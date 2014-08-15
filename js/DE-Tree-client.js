var TreeFactory = (function(){
  var TreeSession = new ReactiveDict();
  var TreeConstructor = function(){
    this.plugins = {
      expand : false,
      collapse : false,
      search : false
    };
  };
  TreeConstructor.prototype.bindSource = function(dataSource){
    TreeSession.set('dataSource', dataSource);
  };
  TreeConstructor.prototype.__getSource__ = function(){
    return TreeSession.get('dataSource');
  };
  TreeConstructor.prototype.enabledLink = function(){
    TreeSession.set('enabledLink', true);
  };
  TreeConstructor.prototype.disabledLink = function(){
    TreeSession.set('enabledLink', false);
  };
  TreeConstructor.prototype.linkStatus = function(){
    return TreeSession.get('enabledLink') ? 'link' : 'text';
  };
  TreeConstructor.prototype.getChecked = function(){
    return TreeSession.get('checked');
  };
  TreeConstructor.prototype.__setChecked__ = function(checkedArray){
    TreeSession.set('checked', checkedArray);
  };
  TreeConstructor.prototype.enabledCheckbox = function(){
    TreeSession.set('enabledCheckbox', true);
  };
  TreeConstructor.prototype.disabledCheckbox = function(){
    TreeSession.set('enabledCheckbox', false);
  };
  TreeConstructor.prototype.isEnabledCheckbox = function(){
    return TreeSession.get('enabledCheckbox');
  };
  TreeConstructor.prototype.usePlugins = function(pluginArray){
    var self = this;
    _.each(pluginArray, function(plugin){
      self.plugins[plugin] = true;
    });
  };
  return {
    createTree : function(){
      return new TreeConstructor();
    }
  };
})();

TreeManager = (function(){
  var trees = [];
  function TreeManagerConstructor(){};
  TreeManagerConstructor.prototype.defined = function(name){
    return trees[name] = TreeFactory.createTree();
  };
  TreeManagerConstructor.prototype.get = function(name){
    return trees[name];
  }
  return new TreeManagerConstructor();
})();

var Tree = UI.Component.extend({
  __helperHost : true ,
  init : function(){
    var name = this.get('name');
    var mytree = TreeManager.get(name);
    var linkStatus = mytree.linkStatus();
    if(!mytree){
      throw new Meteor.Error(10000, '树形控件未定义', '未找到名为' + name + '的树形控件，请先定义！');
    }
    this.helpers({
      children : function(){
        return [mytree.__getSource__()];
      }
    });
    var linkClickHandle = function(e, t){};
    if(mytree.linkClick){
      linkClickHandle = mytree.linkClick;
      delete mytree.linkClick;
    }
    this.events({
      'click li.tree-node > span.tree-link > a[href]' : function(e,t){
        linkClickHandle.call(this, e, t);
      },
      'click li.tree-node > span.tree-icon' : function(e){
        var span = $(e.currentTarget);
        var ul = span.siblings('ul.tree-root');
        var li = span.parent('li.tree-node');
        // 严格判断：是否有子节点
        if(ul.children().length > 0){
          if(span.hasClass('glyphicon-folder-close')){
            span.removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');
            ul.slideDown('slow', function(){
              li.removeClass('node-collapse').addClass('node-expand');
            });
          }else{
            span.removeClass('glyphicon-folder-open').addClass('glyphicon-folder-close');
            ul.slideUp('slow', function(){
              li.removeClass('node-expand').addClass('node-collapse');
            });
          }
        }
        return false;
      },
      'click li.tree-node > span.tree-checkbox > :checkbox' : function(e){
        function changeParentCheckedStat(ul){
          if(ul && ul[0]){
            /*
             *  1. 如果兄弟节点都“未选中”，父节点改为“未选中”状态
             *  2. 如果兄弟节点有选中，但未全部选中，父节点改为“半选中”状态
             *  3. 如果兄弟节点全部选中，父节点改为“已选中状态”
             */
            if(ul.find(':checked').length === 0){
              ul.siblings('span.tree-checkbox').find(':checkbox').prop('checked', false).prop('indeterminate', false);
            }else if(ul.find(':checked').length < ul.find(':checkbox').length){
              ul.siblings('span.tree-checkbox').find(':checkbox').prop('checked', false).prop('indeterminate', true);
            }else if(ul.find(':checked').length === ul.find(':checkbox').length){
              ul.siblings('span.tree-checkbox').find(':checkbox').prop('checked', true).prop('indeterminate', false);
            }
            changeParentCheckedStat(ul.parents('ul.tree-root:eq(0)'));
          }
          return;
        };
        var checkbox = $(e.currentTarget);
        var checked = checkbox.prop('checked');
        var children = checkbox.parent('span.tree-checkbox').siblings('ul.tree-root').find(':checkbox');
        children.prop('checked', checked).prop('indeterminate', false);
        changeParentCheckedStat(checkbox.parents('ul.tree-root:eq(0)'));

        var tree = checkbox.parents('div.treeview');
        var checkedArray = jQuery.makeArray(tree.find('input:checkbox:checked[value]').map(function(){
          return $(this).val();
        }));
        mytree.__setChecked__(checkedArray);
      },
      'click button.exapndAll' : function(e){
        $('div.treeview span.glyphicon-folder-close ~ ul.tree-root').slideDown('slow', function(){
          $(this).siblings('span.glyphicon-folder-close').removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');
          $(this).parent('li.tree-node').removeClass('node-collapse').addClass('node-expand');
        });
        return false;
      },
      'click button.collapseAll' : function(e){
        $('div.treeview span.glyphicon-folder-open ~ ul.tree-root').slideUp('slow', function(){
          $(this).siblings('span.glyphicon-folder-open').removeClass('glyphicon-folder-open').addClass('glyphicon-folder-close');
          $(this).parent('li.tree-node').removeClass('node-expand').addClass('node-collapse');
        });
        return false;
      },
      'click button.search' : function(e){
        e.preventDefault();
        $('div.treeview li.tree-node').removeClass('node-highlight');
        $('div.treeview .node-highlight-el').removeClass('node-highlight-el');
        var searchText = $('div.treeview .searchText:input').val();
        if(searchText){
          var highlightEl = $('div.treeview span.tree-' + linkStatus + ' > a:contains("' + searchText + '")');
          highlightEl.parents('li.tree-node').addClass('node-highlight');
          highlightEl.addClass('node-highlight-el');
          $('div.treeview li.node-highlight > span.tree-icon').each(function(){
            var span = $(this);
            if(span.parent().hasClass('node-collapse')){
              span.click();
            }
          });
        }
        return false;
      }
    });
  },
  render : function(){
    var self = this;
    var name = self.get('name');
    var mytree = TreeManager.get(name);
    var linkStatus = mytree.linkStatus();
    var enabledCheckbox = mytree.isEnabledCheckbox();
    var usePluginSearch = mytree.plugins.search;
    var usePluginExpand = mytree.plugins.expand;
    var usePluginCollapse = mytree.plugins.collapse;
    function it(){
      var iteration = this;
      var first = arguments[0] === true ? false : true;
      /*
        <ul class="tree-root">
          <li class="tree-node {{#if ./expand}}node-expand{{else}}node-collapse{{/if}}">
            <span class="tree-checkbox">
              <input type="checkbox"/>
            </span>
            <span class="tree-icon glyphicon {{#if ./expand}}glyphicon-folder-open{{else}}{{#if ./children.length}}glyphicon-folder-close{{else}}glyphicon-file{{/if}}{{/if}}"></span>
            <span class="tree-text">
              <a href="{{./href}}">{{./name}}</a>
            </span>
          </li>
        </ul>
      */
      return HTML.UL({class : 'tree-root'}, UI.Each(function(){
        return first ? Spacebars.call(iteration.lookup('children')) : Spacebars.dataMustache(Spacebars.dot(iteration.lookup('.'),'children'));
      },UI.block(function(){
        var block = this;
        return function(){
          return HTML.LI({class : ['tree-node ', UI.If(function(){
            return Spacebars.dataMustache(Spacebars.dot(block.lookup('.'),'expand'));
          }, UI.block(function(){
            return 'node-expand';
          }), UI.block(function(){
            return 'node-collapse'
          }))]},[
            HTML.SPAN({class : 'tree-checkbox'}, enabledCheckbox ? HTML.INPUT({type : 'checkbox', value : Spacebars.dataMustache(Spacebars.dot(block.lookup('.'),'id'))}) : null),
            HTML.SPAN({class : ['tree-icon glyphicon ', UI.If(function(){
              return Spacebars.dataMustache(Spacebars.dot(block.lookup('.'),'expand'));
            }, UI.block(function(){
              return 'glyphicon-folder-open';
            }),UI.block(function(){
              return UI.If(function(){
                return Spacebars.dataMustache(Spacebars.dot(block.lookup('.'),'children','length'));
              }, UI.block(function(){
                return 'glyphicon-folder-close';
              }), UI.block(function(){
                return 'glyphicon-file';
              }));
            }))]}),
            HTML.SPAN({class : 'tree-' + linkStatus}, HTML.A({href : Spacebars.dataMustache(Spacebars.dot(block.lookup('.'),'href'))},Spacebars.dataMustache(Spacebars.dot(block.lookup('.'),'name')))),
            it.call(block, true)]);
        };
      })));
    };
    return HTML.DIV({class : 'treeview'},[
      HTML.DIV({class : 'container row'},
        HTML.DIV({class : 'input-group', style : 'width:100px;'},[
          usePluginSearch ? HTML.INPUT({type : 'text', class : 'form-control input-sm searchText', style : 'width:100px;'}) : null,
          HTML.DIV({class : 'input-group-btn'},[
            usePluginSearch ? HTML.BUTTON({class : 'search btn btn-default glyphicon glyphicon-search', type : 'button'}) : null,
            usePluginExpand ? HTML.BUTTON({class : 'exapndAll btn btn-default glyphicon glyphicon-chevron-down', type : 'button'}) : null,
            usePluginCollapse ? HTML.BUTTON({class : 'collapseAll btn btn-default glyphicon glyphicon-chevron-up', type : 'button'}) : null,
          ])
        ])
      ),
      it.call(self)
    ]);
  }
});

UI.registerHelper('Tree', Tree);


































