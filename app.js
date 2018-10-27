var scriptOpts = {
  "Counts": {
    template(datasetName, weightVariable, args) {
      return `Data Work.${datasetName};
      Set RTRAData.${datasetName};
      %RTRAFreq (InputDataset=work.${datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        UserWeight=${weightVariable});`;
    },
    options: [
      "variables",
      "outputFileName"
    ]
  },
  "CountsBrokenDown": {
    template(datasetName, weightVariable, args) {
      return `Data Work.${datasetName};
      Set RTRAData.${datasetName};
      %RTRAFreq (InputDataset=work.${datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables} ${args.statisticBreakdown},
        UserWeight=${weightVariable})`;
    },
    options: [
      "variables",
      "statisticBreakdown",
        "outputFileName"

    ]
  },
  "Percentage": {
    template(datasetName, weightVariable, args) {
      return `Data Work.${datasetName};
      Set RTRAData.${datasetName};
      %RTRAPercentDist (InputDataset=work.${datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        UserWeight=${weightVariable})`;
    },
    options: [
      "variables",
      "outputFileName"
    ]
  },
  "PercentBrokenDown": {
    template(datasetName, weightVariable, args) {
      return `Data Work.${datasetName};
      Set RTRAData.${datasetName};
      %RTRAProportion (InputDataset=work.${datasetName}, OutputName=${args.outputFileName}, ClassVarList=${args.variables},
        ByVar=${args.statisticBreakdown}, UserWeight=${weightVariable})`;
    },
    options: [
      "variables",
      "statisticBreakdown",
      "outputFileName"

    ]
  },
  "MedianPercentile": {
    template(datasetName, weightVariable, args) {
      return `Data Work.${datasetName};
      Set RTRAData.${datasetName};
      %RTRAPercentile (InputDataset=work.${datasetName}, OutputName=${args.outputFileName}, AnalysisVar=${args.variables},
        ClassVarList=${args.statisticBreakdown}, Percentiles=${args.mediantile}, UserWeight=${weightVariable})`;
    },
    options: [
      "variables",
      "statisticBreakdown",
      "mediantile",
      "outputFileName"

    ]
  },
  "MeanStat": {
    template(datasetName, weightVariable, args) {
      return `Data Work.${datasetName};
      Set RTRAData.${datasetName};
      %RTRAMean (InputDataset=work.${datasetName}, OutputName=${args.outputFileName}, AnalysisVarList=${args.variables},
        ClassVarList=${args.statisticBreakdown}, UserWeight=${weightVariable})`;
    },
    options: [
      "variables",
      "statisticBreakdown",
      "outputFileName"

    ]
  }
};

var optionTypes = {

  variables: {
    className: 'variables',
    label: 'Statistic breakdown by this var',
    helpText: 'Enter the name of the variable (from data dictionary) by which you want your statistic broken down. For some breakdowns, you can enter more than one variable, but we recommend entering just 1 variable'
  },

  statisticBreakdown: {
    className: 'statisticBreakdown',
    label: 'Variable(s)',
    helpText: 'Enter the name of the variable (from data dictionary) for which you want estimates here. You can only enter 1 variable here'
  },

  mediantile: {
    className: 'mediantile',
    label: 'Percentiles requested this var',
    helpText: 'Enter the percentiles you want e.g 50 for median. For multiple percentiles separate each with a space e.g. 25 50'
  },

  outputFileName: {
    className: 'outputFileName',
    label: 'Output file name',
    helpText: 'Enter the name of the output file here (Limited to 8 characters and NO SPACES or SPECIAL CHARACTERS). It could be a descriptive name e.g. educpercent'
  }
};

$(function() {
  // find elements
  const banner = $("#banner-message");
  const generateButton = $(".generate");
  const datasetName = $('#datasetName');
  const weightVariable = $('#weightVariable');
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
  addScript.on("click", () => {
    if ( $('.scriptGenerator').length === 10 ) {
      alert('Maximum of ten programs allowed');
      return;
    }

    createScript();
  });

  generateButton.on("click", () => {
    var outputTotalScript = [];

    const dsn = datasetName.val().trim();
    const wt = weightVariable.val().trim();
    const isValidDsn = dsn.length > 0;
    const isValidWt = wt.length > 0;

    if (!isValidDsn) {
      alert('Please provide a dataset name');
      return;
    }

    if (!isValidWt) {
      alert('Please provide a weight variable name');
      return;
    }

    var success = Array.from($('.scriptGenerator')).every((element) => {
      var generator = $(element);
      var ss = generator.find(".scriptSelector");
      var so = generator.find(".scriptOptions");

      var selectedScript = ss.val();

      if (!(selectedScript in scriptOpts)) {
        alert('select a valid option');
        return false;
      }

      var selected = scriptOpts[selectedScript];

      var args = {};
      var genSuccess = selected.options.every((option) => {
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

      outputTotalScript.push(selected.template(dsn, wt, args));
      return true;
    });

    if (!success) {
      return;
    }

    var text = outputTotalScript.join('\r\n\r\n');
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    // uncomment the next line to debug;
    // output.text(text);
    saveAs(blob, `${dsn}_${requestName.val() || 'v'}.sas`);
  });
});
