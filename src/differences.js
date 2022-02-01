export function calculateDiff(obj1, obj2) {
  let diff = {};

  //looping through object keys to calculate differences
  for (let key in obj1) {
    if (isFunction(obj1[key])) {
      continue;
    }
    // calculate losses sub-model
    if (key === "losses") {
      diff = calculateLosses(obj1[key], obj2[key], diff);
    }
    // calculate transits sub-model
    if (key === "transits") {
      diff = calculateTransits(obj1[key], obj2[key], diff);
    }
    //calculate stocks sub-model 
    if (key === "stocks") {
      diff = calculateStocks(obj1[key], obj2[key], diff);
    }
    //calculate sublimits sub-model
    if (key === "sublimits") {
      diff = calculateSublimits(obj1[key], obj2[key], diff);
    }
    if (key === "policy_lines") {
      //calculate uw data sub-model
      diff = calculateUwData(obj1, obj2, diff);
      diff = calculateRiskCodes(obj1, obj2, diff);
      //calculate subjectivities sub-model
      diff = calculateSubjectivities(obj1, obj2, diff);
    }
    //calculate rest of differences
    diff[key] = calculateAll(obj1[key], obj2[key], key);
  }

  //remove irrelevant attributes - the ones you do not want to compare
  diff = removeIrrelevantProps(diff);

  //calculate sales years
  diff = calculateSalesYear(diff);

  //sort limits and deductibles
  diff = sortLimitsAndDeductibles(diff);

  //remove the props that haven't been changed
  for (let key in diff) {
    if(diff[key]?.type === "unchanged values" || diff[key]?.isValuesChanged === "unchanged values") {
      delete diff[key];
    } 
  }

  return diff;
};
//function to calculate all of the differences - without sub-models
function calculateAll(obj1, obj2, key) {
  if (isFunction(obj1) || isFunction(obj2)) {
    return 'Invalid argument. Function given, object expected.';
  }

  if (key === "operations") {
    let arr1 = [];
    let arr2 = [];

    obj1.forEach((item) => {
      arr1.push(item.name);
    });

    obj2.forEach((item) => {
      arr2.push(item.name);
    });

    return {
      type: compareArrayValues(arr1.sort(), arr2.sort()),
      oldValue: arr1.join(", "),
      newValue: arr2.join(", "),
      var_type: returnVarType(key)
    }
  }

  if (isValue(obj1) || isValue(obj2)) {
    return {
      type: compareValues(obj1, obj2),
      oldValue: obj1,
      newValue: obj2,
      var_type: returnVarType(key)
    };
  } else {
    return {
      type: "unchanged values"
    };
  }
};
//function to calculate Losses sub-models
function calculateLosses(obj1, obj2, diff) {
  obj1.sort(function(x,y) {
    return x.to > y.to ? -1 : 0;
  });

  obj1.sort(function(x,y) {
    return x.to > y.to ? -1 : 0;
  });

  diff.losses_year_1 = {};
  diff.losses_year_2 = {};
  diff.losses_year_3 = {};
  diff.losses_year_4 = {};
  diff.losses_year_5 = {};
  diff.losses_year_6 = {};

  let count = 1;
  obj1.forEach((item) => {
    diff["losses_year_" + count].oldValue = item;
    count++;
  })

  count = 1;
  obj2.forEach((item) => {
    diff["losses_year_" + count].newValue = item;
    count++;
  })

  //calculate losses for each year given
  diff.losses_year_1 = calculateYearLoss(diff.losses_year_1);
  diff.losses_year_2 = calculateYearLoss(diff.losses_year_2);
  diff.losses_year_3 = calculateYearLoss(diff.losses_year_3);
  diff.losses_year_4 = calculateYearLoss(diff.losses_year_4);
  diff.losses_year_5 = calculateYearLoss(diff.losses_year_5);
  diff.losses_year_6 = calculateYearLoss(diff.losses_year_6);

  if (diff.losses_year_1 === null) {  
    delete diff.losses_year_1;
  }
  if (diff.losses_year_2 === null) {  
    delete diff.losses_year_2;
  }
  if (diff.losses_year_3 === null) {  
    delete diff.losses_year_3;
  }
  if (diff.losses_year_4 === null) {  
    delete diff.losses_year_4;
  }
  if (diff.losses_year_5 === null) {  
    delete diff.losses_year_5;
  }
  if (diff.losses_year_6 === null) {  
    delete diff.losses_year_6;
  }

  return diff
};
//function to calculate Sublimits sub-models
function calculateSublimits(obj1, obj2, diff) {
  diff.limits = {type: "unchanged values"};
  diff.deductibles = {type: "unchanged values"};
  let obj1_limits = [];
  let obj1_deductibles = [];
  let obj2_limits = [];
  let obj2_deductibles = [];
  obj1.forEach(item => {
    if (item.contract_type === "limit") {
      obj1_limits.push(item);
    }
    if (item.contract_type === "deductible") {
      obj1_deductibles.push(item);
    }
  });

  obj2.forEach(item => {
    if (item.contract_type === "limit") {
      obj2_limits.push(item);
    }
    if (item.contract_type === "deductible") {
      obj2_deductibles.push(item);
    }
  });

  //calculate sublimits for each type limits/deductibles
  diff = calculateLimits(obj1_limits, obj2_limits, diff);
  diff = calculateDeductibles(obj1_deductibles, obj2_deductibles, diff);

  return diff;
};
//function to calculate limits differences
function calculateLimits(obj1_limits, obj2_limits, diff) {
  diff = calculateSublimitDiff(obj1_limits, obj2_limits, diff, "limits");
  return diff;
};
//function to calculate deductibles differences
function calculateDeductibles(obj1_deductibles, obj2_deductibles, diff) {
  diff = calculateSublimitDiff(obj1_deductibles, obj2_deductibles, diff, "deductibles");
  return diff;
};
//function to calculate Transits sub-models
function calculateTransits(obj1, obj2, diff) {
  diff = preCalculateTransits(diff);

  let obj1_incoming_transits = [];
  let obj1_domestic_transits = [];
  let obj1_outgoing_transits = [];
  let obj2_incoming_transits = [];
  let obj2_domestic_transits = [];
  let obj2_outgoing_transits = [];

  obj1.forEach(item => {
    if (item.type === "incoming") {
      obj1_incoming_transits.push(item);
    }
    if (item.type === "domestic") {
      obj1_domestic_transits.push(item);
    }
    if (item.type === "outgoing") {
      obj1_outgoing_transits.push(item);
    }
  });

  obj2.forEach(item => {
    if (item.type === "incoming") {
      obj2_incoming_transits.push(item);
    }
    if (item.type === "domestic") {
      obj2_domestic_transits.push(item);
    }
    if (item.type === "outgoing") {
      obj2_outgoing_transits.push(item);
    }
  });

  //calculate transits for each type of transit - incoming, domestic, outgoing
  diff = calculateIncomingTransitDiff(obj1_incoming_transits, obj2_incoming_transits, diff);
  diff = calculateDomesticTransitDiff(obj1_domestic_transits, obj2_domestic_transits, diff);
  diff = calculateOutgoingTransitDiff(obj1_outgoing_transits, obj2_outgoing_transits, diff);

  return diff;
};
//function to calculate Stocks sub-models
function calculateStocks(obj1, obj2, diff) {
  diff = preCalculateStocks(diff);
  diff = calculateStockDiff(obj1, obj2, diff);
  return diff;
};
//function to calculate diff of incoming transits
function calculateIncomingTransitDiff(obj1_transits, obj2_transits, diff) {
  diff = calculateTransitDiff(obj1_transits, obj2_transits, diff, "incoming_transits");
  return diff;
};
//function to calculate diff of domestic transits
function calculateDomesticTransitDiff(obj1_transits, obj2_transits, diff) {
  diff = calculateTransitDiff(obj1_transits, obj2_transits, diff, "domestic_transits");
  return diff;
};
//function to calculate diff of outgoing transits
function calculateOutgoingTransitDiff(obj1_transits, obj2_transits, diff) {
  diff = calculateTransitDiff(obj1_transits, obj2_transits, diff, "outgoing_transits");
  return diff;
};
//function to calculate uw data sub-model
function calculateUwData(obj1, obj2, diff) {
  let offers1 = obj1.policy_lines;
  let offers2 = obj2.firm_order_offers;
  diff["uw_data"] = {};

  diff = calculateUwDataDiff(offers1, offers2, diff);

  return diff;
};
//function to calculate risk codes as part of uw data sub-model
function calculateRiskCodes(obj1, obj2, diff) {
  let riskCodes1 = preCalculateRiskCodesFromPolicy(obj1);
  let riskCodes2 = preCalculateRiskCodesFromEndorsement(obj2);
  diff["uw_data_risk_codes"] = {};

  diff = calculateRiskCodesDiff(riskCodes1, riskCodes2, diff);

  if (diff.uw_data_risk_codes.type === "unchanged values" || diff.uw_data_risk_codes.risk_codes.length === 0) {
    delete diff.uw_data_risk_codes;
  }
  return diff;
};
//function to calculate subjectivities sub-model
function calculateSubjectivities(obj1, obj2, diff) {
  let subjectivities1 = preCalculateSubjectivitiesFromPolicy(obj1);
  let subjectivities2 = preCalculateSubjectivitiesFromEndorsement(obj2);
  diff["subjectivities"] = {};

  diff = calculateSubjectivityDiff(subjectivities1, subjectivities2, diff);

  if (diff.subjectivities.type === "unchanged values" || diff.subjectivities.total_subjectivities.length === 0) {
    delete diff.subjectivities;
  }

  return diff;
};
//calculate diff of single loss in one year
function calculateYearLoss(lossYear) {
  if (!isEmtpyObject(lossYear)) {
    lossYear.values_updated = [];
    lossYear.type = "unchanged values";

    if (lossYear.oldValue?.paid !== lossYear.newValue?.paid) {
      lossYear.values_updated.push("paid");
      lossYear.type = "values updated";
    }
    if (lossYear.oldValue?.outstanding !== lossYear.newValue?.outstanding) {
      lossYear.values_updated.push("outstanding");
      lossYear.type = "values updated";
    }
    if (lossYear.oldValue?.fees !== lossYear.newValue?.fees) {
      lossYear.values_updated.push("fees");
      lossYear.type = "values updated";
    }
    if (lossYear.oldValue?.advised !== lossYear.newValue?.advised) {
      lossYear.values_updated.push("advised");
      lossYear.type = "values updated";
    }
    if (lossYear.oldValue?.count !== lossYear.newValue?.count) {
      lossYear.values_updated.push("count");
      lossYear.type = "values updated";
    }
    return lossYear;
  }
  return null;
};
//function to calculate Sales Years sub-models
function calculateSalesYear(diff) {
  let oldYear = diff["incorporation_year"].oldValue;
  let newYear = diff["incorporation_year"].newValue;
  let difference = oldYear > newYear ? oldYear - newYear : newYear - oldYear;
  let yearKey = oldYear > newYear ? 'decreased' : 'increased'; 

  let latest_from = 0;
  let latest_to = 0;

  function calculate(year, word) {
    if (year - difference > 0) {
      latest_from = diff["sales_year_" + (year - difference) + "_from"].oldValue;
      latest_to = diff["sales_year_" + (year - difference) + "_to"].oldValue;
      return diff["sales_year_" + (year - difference) + word].oldValue;
    }

    if (word === "_from") {
      latest_from--;
      return latest_from;
    }
    
    if (word === "_to") {
      latest_to--;
      return latest_to;
    }

    if (year - difference <= 0) {
      return null;
    }
  }

  //calucalte sales years when year is decreased
  if (yearKey === "decreased") {
    diff["sales_year_6_amount"].oldValue = calculate(6, "_amount");
    diff.sales_year_6_amount["year_from"] = calculate(6, "_from");
    diff.sales_year_6_amount["year_to"] = calculate(6, "_to");

    diff["sales_year_5_amount"].oldValue =  calculate(5, "_amount");
    diff.sales_year_5_amount["year_from"] = calculate(5, "_from");
    diff.sales_year_5_amount["year_to"] = calculate(5, "_to");

    diff["sales_year_4_amount"].oldValue = calculate(4, "_amount");
    diff.sales_year_4_amount["year_from"] = calculate(4, "_from");
    diff.sales_year_4_amount["year_to"] = calculate(4, "_to");

    diff["sales_year_3_amount"].oldValue = calculate(3, "_amount");
    diff.sales_year_3_amount["year_from"] = calculate(3, "_from");
    diff.sales_year_3_amount["year_to"] = calculate(3, "_to");

    diff["sales_year_2_amount"].oldValue = calculate(2, "_amount");
    diff.sales_year_2_amount["year_from"] = calculate(2, "_from");
    diff.sales_year_2_amount["year_to"] = calculate(2, "_to");
    
    diff["sales_year_1_amount"].oldValue = calculate(1, "_amount");
    diff.sales_year_1_amount["year_from"] = calculate(1, "_from");
    diff.sales_year_1_amount["year_to"] = calculate(1, "_to");
  }

  //calculate sales years when year is increased
  if (yearKey === "increased") {
    let new_sales_year_1_amount = diff["sales_year_1_amount"].newValue;
    let new_sales_year_2_amount = diff["sales_year_2_amount"].newValue;
    let new_sales_year_3_amount = diff["sales_year_3_amount"].newValue;
    let new_sales_year_4_amount = diff["sales_year_4_amount"].newValue;
    let new_sales_year_5_amount = diff["sales_year_5_amount"].newValue;

    if (difference === 1) {
      diff.sales_year_6_amount.newValue = new_sales_year_5_amount;
      diff.sales_year_5_amount.newValue = new_sales_year_4_amount;
      diff.sales_year_4_amount.newValue = new_sales_year_3_amount;
      diff.sales_year_3_amount.newValue = new_sales_year_2_amount;
      diff.sales_year_2_amount.newValue = new_sales_year_1_amount;
      diff.sales_year_1_amount.newValue = null;
    }
    if (difference === 2) {
      diff.sales_year_6_amount.newValue = new_sales_year_4_amount;
      diff.sales_year_5_amount.newValue = new_sales_year_3_amount;
      diff.sales_year_4_amount.newValue = new_sales_year_2_amount;
      diff.sales_year_3_amount.newValue = new_sales_year_1_amount;
      diff.sales_year_2_amount.newValue = null;
      diff.sales_year_1_amount.newValue = null;
    }
    if (difference === 3) {
      diff.sales_year_6_amount.newValue = new_sales_year_3_amount;
      diff.sales_year_5_amount.newValue = new_sales_year_2_amount;
      diff.sales_year_4_amount.newValue = new_sales_year_1_amount;
      diff.sales_year_3_amount.newValue = null;
      diff.sales_year_2_amount.newValue = null;
      diff.sales_year_1_amount.newValue = null;
    }
    if (difference === 4) {
      diff.sales_year_6_amount.newValue = new_sales_year_2_amount;
      diff.sales_year_5_amount.newValue = new_sales_year_1_amount;
      diff.sales_year_4_amount.newValue = null;
      diff.sales_year_3_amount.newValue = null;
      diff.sales_year_2_amount.newValue = null;
      diff.sales_year_1_amount.newValue = null;
    }
    if (difference === 5) {
      diff.sales_year_6_amount.newValue = new_sales_year_1_amount;
      diff.sales_year_5_amount.newValue = null;
      diff.sales_year_4_amount.newValue = null;
      diff.sales_year_3_amount.newValue = null;
      diff.sales_year_2_amount.newValue = null;
      diff.sales_year_1_amount.newValue = null;
    }

    //calculate sales_years from and to for all years
    diff.sales_year_1_amount.year_from = diff["sales_year_1_from"].oldValue;
    diff.sales_year_1_amount.year_to = diff["sales_year_1_to"].oldValue;

    diff.sales_year_2_amount.year_from = diff["sales_year_2_from"].oldValue;
    diff.sales_year_2_amount.year_to = diff["sales_year_2_to"].oldValue;

    diff.sales_year_3_amount.year_from = diff["sales_year_3_from"].oldValue;
    diff.sales_year_3_amount.year_to = diff["sales_year_3_to"].oldValue;

    diff.sales_year_4_amount.year_from = diff["sales_year_4_from"].oldValue;
    diff.sales_year_4_amount.year_to = diff["sales_year_4_to"].oldValue;

    diff.sales_year_5_amount.year_from = diff["sales_year_5_from"].oldValue;
    diff.sales_year_5_amount.year_to = diff["sales_year_5_to"].oldValue;

    diff.sales_year_6_amount.year_from = diff["sales_year_6_from"].oldValue;
    diff.sales_year_6_amount.year_to = diff["sales_year_6_to"].oldValue;
  }

  function validateYear(year) {
    if (diff[year]?.oldValue === null && diff[year]?.newValue === null) {
      delete diff[year];
    }
  }

  validateYear("sales_year_1_amount");
  validateYear("sales_year_2_amount");
  validateYear("sales_year_3_amount");
  validateYear("sales_year_4_amount");
  validateYear("sales_year_5_amount");
  validateYear("sales_year_6_amount");

  return diff;
};
//calculate single sublimit in limits/deductibles
function calculateSublimitDiff(arr1, arr2, diff, sublimitType) {
  diff[sublimitType].total_sublimits = [];
  //looping through arr1 items
  for (let i = 0; i < arr1.length; i++) {
    let value2 = arr2.find(sublimit => sublimit.uuid === arr1[i].uuid);
    // calculating differences
    diff = compareSublimitValue(arr1[i], value2, diff, sublimitType);
  }

  //looping through arr2 items
  for (let i = 0; i < arr2.length; i++) {
    let value1 = arr1.find(sublimit => sublimit.uuid === arr2[i].uuid);
    if (value1 === undefined) {
      //calculating differences
      diff = compareSublimitValue(value1, arr2[i], diff, sublimitType);
    }
  }

  return diff;
};
//calculate single transit in incoming/domestic/outgoing 
function calculateTransitDiff(arr1, arr2, diff, transitName) {
  diff[transitName].total_transits = [];
  //looping through arr1 items
  for (let i = 0; i < arr1.length; i++) {
    let value2 = arr2.find(transit => transit.uuid === arr1[i].uuid);
    // calculating differences
    diff = compareTransitValue(arr1[i], value2, diff, transitName);
  }

  //looping through arr2 items
  for (let i = 0; i < arr2.length; i++) {
    let value1 = arr1.find(transit => transit.uuid === arr2[i].uuid);
    if (value1 === undefined) {
      //calculating differences
      diff = compareTransitValue(value1, arr2[i], diff, transitName);
    }
  }

  return diff;
};
//calculate single stock differences
function calculateStockDiff(arr1, arr2, diff) {
  diff.exposure_stocks.total_stocks = [];
  //looping through arr1 items
  for (let i = 0; i < arr1.length; i++) {
    let value2 = arr2.find(stock => stock.uuid === arr1[i].uuid);
    // calculating differences
    diff = compareStockValue(arr1[i], value2, diff);
  }

  //looping through arr2 items
  for (let i = 0; i < arr2.length; i++) {
    let value1 = arr1.find(stock => stock.uuid === arr2[i].uuid);
    if (value1 === undefined) {
      //calculating differences
      diff = compareStockValue(value1, arr2[i], diff);
    }
  }

  return diff;
};
//calculate differences of all the offers in uw data sub-model
function calculateUwDataDiff(arr1, arr2, diff) {
  diff.uw_data.total_offers = [];
  //looping through arr1 items
  for (let i = 0; i < arr1.length; i++) {
    let value2 = undefined;
    if (arr2[i] !== undefined) {
      value2 = arr2[i];
    }
    // calculating differences
    diff = compareUwDataValue(arr1[i], value2, diff);
  }

  //looping through arr2 items
  for (let i = 0; i < arr2.length; i++) {
    if (arr1[i] === undefined) {
      //calculating differences
      diff = compareUwDataValue(arr1[i], arr2[i], diff);
    }
  }

  return diff;
};
//calculate single subjectivity differences
function calculateSubjectivityDiff(arr1, arr2, diff) {
  diff.subjectivities.total_subjectivities = [];
  //looping through arr1 items
  for (let i = 0; i < arr1.length; i++) {
    let value2 = undefined;
    if (arr2[i] !== undefined) {
      value2 = arr2[i];
    }
    // calculating differences
    diff = compareSubjectivityValue(arr1[i], value2, diff);
  }

  //looping through arr2 items
  for (let i = 0; i < arr2.length; i++) {
    if (arr1[i] === undefined) {
      //calculating differences
      diff = compareSubjectivityValue(arr1[i], arr2[i], diff);
    }
  }

  return diff;
};
function calculateRiskCodesDiff(arr1, arr2, diff) {
  diff.uw_data_risk_codes.risk_codes = [];
  //looping through arr1 items
  for (let i = 0; i < arr1.length; i++) {
    let value2 = undefined;
    if (arr2[i] !== undefined) {
      value2 = arr2[i];
    }
    // calculating differences
    diff = compareRiskCodeValue(arr1[i], value2, diff);
  }

  //looping through arr2 items
  for (let i = 0; i < arr2.length; i++) {
    if (arr1[i] === undefined) {
      //calculating differences
      diff = compareRiskCodeValue(arr1[i], arr2[i], diff);
    }
  }

  return diff;
};
//calculate single sublimit differences
function compareSublimitValue(value1, value2, diff, sublimitType) {
  //pre-asing some values for single sublimit before compare
  diff[sublimitType].total_sublimits.push({
    oldValue: value1,
    newValue: value2,
    values_updated: []
  })
  diff[sublimitType].values_updated = [];
  let lastElement = diff[sublimitType].total_sublimits.length - 1;
  
  //compare all the differences between the sub-models of single sublimit
  if (value1?.deductible_basis_value !== value2?.deductible_basis_value) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("deductible_basis_value");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.deductible_flat_amount !== value2?.deductible_flat_amount) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("deductible_flat_amount");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.deductible_percentage !== value2?.deductible_percentage) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("deductible_percentage");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.deductible_type !== value2?.deductible_type) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("deductible_type");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.exposure_type !== value2?.exposure_type) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("exposure_type");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.subject_to_minimum !== value2?.subject_to_minimum) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("subject_to_minimum");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.sublimit_amount !== value2?.sublimit_amount) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("sublimit_amount");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.sublimit_description !== value2?.sublimit_description) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("sublimit_description");
    diff[sublimitType].type = "values updated";
  }
  if (value1?.sublimit_type !== value2?.sublimit_type) {
    diff[sublimitType].total_sublimits[lastElement].values_updated.push("sublimit_type");
    diff[sublimitType].type = "values updated";
  }
  return diff;
};
//calculate single transit differences
function compareTransitValue(value1, value2, diff, transitName) {
  //pre-asing some values for single transit before compare
  diff[transitName].total_transits.push({
    oldValue: value1,
    newValue: value2,
    values_updated: []
  })
  diff[transitName].values_updated = [];
  let lastElement = diff[transitName].total_transits.length - 1;
  
  //compare all the differences between the sub-models of single transit
  if (value1?.annual_value !== value2?.annual_value) {
    diff[transitName].total_transits[lastElement].values_updated.push("annual_value");
    diff[transitName].type = "values updated";
  }
  if (value1?.commodity_id !== value2?.commodity_id) {
    diff[transitName].total_transits[lastElement].values_updated.push("commodity_id");
    diff[transitName].type = "values updated";
  }
  if (value1?.contingent_coverage !== value2?.contingent_coverage) {
    diff[transitName].total_transits[lastElement].values_updated.push("contingent_coverage");
    diff[transitName].type = "values updated";
  }
  if (value1?.insurance_type_id !== value2?.insurance_type_id) {
    diff[transitName].total_transits[lastElement].values_updated.push("insurance_type_id");
    diff[transitName].type = "values updated";
  }
  if (diff[transitName].total_annual_value.oldValue !== diff[transitName].total_annual_value.newValue) {
    diff[transitName].values_updated.push("total_annual_value");
    diff[transitName].type = "values updated";
  }
  if (diff[transitName].basis_of_valuation.oldValue !== diff[transitName].basis_of_valuation.newValue) {
    diff[transitName].values_updated.push("basis_of_valuation");
    diff[transitName].type = "values updated";
  }
  if (compareArrayValues(convertArrayToString(value1?.conveyances, "conveyance"),convertArrayToString(value2?.conveyances, "conveyance")) === "values updated") {
    diff[transitName].total_transits[lastElement].values_updated.push("conveyances");
    diff[transitName].type = "values updated";
  }
  if (compareArrayValues(convertArrayToString(value1?.packing, "packing"),convertArrayToString(value2?.packing, "packing")) === "values updated") {
    diff[transitName].total_transits[lastElement].values_updated.push("packing");
    diff[transitName].type = "values updated";
  }
  if (compareArrayValues(convertArrayToString(value1?.shipping, "shipping"),convertArrayToString(value2?.shipping, "shipping")) === "values updated") {
    diff[transitName].total_transits[lastElement].values_updated.push("shipping");
    diff[transitName].type = "values updated";
  }
  if (compareArrayValues(convertArrayToString(value1?.containers, "containers"),convertArrayToString(value2?.containers, "containers")) === "values updated") {
    diff[transitName].total_transits[lastElement].values_updated.push("containers");
    diff[transitName].type = "values updated";
  }
  return diff;
};
//calculate single stock differences
function compareStockValue(value1, value2, diff) {
  //pre-asing some values for single stock before compare
  diff.exposure_stocks.total_stocks.push({
    oldValue: value1,
    newValue: value2,
    values_updated: []
  })
  diff.exposure_stocks.values_updated = [];
  let lastElement = diff.exposure_stocks.total_stocks.length - 1;
  
  //compare all the differences between the sub-models of single stock
  if (value1?.location_name !== value2?.location_name) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("location_name");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.country_id !== value2?.country_id) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("country_id");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.address_line_1 !== value2?.address_line_1) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("address_line_1");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.address_line_2 !== value2?.address_line_2) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("address_line_2");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.city !== value2?.city) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("city");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.state_id !== value2?.state_id) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("state_id");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.postcode !== value2?.postcode) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("postcode");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.location_description_id !== value2?.location_description_id) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("location_description_id");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.third_party_location !== value2?.third_party_location) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("third_party_location");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.commodity_id !== value2?.commodity_id) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("commodity_id");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.average_exposure_value !== value2?.average_exposure_value) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("average_exposure_value");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.max_inventory_value !== value2?.max_inventory_value) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("max_inventory_value");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.temperature_controlled !== value2?.temperature_controlled) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("temperature_controlled");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.construction_type !== value2?.construction_type) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("construction_type");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.year_built !== value2?.year_built) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("year_built");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.year_of_last_building_update !== value2?.year_of_last_building_update) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("year_of_last_building_update");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.year_of_last_roof_update !== value2?.year_of_last_roof_update) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("year_of_last_roof_update");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.fire_extinguishers !== value2?.fire_extinguishers) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("fire_extinguishers");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.fire_hydrants !== value2?.fire_hydrants) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("fire_hydrants");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.central_station_fire_alarm !== value2?.central_station_fire_alarm) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("central_station_fire_alarm");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.central_station_burglar_alarm !== value2?.central_station_burglar_alarm) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("central_station_burglar_alarm");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.controlled_access !== value2?.controlled_access) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("controlled_access");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.perimeter_fences !== value2?.perimeter_fences) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("perimeter_fences");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.security_guards !== value2?.security_guards) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("security_guards");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.cctv !== value2?.cctv) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("cctv");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.onsite_backup_generators !== value2?.onsite_backup_generators) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("onsite_backup_generators");
    diff.exposure_stocks.type = "values updated";
  }
  if (value1?.sprinkler !== value2?.sprinkler) {
    diff.exposure_stocks.total_stocks[lastElement].values_updated.push("sprinkler");
    diff.exposure_stocks.type = "values updated";
  }
  if (diff.exposure_stocks.average_annual_value_of_stocks.oldValue !== diff.exposure_stocks.average_annual_value_of_stocks.newValue) {
    diff.exposure_stocks.values_updated.push("average_annual_value_of_stocks");
    diff.exposure_stocks.type = "values updated";
  }
  if (diff.exposure_stocks.max_annual_value_of_stocks.oldValue !== diff.exposure_stocks.max_annual_value_of_stocks.newValue) {
    diff.exposure_stocks.values_updated.push("max_annual_value_of_stocks");
    diff.exposure_stocks.type = "values updated";
  }
  if (diff.exposure_stocks.basis_of_valuation_stocks.oldValue !== diff.exposure_stocks.basis_of_valuation_stocks.newValue) {
    diff.exposure_stocks.values_updated.push("basis_of_valuation_stocks");
    diff.exposure_stocks.type = "values updated";
  }
  return diff;
};
//calculate single uw data differences
function compareUwDataValue(value1, value2, diff) {
  //pre-asing some values for single uw data offer before compare
  diff.uw_data.isValuesChanged = "unchanged values";
  diff.uw_data.total_offers.push({
    oldValue: value1,
    newValue: value2,
    values_updated: []
  });

  diff.uw_data.values_updated = [];
  let lastElement = diff.uw_data.total_offers.length - 1;

  //compare all the differences between the sub-models of single uw data offer
  if (value1?.underwriter_reference !== value2?.underwriter_reference) {
    diff.uw_data.total_offers[lastElement].values_updated.push("underwriter_reference");
    diff.uw_data.isValuesChanged = "values updated";
  }
  if (value1?.settlement_due !== value2?.settlement_due) {
    diff.uw_data.total_offers[lastElement].values_updated.push("settlement_due");
    diff.uw_data.isValuesChanged = "values updated";
  }
  if (value1?.instalment_period_of_credit !== value2?.instalment_period_of_credit) {
    diff.uw_data.total_offers[lastElement].values_updated.push("instalment_period_of_credit");
    diff.uw_data.isValuesChanged = "values updated";
  }
  return diff;
};
//calculate single subjectivity differences
function compareSubjectivityValue(value1, value2, diff) {
  //pre-asing some values for single subjectivity before compare
  diff.subjectivities.type = "unchanged values";
  diff.subjectivities.total_subjectivities.push({
    oldValue: value1,
    newValue: value2,
    values_updated: []
  });

  diff.subjectivities.values_updated = [];
  let lastElement = diff.subjectivities.total_subjectivities.length - 1;
  
  //compare all the differences between the sub-models of single subjectivity
  if (value1?.name !== value2?.name) {
    diff.subjectivities.total_subjectivities[lastElement].values_updated.push("name");
    diff.subjectivities.type = "values updated";
  }
  if (value1?.due_by !== value2?.due_by) {
    diff.subjectivities.total_subjectivities[lastElement].values_updated.push("due_by");
    diff.subjectivities.type = "values updated";
  }
  if (value1?.status !== value2?.status) {
    diff.subjectivities.total_subjectivities[lastElement].values_updated.push("status");
    diff.subjectivities.type = "values updated";
  }
  return diff;
};
//calculate single risk code differences
function compareRiskCodeValue(value1, value2, diff) {
  //pre-asing some values for single risk code before compare
  diff.uw_data_risk_codes.type = "unchanged values";
  diff.uw_data_risk_codes.risk_codes.push({
    oldValue: value1,
    newValue: value2,
    values_updated: []
  })
  diff.uw_data_risk_codes.values_updated = [];
  let lastElement = diff.uw_data_risk_codes.risk_codes.length - 1;

  //compare all the differences between the risk codes of single uw data offer
  if (value1?.risk_code_id !== value2?.risk_code_id) {
    diff.uw_data_risk_codes.risk_codes[lastElement].values_updated.push("risk_code_id");
    diff.uw_data_risk_codes.type = "values updated";
  }
  if (value1?.premium_allocation !== value2?.premium_allocation) {
    diff.uw_data_risk_codes.risk_codes[lastElement].values_updated.push("premium_allocation");
    diff.uw_data_risk_codes.type = "values updated";
  }
  return diff;
};
//precalcualte and assign values to all the types of transits
function preCalculateTransits(diff) {
  diff.incoming_transits = { total_annual_value: {}, basis_of_valuation: {}, type: "unchanged values" };
  diff.domestic_transits = { total_annual_value: {}, basis_of_valuation: {}, type: "unchanged values" };
  diff.outgoing_transits = { total_annual_value: {}, basis_of_valuation: {}, type: "unchanged values" };

  diff.incoming_transits.total_annual_value.oldValue = diff.annual_value_of_incoming_transits.oldValue;
  diff.incoming_transits.total_annual_value.newValue = diff.annual_value_of_incoming_transits.newValue;
  diff.incoming_transits.basis_of_valuation.oldValue = diff.basis_of_valuation_incoming_transits.oldValue;
  diff.incoming_transits.basis_of_valuation.newValue = diff.basis_of_valuation_incoming_transits.newValue;

  diff.domestic_transits.total_annual_value.oldValue = diff.annual_value_of_domestic_transits.oldValue;
  diff.domestic_transits.total_annual_value.newValue = diff.annual_value_of_domestic_transits.newValue;
  diff.domestic_transits.basis_of_valuation.oldValue = diff.basis_of_valuation_domestic_transits.oldValue;
  diff.domestic_transits.basis_of_valuation.newValue = diff.basis_of_valuation_domestic_transits.newValue;

  diff.outgoing_transits.total_annual_value.oldValue = diff.annual_value_of_outgoing_transits.oldValue;
  diff.outgoing_transits.total_annual_value.newValue = diff.annual_value_of_outgoing_transits.newValue;
  diff.outgoing_transits.basis_of_valuation.oldValue = diff.basis_of_valuation_outgoing_transits.oldValue;
  diff.outgoing_transits.basis_of_valuation.newValue = diff.basis_of_valuation_outgoing_transits.newValue;

  return diff;
};
//precalcualte and assign values to stocks
function preCalculateStocks(diff) {
  diff.exposure_stocks = { average_annual_value_of_stocks: {}, max_annual_value_of_stocks: {}, basis_of_valuation_stocks: {}, type: "unchanged values" };
  diff.exposure_stocks.average_annual_value_of_stocks.oldValue = diff.average_annual_value_of_stocks.oldValue;
  diff.exposure_stocks.average_annual_value_of_stocks.newValue = diff.average_annual_value_of_stocks.newValue;
  diff.exposure_stocks.max_annual_value_of_stocks.oldValue = diff.max_annual_value_of_stocks.oldValue;
  diff.exposure_stocks.max_annual_value_of_stocks.newValue = diff.max_annual_value_of_stocks.newValue;
  diff.exposure_stocks.basis_of_valuation_stocks.oldValue = diff.basis_of_valuation_stocks.oldValue;
  diff.exposure_stocks.basis_of_valuation_stocks.newValue = diff.basis_of_valuation_stocks.newValue;

  return diff;
};
//find the risk codes sub-model that comes from policy
function preCalculateRiskCodesFromPolicy(obj1) {
  //latest completed policy
  let riskCodes = [];
  let leadOffer1 = obj1.policy_lines.find(policyLine => policyLine.type === "lead");
  leadOffer1.risk_codes.forEach(item => {
    riskCodes.push({
      risk_code_id: item.risk_code_id,
      premium_allocation: parseInt(item.premium_allocation)
    });
  });
  return riskCodes;
};
//find the risk codes sub-model that comes from endorsement
function preCalculateRiskCodesFromEndorsement(obj2) {
  //submission on endorsement
  let riskCodes = [];
  let leadOffer2 = obj2.firm_order_offers.find(firmOrder => firmOrder.type === "lead");
  leadOffer2.risk_codes.forEach(item => {
    riskCodes.push({
      risk_code_id: item.pivot.risk_code_id,
      premium_allocation: parseInt(item.pivot.premium_allocation)
    });
  });
  return riskCodes;
};
//find the subjectivities sub-model that comes from policy
function preCalculateSubjectivitiesFromPolicy(obj1) {
  //latest completed policy
  let leadOffer1 = obj1.policy_lines.find(policyLine => policyLine.type === "lead");
  return leadOffer1.subjectivities.filter(subjectivity => subjectivity.source !== "endorsement_offer");
};
//find the subjectivities sub-model that comes from endorsement
function preCalculateSubjectivitiesFromEndorsement(obj2) {
    //submission on endorsement
    let leadOffer2 = obj2.firm_order_offers.find(firmOrder => firmOrder.type === "lead");
    return leadOffer2.subjectivities.filter(subjectivity => subjectivity.source !== "endorsement_offer");
};
//function to convert arrays of conveyances, packing, shipping to string
function convertArrayToString(arr, type) {
  let stringArray = [];
  if (arr !== undefined) {
    if (type === "conveyance") {
      arr.forEach(item => {
        stringArray.push(
          item.conveyance.name + item.utilisation + item.max_value + item.average_value
        );
      })
    }
    if (type === "packing") {
      arr.forEach(item => {
        stringArray.push(
          item.packing.name + item.utilisation 
        );
      })
    }
    if (type === "shipping") {
      arr.forEach(item => {
        stringArray.push(
          item.country.name + item.utilisation 
        );
      })
    }
    if (type === "containers") {
      arr.forEach((item, index) => {
        stringArray.push(
          index + item.average_value
        );
      })
    }
  }

  return stringArray.sort();
};
//fucntion to categorize contract info differences (limits and deductibles)
function sortLimitsAndDeductibles(diff) {
  for (let key in diff) {
    if (key === 'limits') {
      diff[key]["sublimit_type"] = 'limits';
    }
    if (key === 'deductibles') {
      diff[key]["sublimit_type"] = 'deductibles';
    }
    if (key === 'order_percentage') {
      diff[key]["sublimit_type"] = 'contract_details';
    }
    if (
      key === 'requires_cat_aggregate_limit' ||
      key === 'cat_agg_limit' ||
      key === 'stock_limit'
    ) {
      diff[key]["sublimit_type"] = 'stock_limits';
    }
    if (
      key === 'transit_limit' || 
      key === 'cargo_marine_transit_limit'
    ) {
      diff[key]["sublimit_type"] = 'transit_limits';
    }
    if (
      key === 'requires_unnamed_location_limit' ||
      key === 'unnamed_location_limit' ||
      key === 'requires_unnamed_location_aggregate_limit' ||
      key === 'unnamed_location_aggregate_limit' ||
      key === 'requires_extra_expense_sub_limit' ||
      key === 'extra_expense_sub_limit' ||
      key === 'requires_cyber_limit' ||
      key === 'cyber_limit'
    ) {
      diff[key]["sublimit_type"] = 'general_policy_limits';
    }
    if (
      key === 'cd_stock_deductible' ||
      key === 'cd_stock_deductible_basis_value' ||
      key === 'cd_stock_deductible_percentage' ||
      key === 'cd_stock_deductible_subject_to_minimum' ||
      key === 'cd_stock_deductible_type'
    ) {
      diff[key]["sublimit_type"] = 'stock_deductible';
    }
    if (
      key === 'cd_stock_cat_deductible' ||
      key === 'cd_stock_cat_deductible_basis_value' ||
      key === 'cd_stock_cat_deductible_percentage' ||
      key === 'cd_stock_cat_deductible_subject_to_minimum' ||
      key === 'cd_stock_cat_deductible_type'
    ) {
      diff[key]["sublimit_type"] = 'stock_cat_deductible';
    }
    if (
      key === 'cd_transit_deductible' ||
      key === 'cd_transit_deductible_basis_value' ||
      key === 'cd_transit_deductible_percentage' ||
      key === 'cd_transit_deductible_subject_to_minimum' ||
      key === 'cd_transit_deductible_type'
    ) {
      diff[key]["sublimit_type"] = 'transit_deductible';
    }
    if (
      key === 'cd_cargo_marine_deductible' ||
      key === 'cd_cargo_marine_deductible_basis_value' ||
      key === 'cd_cargo_marine_deductible_percentage' ||
      key === 'cd_cargo_marine_deductible_subject_to_minimum' ||
      key === 'cd_cargo_marine_deductible_type'
    ) {
      diff[key]["sublimit_type"] = 'cargo_marine_deductible';
    }
  }
  return diff;
};
//function to compare two simple values (no Object and Array values)
function compareValues(value1, value2) {
  if (value1 === value2) {
    return "unchanged values";
  }
  if (isDate(value1) && isDate(value2) && value1.getTime() === value2.getTime()) {
    return "unchanged values";
  }
  if (value1 === undefined) {
    return "values added";
  }
  if (value2 === undefined) {
    return "values deleted";
  }
  return "values updated";
};
//function to compare two arrays (needs to be string arrays)
function compareArrayValues(value1, value2) {
  if(JSON.stringify(value1) === JSON.stringify(value2)) {
    return "unchanged values";
  }
  return "values updated";
};
//function to returns value type of some data
function returnVarType(key) {
  if (key === "inception_date" || key === "expiry_date") {
    return "date";
  } else if (
    key === "brokerage" ||
    key === "order_percentage" ||
    key === "cd_stock_deductible_percentage" ||
    key === "cd_stock_cat_deductible_percentage" ||
    key === "cd_transit_deductible_percentage" ||
    key === "cd_cargo_marine_deductible_percentage"
  ) {
    return "percent";
  } else if (
    key === "sales_year_1_amount" ||
    key === "sales_year_2_amount" ||
    key === "sales_year_3_amount" ||
    key === "sales_year_4_amount" ||
    key === "sales_year_5_amount" ||
    key === "sales_year_6_amount" ||
    key === "target_premium" ||
    key === "cat_agg_limit" ||
    key === "stock_limit" ||
    key === "transit_limit" ||
    key === "cargo_marine_transit_limit" ||
    key === "unnamed_location_limit" ||
    key === "unnamed_location_aggregate_limit" ||
    key === "extra_expense_sub_limit" ||
    key === "cyber_limit" ||
    key === "cd_stock_deductible" ||
    key === "cd_stock_deductible_subject_to_minimum" ||
    key === "cd_stock_cat_deductible" ||
    key === "cd_stock_cat_deductible_subject_to_minimum" ||
    key === "cd_transit_deductible" ||
    key === "cd_transit_deductible_subject_to_minimum" ||
    key === "cd_cargo_marine_deductible" ||
    key === "cd_cargo_marine_deductible_subject_to_minimum"
  ) {
    return "number";
  } else {
    return "string";
  }
};
function isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
};
function isArray(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};
function isDate(x) {
  return Object.prototype.toString.call(x) === '[object Date]';
};
function isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
};
function isValue(x) {
  return !isObject(x) && !isArray(x);
};
function isEmtpyObject(obj) {
  return Object.keys(obj).length === 0;
};
//function to remove all the unncesessary props from diff object
function removeIrrelevantProps(diff) {
  delete diff.firm_orders;
  delete diff.can_download_security_details_document;
  delete diff.country;
  delete diff.created_at;
  delete diff.firm_orders;
  delete diff.has_expired_offers;
  delete diff.has_firm_order_offers_with_accepted_lead;
  delete diff.id;
  delete diff.is_editable;
  delete diff.offers_received_count;
  delete diff.offers_received_percentage;
  delete diff.risk_type;
  delete diff.term_length;
  delete diff.updated_at;
  delete diff.uuid;
  delete diff.submission_id;
  delete diff.currency;
  delete diff.tria_premium;
  delete diff.local_timezone;
  delete diff.requires_cat_aggregate_limit;
  delete diff.requires_unnamed_location_limit;
  delete diff.requires_unnamed_location_aggregate_limit;
  delete diff.requires_extra_expense_sub_limit;
  delete diff.requires_cyber_limit;
  delete diff.policy_lines;
  delete diff.version;

  return diff;
};
  