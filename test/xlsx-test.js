const XlsxPopulate = require('xlsx-populate');
const data = [
  ['head1', '標題2', 'head標題3', '@d_fa234!標題ˋ4', '標題_esf_5'],
  [`'sfasf_asf'`, '093774928', '0000001', 00000001, 4324]
];


XlsxPopulate.fromBlankAsync().then(workbook => {
  workbook.sheet(0).name('自訂名單').cell("A1").value(data);

  // Write to file.
  return workbook.toFileAsync("/Users/hd/Downloads/test-3.xlsx", { password: "vvv" });
});