var scriptOpts = {
  "Counts": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAFreq (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables}, UserWeight=${args.weightVariable});`;
    },
    options: [
      "datasetName",
      "variables",
      "weightVariable",
      "outputFileName"
    ]
  },
  "CountsBrokenDown": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAFreq (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "outputFileName"
    ]
  },
  "Percentage": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAPercentDist (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},`;
    },
    options: [
      "datasetName",
      "variables",
      "outputFileName"
    ]
  },
  "PercentBrokenDown": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAProportion (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "outputFileName"
    ]
  },
  "MedianPercentile": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAPercentile (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, AnalysisVar=${args.variables},
        ClassVarList=${args.statisticBreakdown}, Percentiles=${args.Mediantile}`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "MedianPercentile",
      "outputFileName"
    ]
  },
  "Means": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAMean (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, AnalysisVarList=${args.variables}, ClassVarList=${args.statisticBreakdown}`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "Means",
      "outputFileName"
    ]
  }
};

$(function() {
// find elements
var banner = $("#banner-message");
var button = $("button");
var output = $("#output");
var ss = $("#ScriptSelector");
var so = $("#scriptOptions");

so.find('div').hide();

// handle click and add class
ss.on("change", () => {
  so.find('div').hide();
  var selectedScript = ss.val();
  var selectedObject = scriptOpts[selectedScript] || {};
  var options = selectedObject.options || [];

  options.forEach((optionToShow) => $(`#${optionToShow}`).show());
});

button.on("click", ()=> {
  var selectedScript = ss.val();
  if (!(selectedScript in scriptOpts)){
  alert('select a valid option');
  return;
  }
  var selected = scriptOpts[selectedScript];

  var args = {};
  var success = selected.options.every((option) =>
  {
    args[option] = $(`#${option} input`).val();

    if (args[option].length === 0) {
      const optionLabel = $(`#${option} label`).text();
      alert(`You missed an option: "${optionLabel}"`);
      $(`#${option} input`).focus();
      return false;
    }

    return true;
  });

  if (!success) {
    return;
  }

  var text = selected.template(args);
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  // uncomment the next line to debug;
  // output.text(text);
  saveAs(blob, `${args.datasetName}_${args.outputFileName}.sas`);

})
});
