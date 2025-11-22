// InvoicePDF.jsx

import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    PDFViewer,
    Font,
    PDFDownloadLink,
} from "@react-pdf/renderer";
// Assuming these utilities/components are correctly imported or defined elsewhere
// Since I don't have the original definitions, I'll mock them or use simple placeholders.
// import { formatDateWithDay } from "../utils";
// import Table from "./Table";

// --- Mocked/Placeholder Functions/Components ---
// Replace these with your actual implementations
const formatDateWithDay = (date) => (date ? new Date(date).toDateString() : "-");
const calculateItemTotal = (item) => item.quantity * item.selling_price_snapshot;

// Simple Table Placeholder - This is a common pain point in react-pdf.
// A full implementation requires more logic, but this shows the structure.
const Table = ({ columns, data, size, bottomGap }) => {
    // Determine column widths based on the passed columns prop
    const getColumnWidth = (width) => {
        if (width === "auto" || !width) return `${100 / columns.length}%`; // Fallback for 'auto'
        return width; // Use the explicit width if provided
    };

    return (
        <View style={tableStyles.table}>
            {/* Table Header */}
            <View style={tableStyles.tableRow}>
                {columns.map((col, index) => (
                    <View key={index} style={[tableStyles.tableColHeader, { width: getColumnWidth(col.width), textAlign: col.align || 'left' }]}>
                        <Text>{col.label}</Text>
                    </View>
                ))}
            </View>
            {/* Table Rows */}
            {data.map((item, index) => (
                <View key={index} style={tableStyles.tableRow}>
                    {columns.map((col, colIndex) => (
                        <View key={colIndex} style={[tableStyles.tableCol, { width: getColumnWidth(col.width), textAlign: col.align || 'left' }]}>
                            <Text>
                                {col.render ? col.render(item, index) : item[col.field]}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

Font.register({
    family: "Roboto",
    fonts: [
        { src: "/fonts/Roboto-Thin.ttf", fontWeight: 100 },         // font-thin
        { src: "/fonts/Roboto-ExtraLight.ttf", fontWeight: 200 },   // font-extralight
        { src: "/fonts/Roboto-Light.ttf", fontWeight: 300 },        // font-light
        { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },      // font-normal
        { src: "/fonts/Roboto-Medium.ttf", fontWeight: 500 },       // font-medium
        { src: "/fonts/Roboto-SemiBold.ttf", fontWeight: 600 },     // font-semibold
        { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },         // font-bold
        { src: "/fonts/Roboto-ExtraBold.ttf", fontWeight: 800 },    // font-bold
        { src: "/fonts/Roboto-Black.ttf", fontWeight: 900 },        // font-black
    ],
});

// --- STYLES ---
const pageStyle = {
    A5: {
        width: 420, // A5 is approx 148mm x 210mm. 148mm is ~420pt.
        height: 595, // 210mm is ~595pt.
        padding: 18, // Approx equivalent to p-6
        fontSize: 9, // Use a smaller base font for A5
        fontFamily: "Roboto",
        flexDirection: 'column',
        letterSpacing: 0.5
    },
};

const styles = StyleSheet.create({
    page: pageStyle.A5,

    // Header (Business Name & Sales Invoice)
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        textTransform: 'capitalize',
        fontSize: 14, // Equivalent to text-lg
        fontWeight: '500', // Equivalent to font-medium
        letterSpacing: 0.5, // Equivalent to tracking-wide
    },
    hr: {
        borderBottomColor: '#4b5563', // border-gray-600
        borderBottomWidth: 1,
        marginVertical: 7, // Equivalent to my-2 (adjust for better visual fit)
    },

    // Customer & Invoice Details
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        textTransform: 'capitalize',
    },
    detailText: {
        marginBottom: 4, // Equivalent to mb-1
    },
    detailLabel: {
        fontWeight: '500', // Equivalent to font-medium
    },

    // Table Container
    tableWrapper: {
        flexGrow: 1, // Equivalent to grow
    },

    // Footer Summary Boxes
    summaryContainer: {
        flexDirection: 'row',
        gap: 0.05, // Equivalent to gap-2 (using margin-right to simulate gap)
    },
    summaryBox: {
        flex: 1, // Equivalent to flex-1
        borderWidth: 1,
        borderColor: '#4b5563', // border-gray-600
        borderRadius: 6, // Equivalent to rounded-lg
        paddingVertical: 6, // Equivalent to py-1.5
        paddingHorizontal: 12, // Equivalent to px-3
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 8, // Simulate gap-2
    },
    // Remove last margin for the last box
    lastSummaryBox: {
        marginRight: 0,
    },

    // Bottom Footer (Powered by/Copyright)
    bottomFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

const tableStyles = StyleSheet.create({
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#4b5563', // Match hr/summary box border color
        borderRadius: 10,
    },
    tableRow: {
        flexDirection: "row",
    },
    // Table Header Cell
    tableColHeader: {
        padding: 4,
        fontSize: 8,
        backgroundColor: '#f3f4f6', // Equivalent to a light gray background
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#4b5563',
        fontWeight: '500',
        textAlign: 'center', // Defaulting to center unless overridden
    },
    // Table Data Cell
    tableCol: {
        padding: 4,
        fontSize: 8,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#4b5563',
        textAlign: 'left', // Defaulting to left unless overridden
    },
});

// --------------------
// PDF DOCUMENT
// --------------------
const InvoiceDocument = ({ user, invoice, flattenedItems, calculateItemTotal }) => (
    <Document>
        <Page size="A5" style={styles.page}>
            {/* Header (Business Name & Sales Invoice) */}
            <View style={styles.headerContainer}>
                <Text>{user.name}</Text>
                <Text>Sales Invoice</Text>
            </View>

            <View style={styles.hr} />

            {/* Customer & Invoice Details */}
            <View style={styles.detailsContainer}>
                {/* Customer Details */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Customer:</Text> {invoice.customerId?.name || "-"}
                    </Text>
                    <Text>
                        <Text style={styles.detailLabel}>Contact:</Text> {invoice.customerId?.phone_no || "-"}
                    </Text>
                </View>
                {/* Invoice Details */}
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Date:</Text> {formatDateWithDay(invoice.createdAt)}
                    </Text>
                    <Text>
                        <Text style={styles.detailLabel}>Invoice No:</Text> {invoice.invoiceNumber}
                    </Text>
                </View>
            </View>

            <View style={styles.hr} />

            {/* Line Items Table */}
            <View style={styles.tableWrapper}>
                <Table
                    columns={[
                        // s no, article_no, quantity, price
                        { label: "#", render: (_, i) => i + 1, width: "7%", align: "left" },
                        { label: "Article No.", field: "article_no", width: "auto" },
                        { label: "Quantity", field: "quantity", width: "15%", align: "center" },
                        { label: "Price", field: "selling_price_snapshot", width: "18%", align: "center" },
                        { label: "Total", render: (item) => calculateItemTotal(item).toFixed(1), width: "20%", align: "center" },
                    ]}
                    data={flattenedItems}
                    size="xs"
                    bottomGap={false}
                />
            </View>

            {/* Important: react-pdf needs a defined height or flexGrow for containers.
                 Since the table has flexGrow, the remaining elements will stack below it. */}

            <View style={styles.hr} />

            {/* Summary Boxes (G. Amount, Discount, N. Amount) */}
            <View style={styles.summaryContainer}>
                {/* G. Amount */}
                <View style={styles.summaryBox}>
                    <Text>G. Amount:</Text>
                    <Text>{invoice.grossAmount.toFixed(1)}</Text>
                </View>
                {/* Discount */}
                <View style={styles.summaryBox}>
                    <Text>Discount:</Text>
                    <Text>{invoice.discount}%</Text>
                </View>
                {/* N. Amount - Note: We apply the lastSummaryBox style to remove the marginRight */}
                <View style={[styles.summaryBox, styles.lastSummaryBox]}>
                    <Text>N. Amount:</Text>
                    <Text>{invoice.netAmount.toFixed(1)}</Text>
                </View>
            </View>

            <View style={styles.hr} />

            {/* Bottom Footer (Powered by/Copyright) */}
            <View style={styles.bottomFooter}>
                <Text>Powered by SparkPair</Text>
                <Text>© 2025 SparkPair | +92 316 5825495</Text>
            </View>
        </Page>
    </Document>
);

// --------------------
// MAIN COMPONENT (Viewer)
// --------------------
export default function InvoicePDF() {
    // --- Mock Data Setup for Display ---
    const userMock = {
        name: "SparkPair",
    };
    const flattenedItemsMock = [
        { article_no: "A456", quantity: 2, selling_price_snapshot: 10.0 },
        { article_no: "B101", quantity: 5, selling_price_snapshot: 5.5 },
    ];
    const grossAmount = flattenedItemsMock.reduce((sum, item) => sum + item.quantity * item.selling_price_snapshot, 0);
    const discountPercent = 10;
    const discountAmount = grossAmount * (discountPercent / 100);
    const netAmount = grossAmount - discountAmount;

    const invoiceMock = {
        invoiceNumber: "INV-001",
        createdAt: new Date(),
        customerId: {
            name: "Junaid",
            phone_no: "0300-1234567",
        },
        grossAmount: grossAmount,
        discount: discountPercent,
        netAmount: netAmount,
    };
    // -----------------------------------

    return (
        <div style={{ padding: "20px" }}>
            <PDFDownloadLink
                document={
                    <InvoiceDocument
                        user={userMock}
                        invoice={invoiceMock}
                        flattenedItems={flattenedItemsMock}
                        calculateItemTotal={calculateItemTotal}
                    />
                }
                fileName={`invoice-${invoiceMock.invoiceNumber}.pdf`}
                style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    textDecoration: "none",
                    fontWeight: "500",
                }}
            >
                {({ loading }) => (loading ? "Generating PDF..." : "Download Invoice PDF")}
            </PDFDownloadLink>
        </div>
    );
}