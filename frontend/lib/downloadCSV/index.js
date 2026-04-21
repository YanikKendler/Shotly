/*
 * based on https://github.com/ayush-shta/download-csv which is a fork of https://github.com/react-csv/react-csv
 */

import { buildURI } from "./core";

export const downloadCSV = (data, headers, separator, fileName = "Csv Report") => {
  const fileNameWithExtension = fileName + ".csv";
  const url = buildURI(data, headers, separator);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileNameWithExtension);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
