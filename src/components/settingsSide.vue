<template>
    <div class="container d-flex flex-column align-items-start h-100  p-2 w-auto">
        <div class="d-flex w-100 justify-content-between align-items-center">
            <p class="h5 mt-2">Settings</p>
            <div class="d-flex gap-1">
                <span class="badge bg-primary center d-flex justify-content-center align-items-center" title="current version">{{version}}</span>
                <!-- <button class="btn btn-info">{{version}}</button> -->
                <button class="btn btn-close" @click="closeSettings"></button>
            </div>
        </div>
        <div class="d-flex input-group mt-2">
            <input type="text" class="form-control danger" placeholder="Enter New Password" v-model="newpass" @keyup.enter="changepass">
            <button class="btn btn-danger" @click="changepass">Change</button>
        </div>
        <div class="d-flex input-group mt-2">
            <input type="text" class="form-control" placeholder="New Alert Email" v-model="newmail" @keyup.enter="addmail">
            <button class="btn btn-primary" @click="addmail">Add</button>
        </div>
        <div v-if="settings.mails" class="w-100">
            <div v-for="mail in settings.mails" class="d-flex align-items-center w-100 mt-2" :key="mail">
                <span class="input-group-text w-100">{{ mail }}</span>
                <button class="btn btn-close btn-sm" @click="removemail(mail)"></button>
            </div>
        </div>
        <div class="d-flex mt-2 flex-column w-100">
            <div class="input-group">
                <span class="input-group-text w-50" id="basic-addon1">No.of Packets</span>
                <input type="text" class="form-control"  v-model="packets"/>
            </div>
            <div class="input-group">
                <span class="input-group-text w-50" id="basic-addon1">T.O Packets(s)</span>
                <input type="text" class="form-control" v-model="packettimeout"/>
            </div>
            <div class="input-group">
                <span class="input-group-text w-50" id="basic-addon1">T.O Ping(ms)</span>
                <input type="text" class="form-control" v-model="pingtimeout"/>
            </div>
            <button class="btn btn-primary btn-sm" @click="updatepinginfo">Update</button>
        </div>
       
    </div>
</template>
<script setup>
import { defineEmits, defineProps, ref, watch } from 'vue'
import useLocalStorage from './useLocalStorage'
const p = defineProps(['settings','version'])
const newpass = ref("")
const newmail = ref("")
const packets = ref(p.settings['packets'])
const packettimeout = ref(p.settings['packettimeout'])
const pingtimeout = ref(p.settings['pingtimeout'])

const emits = defineEmits(['closeSettings','settoast'])
const closeSettings = () => {
    emits('closeSettings', true)
}

const changepass = () => {
    if(newpass.value != ""){
        useLocalStorage.updateSettings(p.settings, "password", newpass.value)
        newpass.value = ""
        emits('settoast',"Admin Password Changed")
    }else{
        emits("settoast","Empty entry","danger")
    }
}

const addmail = () => {
    if(newmail.value != ""){
        useLocalStorage.updateSettings(p.settings, "addmail", newmail.value)    
        emits('settoast',`${newmail.value}:New Mail Added`)
        newmail.value = ""
    }else{
        emits("settoast","Empty entry","danger")
    }
   
}
const removemail = (mail) => {
    useLocalStorage.updateSettings(p.settings, "removemail", mail)
    emits('settoast',`${mail}:Mail Removed`,"danger")

}
const updatepinginfo = () =>{
    const value = {
        packets:packets.value,
        packettimeout:packettimeout.value,
        pingtimeout:pingtimeout.value
    }
    useLocalStorage.updateSettings(p.settings,"updatepinginfo",value)
    emits('settoast',"PingInfo Updated")

}
watch(p.settings, () => {
    useLocalStorage.pushUpdateSettings(p.settings)
}, { deep: true })
</script>
<style scoped>
.container {
    background-color: var(--bs-tertiary-bg);
    padding: 0;
}
</style>
