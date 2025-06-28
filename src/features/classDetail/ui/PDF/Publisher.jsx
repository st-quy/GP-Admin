import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CoverPDF from "./CoverPDF";
import WritingPDF from "./WritingPDF";
import SpeakingPDF from "./SpeakingPDF";

const Publisher = ({ students }) => {
  const exportStudentPDF = async (student) => {
    const pdf = new jsPDF("p", "mm", "a4");

    const renderPageToCanvas = async (Component, props) => {
      const node = document.createElement("div");
      node.style.width = "210mm";
      node.style.minHeight = "297mm";
      node.style.display = "flex";
      node.style.alignItems = "center";
      node.style.justifyContent = "center";
      node.style.padding = "20px";
      node.style.backgroundColor = "white";
      node.style.position = "absolute";
      node.style.top = "-9999px";
      node.style.left = "-9999px";
      document.body.appendChild(node);

      const root = React.createElement(Component, props);
      const { createRoot } = await import("react-dom/client");
      const reactRoot = createRoot(node);
      reactRoot.render(root);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(node, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      document.body.removeChild(node);

      return imgData;
    };

    // CoverPage
    const coverImg = await renderPageToCanvas(CoverPDF, { student });
    pdf.addImage(coverImg, "PNG", 0, 0, 210, 297);

    // WritingPage
    pdf.addPage();
    const detailImg = await renderPageToCanvas(WritingPDF, { student });
    pdf.addImage(detailImg, "PNG", 0, 0, 210, 297);

    // SpeakingPage
    pdf.addPage();
    const speakingImg = await renderPageToCanvas(SpeakingPDF);
    pdf.addImage(speakingImg, "PNG", 0, 0, 210, 297);

    // Save file
    pdf.save(`${student.name.replace(/ /g, "_")}.pdf`);
  };

  const handlePublishAll = async () => {
    for (const student of students) {
      await exportStudentPDF(student);
    }
    alert("✅ Đã xuất toàn bộ PDF cho học sinh!");
  };

  return (
    <div className="my-6">
      <button
        onClick={handlePublishAll}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        📤 Publish All PDFs
      </button>
    </div>
  );
};

export default Publisher;
