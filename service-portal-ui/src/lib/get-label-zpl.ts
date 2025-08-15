export const GetLabelZPL = (
  techName: string,
  itemName: string,
  faultMessage: string,
  mobileNumber: string
): string => {
  const today = new Date();
  const formattedDate = today.toLocaleString(); // DD/MM/YYYY

  const nameLine = `#${itemName}`;
  const techLine = `${techName} (${mobileNumber})`;
  const nameLength = nameLine.length;
  const faultMessageLength = faultMessage.length
  const techLineLength = techLine.length;

    let nameFontSize = 30;
    let faultYOffset = 60;
    let faultFontSize = 25
    let techLineYOffset = 130; // Y position for Tech line
    let techLineSize = 25;

      if (nameLength > 30) {
      nameFontSize = 25;
      faultYOffset = 55;
      techLineYOffset = 120;
    }
    else if (nameLength <= 10){
      nameFontSize = 35;
      faultYOffset = 65;
      techLineYOffset = 140;
    }

    if(faultMessageLength > 40){
      faultFontSize = 20
    }

    if (techLineLength > 40) {
      techLineSize = 20;
    }

  const zpl = `
^XA
^PW406                  // 2 inches × 203 DPI = 406 dots
^LL203                  // 1 inch × 203 DPI = 203 dots
^FO15,25                // Start 15 dots from edges (safe margin)
^A0N,${nameFontSize},${nameFontSize}          // Smaller font
^FB370,1,0,L,0       // Wrap width = 560 dots, 1 lines max, left aligned
^FD${nameLine}^FS
^FO15,${faultYOffset}
^A0N,${faultFontSize},${faultFontSize}           // Even smaller font
^FB370,2,0,L,0       // Wrap width = 560 dots, 2 lines max, left aligned
^FD${faultMessage}^FS
^FO15,${techLineYOffset}
^A0N,25,25
^FB370,1,0,L,0
^FD${techLine}^FS
^FO15,165
^A0N,18,18
^FD${formattedDate}^FS
^XZ
  `;
  return zpl;
};
