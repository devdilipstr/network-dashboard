<template>
    <div class="infocontainer w-auto m-2 d-flex h-auto align-items-center justify-content-end">
        <div class="d-flex flex-column infocard p-2" title="total no. of nodes">
            <p class="h6 m-0">Total Nodes</p>
            <p class="h2 m-0 fw-bold ">{{totalnodes}}</p>
        </div>
        <div class="d-flex flex-column infocard p-2" title="No. of nodes where autoping is off">
            <p class="h6 m-0">UnPinged</p>
            <p class="h2 m-0 fw-bold ">{{totalnodes - stats.offline - stats.online}}</p>
        </div>
        <div class="d-flex flex-column infocard p-2" title="No. of online nodes">
            <p class="h6 m-0">Online</p>
            <p class="h2 m-0 fw-bold text">{{stats.online}}</p>
        </div>
        <div class="d-flex flex-column infocard p-2" title="No. of offline nodes">
            <p class="h6 m-0">Offline</p>
            <p class="h2 m-0 fw-bold text-danger">{{stats.offline}}</p>
        </div>
       
    </div>  
</template>
<script setup>
   import {defineProps, onBeforeMount, ref,watch,defineEmits} from 'vue'
   
   import useLocalStorage from './useLocalStorage'
   const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null
   const p = defineProps(['pingData','totalnodes',"topology","mails",'alertvalue'])
   const emits  = defineEmits(["showtoast"])
   const downNodes = ref(null)
    onBeforeMount(async ()=>{
      downNodes.value = await useLocalStorage.serverDownEmailed()
    })
    const types={
        1:"Internet",
        2:"Router",
        3:"PC",
        4:"Switch",
        5:"Server"
    }

   const stats = ref({
       online:0,
       offline:0
   })
   watch(p.pingData,()=>{
       stats.value.online = 0
       stats.value.offline = 0
       Object.entries(p.pingData).map(([nodeid,value])=>{
            if(value == 'Offline'){
                stats.value.offline+=1
                if(!downNodes.value.includes(nodeid)){
                    downNodes.value.push(nodeid)
                    if(p.alertvalue){
                      sendmail(nodeid)
                    }
                    
                }
               
            }else{
                stats.value.online+=1
            }
            downNodes.value.map(value=>{
                if(p.pingData[value]!=='Offline'){
                    downNodes.value = downNodes.value.filter(nodeids=>nodeids!==value)
                }
            })
       })
   },{deep:true})
   
   watch(downNodes,()=>{
        useLocalStorage.serverDownEmailedAdd(downNodes.value)
   },{deep:true})
//    const sendMail = (nodeid) =>{
//         const params = {
//             nodename:useLocalStorage.getNode(p.topology,nodeid).name,
//             bcc:"techartistdilip@gmail.com"
//         }
//         emailjs.send(
//             'service_2374k9t',
//             'template_rlmpzzn',
//             params,
//             'gLXx3zSureYLTuHei'
//         )
//         .then(()=>{
//             console.log("email send successfully")
//         })
//         .catch((err)=>{
//             console.log(err)
//         })
//    }
   const sendmail = async (nodeid) =>{
    const downnode = useLocalStorage.getNode(p.topology,nodeid)
    if(ipcRenderer){
        const emailOptions = {
        from: 'networkdashboardbyds@gmail.com',
        to: `${p.mails.join(",")}`,
        subject: `NodeDown ${downnode.name}`,
        html: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        background: #f4f4f4;
        color: #333;
      }

      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .header {
        text-align: center;
        background: red;
        color: white;
        padding: 15px;
        border-radius: 10px 10px 0 0;
      }

      .header h1 {
        margin: 0;
        font-size: 22px;
      }

      .content {
        padding: 20px;
        text-align: center;
      }

      .node-name {
        font-size: 18px;
        font-weight: bold;
        color: #d9534f; /* Red color to emphasize the node issue */
        margin: 20px 0;
      }

      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #dddddd;
      }

      .footer p {
        margin: 5px 0;
      }
    </style>
    <!-- Import Poppins Font -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <h1>Network Alert</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>Hello,</p>
        <p>We’ve detected that a node in your network topology is down:</p>
         <div class="node-name">NodeId: <strong style="color: #d9534f;">${nodeid}</strong></div>
        <div class="node-name">Node Name: <strong style="color: #d9534f;">${downnode.name}</strong></div>
        <div class="node-name">IP Address: <strong style="color: #d9534f;">${downnode.ip}</strong></div>
        <div class="node-name">Type: <strong style="color: #d9534f;">${types[downnode.type]}</strong></div>
       
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Message by Network Dashboard by DS</p>
      </div>
    </div>
  </body>
</html>
`
    }
    const result  = await ipcRenderer.invoke('send-email',emailOptions)
    if(result == "success"){
       emits("showtoast","Node Down: Alert Mail Sent","danger")
    }else{
      emits("showtoast","Node Down: Mail Send Failed","danger")
      console.log(result)
    }
    }
    return 
   }
</script>
<style>
     .infocontainer{
        position: absolute;
        top: 0;
        right: 0;  
    }
    .infocard{
        background-color: var(--bs-tertiary-bg);
        border-radius: 10px;
        margin-right: 5px
    }
</style>