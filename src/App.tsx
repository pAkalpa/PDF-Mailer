import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "./App.css";
import { useState } from "react";

function App() {
  const [pdfArray, setPdfArray] = useState<Uint8Array | null>(null);
  const [greetMsg, setGreetMsg] = useState("");
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  async function modifyPdf(pdfArrayBuffer: Uint8Array) {
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    firstPage.drawText("This text was added with JavaScript!", {
      x: 5,
      y: height / 2 + 300,
      size: 50,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
      rotate: degrees(-45),
    });

    const pdfBytes = await pdfDoc.save();
    console.log("🤬 ~ file: App.tsx:34 ~ modifyPdf ~ pdfBytes:", pdfBytes);
    setPdfArray(pdfBytes);
    setGreetMsg(await invoke("greet", { name: "Pasindu" }));
    invoke("pdf_saver", { pdfData: pdfBytes });
  }
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const selected = await open({
      multiple: false,
      title: "Select a PDF",
      filters: [
        {
          name: "PDF Files",
          extensions: ["pdf"],
        },
      ],
    });
    if (selected === null) {
      // user cancelled the selection
    } else {
      console.log("🤬 ~ file: App.tsx:44 ~ greet ~ selected:", selected);
      const content = await readBinaryFile(selected as string);
      modifyPdf(content);
      console.log("🤬 ~ file: App.tsx:47 ~ greet ~ content:", content);
    }
  }

  return (
    <div className="container">
      <h1>{greetMsg}</h1>
      <h1>Welcome to Tauri!</h1>
      <Document
        file={{ data: pdfArray }}
        onLoadSuccess={() => {
          console.log("SUCCESS LOAD");
        }}
      >
        <Page pageNumber={1} />
      </Document>

      <div className="row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <button type="submit">Greet</button>
        </form>
      </div>
    </div>
  );
}

export default App;
