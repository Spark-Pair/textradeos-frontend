import React from "react";
import { pdf, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import DocumentTable from "./DocumentTable";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});

// Pagination helper
function paginate(data, firstCount, otherCount) {
  const pages = [];
  pages.push(data.slice(0, firstCount));
  let index = firstCount;
  while (index < data.length) {
    pages.push(data.slice(index, index + otherCount));
    index += otherCount;
  }
  return pages;
}

// Main component
export default function PrintListBtn({
  label,
  columns,
  data,
  filtersActive,
  filteredData,
  topSection,
  firstPageRowCount = 24,
  otherPageRowCount = 27,
}) {
  const handleClick = async () => {
    const tableData = filtersActive ? filteredData : data;

    // Sanitize table data
    const safeRows = tableData.map((row) => {
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        const val = row[key];
        cleanRow[key] =
          val === null || val === undefined || typeof val === "object"
            ? ""
            : String(val);
      });
      return cleanRow;
    });

    // Sanitize topSection
    const safeTopSection = Array.isArray(topSection)
      ? topSection.map((item) => ({
          title: String(item?.title ?? ""),
          value: String(item?.value ?? ""),
        }))
      : [];

    // Paginate
    const pages = paginate(safeRows, firstPageRowCount, otherPageRowCount);

    // Styles
    const styles = StyleSheet.create({
      page: { padding: 20, fontFamily: "Roboto", fontSize: 10 },
      header: { flexDirection: "row", justifyContent: "space-between" },
      summaryBox: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
      summaryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexGrow: 1,
        borderWidth: 1,
        borderColor: "#4b5563",
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
      },
      summaryTitle: { fontSize: 9, marginTop: "0.5px", fontWeight: 400 },
      summaryValue: { fontSize: 10 },
      footer: { position: "absolute", bottom: 10, left: 0, right: 0, padding: "0 20" },
      footerContent: { flexDirection: "row", justifyContent: "space-between", padding: "0 4", fontSize: 8 },
      hr: { borderBottomColor: "#4a5565", borderBottomWidth: 0.5, marginVertical: 7 },
    });

    // PDF Document
    const PDFDocument = (
      <Document>
        {pages.map((pageRows, pageIndex) => {
          const startIndex =
            pageIndex === 0
              ? 0
              : firstPageRowCount + (pageIndex - 1) * otherPageRowCount;

          return (
            <Page size="A4" orientation="landscape" style={styles.page} key={pageIndex}>
              <View style={styles.header}>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>{label} List</Text>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
              </View>

              <View style={styles.hr} />

              {pageIndex === 0 && safeTopSection.length > 0 && (
                <>
                  <View style={styles.summaryBox}>
                    {safeTopSection.map((item, i) => (
                      <View key={i} style={styles.summaryItem}>
                        <Text style={styles.summaryTitle}>{item.title}: </Text>
                        <Text style={styles.summaryValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.hr} />
                </>
              )}

              <DocumentTable columns={columns} data={pageRows} startIndex={startIndex} />

              <View style={styles.footer} fixed>
                <View style={styles.hr} />
                <View style={styles.footerContent}>
                  <Text>Powered by SparkPair</Text>
                  <Text>© 2025 SparkPair | +92 316 5825495</Text>
                </View>
              </View>
            </Page>
          );
        })}
      </Document>
    );

    // Generate PDF as blob
    const asPdf = pdf(PDFDocument);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label}_list.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center bg-[#127475] text-white px-4 py-2 rounded-xl hover:bg-[#0c5f60]"
    >
      Download List
    </button>
  );
}
