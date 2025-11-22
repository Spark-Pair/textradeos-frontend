import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
    PDFDownloadLink,
} from "@react-pdf/renderer";
import { formatDateWithDay } from "../utils";

const Table = ({ columns, data, size, bottomGap }) => {
    // 1. Extract numeric widths for fixed columns
    const fixedWidths = columns
        .map(col => col.width)
        .filter(w => w && w !== "auto")
        .map(w => parseFloat(w));

    const totalFixed = fixedWidths.reduce((a, b) => a + b, 0);

    // 2. Count auto columns
    const autoColumns = columns.filter(col => !col.width || col.width === "auto").length;

    // 3. Remaining width distributed to auto columns
    const autoWidth = autoColumns > 0 ? (100 - totalFixed) / autoColumns : 0;

    // 4. Final column width resolver
    const getColumnWidth = (width) => {
        if (!width || width === "auto") return `${autoWidth}%`;
        return `${parseFloat(width)}%`;
    };

    return (
        <View style={tableStyles.table}>
            {/* Table Header */}
            <View style={[tableStyles.tableRow, tableStyles.tableRowHeader]}>
                {columns.map((col, index) => (
                    <View key={index} style={[tableStyles.tableColHeader, { width: getColumnWidth(col.width), textAlign: col.align || 'left' }]}>
                        <Text>{col.label}</Text>
                    </View>
                ))}
            </View>
            {/* Table Rows */}
            {data.map((item, index) => (
                <View
                    key={index}
                    style={[
                        tableStyles.tableRow,
                        index === data.length - 1 && { borderBottomWidth: 0 } // ✅ remove border for last row
                    ]}
                >
                    {columns.map((col, colIndex) => (
                        <View
                            key={colIndex}
                            style={[
                                tableStyles.tableCol,
                                { width: getColumnWidth(col.width), textAlign: col.align || 'left' }
                            ]}
                        >
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
        borderBottomColor: '#4a5565', // border-gray-600
        borderBottomWidth: 0.6,
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
        borderColor: '#d1d5dc', // Match hr/summary box border color
        borderRadius: 10,
        padding: 3,
    },
    tableRowHeader: {
        backgroundColor: "#127475",
        color: "#ffff",
        borderRadius: 7,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: "row",
        padding: "2.5 1.5",
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#ebe6e7',
    },
    // Table Header Cell
    tableColHeader: {
        padding: 4,
        fontSize: 8,
        fontWeight: '500',
        textAlign: 'center', // Defaulting to center unless overridden
    },
    // Table Data Cell
    tableCol: {
        padding: 4,
        fontSize: 8,
        textAlign: 'left', // Defaulting to left unless overridden
    },
});

// --------------------
// PDF DOCUMENT
// --------------------
export default function InvoiceDocument({ user, invoice, flattenedItems, calculateItemTotal }) {
    return (
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
}