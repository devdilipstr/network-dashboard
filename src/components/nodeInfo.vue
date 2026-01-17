<template>
    <div class="d-flex flex-column info">
        <div class="d-flex flex-row align-items-center justify-content-between pb-2">
            <div class="form-check form-switch" v-if="!viewonly">
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"  v-model="pingSwitch" @change="pingSwitchChanged">
                    <label class="form-check-label" for="flexSwitchCheckDefault">Auto Ping</label>
                </div>
            <div class="d-flex justify-content-between">
                <p class=" align-self-center m-0" title="Node ID" @click="copyNodeId(nodeId)">{{ nodeId }}</p>
            <button class="btn btn-close" @click="closeinfo"></button>

                <!-- <button class="btn btn-primary btn-sm m-1" @click="ping">Ping</button> -->
              
            </div>
        </div>
        <div class="input-group">
            <span class="input-group-text" id="basic-addon1">Name</span>
            <input type="text" class="form-control" placeholder="Enter Device Name" aria-label="Username"
                aria-describedby="basic-addon1" :value="data[topology].nodes[nodeId].name" ref="nameref">
        </div>
        <div class="input-group">
            <span class="input-group-text" id="basic-addon1">IP</span>
            <input type="text" class="form-control" placeholder="Enter IP" aria-label="ip"
                aria-describedby="basic-addon1" :value="data[topology].nodes[nodeId].ip" ref="ipref">
        </div>
        <div class="input-group">
            <span class="input-group-text" id="basic-addon1">Detail</span>
            <input type="text" class="form-control" placeholder="Enter Detail" aria-label="detail"
                aria-describedby="basic-addon1" :value="data[topology].nodes[nodeId].detail" ref="detailref">
        </div>
        <div class="input-group">
            <select class="form-select" ref="typeref" :value="data[topology].nodes[nodeId].type">
                <option selected>Select Type</option>
                <option value="1">Internet</option>
                <option value="2">Router</option>
                <option value="3">PC</option>
                <option value="4">Switch</option>
                <option value="5">Server</option>
            </select>

        </div>
        <div v-if="!viewonly" class="d-flex input-group">
            <div class="d-flex w-50">
            <span class="input-group-text" id="basic-addon1">Target</span>
            <input type="text" class="form-control" placeholder="Enter Target Node Id" aria-label="ip"
                aria-describedby="basic-addon1" ref="target_id"></div>
            <div class="input-group w-50">
                <select class="form-select" ref="connTypeRef">
                <option selected>Select Connection Type</option>
                <option value="1">ofc single fiber mode - module</option>
                <option value="2">ofc single fiber mode - media convertor</option>
                <option value="3">ofc multi mode mode - module</option>
                <option value="4">ofc multi mode mode - media convertor</option>
                <option value="5">utp</option>
                <option value="6">wireless ap</option>
                </select>
            <button class="btn btn-light btn-sm" @click="addTarget" title="Add Target Connection">Add</button>
            </div>
        </div>
        <div class="div mt-2" v-if="connlist">
            <div class="d-flex align-items-center justify-content-between" v-for="(conn, id) in connlist"
                v-bind:key="id">
                <span class="input-group-text w-100" id="basic-addon1" ref="">{{ id }}</span>
                <!-- <span class="input-group-text" id="basic-addon1">{{data[topology].nodes[conn[target]]}}</span> -->
                <span class="input-group-text w-100" id="basic-addon1">{{ conn.name || "-"}}</span>
                <span class="input-group-text w-100" id="basic-addon1">{{ conn.ip || "-"}}</span>
                <span class="input-group-text w-100" id="basic-addon1">{{ conn.type || "-" }}</span>
                <button v-if="!p.viewonly" class="btn btn-close btn-sm p-3" @click="deleteConn(id)"></button>
            </div>
        </div>
        <div v-if="!p.viewonly" class="d-flex justify-content-between">
            <button class="g-1 btn btn-primary justify-content-center m-1 w-50" @click="updateNode">Update</button>
            <button class="btn btn-danger justify-content-center m-1 w-50" @click="deleteNode">Delete</button>
        </div>
    </div>
</template>
<script setup>
import { defineProps, defineEmits, ref, onBeforeMount, watch } from 'vue'
import useLocalStorage from './useLocalStorage'

const p = defineProps(["data", "topology", "nodeId","connections","autoping","pingData","viewonly"])
const nameref = ref()
const ipref = ref()
const typeref = ref()
const target_id = ref()
const connlist = ref({})
const pingSwitch = ref(p.autoping)
const connTypeRef  = ref()
const detailref = ref()
const emits = defineEmits(['closeinfo', 'deleteNode', 'updateNode', 'addTarget'])
const closeinfo = () => {
    emits("closeinfo", true)
}
const updateNode = () => {
    emits('updateNode', p.nodeId, {
        name: nameref.value.value,
        ip: ipref.value.value,
        type: typeref.value.value,
        detail:detailref.value.value
    })
}

const deleteNode = () => {
    emits('deleteNode', p.nodeId)
    closeinfo()
}

const addTarget = () => {
    emits('addTarget', target_id.value.value,connTypeRef.value.value)
    if(!target_id.value.length==0){
        let addTarget = useLocalStorage.getNode(p.topology, target_id.value.value)
        connlist.value[target_id.value.value] = addTarget
        target_id.value.value = ""
    }
}

const deleteConn = (id) => {
    useLocalStorage.deleteConnection(p.data, p.topology, id)
    delete connlist.value[id]

}

const copyNodeId = (nodeId) => {
    try{
        navigator.clipboard.writeText(nodeId)
        emits('settoast',"Node ID")  
    }catch(e){
        emits('settoast',"Cipboard issue","danger")  ``
    }
}

const pingSwitchChanged= ()=>{
    useLocalStorage.changeAutoPing(p.data,p.topology,p.nodeId)
}
onBeforeMount(() => {
    Object.values(p.connections || {}).map((conn) => {
        if (conn['target'] != '') {
            let targetNode = useLocalStorage.getNode(p.topology, conn['target'])
            connlist.value[conn['target']] = targetNode
        }
    })
})

watch(pingSwitch,()=>{
    useLocalStorage.pingDataChange(p.pingData,p.nodeId,pingSwitch.value)
})

</script>

<style scoped>
.info {
    position: absolute;
    bottom: 0;
    margin-bottom: 5px;
    left: 50%;
    width: fit-content;
    height: fit-content;
    background-color: #f2f2f2;
    transform: translateX(-50%);
    border-radius: 10px;
    padding: 15px;
}
</style>