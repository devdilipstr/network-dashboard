<template>
    <div class="container d-flex flex-column align-items-start h-100 justify-content-between p-2 w-auto">
        <div class="d-flex flex-column w-100">
            <div class="d-flex justify-content-between gap-3">
                <p class="h5 mt-2">Topologies</p>
                <div class="d-flex w-100 ">
                <a href="/"><button class="d-flex justify-content-center align-items-center btn btn-outline-light rounded-5" style="width: 40px; height: 40px;" title="Refresh/Logout"><img :src="refreshicon" style="width: 20px;height: 20px;"/></button></a>
                <button class="d-flex justify-content-center align-items-center btn btn-outline-light rounded-5" style="width: 40px; height: 40px;" :title="updateinfo"><img id="updateicon" :src="updateicon" style="width: 18px;height: 18px;"/></button>
                <button v-if="!viewonly" class="d-flex justify-content-center align-items-center btn btn-outline-light rounded-5" style="width: 40px; height: 40px;" @click="openSettings" title="Settings"><img :src="settingicon" style="width: 20px;height: 20px;"/></button>
            </div>
            </div>
        <div class="div mt-2"  v-if="data" >
            <div class="d-flex align-items-center justify-content-between" v-for="(t,id) in data" v-bind:key="id">
                <span class="input-group-text w-100" style="cursor: pointer;" id="basic-addon1" @click="selectTopology(id,t.name)" title="Select Topology">{{t.name}}</span>
                <button v-if="!viewonly" class="btn btn-sm p-2" @click="exportToplogy(id)" title="Export Topology"><img width="16px" height="16px" :src="exporticon"/></button>
                <button v-if="!viewonly" class="btn btn-close btn-sm p-2" @click="deleteTopology(id,t.name)" title="Delete Topology"></button>
            </div>
        </div>
        </div>
        <div v-if="!viewonly" class="d-flex flex-column w-100">
        <input type="text" class="form-control" placeholder="Name or Topology Data" aria-label="TopologyName"
        aria-describedby="basic-addon1"  ref="tName" title="for new topology enter title or paste clipboard data of exported topology" @keyup.enter="addTopology">
        <button class="btn btn-primary btn-sm align-self-center m-2 w-100" @click="addTopology">Add Topology</button>
    </div>
    </div>
</template>
<script setup>
    import {ref,defineProps,watch,defineEmits,onBeforeMount} from 'vue'
    import useLocalStorage from './useLocalStorage'
    import settingicon from "../assets/settings.png"
    import exporticon from "../assets/export.png"
    import refreshicon from "../assets/refresh.png"
    import updateicon from "../assets/update.png"
    const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null
    const tName  = ref()
    const updateinfo = ref("latest" )
    onBeforeMount(async ()=>{
        const version  = await ipcRenderer.invoke('get-app-version')
        updateinfo.value = "latest:" +version
    })

    const p = defineProps(['data','viewonly'])
    const emits = defineEmits(['selectTopology','deleteTopology','openSettings','settoast'])   
    
    const deleteTopology =(id,name)=>{
        emits('deleteTopology',id,name)
    }

    watch(p.data, () => {
    useLocalStorage.saveData(p.data)
    }, { deep: true })

    const selectTopology = (id,name) =>{
        emits('selectTopology',id,name)
    }

    const addTopology = () =>{
        if(tName.value.value.length ==0 ||tName.value.value == ""){
             emits('settoast',"Empty Entry","danger")
        }else{
            useLocalStorage.newTopology(p.data,tName.value.value)
        tName.value.value = ""
        emits('settoast',"New Topology Created")
        }
        
    }

    const openSettings =() =>{
        emits('openSettings',true)
    }

    const exportToplogy = (id) =>{
        const topologydata = JSON.stringify(p.data[id]) 
        try {
            navigator.clipboard.writeText(topologydata)
            emits('settoast',"Topology Data CLipboard")   
        } catch (error) {
            emits('settoast',error + ":while clipboard","danger")   
        }
    }

        
    ipcRenderer.on('update-available', () => {
        updateinfo.value = "update available: downloading"
    })

    ipcRenderer.on('update-downloaded', () => {
        updateinfo.value = "Update Downloaded: restart to install"
    })
</script>
<style scoped>
    .container{
        background-color: #f2f2f2;
        padding: 0;
    }
</style>