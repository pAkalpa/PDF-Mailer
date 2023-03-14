import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { desktopDir } from "@tauri-apps/api/path";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "./App.css";

const desktopPath = await desktopDir();

function App() {
  const [pdf, setPdf] = useState<Uint8Array>();

  async function modifyPdf(path: string) {
    console.log("🤬 ~ file: App.tsx:15 ~ modifyPdf ~ path:", path);
    const pdfDoc = await PDFDocument.load(path);
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
    setPdf(pdfBytes);
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
      modifyPdf(selected[0]);
    }
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <iframe
            title="frame"
            width="300px"
            height="700px"
            src={`data:application/pdf;base64,${pdf}`}
          />
          <button type="submit">Greet</button>
        </form>
      </div>
    </div>
  );
}

export default App;
