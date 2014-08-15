if(Meteor.isClient){
  //定义树
  var mytree = TreeManager.defined('mytree');
  //绑定数据源
  mytree.bindSource({
      name : '全部测点',
      expand : true,
      children : [{
        name : '锅炉房',
        id : '001',
        children : [{
          name : '1号',
          id : '1',
          href : '/#1',
          led : 'led1'
        },{
          name : '2号',
          id : '2',
          href : '/#2'
        },{
          name : '3号',
          id : '3',
          href : '/#3'
        },{
          name : '4号',
          id : '4',
          href : '/#4'
        }]
      },{
        name : '焚烧机场1',
        children : [{
          name : '1号'
        },{
          name : '2号',
          children : [{
            name : '烟量控制'
          },{
            name : '冷凝控制'
          },{
            name : '压力'
          },{
            name : '烟气排放'
          }]
        },{
          name : '3号'
        }]
      },{
        name : '焚烧机场2',
        children : [{
          name : '1号'
        },{
          name : '2号',
          children : [{
            name : '烟量控制'
          },{
            name : '冷凝控制'
          },{
            name : '压力'
          },{
            name : '烟气排放'
          }]
        },{
          name : '3号'
        }]
      },{
        name : '焚烧机场3',
        children : [{
          name : '1号'
        },{
          name : '2号',
          children : [{
            name : '烟量控制'
          },{
            name : '冷凝控制'
          },{
            name : '压力'
          },{
            name : '烟气排放'
          }]
        },{
          name : '3号'
        }]
      },{
        name : '鼓风机'
      },{
        name : '监视画面'
      }]
  });
  //启用超链接
  mytree.enabledLink();
  //绑定链接点击事件
  mytree.linkClick = function(e, t){
    console.log(this);
  };
  //启用复选框
  mytree.enabledCheckbox();
  //启用的插件
  mytree.usePlugins(['search','expand','collapse']);
}