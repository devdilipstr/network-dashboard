
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId();
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { Alert } from 'bootstrap';

const firebaseConfig = { apiKey: process.env.VUE_APP_FIREBASE_API_KEY, authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN, databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL, projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID, storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID, appId: process.env.VUE_APP_FIREBASE_APP_ID };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// Write to Firebase Realtime Database
const setcollection = (collectionName, dataObject) => {
    try {
        const dbRef = ref(database, collectionName); // Reference to the specified collection
        set(dbRef, dataObject); // Write data
    } catch (error) {
        alert("Error writing data:", error)
    }
};

// Read from Firebase Realtime Database
const fetchcollection = async (collectionName) => {
    try {
        const dbRef = ref(database, collectionName); // Reference to the specified collection
        const snapshot = await get(dbRef); // Fetch data
        if (snapshot.exists()) {
            return snapshot.val(); // Return the fetched data
        } else {
            return null;
        }
    } catch (error) {
        alert("Error fetching data:", error)
    }
};
//connection types
const conns = {
  1: {
    label: "ofc single fiber mode - module",
    color: "#FFC107" // Bootstrap warning yellow
  },
  2: {
    label: "ofc single fiber mode - media convertor",
    color: "#FFC107"
  },
  3: {
    label: "ofc multi mode mode - module",
    color: "#20C997" // Bootstrap teal
  },
  4: {
    label: "ofc multi mode mode - module",
    color: "#20C997"
  },
  5: {
    label: "utp",
    color: "#0d6efd" // Bootstrap primary blue (distinct from teal/yellow)
  },
  6: {
    label: "wireless ap",
    color: "#6610f2" // Bootstrap purple (distinct from gray/blue)
  }
};



const defaultSetting = {
    adminpass: "12345678",
    mails: [],
    packets: "4",
    packettimeout: "2",
    pingtimeout: "5000"
}

//newnode
const newNode = (data, topology, name, ip, type, detail, x, y) => {
    let id = uid.rnd()
    const node = {
        name: name,
        type: type,
        ip: ip,
        detail: detail
    }
    data[topology].nodes[id] = node
    data[topology].positions['nodes'][id] = {
        x: x,
        y: y
    }
    data[topology].autoping[id] = false
    // saveData(data)
    // return data
}
//it will return node
const getNode = (topology, id) => {
    let data = JSON.parse(localStorage.getItem('topologies'))
    return data[topology].nodes[id]
}
//delete node
const deleteNode = (data, topology, id) => {
    delete data[topology].nodes[id]
    deleteBothConnection(data, topology, id)
    deletePosition(data, topology, id)
}

//update node
const updateNode = (data, topology, id, updatedNode) => {
    data[topology].nodes[id] = updatedNode
    // saveData(data)
    // return data
}
//whole data
const getData = async () => {
    const datafromdb = await fetchcollection("topologies")
    localStorage.setItem('topologies', JSON.stringify(datafromdb))
    const data = JSON.parse(localStorage.getItem("topologies"))
    if (data) {
        return data
    } else {
        return {}
    }
}

//setdata
const saveData = async (data) => {
    localStorage.setItem("topologies", JSON.stringify(data))
    await setcollection("topologies", data)
}

//update connection 
const addConnection = (data, topology, source, target, connType) => {
    const id = uid.rnd()
    const newConn = { source: source, target: target, label: conns[connType].label, color: conns[connType].color }
    if(data[topology]['connection'] == null) data[topology]['connection'] = {}
    data[topology]['connection'][id] = newConn
}
//delete connection 
const deleteBothConnection = (data, topology, id) => {
    Object.entries(data[topology].connection).filter(([_, conn]) => conn.target == id || conn.source == id).map(([key]) => {
        delete data[topology].connection[key]
    })
}
const deleteConnection = (data, topology, id) => {
    Object.entries(data[topology].connection).filter(([_, conn]) => conn.target == id).map(([key]) => {
        delete data[topology].connection[key]
    })
}

const deletePosition = (data, topology, id) => {
    delete data[topology].positions.nodes[id]
}
const changeAutoPing = (data, topology, id) => {
    data[topology].autoping[id] = !data[topology].autoping[id]
}
const newTopology = (data, topologyName) => {
    const id = uid.rnd()
    let topology
    if (topologyName.trim().startsWith("{")) {
        topology = JSON.parse(topologyName)
        if (!('autoping' in topology)) {
            topology['autoping'] = {}
        }

        if (!('connection' in topology)) {
            topology['connection'] = {}
        }

        if (!('nodes' in topology)) {
            topology['nodes'] = {}
        }

        if (!('positions' in topology)) {
            topology['positions'] = {}
            topology['positions']['nodes'] = {}
        }
    } else {
        topology = {
            name: topologyName,
            nodes: {

            },
            connection: {

            },
            positions: {
                nodes: {

                }
            },
            autoping: {

            }
        }
    }

    data[id] = topology

    // newNode("TXGB3q","hello111","192.111","router")

}

const deleteTopology = (data, id) => {
    delete data[id]
}

const updateTopologyName = (data, topology, name) => {
    data[topology].name = name
}
const pingDataChange = (pingData, id, value) => {
    if (value) {
        pingData[id] = "..."
    } else {
        delete pingData[id]

    }
}

const getSettings = async () => {
    localStorage.setItem('settings', JSON.stringify(await fetchcollection('settings')))
    const settings = JSON.parse(localStorage.getItem("settings"))
    if (settings.mails) {
        return settings
    } else {
        settings['mails'] = []
        localStorage.setItem("settings", JSON.stringify(settings))
        return settings
    }
}

const updateSettings = (settingsdata, type, value) => {
    if (type == "password") {
        settingsdata["adminpass"] = value
    } else if (type == "addmail") {
        settingsdata.mails.push(value)
    } else if (type == "removemail") {
        settingsdata.mails = settingsdata.mails.filter(val => val !== value)
    } else if (type == "updatepinginfo") {
        settingsdata['packets'] = value.packets
        settingsdata['packettimeout'] = value.packettimeout
        settingsdata['pingtimeout'] = value.pingtimeout
    }

}

const pushUpdateSettings = async (settings) => {
    localStorage.setItem('settings', JSON.stringify(settings))
    await setcollection('settings', settings)
}

const serverDownEmailed = async () => {
    localStorage.setItem('serverdown', JSON.stringify(await fetchcollection('serverdown')))
    const serverdowndata = JSON.parse(localStorage.getItem('serverdown'))
    if (serverdowndata) {
        return serverdowndata
    } else {
        localStorage.setItem('serverdown', JSON.stringify([]))
        return []
    }
}

const serverDownEmailedAdd = async (data) => {
    localStorage.setItem('serverdown', JSON.stringify(data))
    await setcollection('serverdown', data)
}
export default {
    newNode, addConnection, newTopology, deleteNode, updateNode, deleteConnection, getData, saveData, getNode, deleteTopology, updateTopologyName, changeAutoPing, pingDataChange, getSettings, serverDownEmailed, serverDownEmailedAdd, updateSettings, pushUpdateSettings
}