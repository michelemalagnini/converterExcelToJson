function convertToJson() {
  let fileInput = document.getElementById("excelFile");
  let jsonOutput = document.getElementById("jsonOutput");
  let downloadBtn = document.getElementById("downloadBtn");

  if (fileInput.files.length === 0) {
    alert("Per favore seleziona un file Excel.");
    return;
  }

  let reader = new FileReader();
  reader.onload = function (event) {
    let data = event.target.result;
    let workbook = XLSX.read(data, { type: "binary" });
    let firstSheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[firstSheetName];

    // Aggiusta l'opzione 'range' per iniziare dal secondo elemento (1, poiché è basato su zero)
    let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 1 });

    let json = rows
      .map((row) => {
        // Assicurati che la riga abbia abbastanza elementi
        if (row.length >= 4) {
          return {
            type: row[0],
            label: row[1],
            name: row[2],
            value: row[3] || "",
            validations: parseValidations(row[4]),
          };
        }
        return null;
      })
      .filter(Boolean); // Filtra gli elementi null per rimuovere le righe vuote

    let jsonString = JSON.stringify(json, null, 2);
    jsonOutput.textContent = jsonString;

    downloadBtn.style.display = "block";
    // downloadBtn.onclick = function () {
    //   download(jsonString, "converted.json", "text/plain");
    // };
    downloadBtn.onclick = function () {
      // Ottieni il nome del file dall'input
      let fileName = document.getElementById("fileName").value;
      // Se non viene fornito un nome file, usa un nome file predefinito
      if (fileName === "") {
        fileName = "converted.json";
      } else {
        // Assicurati che il nome file abbia l'estensione .json
        if (!fileName.endsWith(".json")) {
          fileName += ".json";
        }
      }
      download(jsonString, fileName, "text/plain");
    };
  };

  reader.readAsBinaryString(fileInput.files[0]);
}

function parseValidations(validationString) {
  if (!validationString) return [];

  // Assumiamo che le validazioni siano separate da ';' e ogni validazione abbia 'nome:validatore:messaggio'
  return validationString.split(";").map((validation) => {
    let [name, validator, message] = validation.split(":");
    return { name, validator, message };
  });
}

function download(content, fileName, contentType) {
  let a = document.createElement("a");
  let file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
