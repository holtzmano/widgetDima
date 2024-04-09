let tenants_array = [];
let sureties_array = [];
let prod_for_approve = null;
let approve_list = [];
let req_prod_list =[];
let prod_limits = [];
let main_prod_list = [];
function LoadWidget(entity) {
  $("#submitButton").prop("disabled", true).addClass("btn-disabled");
  $(".loader-container").css("display", "inline-block");

  ZOHO.CRM.CONFIG.getCurrentUser().then(function(data){
    let user_mail = data.users[0].email;
   let func_name = "button_click";
   let req_data = {
     arguments: JSON.stringify({
       id: entity.id,
       user_mail: user_mail,
       module: "Risk",
       button_name: "Potential_update"
     }),
   };

   ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(function (data) {
   });
  });

    ZOHO.CRM.API.getAllRecords({Entity:"Products",sort_order:"asc",per_page:100,page:1})
.then(function(data){
  console.log("product_list " + data.data)
  let product_list = data.data;
  product_list.forEach((el) => {
   if(el.product_type == "ראשי" && el.active == "כן"){
    main_prod_list.push(el.id);
 }
});
})
  const tbody = document.getElementById("tbody");
  const deposit = document.getElementById("deposit");
  const deposit_label = document.createElement("th");
  deposit_label.textContent = "פיקדון";
  const deposit_value = document.createElement("td");
  deposit_value.textContent = entity.deposit;
  const model = document.createElement("th");
  model.textContent = "מודל חיתום";
  const model_value = document.createElement("td");
  model_value.textContent = entity.model;
  deposit.append(  model_value,  model, deposit_value, deposit_label);
  // eslint-disable-next-line no-undef
  ZOHO.CRM.API.getRelatedRecords({Entity:"Risk",RecordID:entity.id,RelatedList:"contact_roles",page:1,per_page:200})
.then(function(data){
  console.log("Contacts_Roles");
    console.log("contacts_roles", data.data);
    data.data.forEach(element => {
      if (element.Role == "דייר פוטנציאלי") {
        console.log(element);
        tenants_array.push(element.id);
        const tr = document.createElement("tr");
        const td_role = document.createElement("td");
        const label_role = document.createElement("label");
        const td_Name = document.createElement("td");
        const label_Name = document.createElement("label");
        const td_how_paying = document.createElement("td");
        const td_guarantee = document.createElement("td");

        ZOHO.CRM.META.getFields({ Entity: "Contacts_Roles" }).then(function (data) {        
          var how_paying_obj = data.fields.find(
            (e) => e.api_name === "how_paying"
          );
          var guarantee_obj = data.fields.find(
            (e) => e.api_name === "guarantee"
          );

          how_paying_obj.pick_list_values.forEach((el) => {
            const checkbox = document.createElement("input");
            const checkbox_label = document.createElement("label");
            const checkbox_p = document.createElement("p");

            checkbox.type = "checkbox";
            checkbox.name = "p_t_h_p_"+element.id;
            checkbox.id = el.display_value + "_"+ element.id;
            checkbox_label.textContent  = el.display_value;
            
            checkbox_p.append(checkbox_label);
            checkbox_label.append(checkbox);
            td_how_paying.append(checkbox_p);

            if(element.how_paying.includes(el.display_value) == true && element.how_paying.includes("לא משלם") != true){
              checkbox.checked = true;
            }

            if(element.how_paying.includes("לא משלם") == true){
              if(el.display_value == "לא משלם" ){
                checkbox.checked = true;
              } else{
                checkbox.checked = false;
                checkbox.disabled = true;
              }
            }

            checkbox.addEventListener("change", ()=>{
              if(checkbox.id == "לא משלם_"+element.id && checkbox.checked == true){
                console.log(checkbox.name);
                console.log(checkbox.id);
                document.getElementsByName("p_t_h_p_"+element.id).forEach((box) => {
                if(box.id != "לא משלם_"+element.id){
                  box.checked = false;
                  box.disabled = true;
                }
                });
              } else if(checkbox.id == "לא משלם_"+element.id && checkbox.checked == false) {
                document.getElementsByName("p_t_h_p_"+element.id).forEach((box) => {
                  if(box.id != "לא משלם_"+element.id){
                  
                  box.disabled = false;
                  }
                });
              }
            });
          });

          guarantee_obj.pick_list_values.forEach((el) => {
            const checkbox = document.createElement("input");
            const checkbox_label = document.createElement("label");
            const checkbox_p = document.createElement("p");

            checkbox.type = "checkbox";
            checkbox.name = "p_t_g_"+element.id;
            checkbox.id = el.display_value + "_"+ element.id;
            checkbox_label.textContent  = el.display_value;
            checkbox_p.append(checkbox_label);
            checkbox_label.append(checkbox);
            td_guarantee.append(checkbox_p);

            if(element.guarantee.includes(el.display_value) == true && element.guarantee.includes("אין") != true){
              checkbox.checked = true;
            }

            if(element.guarantee.includes("אין") == true){
              if(el.display_value == "אין" ){
                checkbox.checked = true;
              } else{
                checkbox.checked = false;
                checkbox.disabled = true;
              }

            }

            checkbox.addEventListener("change", ()=>{
              if(checkbox.id == "אין_"+element.id && checkbox.checked == true){
                console.log(checkbox.name);
                console.log(checkbox.id);
                document.getElementsByName("p_t_g_"+element.id).forEach((box) => {
                if(box.id != "אין_"+element.id){
                  box.checked = false;
                  box.disabled = true;
                }
                });
              } else if(checkbox.id == "אין_"+element.id && checkbox.checked == false) {
                document.getElementsByName("p_t_g_"+element.id).forEach((box) => {
                  if(box.id != "אין_"+element.id){
                  
                  box.disabled = false;
                  }
                });
              }
            });
          });   
        });
        
        label_role.textContent = "דייר";
        label_Name.textContent = element.Name + " " + element.First_Name;
        td_Name.append(label_Name);
        td_role.append(label_role);
        tr.append( td_guarantee, td_how_paying, td_role, td_Name );
        tbody.append(tr);
      }
    }); 
}).then(function(){
if(tenants_array.length > 1){
  console.log(tenants_array.length);
  const together_apart_table = document.getElementById("together_apart");
    const together_apart_label = document.createElement("th");
    together_apart_label.textContent = "חותמים ביחד ולחוד";
    const together_apart_value = document.createElement("td");
    
    ZOHO.CRM.META.getFields({ Entity: "Risk" }).then(function (data) {
      
      var together_apart_obj = data.fields.find(
        (e) => e.api_name === "together_apart"
      );
    
      together_apart_obj.pick_list_values.forEach((el) => {
              const checkbox = document.createElement("input");
              const checkbox_label = document.createElement("label");
              const checkbox_p = document.createElement("p");
              checkbox.type = "checkbox";
              if(el.display_value != "-None-"){
                if(entity.together_apart == el.display_value){
                  checkbox.checked = true;
                }
              checkbox_label.textContent  = el.display_value;
              checkbox.name = entity.id;
              checkbox.id = el.display_value;
    
              checkbox_p.append(checkbox_label);
              checkbox_label.append(checkbox);
              together_apart_value.append(checkbox_p);
              }
              checkbox.addEventListener("change", () => {
                const check_array = document.getElementsByName(entity.id);
                check_array.forEach((box) => {
                  if(box.id != checkbox.id){
                    box.checked = false;
                  }
                });
              });
      });
    });
    together_apart_table.append(together_apart_value, together_apart_label);
  }
})
.catch(function(err){
  console.log(err);
});


ZOHO.CRM.API.getRelatedRecords({Entity:"Risk",RecordID:entity.id,RelatedList:"contact_roles",page:1,per_page:200})
.then(function(data){
  console.log("Contacts_Roles");
    console.log(data.data);
    data.data.forEach(element => {
      if (element.Role == "ערב פוטנציאלי") {
        sureties_array.push(element.id);
        const tr = document.createElement("tr");
        const td_role = document.createElement("td");
        const label_role = document.createElement("label");
        const td_Name = document.createElement("td");
        const label_Name = document.createElement("label");
        const td_how_paying = document.createElement("td");
        const td_guarantee = document.createElement("td");

        ZOHO.CRM.META.getFields({ Entity: "Contacts_Roles" }).then(function (data) {        
          var how_paying_obj = data.fields.find(
            (e) => e.api_name === "how_paying"
          );
          var guarantee_obj = data.fields.find(
            (e) => e.api_name === "guarantee"
          );
      
          how_paying_obj.pick_list_values.forEach((el) => {
            const checkbox = document.createElement("input");
            const checkbox_label = document.createElement("label");
            const checkbox_p = document.createElement("p");

            checkbox.type = "checkbox";
            checkbox.name = "s_h_p_"+element.id;
            checkbox.id = el.display_value + "_"+ element.id;
            checkbox_label.textContent  = el.display_value;
            checkbox_p.append(checkbox_label);
            checkbox_label.append(checkbox);
            td_how_paying.append(checkbox_p);

            if(element.how_paying.includes(el.display_value) == true && element.how_paying.includes("לא משלם") != true){
              checkbox.checked = true;
            }

            if(element.how_paying.includes("לא משלם") == true){
              if(el.display_value == "לא משלם" ){
                checkbox.checked = true;
              } else{
                checkbox.checked = false;
                checkbox.disabled = true;
              }
            }

            checkbox.addEventListener("change", ()=>{
              if(checkbox.id == "לא משלם_"+element.id && checkbox.checked == true){
                console.log(checkbox.name);
                console.log(checkbox.id);
                document.getElementsByName("s_h_p_"+element.id).forEach((box) => {
                if(box.id != "לא משלם_"+element.id){
                  box.checked = false;
                  box.disabled = true;
                }
                });
              } else if(checkbox.id == "לא משלם_"+element.id && checkbox.checked == false) {
                document.getElementsByName("s_h_p_"+element.id).forEach((box) => {
                  if(box.id != "לא משלם_"+element.id){
                  
                  box.disabled = false;
                  }
                });
              }
            });
          });

          guarantee_obj.pick_list_values.forEach((el) => {
            const checkbox = document.createElement("input");
            const checkbox_label = document.createElement("label");
            const checkbox_p = document.createElement("p");

            checkbox.type = "checkbox";
            checkbox.name = "s_g_"+element.id;
            checkbox.id = el.display_value + "_"+ element.id;
            checkbox_label.textContent  = el.display_value;
            checkbox_p.append(checkbox_label);
            checkbox_label.append(checkbox);
            td_guarantee.append(checkbox_p);

            if(element.guarantee.includes(el.display_value) == true && element.guarantee.includes("אין") != true){
              checkbox.checked = true;
            }

            if(element.guarantee.includes("אין") == true){
              if(el.display_value == "אין" ){
                checkbox.checked = true;
              } else{
                checkbox.checked = false;
                checkbox.disabled = true;
              }
            }

            checkbox.addEventListener("change", ()=>{
              if(checkbox.id == "אין_"+element.id && checkbox.checked == true){
                console.log(checkbox.name);
                console.log(checkbox.id);
                document.getElementsByName("s_g_"+element.id).forEach((box) => {
                if(box.id != "אין_"+element.id){
                  box.checked = false;
                  box.disabled = true;
                }
                });
              } else if(checkbox.id == "אין_"+element.id && checkbox.checked == false) {
                document.getElementsByName("s_g_"+element.id).forEach((box) => {
                  if(box.id != "אין_"+element.id){
                  box.disabled = false;
                  }
                });
              }
            });
          });  
        });
        label_role.textContent = "ערב";
        label_Name.textContent = element.Name + " " + element.First_Name;
        td_Name.append(label_Name);
        td_role.append(label_role);
        tr.append(  td_guarantee, td_how_paying, td_role, td_Name); 
        tbody.append(tr);
      }
      }); 
});

$(".loader-container").css("display", "none");
$("#submitButton").prop("disabled", false).removeClass("btn-disabled");
}

function Submit(entity) {
  console.log("Submit");
  console.log(entity);
  $("#selectButton").prop("disabled", true).addClass("btn-disabled");
  $("#cancelButton").prop("disabled", true).addClass("btn-disabled");
  $(".loader-container").css("display", "inline-block");

  console.log("prod_for_approve " + prod_for_approve);
 console.log(tenants_array);
 console.log(sureties_array);
 let obj_array = [];
 let errors = {"empty_array": false};
 
 tenants_array.forEach((tenant) => {
  let p_t_h_p_array = [];
  let p_t_g_array = [];

 document.getElementsByName("p_t_h_p_"+tenant).forEach((box) => {
  if(box.checked == true){
   p_t_h_p_array.push(box.id.split("_")[0]);
  }
 });

 document.getElementsByName("p_t_g_"+tenant).forEach((box) => {
  if(box.checked == true){
    p_t_g_array.push(box.id.split("_")[0]);
  }
 });

 const obj = {"module": "Contacts_Roles", "id":tenant, "how_paying": p_t_h_p_array, "guarantee": p_t_g_array };
 
  obj_array.push(obj);

   console.log(p_t_h_p_array);
   console.log(p_t_g_array);
   console.log(obj);
   if(p_t_h_p_array.length == 0 || p_t_g_array == 0 ) {
    if(errors.empty_array == false) {
      errors.empty_array = true;
    }
   }

});

sureties_array.forEach((surety) => {
  let s_h_p_array = [];
  let s_g_array = [];

 document.getElementsByName("s_h_p_"+surety).forEach((box) => {
  if(box.checked == true){
    s_h_p_array.push(box.id.split("_")[0]);
  }
 });

 document.getElementsByName("s_g_"+surety).forEach((box) => {
  if(box.checked == true){
    s_g_array.push(box.id.split("_")[0]);
  }
 });

 const obj = {"module": "Contacts_Roles", "id":surety, "how_paying": s_h_p_array, "guarantee": s_g_array };
 
  obj_array.push(obj);

   console.log(s_h_p_array);
   console.log(s_g_array);
   console.log(obj);
   if(s_h_p_array.length == 0 || s_g_array == 0 ) {
    if(errors.empty_array == false) {
      errors.empty_array = true;
    }
   }
});

console.log(obj_array);

let together_apart = null;

if(tenants_array.length >1) {
const together_apart_array = document.getElementsByName(entity.id);
together_apart_array.forEach((el) =>{
  if(el.checked == true) {
    together_apart = el.id;
  }
});
}

if(errors.empty_array == true || (together_apart == null && tenants_array.length >1)){
  swal({
    title: "שגיאה",
    text: "חובה לסמן לפחות אופציה אחת בכל תא!",
    icon: "error",
  }).then((value) => {
    if (value) {
     
    }
  });
}else {
  obj_array.forEach((rec) =>{
    var config={
      Entity:rec.module,
      APIData:{
            "id": rec.id,
            "how_paying": rec.how_paying,
            "guarantee": rec.guarantee
      },
      Trigger:["workflow"]
    }
    ZOHO.CRM.API.updateRecord(config)
    .then(function(data){
        console.log(data)
    })
  });
  if(tenants_array.length >1) {
  var config={
    Entity:"Risk",
    APIData:{
          "id": entity.id,
          "together_apart": together_apart
          
    },
    Trigger:["workflow"]
  }
  ZOHO.CRM.API.updateRecord(config)
  .then(function(data){
      console.log(data)
  })
}
  swal({
    title: "הצלחה",
    text: "המידע עודכן",
    icon: "success",
  }).then((value) => {
    if (value) {
      
    }
  });

$("#table").hide();
$("#selectButton").hide();
if(tenants_array.length >1) {
  $("#together_apart_table").hide();
}

const save = document.createElement("button");
save.classList.add("button", "button-primary");
save.textContent = "שמירה";
save.id = "save_btn";
$("#button-group").prepend(save);

const next_table = document.getElementById("next_table");

const thead = document.createElement("thead");
const th_risk_commission = document.createElement("th");
const th_discount_percent = document.createElement("th");
const th_type = document.createElement("th");

const tbody = document.createElement("tbody");
const td_risk_commission = document.createElement("td");
const td_discount_percent = document.createElement("td");
const td_type = document.createElement("td");

const input_risk_commission = document.createElement("input");
const input_discount_percent = document.createElement("input");

th_risk_commission.textContent = "אחוז אישור חיתום";
th_discount_percent.textContent = "אחוז הנחה";
th_type.textContent = "סוג";

input_risk_commission.value = entity.risk_commission;
input_discount_percent.value = entity.discount_percent;
input_discount_percent.type = "number";
input_risk_commission.type = "number";
input_discount_percent.step = "5";
input_risk_commission.step = ".1";

function setTwoNumberDecimal(event) {
  this.value = parseFloat(this.value).toFixed(1);
}

function setNumberDecimal(event) {
  this.value = parseFloat(this.value).toFixed(0);
}
input_risk_commission.onchange = setTwoNumberDecimal;

input_discount_percent.onchange = setNumberDecimal;

          const checkbox = document.createElement("input");
          const checkbox_label = document.createElement("label");
          const checkbox_p = document.createElement("p");

          checkbox.type = "checkbox";
 
          checkbox_label.textContent  = prod_for_approve.prod_name;
          checkbox.name = "Products";
          checkbox_p.append(checkbox_label);
          td_type.append(checkbox_p);

td_risk_commission.append(input_risk_commission);
td_discount_percent.append(input_discount_percent);

tbody.append( td_discount_percent, td_risk_commission, td_type );
thead.append( th_discount_percent, th_risk_commission, th_type );
next_table.append(thead, tbody);

save.addEventListener("click", () =>{
  console.log("prod_for_approve " + prod_for_approve);
  let risk_commission = input_risk_commission.value;
  let discount_percent = input_discount_percent.value;
  let type ="";
  let prod_id = 0;
    type = prod_for_approve.prod_name;
    prod_id = prod_for_approve.prod_id;

  console.log(risk_commission);
  console.log(discount_percent);
  console.log(type);

 let max_per = 0;
 let min_per = 0;

  prod_limits.forEach(element => {
    if(prod_for_approve.prod_id == element.prod_id ){
      if(element.max_per != null){
        max_per = element.max_per;
      }
      if(element.min_per != null){
        min_per = element.min_per;
      }
    }
  });
  
  let error = "";
  if(risk_commission == "" || discount_percent == "" || type == "" ) {
    error = "חובה למלא את כל השדות";
  } else if (Number(discount_percent) > 20){
    error = "לא ניתן לתת הנחה מעל ל 20% משווי המוצר";
  }else if (Number(risk_commission) > max_per || Number(risk_commission) < min_per){
    error = " העמלה צריכה להיות בין " +max_per+"%" +" ו- "+ min_per+"%";
  }
if(error != "" ) {
  swal({
    title: "שגיאה",
    text: error,
    icon: "error",
  }).then((value) => {
    if (value) {
     
    }
  });
} else {
  var config={
    Entity:"Risk",
    APIData:{
          "id": entity.id,
          "risk_commission": risk_commission,
          "discount_percent": discount_percent,
          "Type": type,
          "Product" : prod_id
    },
    Trigger:["workflow"]
  }
  ZOHO.CRM.API.updateRecord(config)
  .then(function(data){
      console.log(data)
  })
  swal({
    title: "הצלחה",
    text: "המידע עודכן",
    icon: "success",
  }).then((value) => {
    if (value) {
      Next_prod(entity);
     
    }
  });
}
});
}
$(".loader-container").css("display", "none");
$("#selectButton").prop("disabled", false).removeClass("btn-disabled");
$("#cancelButton").prop("disabled", false).removeClass("btn-disabled");
}

function Prod_select(entity){
  var func_name = "get_risk_log_for_widget";
var req_data ={
  "arguments": JSON.stringify({
      "rec_id" : entity.id 
  })
};
ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
.then(function(data){
   
let get_risk_log_for_widget = JSON.stringify(data);

 console.log("get_risk_log_for_widget " + get_risk_log_for_widget);
  const prod_tbody = document.getElementById("prod_tbody");
  let req_prod = entity.req_prod;
  if(req_prod != null){
    req_prod = req_prod.split(",");
  } else {
   
    req_prod = main_prod_list;
  }
  
  req_prod_list = req_prod;
  console.log(req_prod);
  req_prod.forEach(element => {
    ZOHO.CRM.API.getRecord({
      Entity: "Products", approved: "both", RecordID:element
     })
     .then(function(data){
         console.log(data.data);
         const prod_tr = document.createElement("tr");
         const prod_select_td = document.createElement("td");
         const prod_name = document.createElement("td");
         const prod_select_input = document.createElement("input");
         const prod_status = document.createElement("td");

         prod_name.textContent = data.data[0].Product_Name;
         prod_status.textContent = "חסר אישור";
         if(get_risk_log_for_widget.includes(element) == true || approve_list.includes(element) == true){
          prod_status.textContent = "מאושר";
          prod_status.style.backgroundColor = "#66FF99";
         }
         if(get_risk_log_for_widget.includes(element) == true && approve_list.includes(element) != true){
          approve_list.push(element);
         }
         
         prod_select_input.type = "checkbox";
         prod_select_input.name = "prod_select_input";
         prod_select_input.id = element+"_"+data.data[0].Product_Name;
         prod_select_td.append(prod_select_input);
         prod_tr.append(prod_select_td,prod_name, prod_status );
         prod_tbody.append(prod_tr);

         prod_select_input.addEventListener("change", () => {
          const check_array = document.getElementsByName("prod_select_input");
          check_array.forEach((box) => {
            
            if(box.id != prod_select_input.id){
              box.checked = false;
            }else if (box.id == prod_select_input.id && box.checked == true ){
              prod_for_approve = {"prod_id":prod_select_input.id.split("_")[0], "prod_name":prod_select_input.id.split("_")[1] };
            }else if (box.id == prod_select_input.id && box.checked != true ){
              prod_for_approve = null;
            }
            
          });
        });

        prod_limits.push({"prod_id":data.data[0].id, "min_per":data.data[0].min_per,"max_per":data.data[0].max_per });
      
     })
  });
  
 const prod_selectButton = document.getElementById("prod_selectButton");
 prod_selectButton.addEventListener("click", ()=>{
  console.log("prod_for_approve " + prod_for_approve);
  if(prod_for_approve != null){
    if(approve_list.includes(prod_for_approve.prod_id) !=true){
    approve_list.push(prod_for_approve.prod_id);
    }
  $("#prod_div").prop("hidden", true);
  $("#second_div").prop("hidden", false);
  Tenant_set(entity)

  }else{
    swal({
      title: "שגיאה",
      text: "עליך לבחור לפחות מוצר אחד",
      icon: "error",
    }).then((value) => {
      if (value) {
       
      }
    });
  }
 });

});
  }
  function Next_prod(entity){
    prod_for_approve = null;
    console.log("req_prod_list " + req_prod_list);
    console.log("approve_list " + approve_list);
    var func_name = "risk_log_update";
    var req_data ={
      "arguments": JSON.stringify({
          "rec_id" : entity.id 
      })
    };
    ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
    .then(function(data){
    });
    if(req_prod_list.length == approve_list.length){
      ZOHO.CRM.BLUEPRINT.proceed();
    } else{
      $("#prod_tbody").empty();
      $("#next_table").empty();
      Prod_select(entity);
      $("#prod_div").prop("hidden", false);
      $("#second_div").prop("hidden", true);
    }
  }
  function Tenant_set(entity){
    
$("#table").show();
$("#save_btn").hide();
$("#together_apart_table").show();
$("#selectButton").show();
    
  }

