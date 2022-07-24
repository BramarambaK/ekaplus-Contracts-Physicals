db.getCollection('Cargill_Meta').insert({
    "_id" : "1110003",
    "name" : "Contract",
    "type" : "object",
    "fields": {
        "generalDetails": {
          "labelKey": "ContractgeneralDetails",
          "ContractgeneralDetails": "General Details"
        },
        "templateId": {
          "options": [
            {
              "key": "t1",
              "value": "template 1"
            }
          ],
          "labelKey": "ContracttemplateId",
          "ContracttemplateId": "Select Template"
        },
        "templateName": {
          "labelKey": "ContracttemplateName",
          "ContracttemplateName": "Enter Template Name"
        },
        "issueDate": {
          "labelKey": "ContractissueDate",
          "ContractissueDate": "Contract Issue Date"
        },
        "dealType": {
          "options": [
            {
              "key": "thirdParty",
              "value": "Third Party"
            },
            {
              "key": "interCompany",
              "value": "Inter Company"
            }
          ],
          "labelKey": "ContractdealType",
          "ContractdealType": "Deal Type"
        },
        "contractType": {
          "options": [
            {
              "key": "P",
              "value": "Purchase"
            },
            {
              "key": "S",
              "value": "Sale"
            }
          ],
          "labelKey": "ContractcontractType",
          "ContractcontractType": "Contract Type"
        },
        "traderUserId": {
          "options": [
            {
              "key": "userName",
              "value": "Current User"
            }
          ],
          "labelKey": "ContracttraderUserId",
          "ContracttraderUserId": "Trader Name"
        },
        "cpProfileId": {
          "options": [
            {
              "key": "cp1",
              "value": "CP profile"
            }
          ],
          "key": "cpProfileId",
          "labelKey": "ContractcpProfileId",
          "ContractcpProfileId": "CP Name"
        },
        "paymentTermId": {
          "options": [
            {
              "key": "7D",
              "value": "7 days after delivery"
            },
            {
              "key": "15D",
              "value": "15 days after delivery"
            },
            {
              "key": "5D",
              "value": "5 days after delivery"
            },
            {
              "key": "30D",
              "value": "30 days after delivery"
            }
          ],
          "labelKey": "ContractpaymentTermId",
          "ContractpaymentTermId": "Payment Terms"
        },
        "applicableLawId": {
          "options": [
            {
              "key": "maxARB",
              "value": "maximum used arbitration for CP"
            }
          ],
          "labelKey": "ContractapplicableLawId",
          "ContractapplicableLawId": "Applicable Law/Contract"
        },
        "arbitrationId": {
          "options": [
            {
              "key": "arb1",
              "value": "arbitration rule 1"
            }
          ],
          "labelKey": "ContractarbitrationId",
          "ContractarbitrationId": "Arbitration"
        },
        "optional": {
          "labelKey": "Contractoptional",
          "Contractoptional": "Optional"
        },
        "generalDetailsOptional": {
          "labelKey": "ContractgeneralDetailsOptional",
          "ContractgeneralDetailsOptional": "(Broker Name, Broker Person Incharge, Broker Ref. No., Broker Commission, CP Person Incharge, CP Contract Ref. No.)"
        },
        "agentProfileId": {
          "options": [
            {
              "key": "agentName",
              "value": "agent profile name"
            }
          ],
          "labelKey": "ContractagentProfileId",
          "ContractagentProfileId": "Broker Name"
        },
        "agentPersonInCharge": {
          "options": [
            {
              "key": "brokeInCharge",
              "value": "broker Incharge"
            }
          ],
          "labelKey": "ContractagentPersonInCharge",
          "ContractagentPersonInCharge": "Broker Person Incharge"
        },
        "agentRefNo": {
          "options": [
            {
              "key": "brkRef",
              "value": "Broker Ref"
            }
          ],
          "labelKey": "ContractagentRefNo",
          "ContractagentRefNo": "Broker Ref No."
        },
        "agentCommValue": {
          "options": [
            {
              "key": "brkercommission",
              "value": "Broker Commission"
            }
          ],
          "labelKey": "ContractagentCommValue",
          "ContractagentCommValue": "Broker Commission"
        },
        "agentCommPriceUnitId": {
          "options": [
            {
              "key": "commUnit",
              "value": "brokerCommissionUnit"
            }
          ],
          "labelKey": "ContractagentCommPriceUnitId",
          "ContractagentCommPriceUnitId": "Unit"
        },
        "cpPersonInCharge": {
          "options": [
            {
              "key": "cpInCha",
              "value": "Cp Person"
            }
          ],
          "labelKey": "ContractcpPersonInCharge",
          "ContractcpPersonInCharge": "CP Person Incharge"
        },
        "cpRefNo": {
          "options": [
            {
              "key": "cpConRef",
              "value": "Cp cont Ref"
            }
          ],
          "labelKey": "ContractcpRefNo",
          "ContractcpRefNo": "CP Contact Ref No."
        },
        "itemDetails": {
          "labelKey": "ContractitemDetails",
          "ContractitemDetails": "Item Details"
        },
        "productId": {
          "options": [
            {
              "key": "ProductId",
              "value": "Product Id"
            }
          ],
          "labelKey": "ContractproductId",
          "ContractproductId": "Product"
        },
        "quality": {
          "options": [
            {
              "key": "QAT-M0-11758",
              "value": "Arabica Quanlity 1"
            }
          ],
          "labelKey": "Contractquality",
          "Contractquality": "Quality"
        },
        "itemQty": {
          "labelKey": "ContractitemQty",
          "ContractitemQty": "Item Quantity"
        },
        "itemQtyUnitId": {
          "options": [
            {
              "key": "quant",
              "value": "Quantity"
            }
          ],
          "labelKey": "ContractitemQtyUnitId"
        },
        "tolerance": {
          "labelKey": "Contracttolerance",
          "Contracttolerance": "Tolerance"
        },
        "toleranceType": {
          "options": [
            {
              "key": "Percentage",
              "value": "%"
            }
          ],
          "labelKey": "ContracttoleranceType"
        },
        "toleranceLevel": {
          "options": [
            {
              "key": "tolLevel",
              "value": "Level"
            }
          ],
          "labelKey": "ContracttoleranceLevel"
        },
        "payInCurId": {
          "options": [
            {
              "key": "bbl/usd",
              "value": "BBL/USD"
            }
          ],
          "labelKey": "ContractpayInCurId"
        },
        "priceType": {
          "options": [
            {
              "key": "Flat",
              "value": "Flat"
            },
            {
              "key": "Index",
              "value": "Index"
            },
            {
              "key": "Formula",
              "value": "Formula"
            }
          ],
          "labelKey": "ContractpriceType",
          "ContractpriceType": "Price Type"
        },
        "price": {
          "labelKey": "Contractprice",
          "Contractprice": "Contract Price"
        },
        "priceUnitId": {
          "options": [
            {
              "key": "bbl/usd",
              "value": "BBL/USD"
            }
          ],
          "labelKey": "ContractpriceUnitId"
        },
        "payInSettlementCurrency": {
          "options": [
            {
              "key": "GBP",
              "value": "GBP"
            }
          ],
          "labelKey": "ContractpayInSettlementCurrency",
          "ContractpayInSettlementCurrency": "Pay-In Settlement Currency"
        },
        "fxRate": {
          "labelKey": "ContractfxRate",
          "ContractfxRate": "FX-Rate"
        },
        "fxRateUnit": {
          "options": [
            {
              "key": "USD/GBP",
              "value": "USD/GBP"
            }
          ],
          "labelKey": "ContractfxRateUnit"
        },
        "differential": {
          "labelKey": "Contractdifferential",
          "Contractdifferential": "Differential"
        },
        "differentialUnit": {
          "options": [
            {
              "key": "USD/Barrel",
              "value": "USD/Barrel"
            }
          ],
          "labelKey": "ContractdifferentialUnit"
        },
        "formula": {
          "labelKey": "Contractformula",
          "Contractformula": "Formula"
        },
        "baseCurve": {
          "labelKey": "ContractbaseCurve",
          "ContractbaseCurve": "Base Curve"
        },
        "shipmentMode": {
          "options": [
            {
              "key": "transMode1",
              "value": "Vessel"
            }
          ],
          "labelKey": "ContractshipmentMode",
          "ContractshipmentMode": "Transportation Mode"
        },
        "deliveryPeriod": {
          "labelKey": "ContractdeliveryPeriod",
          "ContractdeliveryPeriod": "Delivery Period"
        },
        "originationCountryId": {
          "options": [
            {
              "key": "LoadingCou",
              "value": "Loading Country"
            }
          ],
          "labelKey": "ContractoriginationCountryId",
          "ContractoriginationCountryId": "Loading Country"
        },
        "originationCityId": {
          "options": [
            {
              "key": "LoaCityId",
              "value": "Loading City"
            }
          ],
          "labelKey": "ContractoriginationCityId",
          "ContractoriginationCityId": "Loading Location"
        },
        "loadingLocationGroupTypeId": {
          "options": [
            {
              "key": "City",
              "value": "City"
            },
            {
              "key": "Port",
              "value": "Port"
            }
          ],
          "labelKey": "ContractloadingLocationGroupTypeId",
          "ContractloadingLocationGroupTypeId": "Loading Location"
        },
        "destinationLocationGroupTypeId": {
          "options": [
            {
              "key": "City",
              "value": "City"
            },
            {
              "key": "Port",
              "value": "Port"
            }
          ],
          "labelKey": "ContractdestinationLocationGroupTypeId",
          "ContractdestinationLocationGroupTypeId": "Discharge Loacation"
        },
        "destinationCountryId": {
          "options": [
            {
              "key": "destCountry",
              "value": "destCountr"
            }
          ],
          "labelKey": "ContractdestinationCountryId",
          "ContractdestinationCountryId": "Discharge Country"
        },
        "destinationCityId": {
          "options": [
            {
              "key": "destiCityId",
              "value": "dest city"
            }
          ],
          "labelKey": "ContractdestinationCityId",
          "ContractdestinationCityId": "Discharge Location"
        },
        "paymentDueDate": {
          "labelKey": "ContractpaymentDueDate",
          "ContractpaymentDueDate": "Payment Due Date"
        },
        "incotermId": {
          "options": [
            {
              "key": "Inco",
              "value": "Invo"
            }
          ],
          "labelKey": "ContractincotermId",
          "ContractincotermId": "INCO Term"
        },
        "profitCenterId": {
          "options": [
            {
              "key": "profCenId",
              "value": "profCenId"
            }
          ],
          "labelKey": "ContractprofitCenterId",
          "ContractprofitCenterId": "Profit Center"
        },
        "strategyAccId": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractstrategyAccId",
          "ContractstrategyAccId": "Strategy"
        },
        "valuationFormula": {
          "options": [
            {
              "key": "value",
              "value": "valuationFormula"
            }
          ],
          "labelKey": "ContractvaluationFormula",
          "ContractvaluationFormula": "Valuation"
        },
        "secondaryCost": {
          "labelKey": "ContractsecondaryCost",
          "ContractsecondaryCost": "Secondary Cost"
        },
        "addCost": {
          "labelKey": "ContractaddCost",
          "ContractaddCost": "+ Add Cost"
        },
        "addMore": {
          "labelKey": "ContractaddMore",
          "ContractaddMore": "+ Add More"
        },
        "costComponent": {
          "options": [
            "Inspection",
            "Package"
          ],
          "key": "costComponent",
          "labelKey": "ContractcostComponent",
          "ContractcostComponent": "Cost Component"
        },
        "costType": {
          "options": [
            "Expense",
            "Other"
          ],
          "key": "costType",
          "labelKey": "ContractcostType",
          "ContractcostType": "Cost Type"
        },
        "rateType": {
          "options": [
            "Absolute",
            "Market Value"
          ],
          "key": "rateType",
          "labelKey": "ContractrateType",
          "ContractrateType": "Rate Type"
        },
        "costValue": {
          "key": "costValue",
          "labelKey": "ContractcostValue",
          "ContractcostValue": "Cost Value"
        },
        "costValueCurrency": {
          "options": [
            "USD",
            "INR",
            "EURO",
            "JPY",
            "GBP"
          ],
          "key": "costValueCurrency",
          "labelKey": "ContractcostValueCurrency"
        },
        "fxToBase": {
          "key": "fxToBase",
          "labelKey": "ContractfxToBase",
          "ContractfxToBase": "FX to Base"
        },
        "secondaryCostComments": {
          "key": "comments",
          "labelKey": "ContractsecondaryCostComments",
          "ContractsecondaryCostComments": "Comments"
        },
        "secondaryCostAction": {
          "labelKey": "ContractsecondaryCostAction",
          "ContractsecondaryCostAction": "Action"
        },
        "generateItems": {
          "labelKey": "ContractgenerateItems",
          "ContractgenerateItems": "Generate Items"
        },
        "saveItemBtn": {
          "labelKey": "ContractsaveItemBtn",
          "ContractsaveItemBtn": "Save Item"
        },
        "newItemBtn": {
          "labelKey": "ContractnewItemBtn",
          "ContractnewItemBtn": "New Item"
        },
        "defineFormula": {
          "labelKey": "ContractdefineFormula",
          "ContractdefineFormula": "Define Formula"
        },
        "saveBtn": {
          "labelKey": "ContractsaveBtn",
          "ContractsaveBtn": "SAVE"
        },
        "itemDeliveryFrequency": {
          "options": [
            {
              "key": "Monthly",
              "value": "Monthly"
            }
          ],
          "labelKey": "ContractitemDeliveryFrequency",
          "ContractitemDeliveryFrequency": "Frequency"
        },
        "itemsGenerateMsg": {
          "labelKey": "ContractitemsGenerateMsg",
          "ContractitemsGenerateMsg": "items will be generated"
        },
        "generateBtn": {
          "labelKey": "ContractgenerateBtn",
          "ContractgenerateBtn": "GENERATE"
        },
        "cancelBtn": {
          "labelKey": "ContractcancelBtn",
          "ContractcancelBtn": "CANCEL"
        },
        "itemNo": {
          "labelKey": "ContractitemNo",
          "ContractitemNo": "Item No."
        },
        "contractQuantity": {
          "labelKey": "ContractcontractQuantity",
          "ContractcontractQuantity": ""
        },
        "minQuantity": {
          "labelKey": "ContractminQuantity",
          "ContractminQuantity": "Min Quantity"
        },
        "maxQuantity": {
          "labelKey": "ContractmaxQuantity",
          "ContractmaxQuantity": "Max Quantity"
        },
        "deliveredQuantity": {
          "labelKey": "ContractdeliveredQuantity",
          "ContractdeliveredQuantity": "Delivered Quantity"
        },
        "openQuantity": {
          "labelKey": "ContractopenQuantity",
          "ContractopenQuantity": "Open Quantity"
        },
        "action": {
          "labelKey": "Contractaction",
          "Contractaction": "Action"
        },
        "addItem": {
          "labelKey": "ContractaddItem",
          "ContractaddItem": "+ Add Item"
        },
        "documentUpload": {
          "labelKey": "ContractdocumentUpload",
          "ContractdocumentUpload": "Document Upload"
        },
        "document": {
          "options": [
            {
              "key": "pdf",
              "value": "PDF"
            }
          ],
          "labelKey": "Contractdocument",
          "Contractdocument": "Document"
        },
        "documentDate": {
          "labelKey": "ContractdocumentDate",
          "ContractdocumentDate": "Document date"
        },
        "description": {
          "labelKey": "Contractdescription",
          "Contractdescription": "Description"
        },
        "optionalItemDetails": {
          "labelKey": "ContractoptionalItemDetails",
          "ContractoptionalItemDetails": "(Quality Finalization Point, Quantity Finalization Point, Inspection Company, Late Payment Interest Type, Late Payment Interest Rate, Interest Method, Option Load, Option Discharge)"
        },
        "qualityFinalizationPoint": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractqualityFinalizationPoint",
          "ContractqualityFinalizationPoint": "Qality Finalization Point"
        },
        "weightFinalizationPoint": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractweightFinalizationPoint",
          "ContractweightFinalizationPoint": "Quantity Finalization Point"
        },
        "inspectionCompany": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractinspectionCompany",
          "ContractinspectionCompany": "Inspection Company"
        },
        "interestRateType": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractinterestRateType",
          "ContractinterestRateType": "Late Payment Interest Type"
        },
        "latePaymentInterestRate": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractlatePaymentInterestRate",
          "ContractlatePaymentInterestRate": "Late Payment Interest Rate"
        },
        "compounding": {
          "options": [
            "",
            ""
          ],
          "labelKey": "Contractcompounding",
          "Contractcompounding": "Compounding"
        },
        "frequency": {
          "options": [
            {
              "key": "One Time",
              "value": "One Time"
            }
          ],
          "labelKey": "Contractfrequency",
          "Contractfrequency": "Frequency"
        },
        "latePaymentInterestMethod": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractlatePaymentInterestMethod",
          "ContractlatePaymentInterestMethod": "Interest Method"
        },
        "optionLoad": {
          "options": [
            {
              "key": "stra",
              "value": "stra"
            }
          ],
          "labelKey": "ContractoptionLoad",
          "ContractoptionLoad": "Option Load"
        },
        "provisionalInvoice": {
          "labelKey": "ContractprovisionalInvoice",
          "ContractprovisionalInvoice": "Provisional Invoice % to Pay "
        },
        "lycanDate": {
          "labelKey": "ContractlycanDate",
          "ContractlycanDate": "Lycan Date"
        },
        "optionDischarge": {
          "labelKey": "ContractoptionDischarge",
          "ContractoptionDischarge": "Option Discharge"
        },
        "itemListTable": {
          "headers": [
            "Item No.",
            "Delivery Periods",
            "Transportation Mode",
            "Contract Quantity",
            "Min Quantity",
            "Max Quantity",
            "Delivered Quantity",
            "Open Quantity"
          ],
          "labelKey": "ContractitemListTable"
        },
        "interestMethod": {
          "labelKey": "ContractinterestMethod",
          "ContractinterestMethod": "Interest Method"
        },
        "optionalLoad": {
          "labelKey": "ContractoptionalLoad",
          "ContractoptionalLoad": "Optional Load"
        },
        "loadingCity": {
          "options": [
            "Loading City"
          ],
          "labelKey": "ContractloadingCity"
        },
        "locationPD": {
          "options": [
            "Loacation P/D"
          ],
          "labelKey": "ContractlocationPD"
        },
        "usdMT": {
          "options": [
            "USD/MT"
          ],
          "labelKey": "ContractusdMT"
        },
        "actionOnContract": {
          "labelKey": "ContractactionOnContract",
          "ContractactionOnContract": "Action On Contract"
        },
        "approve": {
          "labelKey": "Contractapprove",
          "Contractapprove": "Approve"
        },
        "reject": {
          "labelKey": "Contractreject",
          "Contractreject": "Reject"
        },
        "remark": {
          "labelKey": "Contractremark",
          "Contractremark": "Remark"
        },
        "proceed": {
          "labelKey": "Contractproceed",
          "Contractproceed": "PROCEED"
        },
        "specification": {
          "labelKey": "Contractspecification",
          "Contractspecification": "Specification"
        }
      }
})
