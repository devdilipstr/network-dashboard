<script setup>
import { ref, onBeforeMount,watch } from "vue"
import space from "./components/space.vue"
import TopologySection from "./components/topologySection.vue"
import useLocalStorage from "./components/useLocalStorage"
import LogIn from "./components/logIn.vue"
import settingsSide from "./components/settingsSide.vue"
import ShowToast from "./components/showToast.vue"



const data = ref({})
const settings = ref({})
const selectedTopology = ref(null)
const islogged = ref(false)
const viewonly = ref(false)
const settingsidestatus = ref(false)
const toastData =  ref({
  text:"",
  bg:""
})
const darkMode = ref(localStorage.getItem("darkMode") === "true")

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem("darkMode",darkMode.value)
}

onBeforeMount(async () => {
  try {
    data.value = await useLocalStorage.getData()
    settings.value = await useLocalStorage.getSettings()
    selectedTopology.value = Object.keys(data.value)[0]
  } catch (error) {
    setToast("Error while fetching data","danger")
  }
})

const selectTopology = (id,name) => {
  selectedTopology.value = id
  setToast(name+":topology selected")
}

const deleteTopology = (id,name) => {
  if (selectedTopology.value === id) {
    selectedTopology.value = null
  }
  useLocalStorage.deleteTopology(data.value, id)
  setToast(name+":topology deleted","danger")
}

const checkPass = (pass) => {
  if(pass == undefined || pass.length == 0){
    setToast("empty entry","danger")
  }
  else if (pass === settings.value.adminpass) {
     setToast("Admin Login Sucessfull")
     islogged.value = true
  }else{
     setToast("Check your admin password and try again","danger")
  }
}

const viewOnly = () => {
  islogged.value = true
  viewonly.value = true
 setToast("ViewOnly Login")
}

const openSettings = () => {
  settingsidestatus.value = true
}

const closeSettings = () => {
  settingsidestatus.value = false
  setToast("Settings Closed")
}

const setToast = (text,bg="primary") =>{
  toastData.value = {
    text:text,
    bg:bg
  }
}
let timeoutid = toastData.value  
watch(toastData,()=>{
  if(timeoutid){
    clearTimeout(timeoutid)
  }
  timeoutid = toastData.value
  timeoutid = setTimeout(() => {
    toastData.value.text = ""
    toastData.value.bg =""
  }, 5000);
})
</script>
<template>
  <ShowToast v-if="toastData.text" :toastdata="toastData" :key="toastData.bg"/>
  <div class="main-parent w-100 d-flex justify-content-center" :data-bs-theme="darkMode ? 'dark' : 'light'">
    <LogIn v-if="!islogged" @check-pass="checkPass" @view-only="viewOnly"/>
    <div v-else class="d-flex">    
      <settingsSide v-if="settingsidestatus" :settings="settings" @closeSettings="closeSettings" @settoast="setToast"/>
      <TopologySection v-else :data="data" @select-topology="selectTopology" @deleteTopology="deleteTopology" :viewonly="viewonly" @openSettings="openSettings"  @settoast="setToast" :isdarkmode="darkMode" @toggleDarkMode="toggleDarkMode"/>
      <space v-if="selectedTopology" :data="data" :topology="selectedTopology" :key="selectedTopology" :viewonly="viewonly" :settings="settings" @settoast="setToast"/>
      <h1 v-else class="d-flex align-items-center h-100 justify-content-center w-100">No Topologies or Not Selected</h1>
    </div>
  </div>
</template>

<style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif
  }
  div {
    height: 100vh;
    width: 100%;
  }
  .main-parent{
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
  }
</style>
