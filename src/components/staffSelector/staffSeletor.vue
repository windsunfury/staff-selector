<template>
  <div class="selector">
    <div class="selector-inputer">
      <textarea v-if="element==='textarea'" :id="inputID" :class="inputClass" :placeholder="placeholder" v-model="names" @blur="calStaff($event,false)" @keyup="calStaff($event)"></textarea>
      <input v-else type="text"  :id="inputID" :class="inputClass" :placeholder="placeholder" v-model="names" @blur="calStaff($event,false)" @keyup="calStaff($event)"/>
      <span class="selector-icon" @click="getData"></span>
      <div class="candidates-container" :id="candidateID" v-show="candidates.length>0">
        <ul>
          <li v-for="item in candidates" @mousedown="addStaff(item,true)" @mouseover="addBackground($event)" @mouseleave="deleteBackground($event)">{{item.name}}</li>
        </ul>
      </div>
    </div>

    <Modal v-model="show" showHead width="800" @on-ok="ok" @on-cancel="cancel">
      <p slot="header">员工选择器</p>

      <div class="row-s">
        <div class="row-s-col">
          <div class="selector-title">
            <span class="tit">请选择员工</span>
          </div>
        </div>
        <div class="row-s-col">
          <div class="selector-title">
            <span class="tit">已选择员工</span>
          </div>
        </div>
      </div>
      <div class="row-s">
        <div class="row-s-col">
          <div class="selector-container">
            <ul>
              <li v-for="item in staffs" @click="addStaff(item)">{{item.name}}<span v-if="selectedMap[item.id]"><b class="icon-selected"></b></span></li>
            </ul>
          </div>
        </div>
        <div class="row-s-col">
          <div class="selector-container">
            <ul>
              <!--<li v-for="(value,key) in selectedMap" @click="deleteStaff(key)" @mouseover="showDelete($event)" @mouseleave="hideDelete($event)">{{value}}</li>-->
              <li v-for="item in selectedStaffs" @click="deleteStaff(item)" @mouseover="showDelete($event)" @mouseleave="hideDelete($event)">{{item.name}}</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  </div>

</template>

<script>
    export default {
        name: "staffSeletor",
        data(){
          return {
            curPageIndex: 0,
            pageSize: 10,
            maxInt:100000,
            names:'',
            staffs:[],
            selectedStaffs:[],//v-for直接遍历对象或map并不能在页面上实时反映数据变化，要借助数组
            chosen:[],
            selectedMap:{},
            positionMap:{},
            show:false,
            deleteCandidate:{},
            candidates:[]
          }
        },
        props:{
          //重置员工选择器所有数据
          needReset:{
            type:Boolean,
            default:true
          },
          element:{
            type:String,
            default:'input'
          },
          inputClass:{
            type:String
          },
          inputID:{
            type:String
          },
          //外部注入数据源
          data:{
            type: Array,
            default: function () {
              return []
            }
          },
          //接受外部导入数据标识
          import:{
            type:Boolean,
            default:false
          },
          //是否单选
          isRadio:{
            type:Boolean,
            default:false
          },
          //默认选中的人
          defaultSelected:{
            type: Array,
            default: function () {
              return []
            }
          },
          placeholder:{
            type:String,
            default:'请选择员工'
          }
        },
        mounted:function(){
          if(!this.import){
            this.initData();
          }
          else{
            this.staffs = this.data;
          }

          if(this.defaultSelected.length > 0){
            for(let i of this.defaultSelected){
              this.addStaff(i, true);
            }
          }
          else{
            this.calNames()
          }
        },
        computed:{
          candidateID(){
            return this.inputID + 'c';
          }
        },
        watch:{
            needReset:function(){
              if(this.needReset){
                this.clearSelected();
              }
            },
            data:function () {
              this.staffs = this.data;
            },
            defaultSelected:function(){
              if(this.defaultSelected.length > 0){
                for(let i of this.defaultSelected){
                  this.addStaff(i, false);
                }
              }
              else{
                this.calNames()
              }
            }
        },
        methods:{
          async initData(){
              //接入具体业务取数接口数据
              this.staffs = [{"id":"6b86bc02-e169-48a9-bf59-4ad2bf97d812","name":"A"},
              {"id":"e28bc9d7-26ec-4040-a7bf-304aa0271f2b","name":"B"}]
          },
          getData(){
              this.show = true;
          },
          addStaff(item, isFinal=false){
              if(!this.isRadio || (this.selectedStaffs.length === 0 && this.isRadio)){
                if(!this.selectedMap[item.id]){
                  let l = this.selectedStaffs.push(item);
                  this.selectedMap[item.id] = item.name;
                  this.positionMap[item.id] = l>0?l-1:0;
                  this.calNames();
                }
                else{
                  this.calNames();
                }
              }
              else{
                this.calNames();
              }
              this.candidates = [];
              if(isFinal){
                this.chosen = this.selectedStaffs;
                let res = this.chosen.map(function (i) {
                  return i.id;
                });
                this.$emit('getChosen', res);
              }
          },
          deleteStaff(item){
              if(this.selectedMap[item.id]){
                delete this.selectedMap[item.id];
              }

              if(this.positionMap[item.id]!==null){
                this.selectedStaffs.splice(this.positionMap[item.id],1);
                delete this.positionMap[item.id];
              }
              this.calNames();
          },
          showDelete(e){
            if(e.target.localName === 'li' && e.target.childNodes.length <= 1){
              e.target.innerHTML = e.target.innerHTML+'<span><b class="icon-delete"></b></span>';
            }

          },
          hideDelete(e){
            if(e.target.localName === 'li' && e.target.childNodes.length > 1){
              e.target.removeChild(e.target.childNodes[1]);
            }
          },
          calStaff(e, iskeyboard=true){
              if(this.names){
                let arry = this.names.split(';');
                let name = '';
                //取数组最后一个位置的值,有可能是''
                if(arry.length>0){
                  name = arry[arry.length-1];
                }
                if(name){
                  let theEvent = e || window.event;
                  let code = theEvent.keyCode || theEvent.which || theEvent.charCode;

                  if (code === 13 || iskeyboard===false) {
                    /*if(this.staffs[0]){
                      this.addStaff(this.staffs[0]);
                    }*/
                    let sign = false;
                    name = name.replace(/[\r\n]/g,"");
                    for (let value of this.staffs) {
                      if(value.name === name){
                        sign = true;
                        this.addStaff(value, true);
                        return;
                      }
                    }
                    if(!sign) {
                      if (this.staffs[0]) {
                        this.addStaff(this.staffs[0]);
                      }
                    }
                  }
                  else{
                    let temp = [];
                    for (let value of Object.values(this.staffs)) {
                      if(value.name.includes(name)){
                        temp.push(value);
                      }
                    }
                    if(temp.length>0){
                      this.candidates = temp;
                    }
                  }
                }
                else{
                  this.candidates = [];

                  /*通过去掉文字进行删除，需要分别处理selectedMap,positionMap,selectedStaffs三者
                  let temp = {};
                  for(let a in arry){
                    this.temp[a] = a;
                  }
                  //处理selectedMap
                  Object.keys(this.selectedMap).forEach((x) => {
                    if(!temp[x]){
                      if(this.selectedMap[x]){
                        delete this.selectedMap[x];
                      }
                    }
                  })*/
                }
              }
              else{
                this.clearSelected();
                this.candidates = [];
              }
          },
          calNames(){
            this.names='';
            for(let s of this.selectedStaffs){
              this.names+=s.name+';';
            }
          },
          addBackground(e){
            if(!e.target.className){
              e.target.className = 'candidate';
            }
          },
          deleteBackground(e){
            if(e.target.className){
              e.target.className = '';
            }
          },
          ok(){
            this.chosen = this.selectedStaffs;
            let res = this.chosen.map(function (i) {
              return i.id;
            });
            this.$emit('getChosen', res);
          },
          cancel(){
            this.clearSelected();
          },
          clearSelected(){
            this.selectedMap = {};
            this.positionMap = {};
            this.selectedStaffs = [];
            this.names = '';
            this.chosen = [];
          },
          /*
          为input元素添加focus事件后每次都动态计算，但是无法保证每次得到正确答案，offset有可能出现叠加
          offset(){
            this.initOffset();
            let id = `#${this.inputID}`;
            let cid = `#${this.candidateID}`;
            let offset = $(id).offset();
            let height = $(id).height()+2;
            if(offset){
              let coffset = $(cid).offset();
              coffset.left = offset.left;
              coffset.top = offset.top+height;
              $(cid).offset(coffset);
            }
          },
          initOffset(){
            let offset ={left:0, top:0};
            $(`#${this.candidateID}`).offset(offset);
          }*/
        }
    }
</script>

<style>
  ul,li {/*可配全局*/
    margin: 0;
    padding: 0;
    list-style:none;
  }

  .selector-icon{
    display: inline-block;
    width: 30px;
    height: 30px;
    vertical-align: top;
    background: url(/static/images/icon-selector.png) 0 0 no-repeat;
  }

  .selector{
    display: inline-block;
    height: 37px;
    margin: 0 20px;
    text-align: left;
  }

  .selector-inputer{
    position: relative;
  }

  input.selector-text-input{
    width: 260px;
    height: 37px;
    border: 1px solid #d9e0e8;
    border-radius: 4px;
    font-size: 14px;
    color: #929292;
    text-indent: 18px;
    box-shadow: none;
    vertical-align: middle;
    background-color: #fbfbfb;
  }

  .selector-title{
    width: 375px;
  }

  .selector-title .tit{
    float: left;
    line-height: 37px;
    margin-right: 20px;
    font-size: 16px;
    color: #919191;
  }

  .selector-container{
    width: 375px;
    overflow: auto;
    height: 400px;
    background-color: #fff;
    float: left;
  }

  .candidates-container{
    display: block;
    width: 160px;
    overflow: auto;
    background-color: #fff;
    border: 1px solid #e3e8ee;
    position: absolute;
    z-index: 999;
    text-align: left;
  }

  .candidate{
    background-color: #e3e8ee;
  }

  .icon-selected{
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    margin: 0 10px;
    float: right;
    background: url(/static/images/ok.gif) 0 0 no-repeat;
  }

  .icon-delete{
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    margin: 0 10px;
    float: right;
    background: url(/static/images/no.gif) 0 0 no-repeat;
  }

  .row-s:first-child {
    border-bottom: 1px solid #e3e8ee;
  }

  .row-s .row-s-col {
    display: table-cell;
    position: relative;
    width: 50%;
    vertical-align: top;
  }

  .row-s:not(:first-child) .row-s-col:first-child{
    border-right: 1px solid #e3e8ee;
  }

  .row-s .row-s-col:last-child:after{
    display: none;
  }

  .row-s .row-s-col:not(:first-child){
    padding-left: 26px;
  }
</style>
