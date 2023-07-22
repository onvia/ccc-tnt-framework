#target photoshop


/**
* 增加 批量替换名称如：
* 头,身体,大手臂,小手臂,手掌,大腿,小腿
* head,body,bigarm,forearm,palm,thigh,calf
*
**/


var cacheValue = new Map ();
var win;
var res ="dialog { \
text:'图层批量重命名 ',\
        group: Group{orientation: 'column',alignChildren:'left',\
            mode:Panel{orientation: 'row', text:'作用范围：',\
                                         selected:RadioButton {text:'选中图层' },\
                                         all:RadioButton {text:'所有图层' },\
                                         }\
            whichType:Panel{orientation: 'row', text:'类型：',\
                                         whole:RadioButton {text:'整体' },\
                                         rep:RadioButton {text:'替换' },\
                                         add_del:RadioButton {text:'添加/删除' },\
                                         }\
            allGroup:Panel {orientation:'stack', alignChildren:'top',text: '整体',  \
				renameall: Group { orientation: 'column',alignChildren:'left',text: '命名规则',\
										name: Group { orientation: 'row', \
												txt: StaticText { text:'命名规则:' }, \
												edit: EditText { preferredSize: [240, 20] } ,\
												}, \
										helpTip: Group{orientation: 'column',alignChildren:'left',\
												txt1: StaticText{ text:'在此处输入“A_#” 则图层名为“A_<数字编号>'},\
												txt2: StaticText{ text:'使用 * 插入原始图层名称'},\
												txt3: StaticText{ text:'使用 # 以数字插入指定位置'},\
												}\
										paramGroup: Group{orientation: 'column',alignChildren:'left',\
													beginId: Group { orientation: 'row', \
															txt: StaticText { text:'开始于:' }, \
															edit: EditText { text:'0',preferredSize: [50, 20]} ,\
													}, \
													incremental: Group { orientation: 'row', \
															txt: StaticText { text:'增量:   ' }, \
															edit: EditText { text:'1', preferredSize: [50, 20]} ,\
													}, \
													bits: Group { orientation: 'row', \
															txt: StaticText { text:'位数:   ' }, \
															dropdownlist:DropDownList { alignment:'left', itemSize: [34,16] },\
													}, \
												}\
									  }, \
				repGroup: Group { orientation: 'column',alignChildren:'left',text: '命名规则',\
										helpTip: Group{orientation: 'column',alignChildren:'left',\
												txt1: StaticText{ text:'替换文件名中的字符                                                '},\
												},\
										oldStr: Group { orientation: 'row', \
												txt: StaticText { text:'把:      ' }, \
												edit: EditText { preferredSize: [160, 20] } ,\
												}, \
										newStr: Group { orientation: 'row', \
												txt: StaticText { text:'替换成:' }, \
												edit: EditText { preferredSize: [160, 20] } ,\
												}, \
									  }, \
				add_del: Group { orientation: 'column',alignChildren:'left',text: '添加/删除',\
										frontadd: Group { orientation: 'row', \
												txt: StaticText { text:'文件名前添加:   ' }, \
												edit: EditText { preferredSize: [200, 20] } ,\
												}, \
										backtoadd: Group{ orientation: 'row', \
												txt: StaticText { text:'文件名后添加:   ' }, \
												edit: EditText { preferredSize: [200, 20] } ,\
												}, \
										del: Group{ orientation: 'row', \
												txt: StaticText { text:'删除文件名中的:' }, \
												edit: EditText { preferredSize: [200, 20] } ,\
												}, \
										extensionadd: Checkbox{text:'扩展添加'},\
										addGroup: Group{orientation: 'column',alignChildren:'left',\
													beginId: Group { orientation: 'row', \
															txt: StaticText { text:'从文件名第:' }, \
															edit: EditText { text:'0',preferredSize: [50, 20]} ,\
															txt: StaticText { text:'个字符开始' }, \
													}, \
													extensionaddStr: Group { orientation: 'row', \
															txt: StaticText { text:'添加字符串:' }, \
															edit: EditText { text:'', preferredSize: [80, 20]} ,\
													}, \
												}\
										extensiondel: Checkbox{text:'扩展删除'},\
										delGroup: Group{orientation: 'column',alignChildren:'left',\
													beginId: Group { orientation: 'row', \
															txt: StaticText { text:'从文件名第:' }, \
															edit: EditText { text:'0',preferredSize: [50, 20]} ,\
															txt: StaticText { text:'个字符开始' }, \
													}, \
													totalNum: Group { orientation: 'row', \
															txt: StaticText { text:'共删除:' }, \
															edit: EditText { text:'1', preferredSize: [50, 20]} ,\
															txt: StaticText { text:'字符' }, \
													}, \
												}\
									  }, \
            }\
        },\
        buttons: Group { orientation: 'row', alignment: 'right',\
                btnOK: Button { text:'确定', properties:{name:'ok'} }, \
                btnCancel: Button { text:'取消', properties:{name:'cancel'} } \
                }, \
}";



app.bringToFront();
if (documents.length == 0) {
    alert("没有可处理的文档");
}else {
    main();
}


function main(){
   initWin();
}

function initWin(){
    win = new Window (res);
    var whichType = win.group.whichType;
    var repGroup = win.group.allGroup.repGroup;
    var add_del = win.group.allGroup.add_del;
    var renameall =  win.group.allGroup.renameall;
    whichType.whole.value = true;
    add_del.visible = false;
    repGroup.visible = false;
    whichType.whole.onClick = function(){
        renameall.visible = true;
        add_del.visible = false;
        repGroup.visible = false;
        win.group.allGroup.text = "整体";
    } 
    whichType.rep.onClick = function(){
        renameall.visible = false;
        add_del.visible = false;
        repGroup.visible = true;
        win.group.allGroup.text = "替换";
    }
    whichType.add_del.onClick = function(){
        renameall.visible = false;
        add_del.visible = true;
        repGroup.visible = false;
        win.group.allGroup.text = "添加/删除";
    }
//整体    
    checkNum(renameall.paramGroup.beginId.edit,0);    
    checkNum(renameall.paramGroup.incremental.edit,1);  
    //checkNum(renameall.paramGroup.bits.renameall,1);
    renameall.paramGroup.bits.enabled = false; // ====================================================暂时不能选择位数 等待补全====================================================
    win.group.mode.selected.value = true;
    
    var dropDownList = renameall.paramGroup.bits.dropdownlist;
        for(var i = 0; i < 5; i++){//给下拉列表添加元素
           dropDownList.add("item",i+1);
        }
        dropDownList.items[0].selected=true;//使第一个被选中
        
        
//添加/删除
    add_del.addGroup.enabled = false;
    add_del.delGroup.enabled = false;
        
    checkNum(add_del.addGroup.beginId.edit,0);  
    checkNum(add_del.delGroup.beginId.edit,0);  
    checkNum(add_del.delGroup.totalNum.edit,1);  
    
    add_del.extensiondel.onClick = function(){
        add_del.delGroup.enabled = !add_del.delGroup.enabled;
    }
    add_del.extensionadd.onClick = function(){
        add_del.addGroup.enabled = !add_del.addGroup.enabled;
    }
    win.buttons.btnCancel.onClick = function () {
        win.close();
    }
    win.buttons.btnOK.onClick = function () {
         if(renameall.visible){
             exeRename();
         }else if(add_del.visible){
             exeAdd_Del();
         }else if(repGroup.visible){
             exeReplace();
          }
        win.close();
    }
    
    win.center();
    win.show();
}

function exeRename(){
    var layers = []; 
    var renameall =  win.group.allGroup.renameall;
    var name = renameall.name.edit.text;
    var beginIds = Number(renameall.paramGroup.beginId.edit.text);
    var incremental =Number(renameall.paramGroup.incremental.edit.text);
    var bits = Number(renameall.paramGroup.bits.dropdownlist.selection) + 1;
    
    if(win.group.mode.selected.value){
        layers = getSelectedLayers(); 
    }else{
        getLayers(app.activeDocument, layers);
    }
    for (var i = 0; i < layers.length; i++) {
        //var reg1 = new RegExp("*","g");
        var reg2 = new RegExp("#","g");
        var reg3 = new RegExp(" ","g");
        var newname = name.replace ("*", layers[i].name);//替换 * 为原文件名
        newname = newname.replace ("*", layers[i].name);//替换 * 为原文件名
        newname = newname.replace ("*", layers[i].name);//替换 * 为原文件名
        newname = newname.replace ("*", layers[i].name);//替换 * 为原文件名
        newname  = newname.replace (reg2,formatNum( beginIds+i*incremental,bits));//替换 # 为数字
        newname = newname.replace (reg3, "");//删除空格
        layers[i].name = newname ;
    }
}
function exeReplace(){
    var layers = []; 
    var repGroup = win.group.allGroup.repGroup;
    var oldstr = repGroup.oldStr.edit.text;
    var newstr = repGroup.newStr.edit.text;
    
    
     if(win.group.mode.selected.value){
        layers = getSelectedLayers(); 
    }else{
        getLayers(app.activeDocument, layers);
    }
      var oldstrs= new Array(); //定义一数组 
      oldstrs = oldstr.split (",");
      var newstrs= new Array(); //定义一数组 
      newstrs = newstr.split (",");
      if(oldstrs.length != newstrs.length){
                alert ("新字符的数量必须和旧字符串的数量一致");
            return;          
        }
     for (var i = 0; i < layers.length; i++) {
            var newname = layers[i].name;
            
            
            for(var j = 0;j <oldstrs.length;j++){
                 var reg = new RegExp(oldstrs[j],"g");
                newname = newname.replace (reg, newstrs[j]);//替换 * 为原文件名
            }            
            
            //var reg = new RegExp(oldstr,"g");
            //newname = newname.replace (reg, newstr);//替换字符
            layers[i].name = newname ;
        }
}
function exeAdd_Del(){
    var layers = []; 
    var add_del = win.group.allGroup.add_del;
    var frontaddstr = add_del.frontadd.edit.text;//文件名前添加的字符
    var backtoaddstr = add_del.backtoadd.edit.text;//文件名后添加的字符
    var delstr = add_del.del.edit.text;//删除的字符
    
    var addbeginID = Number(add_del.addGroup.beginId.edit.text);
    var addStr = add_del.addGroup.extensionaddStr.edit.text;
    var delbeginID = Number(add_del.delGroup.beginId.edit.text);
    var deltotalNum = Number(add_del.delGroup.totalNum.edit.text);
    
    
    if(win.group.mode.selected.value){
        layers = getSelectedLayers(); 
    }else{
        getLayers(app.activeDocument, layers);
    }

    for (var i = 0; i < layers.length; i++) {
        var newname = frontaddstr+layers[i].name;
        newname  = newname+backtoaddstr;
        //扩展添加
         if(add_del.extensionadd.value){
            //插入字符
            newname = insert_flg(newname,addStr,addbeginID);
        }
    
        var reg = new RegExp(delstr,"g");
        newname = newname.replace (reg, "");//删除字符
        //扩展删除
         if(add_del.extensiondel.value){
            newname = del_flg(newname,delbeginID,deltotalNum);
         }
        
       
        reg = new RegExp(" ","g");
        newname = newname.replace (reg, "");//删除空格

        
        
        
        layers[i].name = newname ;
    }
}
//插入字符
//参数说明：str表示原字符串变量，flg表示要插入的字符串，sn表示要插入的位置
function insert_flg(str,flg,sn){
    newstr = str.substring(0,sn) +flg+ str.substring(sn,str.length);
    return newstr;
}

//删除指定位置的字符 x代表要删除的位置 代表删除字符的个数
function del_flg(str,x,num){
    var newstr = str.substring(0,x) + str.substring(x+num,str.length);
    return newstr;
}
function formatNum(num,bits){
    if(bits > 1){
            var str = Number.toString (num);
            var form='';
            for(var i = 0;i < bits-1;i++){
                    form+='0';
            }
            return form+num;
    }
    return num;
}
function checkNum(editText,defaultNum){
    cacheValue.set(editText,defaultNum);
    editText.onChanging = function(){
                if(isNaN(editText.text)){//非数字
                    editText.text = cacheValue.get(editText);
                }else{
                     cacheValue.set(editText,editText.text);
                }
        }
}
function getSelectedLayers(){
        var idGrp = stringIDToTypeID( "groupLayersEvent" );
        var descGrp = new ActionDescriptor();
        var refGrp = new ActionReference();
        refGrp.putEnumerated(charIDToTypeID( "Lyr " ),charIDToTypeID( "Ordn" ),charIDToTypeID( "Trgt" ));
        descGrp.putReference(charIDToTypeID( "null" ), refGrp );
        executeAction( idGrp, descGrp, DialogModes.ALL );
        var resultLayers=new Array();
        for (var ix=0;ix<app.activeDocument.activeLayer.layers.length;ix++){resultLayers.push(app.activeDocument.activeLayer.layers[ix])}
        var id8 = charIDToTypeID( "slct" );
            var desc5 = new ActionDescriptor();
            var id9 = charIDToTypeID( "null" );
            var ref2 = new ActionReference();
            var id10 = charIDToTypeID( "HstS" );
            var id11 = charIDToTypeID( "Ordn" );
            var id12 = charIDToTypeID( "Prvs" );
            ref2.putEnumerated( id10, id11, id12 );
        desc5.putReference( id9, ref2 );
        executeAction( id8, desc5, DialogModes.NO );
        return resultLayers;
}
function getLayers (layer, collect) {
	if (!layer.layers || layer.layers.length == 0) return layer;
    if(layer != app.activeDocument){
        collect.push(layer);
    }
    
	for (var i = 0, n = layer.layers.length; i < n; i++) {
		// For checking if its an adjustment layer, but it also excludes
		// LayerSets so we need to find the different types needed.
		//if (layer.layers[i].kind == LayerKind.NORMAL) {
              //collect.push(layer.layers[i]);
			var child = getLayers(layer.layers[i], collect);
			if (child) collect.push(child);
		//}
	}
}
function Map() {
    this.keys = new Array();
    this.values= new Array();
    //添加键值对
    this.set = function (key, value) {
        if (this.values[key] == null) {//如键不存在则身【键】数组添加键名
            this.keys.push(value);
        }
        this.values[key] = value;//给键赋值
    };
    //获取键对应的值
    this.get = function (key) {
        return this.values[key];
    };
    //去除键值，(去除键数据中的键名及对应的值)
    this.remove = function (key) {
        this.keys.remove(key);
        this.values[key] = null;
    };
    //判断键值元素是否为空
    this.isEmpty = function () {
        return this.keys.length == 0;
    };
    //获取键值元素大小
    this.size = function () {
        return this.keys.length;
    };
}
