var scriptOpts = {
  "Counts": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAFreq (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        UserWeight=${args.weightVariable});`;
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
      %RTRAFreq (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        UserWeight=${args.weightVariable})`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "weightVariable",
      "outputFileName"

    ]
  },
  "Percentage": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAPercentDist (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        UserWeight=${args.weightVariable})`;
    },
    options: [
      "datasetName",
      "variables",
      "weightVariable",
      "outputFileName"
    ]
  },
  "PercentBrokenDown": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAProportion (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        UserWeight=${args.weightVariable})`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "weightVariable",
      "outputFileName"

    ]
  },
  "MedianPercentile": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAPercentile (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, AnalysisVar=${args.variables},
        ClassVarList=${args.statisticBreakdown}, Percentiles=${args.mediantile}, UserWeight=${args.weightVariable})`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "mediantile",
      "weightVariable",
      "outputFileName"

    ]
  },
  "MeanStat": {
    template(args) {
      return `Data Work.${args.datasetName};
      Set RTRAData.${args.datasetName};
      %RTRAMean (InputDataset=work.${args.datasetName}, OutputName=${args.outputFileName}, AnalysisVarList=${args.variables},
        ClassVarList=${args.statisticBreakdown}, UserWeight=${args.weightVariable})`;
    },
    options: [
      "datasetName",
      "variables",
      "statisticBreakdown",
      "outputFileName",
      "weightVariable"
    ]
  }
};

var optionTypes = {
  datasetName: {
    className: 'datasetName',
    label: 'Dataset name',
    helpText: 'Enter the name of the dataset here'
  },

  variables: {
    className: 'variables',
    label: 'Variable(s)',
    helpText: 'Enter the name of the variable for which you want estimates here'
  },

  statisticBreakdown: {
    className: 'statisticBreakdown',
    label: 'Statistic breakdown by this var',
    helpText: 'Enter the name of the variable by which you want your statistic broken down'
  },

  mediantile: {
    className: 'mediantile',
    label: 'Percentiles breakdown by this var',
    helpText: 'Enter the percentiles you want e.g 50 for median. For multiple percentiles separate each with a space e.g. 25 50'
  },

  weightVariable: {
    className: 'weightVariable',
    label: 'Weight variable name',
    helpText: 'Enter the name of the weight variable  here'
  },

  outputFileName: {
    className: 'outputFileName',
    label: 'Output file namee',
    helpText: 'Enter the name of the output file here'
  },
}

$(function() {
// find elements
const banner = $("#banner-message");
const generateButton = $(".generate");
const output = $("#output");
const scriptContainer = $("#scriptContainer");
const addScript = $('.addScript');
const requestName = $('#requestName');

function createOption (className, label, helpText) {
  var template = `<div class="${className}">
        <label>${label}</label>
        <input type="text" />
        <small>${helpText}</small>
      </div>`;

      return $(template);
}

function createScript () {
  var template = `<div class="scriptGenerator">
    <div>
      <select class="scriptSelector">
      <option>Select type of stastic to generate</option>
      <option value="Counts">Counts</option>
      <option value="CountsBrokenDown">Counts broken down by another variable</option>
      <option value="Percentage">Percentage</option>
      <option value="PercentBrokenDown">Percentage broken down by another variable</option>
      <option value="MedianPercentile">Median and Percentiles</option>
      <option value="MeanStat">Means</option>
      </select>
    </div>

    <fieldset class="scriptOptions">

    </fieldset>
  </div> `;

  var generator = $(template);

  var ss = generator.find(".scriptSelector");
  var so = generator.find(".scriptOptions");

  ss.on("change", () => {
    var selectedScript = ss.val();
    var selectedObject = scriptOpts[selectedScript] || {};
    var options = selectedObject.options || [];

    so.empty();
    options.forEach((optionToShow) => {
      var optionType = optionTypes[optionToShow];
      var optionElement = createOption(optionType.className, optionType.label, optionType.helpText);
      so.append(optionElement);
    });

    so.toggleClass('empty', options.length === 0);
  });

  so.addClass('empty');

  scriptContainer.append(generator);
}

// this is the part where we initialize the code
createScript();

// handle click and add class


addScript.on("click",()=> {
  if ( $('.scriptGenerator').length === 10 ) {
    alert('Maximum of ten programs allowed');
    return;
  }

  createScript();
});

generateButton.on("click", ()=> {
  var outputTotalScript = [];

  var success = Array.from($('.scriptGenerator')).every((element) => {
    var generator = $(element);
    var ss = generator.find(".scriptSelector");
    var so = generator.find(".scriptOptions");

    var selectedScript = ss.val();

    if (!(selectedScript in scriptOpts)){
      alert('select a valid option');
      return;
    }

    var selected = scriptOpts[selectedScript];

    var args = {};
    var genSuccess = selected.options.every((option) =>
    {
      args[option] = generator.find(`.${option} input`).val();

      if (args[option].length === 0) {
        const optionLabel = generator.find(`.${option} label`).text();
        alert(`You missed an option: "${optionLabel}"`);
        generator.find(`.${option} input`).focus();
        return false;
      }

      return true;
    });

    if (!genSuccess) {
      return false;
    }

    outputTotalScript.push(selected.template(args));
    return true;
  });

  if(!success) {
    return;
  }

  const allDSNames = Array.from($('.datasetName')).map((element) => $(element).find('input').val());
  const firstDSN = allDSNames[0];
  const allDSNamesAreEqual = allDSNames.every((name) => name === firstDSN);

  if (!allDSNamesAreEqual) {
    alert('Not all the Dataset Names are equal, they must be in order to run this program');
    return;
  }

  var text = outputTotalScript.join('\r\n\r\n');
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  // uncomment the next line to debug;
  // output.text(text);
  saveAs(blob, `${firstDSN}_${requestName.val() || 'v'}.sas`);
})
});
