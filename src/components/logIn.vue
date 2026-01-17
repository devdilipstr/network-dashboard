<template>
    <div class="w-auto h-auto d-flex flex-column justify-content-center align-self-center p-5 rounded-5" id="container">
        <img class="align-self-center" src="https://i.ibb.co/chFJMR98/984d60630186e440e9c01655c3e50f1b.jpg" style="width: 150px;height: 100px;"/>
        <h5 class="align-self-center">Network Monitoring Tool</h5>
        <p class="h2 mb-3">Admin Login</p>
        <div class="d-flex gap-1">
        <input type="text" class="form-control "  placeholder="Enter PassKey for Admin" v-model="pass" @keyup.enter="checkPass">
        <button class="btn btn-primary" @click="checkPass">login</button>
    </div>
    <div class="d-flex mt-3 justify-content-center">
        <button class="btn btn-primary btn-sm" @click="viewOnly">View Only</button>
    </div>
    </div>
</template>
<script setup>
    import { ref,defineEmits } from 'vue';
    const pass = ref()
    const emits = defineEmits(["checkPass","viewOnly"])
    const checkPass = () =>{
        emits("checkPass",pass.value)
    }
    const viewOnly = () =>{
        emits("viewOnly",true)
    }
</script>
<style scoped>
    #container{
        background-color: var(--bs-tertiary-bg);
    }
</style>