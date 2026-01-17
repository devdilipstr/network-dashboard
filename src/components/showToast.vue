<template>
   <div id="toast" :class="['d-flex w-auto h-auto align-items-center m-3 p-2 rounded-2',color]">
      <p class="align-self-center h-100 m-0">{{toastdata.text}}</p>
      
   </div>
</template>
<script setup>
import { defineProps,ref, watch } from 'vue';
const p = defineProps(['toastdata'])
const color = ref("text-bg-"+p.toastdata.bg)
</script>
<style scoped>
   #toast{
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
    animation: moveout 1s
   }
   @keyframes moveout{
      0%{
         right: -50px;
      }
      100%{
         right: 0;
      }
   }
</style>