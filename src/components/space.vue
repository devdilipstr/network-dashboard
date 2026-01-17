<template>
  <div class="space" ref="space">
    <input
    v-if="!p.viewonly"
      type="text"
      class="form-control m-2 position-absolute w-auto"
      :value="data[topology].name"
      @keyup.enter="updateTName"
    >
    <div class="form-check form-switch" style="position: absolute;bottom: 45px; right: 10px;">
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"  v-model="alertSwitch">
                    <label class="form-check-label" for="flexSwitchCheckDefault">Email Alert</label>
    </div>
    <PingDataInfo :pingData="pingData" :topology="topology" :totalnodes="Object.keys(data[topology].nodes || []).length" :mails="settings.mails || []" :alertvalue="alertSwitch" @showtoast="emittoast"/>
    <button
     v-if="!p.viewonly"
      class="btn btn-primary btn-sm m-2 position-absolute bottom-0"
      style="right: 0"
      @click="addNewNode"
    >
      Add Node
    </button>
    <VNetworkGraph
      :nodes="data[topology]?.nodes || {}"
      :edges="data[topology]?.connection || {}"
      :configs="configs"
      :layouts="data[topology]?.positions || {}"
      :event-handlers="showNodeInfo"
    >
      <template #edge-label="{ edge, ...slotProps }">
      <v-edge-label :text="edge.label" align="center" vertical-align="above" v-bind="slotProps" />
    </template>
      <template #override-node-label="{ nodeId, config }">
        <g>
          <text
            x="0"
            y="40"
            dominant-baseline="middle"
            text-anchor="middle"
            fill="currentColor"
            :font-size="config.fontSize * 1 - 3"
            font-weight="bold"
          >
            {{ data[topology].nodes[nodeId].name }}
          </text>
        </g>
      </template>

      <template #override-node="{ nodeId, config }">
        <g>
          <text x="22" y="-22" v-if="nodeId in pingData" :fill="pingColor(pingData[nodeId])" font-weight="bold"><tspan class="pingBlink">⬤ </tspan>{{ pingData[nodeId] }}</text>
          <rect
            x="-20"
            y="-20"
            width="40"
            height="40"
            fill="var(--bs-tertiary-bg)"
            rx="8"
            :stroke-width="config.strokeWidth"
            stroke="#f2f2f2"
            style="transition: all 0.2s ease-in-out"
          ></rect>
          <image class="png-theme" x="-10" y="-10" height="20" width="20" :href="typeLogo(nodeId)"/>
        </g>
      </template>
      
    </VNetworkGraph>
    <nodeInfo
      v-if="nodeSelectInfo.nodeId"
      :data="data"
      :topology="topology"
      :node-id="nodeSelectInfo.nodeId"
      :connections="Object.values(data[topology].connection || {}).filter(conn => conn.source == nodeSelectInfo.nodeId)"
      @closeinfo="closeInfo"
      @deleteNode="deleteNode"
      @updateNode="updateNode"
      @addTarget="addTarget"
      :key="nodeSelectInfo.nodeId"
      :autoping="data[topology].autoping[nodeSelectInfo.nodeId]"
      :ping-data="pingData"
      :viewonly="p.viewonly"
      @settoast="emittoast"
    />
    
  </div>
</template>

<script setup>
import { ref, defineProps, onBeforeMount, onUnmounted,defineEmits, watch} from 'vue'
import { VNetworkGraph, defineConfigs,VEdgeLabel} from 'v-network-graph'
import nodeInfo from './nodeInfo.vue'
import useLocalStorage from './useLocalStorage.js'
//import icons 
import icon0 from '../assets/unknown.png'
import icon1 from '../assets/1.png'
import icon2 from '../assets/2.png'
import icon3 from '../assets/3.png'
import icon4 from '../assets/4.png'
import icon5 from '../assets/5.png'
import PingDataInfo from './pingDataInfo.vue'

const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null
const p = defineProps(['data', 'topology','viewonly','settings'])
const emits = defineEmits(['settoast'])
const emittoast=(text,bg)=>{
    emits("settoast",text,bg)
}
const nodeSelectInfo = ref({
  nodeId: '',
  name: '',
  ip: '',
  type: ''
})

const iconMap = { 
  0:icon0,
  1:icon1,
  2:icon2,
  3:icon3,
  4:icon4,
  5:icon5
}
const alertSwitch = ref()
watch(alertSwitch,()=>{
  if(alertSwitch.value){
    emits("settoast","Email Alert: ON")
  }else{
    emits("settoast","Email Alert: OFF","danger")
  }
})
const pingData = ref(Object.entries(p.data[p.topology]?.autoping || {}) // Add fallback
  .filter(([key, value]) => value)
  .reduce((acc, [key]) => {
    acc[key] = "..."
    return acc
  }, {}))

const pingColor = (value) =>{
  if(value == 'Offline' || value== 'Error' || Number(value)>1000){
    return '#ff4d4d'
  }else{
    return '#00ff66'
  }
}

const typeLogo = (nodeId)=>{
  if(p.data[p.topology].nodes[nodeId].type){
    return iconMap[p.data[p.topology].nodes[nodeId].type]
  }else{
    return iconMap[0]
  }
}
const configs = defineConfigs({
  node: {
    selectable: true,
    hover: {
      type: 'rect',
      strokeColor: '#f2f2f2',
      color: 'f2f2f2',
      fill: '#f2f2f2',
      strokeWidth: 1,
      borderRadius: 8
    },
    normal: {
      type: 'rect',
      borderRadius: 8,
      strokeColor: 'black',
      width: 36,
      height: 36
    },
    focusring: {
      color: 'var(--bs-primary)',
      width: 2,
      borderRadius: 8
    },
    label: {
      fontSize: 15,
      color: '#000000',
      direction: 'south'
    }
  },
  edge: {
    label:{
      color:'currentColor',
    },
    marker: {
      target: {
        type: "arrow",
        width: 4,
        height: 4,
      },
    },
    normal: {
      width: 3,
      color: (edge)=>edge.color||'black',
      dasharray: '4 6',
      linecap: 'round',
    },
    hover: {

      color:(edge)=>edge.color||'black',
    }
  },
 
  view: {
    panEnabled: true,
    zoomEnabled: false
  }
})

const showNodeInfo = {
  'node:click': ({ node }) => {
    closeInfo(true)
    nodeSelectInfo.value.nodeId = node
    nodeSelectInfo.value.name = p.data[p.topology].nodes[node].name
    nodeSelectInfo.value.ip = p.data[p.topology].nodes[node].ip
    nodeSelectInfo.value.type = p.data[p.topology].nodes[node].type
  }
}

const closeInfo = (e) => {
  if (e) {
    nodeSelectInfo.value = {
      nodeId: '',
      name: '',
      ip: '',
      type: ''
    }
  }
}

const addNewNode = () => {
  useLocalStorage.newNode(p.data, p.topology, '', '', '0','', 50, 50)
  emits("settoast","New Node Added")
}

const deleteNode = (nodeId) => {
  useLocalStorage.deleteNode(p.data, p.topology, nodeId)
  emits("settoast","Node Deleted","danger")
}

const updateNode = (nodeId, updatedNode) => {
  useLocalStorage.updateNode(p.data, p.topology, nodeId, updatedNode)
  emits("settoast",updatedNode.name + ":Node Updated")
}

const addTarget = (targetId,connType) => {
  if(targetId.length==0 || targetId == "" || connType.length == 0 || String(connType).match("Select") ){
    emits("settoast","Empty Target ID or Connection Type","danger")
  }else{
  useLocalStorage.addConnection(p.data, p.topology, nodeSelectInfo.value.nodeId, targetId,connType)
  emits("settoast",targetId + ":Target Added")
  }
}

const updateTName = (e) => {
  if (e.target.value) {
    useLocalStorage.updateTopologyName(p.data, p.topology, e.target.value)
    emits("settoast","Topology Name Updated")
  }
}

// watch(pingData,()=>{
//   startPinging()
// }, { deep: true })

let intervalId = null // Store the interval ID globally

const startPinging = () => {
  if (!ipcRenderer) return

  // Ensure any existing interval is cleared before starting a new one
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  // Start the interval for active pinging
  intervalId = setInterval(async () => {
    const activeNodes = Object.keys(pingData.value || {})
    if (activeNodes.length === 0) return // Do nothing if no active nodes exist

    const pingPromises = activeNodes.map(async (nodeId) => {
      const ip = p.data[p.topology].nodes[nodeId]?.ip
      if (!ip) {
        delete pingData.value[nodeId] // Remove invalid nodes
        return null
      }

      try {
        const result = await ipcRenderer.invoke('ping-ip', ip,Number(p.settings['packettimeout']),p.settings['packets'])
        return { nodeId, result }
      } catch (error) {
        return { nodeId, error: 'error' }
      }
    })

    const results = (await Promise.all(pingPromises)).filter(Boolean)

    // Update pingData only if the node still exists
    results.forEach(({ nodeId, result, error }) => {
      if (nodeId in pingData.value) {
        if (result) {
          pingData.value[nodeId] = result.alive ? `${result.avg}` : 'Offline'
        } else {
          pingData.value[nodeId] = 'Error'
        }
      }
    })
  }, Number(p.settings['pingtimeout'])) 
}

// Use onUnmounted to clean up the interval
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})

onBeforeMount(() => {
  startPinging()
})
</script>

<style scoped>
.v-network-graph {
  width: 100%;
  height: 100%;
  display: block;
}

.space {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-text);
  height: 100vh;
  width: 100vw;
  position: relative;
}
.pingBlink{
  animation: blink 1s infinite;
  font-size: 10px;  
}
  [data-bs-theme="light"] .png-theme{
        filter: invert(0) brightness(0);
    }
    [data-bs-theme="dark"] .png-theme{
        filter: invert(1) brightness(100%);
    }
@keyframes blink {
  0%,100%{
    opacity:1
  }
  50%{
    opacity: 0;
  }
}

</style>
