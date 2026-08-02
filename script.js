/* ==========================================
   NI CRM
   script.js
========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {

getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
updateDoc,
doc,
query,
orderBy

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ===========================
Firebase
=========================== */

const firebaseConfig = {

apiKey:"AIzaSyD1k3vMvPt3Rqi8JgAl56DrO82vXn3WbAo",
authDomain:"nicrm-1afa3.firebaseapp.com",
projectId:"nicrm-1afa3",
storageBucket:"nicrm-1afa3.firebasestorage.app",
messagingSenderId:"1087524542055",
appId:"1:1087524542055:web:c46c43ba9849e3552566c2"

};

const app=initializeApp(firebaseConfig);

const db=getFirestore(app);

/* ===========================
Variables
=========================== */

const leadForm=document.getElementById("leadForm");

const leadContainer=document.getElementById("leadContainer");

const searchInput=document.getElementById("searchInput");

const statusFilter=document.getElementById("statusFilter");

const template=document.getElementById("leadCardTemplate");

let editId=null;

let allLeads=[];

/* ===========================
Save Lead
=========================== */

leadForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const lead={

name:document.getElementById("name").value.trim(),

mobile:document.getElementById("mobile").value.trim(),

address:document.getElementById("address").value.trim(),

followup:document.getElementById("followup").value,

notes:document.getElementById("notes").value.trim(),

status:"None",

createdAt:new Date()

};

/* Duplicate Mobile */

const duplicate=allLeads.find(item=>item.mobile===lead.mobile && item.id!==editId);

if(duplicate){

alert("Mobile Number Already Exists");

return;

}

try{

if(editId){

await updateDoc(doc(db,"Leads",editId),{

name:lead.name,

mobile:lead.mobile,

address:lead.address,

followup:lead.followup,

notes:lead.notes

});

alert("Lead Updated");

editId=null;

}else{

await addDoc(collection(db,"Leads"),lead);

alert("Lead Saved");

}

leadForm.reset();

loadLeads();

}

catch(error){

alert(error.message);

}

});

/* ===========================
Load Leads
=========================== */

async function loadLeads(){

leadContainer.innerHTML="";

allLeads=[];

const q=query(

collection(db,"Leads"),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);

snapshot.forEach(docSnap=>{

const lead=docSnap.data();

lead.id=docSnap.id;

allLeads.push(lead);

});

renderCards(allLeads);

updateDashboard(allLeads);

}

/* ===========================
Render Cards
=========================== */

function renderCards(data){

leadContainer.innerHTML="";

document.getElementById("showingLead").innerHTML=data.length;

data.forEach(lead=>{

const clone=template.content.cloneNode(true);

const card=clone.querySelector(".lead-card");

card.dataset.id=lead.id;

clone.querySelector(".lead-name").innerHTML=lead.name;

clone.querySelector(".lead-mobile").innerHTML=lead.mobile;

clone.querySelector(".lead-address").innerHTML=lead.address;

clone.querySelector(".lead-followup").innerHTML=lead.followup||"-";

clone.querySelector(".lead-notes").innerHTML=lead.notes||"-";

/* Status */

const statusSelect=clone.querySelector(".status-select");

statusSelect.value=lead.status;

applyCardColor(card,lead.status);

/* Status Change */

statusSelect.addEventListener("change",()=>{

changeStatus(

lead.id,

statusSelect.value,

card

);

});

/* Call */

clone.querySelector(".callBtn")

.addEventListener("click",()=>{

window.open(

`tel:${lead.mobile}`

);

});

/* WhatsApp */

clone.querySelector(".whatsappBtn")

.addEventListener("click",()=>{

window.open(

`https://wa.me/91${lead.mobile}`,

"_blank"

);

});

/* Delete */

clone.querySelector(".deleteBtn")

.addEventListener("click",()=>{

deleteLead(lead.id);

});

/* Edit */

clone.querySelector(".editBtn")

.addEventListener("click",()=>{

editLead(lead);

});

leadContainer.appendChild(clone);

});

}
