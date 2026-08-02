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
/* ==========================================
Status Change
========================================== */

async function changeStatus(id,status,card){

try{

await updateDoc(doc(db,"Leads",id),{

status:status

});

applyCardColor(card,status);

const lead=allLeads.find(x=>x.id===id);

if(lead){

lead.status=status;

}

updateDashboard(allLeads);

}catch(error){

alert(error.message);

}

}

/* ==========================================
Card Color
========================================== */

function applyCardColor(card,status){

card.classList.remove(

"status-none",
"status-future",
"status-negotiation",
"status-proposal",
"status-call"

);

switch(status){

case "Contact in Future":

card.classList.add("status-future");

break;

case "Negotiation":

card.classList.add("status-negotiation");

break;

case "Proposal Sent":

card.classList.add("status-proposal");

break;

case "Call Attempted":

card.classList.add("status-call");

break;

default:

card.classList.add("status-none");

}

}

/* ==========================================
Dashboard Counter
========================================== */

function updateDashboard(data){

document.getElementById("totalLead").innerHTML=data.length;

document.getElementById("futureLead").innerHTML=

data.filter(x=>x.status==="Contact in Future").length;

document.getElementById("negotiationLead").innerHTML=

data.filter(x=>x.status==="Negotiation").length;

document.getElementById("proposalLead").innerHTML=

data.filter(x=>x.status==="Proposal Sent").length;

document.getElementById("callLead").innerHTML=

data.filter(x=>x.status==="Call Attempted").length;

}

/* ==========================================
Search
========================================== */

searchInput.addEventListener("keyup",filterLead);

statusFilter.addEventListener("change",filterLead);

function filterLead(){

const keyword=searchInput.value.toLowerCase();

const status=statusFilter.value;

const filtered=allLeads.filter(lead=>{

const matchSearch=

lead.name.toLowerCase().includes(keyword) ||

lead.mobile.includes(keyword);

const matchStatus=

status==="All" ||

lead.status===status;

return matchSearch && matchStatus;

});

renderCards(filtered);

}

/* ==========================================
Delete Lead
========================================== */

async function deleteLead(id){

const ok=confirm("Delete this lead?");

if(!ok) return;

try{

await deleteDoc(doc(db,"Leads",id));

loadLeads();

}catch(error){

alert(error.message);

}

}

/* ==========================================
Edit Lead
========================================== */

function editLead(lead){

editId=lead.id;

document.getElementById("name").value=lead.name;

document.getElementById("mobile").value=lead.mobile;

document.getElementById("address").value=lead.address;

document.getElementById("followup").value=lead.followup;

document.getElementById("notes").value=lead.notes;

window.scrollTo({

top:0,

behavior:"smooth"

});

}

/* ==========================================
Load Page
========================================== */

loadLeads();
/* ==========================================
CSV EXPORT
========================================== */

document.getElementById("exportBtn").addEventListener("click", exportCSV);

function exportCSV() {

    let csv = "Name,Mobile,Address,FollowUpDate,Status,Notes\n";

    allLeads.forEach((lead) => {

        csv += `"${lead.name}","${lead.mobile}","${lead.address}","${lead.followup}","${lead.status}","${lead.notes}"\n`;

    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const today = new Date().toISOString().split("T")[0];

    link.href = url;

    link.download = `Leads_${today}.csv`;

    link.click();

}

/* ==========================================
CSV IMPORT
========================================== */

document.getElementById("importBtn").addEventListener("click", () => {

    document.getElementById("csvFile").click();

});

document.getElementById("csvFile").addEventListener("change", importCSV);

async function importCSV(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function (event) {

        const lines = event.target.result.split(/\r?\n/);

        let imported = 0;

        let duplicate = 0;

        let skipped = 0;

        for (let i = 1; i < lines.length; i++) {

            if (lines[i].trim() === "") continue;

            const row = lines[i].split(",");

            const lead = {

                name: row[0]?.replace(/"/g, "").trim(),

                mobile: row[1]?.replace(/"/g, "").trim(),

                address: row[2]?.replace(/"/g, "").trim(),

                followup: row[3]?.replace(/"/g, "").trim(),

                status: row[4]?.replace(/"/g, "").trim() || "None",

                notes: row[5]?.replace(/"/g, "").trim(),

                createdAt: new Date()

            };

            /* Skip Empty */

            if (!lead.name || !lead.mobile) {

                skipped++;

                continue;

            }

            /* Duplicate Mobile */

            const exists = allLeads.find(x => x.mobile === lead.mobile);

            if (exists) {

                duplicate++;

                continue;

            }

            try {

                await addDoc(collection(db, "Leads"), lead);

                imported++;

                allLeads.push(lead);

            }

            catch (err) {

                skipped++;

            }

        }

        alert(

`Import Completed

Imported : ${imported}

Duplicate : ${duplicate}

Skipped : ${skipped}`

);

        loadLeads();

    };

    reader.readAsText(file);

}

/* ==========================================
DOWNLOAD SAMPLE CSV
========================================== */

function downloadSampleCSV(){

const sample=

`Name,Mobile,Address,FollowUpDate,Status,Notes
ABC Interior,9876543210,Kolkata,2026-08-10,Negotiation,Website Requirement
XYZ Furniture,9123456789,Howrah,2026-08-15,Proposal Sent,Waiting for Approval`;

const blob=new Blob([sample],{

type:"text/csv"

});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="Sample-Leads.csv";

a.click();

}

/* ==========================================
END OF SCRIPT
========================================== */
