import { PDFViewer, Document, Page, Text, StyleSheet, Font, View, PDFDownloadLink } from "@react-pdf/renderer";
import DocumentTable from "./DocumentTable";
import React from "react";
import { Download } from "lucide-react";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 }
  ]
});

// ⭐ Dynamic pagination function
function paginate(data, firstCount, otherCount) {
  const pages = [];

  // First page
  pages.push(data.slice(0, firstCount));

  // Remaining pages
  let index = firstCount;
  while (index < data.length) {
    pages.push(data.slice(index, index + otherCount));
    index += otherCount;
  }

  return pages;
}

function PrintListBtn({
  label,
  columns,
  data,
  filtersActive,
  filteredData,
  topSection,
  firstPageRowCount = 24,
  otherPageRowCount = 27   // You can adjust
}) {
  const tableData = filtersActive ? filteredData : data;

  // ⭐ Use dynamic pagination
  const pages = paginate(tableData, firstPageRowCount, otherPageRowCount);

  const styles = StyleSheet.create({
    page: { padding: 20, fontFamily: "Roboto", fontSize: 10 },
    header: { flexDirection: "row", justifyContent: "space-between" },

    summaryBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10
    },
    summaryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: '#4b5563', // border-gray-600
      borderRadius: 6, // Equivalent to rounded-lg
      paddingVertical: 6, // Equivalent to py-1.5
      paddingHorizontal: 12, // Equivalent to px-3
    },
    summaryTitle: {
      fontSize: 9,
      marginTop: "0.5px",
      fontWeight: 400
    },
    summaryValue: {
      fontSize: 10
    },

    footer: {
      position: "absolute",
      bottom: 10,
      left: 0,
      right: 0,
      padding: "0 20"
    },

    footerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "0 4",
      fontSize: 8
    },

    hr: {
      borderBottomColor: "#4a5565",
      borderBottomWidth: 0.5,
      marginVertical: 7
    }
  });

  const PDFDocument = (
    <Document>
      {pages.map((pageRows, pageIndex) => {
        const startIndex =
          pageIndex === 0
            ? 0
            : firstPageRowCount + (pageIndex - 1) * otherPageRowCount;

        return (
          <Page
            size="A4"
            orientation="landscape"
            style={styles.page}
            key={pageIndex}
          >
            {/* Header */}
            <View
              style={styles.header}
            >
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>{label} List</Text>

              <Text
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages}`
                }
                fixed
              />
            </View>

            <View style={styles.hr} />

            {/* ⭐ Summary only on first page */}
            {pageIndex === 0 && topSection && (
              <>
                <View style={styles.summaryBox}>
                  {topSection.map((item, i) => (
                    <View key={i} style={styles.summaryItem}>
                      <Text style={styles.summaryTitle}>{item.title}: </Text>
                      <Text style={styles.summaryValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.hr} />
              </>
            )}

            {/* Table */}
            <DocumentTable
              columns={columns}
              data={pageRows}
              startIndex={startIndex}
            />

            {/* Footer */}
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
  )

  return (
    <PDFDownloadLink document={PDFDocument} fileName={`${label}_list.pdf`} className="flex items-center bg-[#127475] text-white px-4 py-2 rounded-xl hover:bg-[#0c5f60]">
      {({ loading }) => (
        <>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Download List"}
        </>
      )}
    </PDFDownloadLink>
  );
}

export default PrintListBtn;
