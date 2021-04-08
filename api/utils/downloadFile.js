const fs = require("fs");
const request = require("request");
var format = require("xml-formatter");
const uniqueString = require("unique-string");
const { apiClient } = require("./api");
const { createLogItem } = require("./errorTacker");

require("dotenv").config();
let { APPSETTING_HOST } = process.env;

if (!fs.existsSync("files")) {
  fs.mkdirSync("files");
}

const fileNameAndExt = (str) => {
  var file = str.split("/").pop();
  return [
    file.substr(0, file.lastIndexOf(".")),
    file.substr(file.lastIndexOf(".") + 1, file.length),
  ];
};

function formatXml(xml, tab) {
  // tab = optional indent value, default is tab (\t)
  var formatted = "",
    indent = "";
  tab = tab || "\t";
  xml.split(/>\s*</).forEach(function (node) {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length); // decrease indent by one 'tab'
    formatted += indent + "<" + node + ">\r\n";
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab; // increase indent
  });
  return formatted.substring(1, formatted.length - 3);
}

const getExtension = (url) => {
  if (url === null) {
    return "";
  }
  var index = url.lastIndexOf("/");
  if (index !== -1) {
    url = url.substring(index + 1);
  }
  index = url.indexOf("?");
  if (index !== -1) {
    url = url.substring(0, index);
  }
  index = url.indexOf("#");
  if (index !== -1) {
    url = url.substring(0, index);
  }
  index = url.lastIndexOf(".");
  return index !== -1 ? url.substring(index + 1) : "";
};

exports.downloadFile = (url, cb) => {
  try {
    let nameArray = fileNameAndExt(url);
    let fileName = `files/${nameArray[0]}.${nameArray[1]}`;
    let number = 0;

    while (true) {
      if (fs.existsSync(fileName)) {
        number++;
        fileName = `files/${nameArray[0]}_${number}.${nameArray[1]}`;
      } else break;
    }

    const file = fs.createWriteStream(fileName);
    const sendReq = request.get({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      url,
    });

    sendReq.on("response", (response) => {
      if (response.statusCode !== 200) {
        cb(fileName);
      }

      sendReq.pipe(file);
    });

    file.on("finish", () => {
      file.close();
      cb(fileName);
    });

    sendReq.on("error", (err) => {
      fs.unlink(fileName);
      cb(false);
    });

    file.on("error", (err) => {
      fs.unlink(fileName);
      cb(false);
    });
  } catch (err) {
    cb(false);
  }
};

exports.saveAsTxt = (contents, cb) => {
  try {
    let fileName = "File-" + uniqueString() + ".txt";
    fs.writeFile(
      `files/${fileName}`,
      JSON.stringify(contents),
      "utf8",
      function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return cb(false);
        }

        console.log("JSON file has been saved.");
        return cb({
          name: fileName,
          link: `${APPSETTING_HOST}/${fileName}`,
        });
      }
    );
  } catch (error) {
    return cb(false);
  }
};

exports.downloadContents = async (fileLink) => {
// resource/Batch/Download?requestId={{requestId}}&responseId={{responseId}}
  try {
    createLogItem(true, '0---> Origin File Link', fileLink)

    console.log("START");
    let api = await apiClient();
    api.defaults.headers.common["content-type"] = "application/atom+xml";

    let fileExt = getExtension(fileLink) || "xml";
    let fileName = "File-" + uniqueString() + `.${fileExt}`;
    let filePath = `files/${fileName}`;

    console.log("fileExt, fileName =>", fileExt, fileName)

    const writer = fs.createWriteStream(filePath);

    const response = await api.get(fileLink, {
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        const newFileName = "File-" + uniqueString() + `.${fileExt}`;
        const xmlData = fs.readFileSync(filePath, {
          encoding: "utf8",
          flag: "r",
        });
        var formatedXml = formatXml(xmlData);
        fs.writeFile("files/" + newFileName, formatedXml, function (err) {
          if (err) {
            createLogItem(false, '2---> File Download Error', ``)

            console.log(err);
            return reject;
          }
          fs.unlinkSync(filePath);

          createLogItem(true, '2---> File Download Success', `${APPSETTING_HOST}/${newFileName}`)

          resolve({
            name: newFileName,
            link: `${APPSETTING_HOST}/${newFileName}`,
          });
        });
      });
      writer.on("error", reject);
    });
  } catch (error) {
    createLogItem(false, '2---> File Download Exception', JSON.stringify(error))

    console.log("downloadContents");
    return false;
  }
};


// (async()=>{
//   exports.downloadContents("https://apit.coned.com/gbc/v1/resource/Batch/Download?requestId=82203ccc-5121-4813-9045-4921e8678c44&responseId=b69b51d9-ae63-4d2b-852a-acabd9b92951")
// })()