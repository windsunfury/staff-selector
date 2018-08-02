<template>
    <div  class="mydiv">
      <staffSelecter :needReset="needReset" inputID="inputList" inputClass="selecter-text-input" :import="false" :isRadio="true" @getChosen="getAdmin"></staffSelecter>
    </div>
</template>

<script>
    import staffSelecter from '../staffSelector/staffSeletor.vue';
    export default{
        data: function(){
            return {
              staffID: 0,
              needReset:true,
              inputList:{}
            }
        },
        components: {
          staffSelecter
        },
        methods:{
          getAdmin(chosen){
            if(chosen.length>0){
              this.staffID = chosen[0];
            }
          },
        }
    };
</script>
