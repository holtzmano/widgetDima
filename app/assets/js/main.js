ZOHO.embeddedApp.on("PageLoad", function (data) {
  console.log(data);
  console.log(data.EntityId);
  console.log(data.Entity);
  let entityId = data.EntityId;
  let entityName = data.Entity;

  ZOHO.CRM.UI.Resize({ height: "600", width: "800" });
    ZOHO.CRM.API.getRecord({
      Entity: entityName,
      approved: "both",
      RecordID: entityId,
    }).then(function (entityData) {
      console.log(entityData.data);
      let entityDetail = entityData.data[0];
      //
      
      LoadWidget(entityDetail);
      Prod_select(entityDetail);

      $("#selectButton").click(function () {
        Submit(entityDetail);
      });

      $("#cancelButton").click(function () {
        ZOHO.CRM.UI.Popup.close();
      });
      $("#prod_cancelButton").click(function () {
        ZOHO.CRM.UI.Popup.close();
      });
    });
  });

ZOHO.embeddedApp.init();
