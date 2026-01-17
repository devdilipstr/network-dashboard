    <template>
        <button class="btn btn-primary btn-sm" :style="{position:'absolute',top:`${x}px`,left:`${y}px`}" @click="closeit">Add Node Here</button>
    </template>
    <script setup>
        import {defineProps,defineEmits} from 'vue'
        defineProps(["x","y"])
        const emits = defineEmits(['closeNewNodeBtn'])
        const closeit = ()=>{
            emits('closeNewNodeBtn')    
        }
        
    </script>
