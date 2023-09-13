"use client";

import { Button } from "#/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { open as shellOpen } from "@tauri-apps/api/shell";
import { open as dialogOpen } from "@tauri-apps/api/dialog";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { WebviewWindow } from "@tauri-apps/api/window";
import { Document, Page, pdfjs } from "react-pdf";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function Home() {
  const [greetText, setGreetText] = useState<string | null>(null);
  const [appWindow, setAppWindow] = useState<WebviewWindow>();
  const [pdfArray, setPdfArray] = useState<string | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    setupAppWindow();
  }, []);

  async function setupAppWindow() {
    const appWindow = (await import("@tauri-apps/api/window")).appWindow;
    setAppWindow(appWindow);
  }

  const buttonClickHandler = async () => {
    try {
      let data = await invoke<string>("greet", { name: "Next.js" });
      setGreetText(data);
    } catch (error) {
      console.log(error);
    }
  };

  const closeHandler = async () => {
    await appWindow?.close();
  };

  const profileClickHandler = async () => {
    await shellOpen("http://github.com/pAkalpa");
  };

  const modifyPdf = async (pdfArrayBuffer: Uint8Array) => {
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

    const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
    setPdfArray(pdfBytes);
  };

  const openPDFClick = async () => {
    const selected = await dialogOpen({
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
      const content = await readBinaryFile(selected as string);
      modifyPdf(content);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button onClick={buttonClickHandler}>Click Me</Button>
      <Button onClick={closeHandler}>Close</Button>
      <Button onClick={profileClickHandler}>Open My Profile</Button>
      <Button onClick={openPDFClick}>Open PDF</Button>
      {/* <Document
        file={pdfArray}
        onLoadSuccess={() => {
          console.log("SUCCESS LOAD");
        }}
      >
        <Page pageNumber={1} />
      </Document> */}
      <iframe src={pdfArray!} />
      {greetText ?? <h1>{greetText}</h1>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </main>
  );
}
